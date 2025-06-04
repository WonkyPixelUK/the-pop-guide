import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search, Scan, Upload, Heart, Plus, Check, Camera, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCollection, useFunkoPops, useUserCollection } from "@/hooks/useFunkoPops";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useRewardProgress, useSubmissionTracker } from "@/hooks/useRewardSystem";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';
import ImageUpload from '@/components/ImageUpload';

interface EnhancedAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// All available countries for dropdown
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Japan', 'South Korea', 'China', 'Hong Kong', 'Singapore', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Other'
];

// Brand options
const BRANDS = [
  'Funko', 'Hot Topic', 'BoxLunch', 'Target', 'Walmart', 'GameStop', 'Amazon', 'Disney', 'Marvel', 'DC Comics', 'Star Wars', 'Pokemon', 'Other'
];

// Size options for Funko Pops
const SIZES = [
  'Standard (3.75")', 'Jumbo (6")', 'Super Sized (10")', 'Mini (1.5")', 'Bitty Pop! (1")', 'Other'
];

// Filter options from the main database
const FILTER_OPTIONS = {
  status: ['Coming Soon', 'New Releases', 'Funko Exclusive', 'Pre-Order', 'In Stock', 'Sold Out'],
  category: ['Pop!', 'Bitty Pop!', 'Mini Figures', 'Vinyl Soda', 'Loungefly', 'REWIND', 'Pop! Pins', 'Toys and Plushies', 'Clothing', 'Funko Gear', 'Funko Games'],
  fandom: ['8-Bit', 'Ad Icons', 'Animation', 'Artists', 'Basketball', 'Comics', 'Disney', 'Games', 'Harry Potter', 'Marvel', 'Movies', 'Music', 'NBA', 'NFL', 'Pokémon', 'Star Wars', 'Television', 'Wrestling'],
  genre: ['Animation', 'Anime & Manga', 'Movies & TV', 'Horror', 'Music', 'Sports', 'Video Games', 'Retro Toys', 'Ad Icons'],
  edition: ['New Releases', 'Exclusives', 'CHASE', 'CONVENTION', 'METALLIC', 'GLOW IN THE DARK', 'FLOCKED', 'DIAMOND COLLECTION', 'BLACK LIGHT'],
  rarity: ['Common', 'Uncommon', 'Rare', 'Chase', 'Exclusive', 'Vaulted'],
  condition: ['Mint', 'Near Mint', 'Very Fine', 'Fine', 'Very Good', 'Good', 'Fair', 'Poor']
};

const EnhancedAddItemDialog = ({ open, onOpenChange }: EnhancedAddItemDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Mint");
  const [purchasePrice, setPurchasePrice] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const addToCollection = useAddToCollection();
  const { addToWishlist, wishlist } = useWishlist();
  const { data: funkoPops = [] } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);
  const { currency } = useCurrency();

  // Reward system hooks
  const rewardProgress = useRewardProgress();
  const { trackSubmission, isUpdating } = useSubmissionTracker();

  // Manual entry state - Basic Info
  const [manualName, setManualName] = useState("");
  const [manualSeries, setManualSeries] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [manualRarity, setManualRarity] = useState("");
  const [manualCondition, setManualCondition] = useState("Mint");
  const [manualPrice, setManualPrice] = useState("");

  // Manual entry state - Extended Info
  const [manualUpcA, setManualUpcA] = useState("");
  const [manualEan13, setManualEan13] = useState("");
  const [manualAsin, setManualAsin] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualBrand, setManualBrand] = useState("Funko");
  const [manualModel, setManualModel] = useState("");
  const [manualSize, setManualSize] = useState("Standard (3.75\")");
  const [manualColor, setManualColor] = useState("");
  const [manualWeight, setManualWeight] = useState("");
  const [manualDimensions, setManualDimensions] = useState("");
  
  // Manual entry state - Database Fields
  const [manualStatus, setManualStatus] = useState("In Stock");
  const [manualCategory, setManualCategory] = useState("Pop!");
  const [manualFandom, setManualFandom] = useState("");
  const [manualGenre, setManualGenre] = useState("");
  const [manualEdition, setManualEdition] = useState("");
  const [manualVariant, setManualVariant] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualExclusive, setManualExclusive] = useState(false);
  const [manualVaulted, setManualVaulted] = useState(false);
  const [manualChase, setManualChase] = useState(false);

  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  // Image upload state
  const [funkoImageUrl, setFunkoImageUrl] = useState<string>("");

  // Helper to normalize strings for search (case-insensitive, ignore punctuation)
  function normalize(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
  }

  const normalizedSearch = normalize(searchQuery);
  const searchResults =
    normalizedSearch.length > 1
      ? funkoPops.filter((pop) => {
          return (
            normalize(pop.name).includes(normalizedSearch) ||
            (pop.series && normalize(pop.series).includes(normalizedSearch)) ||
            (pop.number && normalize(pop.number).includes(normalizedSearch))
          );
        })
      : [];

  const isInWishlist = (id: string) => wishlist.some((item: any) => item.funko_pop_id === id);
  const isInCollection = (id: string) => userCollection.some((item: any) => item.funko_pop_id === id);

  const handleAddToCollection = async (item: any) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your collection",
        variant: "destructive",
      });
      return;
    }
    try {
      await addToCollection.mutateAsync({
        funkoPopId: item.id,
        userId: user.id,
        condition: selectedCondition,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  };

  const handleAddToWishlist = async (item: any) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    try {
      await addToWishlist.mutateAsync({
        funkoPopId: item.id,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const resetForm = () => {
    setManualName("");
    setManualSeries("");
    setManualNumber("");
    setManualRarity("");
    setManualCondition("Mint");
    setManualPrice("");
    setManualUpcA("");
    setManualEan13("");
    setManualAsin("");
    setManualCountry("");
    setManualBrand("Funko");
    setManualModel("");
    setManualSize("Standard (3.75\")");
    setManualColor("");
    setManualWeight("");
    setManualDimensions("");
    setManualStatus("In Stock");
    setManualCategory("Pop!");
    setManualFandom("");
    setManualGenre("");
    setManualEdition("");
    setManualVariant("");
    setManualDescription("");
    setManualExclusive(false);
    setManualVaulted(false);
    setManualChase(false);
    // Reset image upload state
    setFunkoImageUrl("");
  };

  const handleManualAdd = async () => {
    setManualError("");
    if (!user) {
      setManualError("Sign in required");
      return;
    }
    if (!manualName || !manualSeries) {
      setManualError("Name and Series are required");
      return;
    }
    setManualLoading(true);
    try {
      // Insert new Pop with all the enhanced fields
      const { data: pop, error } = await supabase
        .from('funko_pops')
        .insert({
          name: manualName,
          series: manualSeries,
          number: manualNumber,
          variant: manualVariant || null,
          description: manualDescription || null,
          rarity: manualRarity || 'Common',
          status: manualStatus,
          category: manualCategory,
          fandom: manualFandom || null,
          genre: manualGenre || null,
          edition: manualEdition || null,
          is_exclusive: manualExclusive,
          is_vaulted: manualVaulted,
          is_chase: manualChase,
          image_url: funkoImageUrl, // Add the uploaded image URL
          // Extended fields
          upc_a: manualUpcA || null,
          ean_13: manualEan13 || null,
          amazon_asin: manualAsin || null,
          country_of_registration: manualCountry || null,
          brand: manualBrand || 'Funko',
          model_number: manualModel || null,
          size: manualSize || null,
          color: manualColor || null,
          weight: manualWeight || null,
          product_dimensions: manualDimensions || null,
          last_scanned: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error || !pop) throw error || new Error('Insert failed');
      
      // Add to collection with enhanced details
      const { error: collectionError } = await supabase
        .from('user_collections')
        .insert({
          funko_pop_id: pop.id,
          user_id: user.id,
          condition: manualCondition,
          purchase_price: manualPrice ? parseFloat(manualPrice) : null,
          purchase_date: new Date().toISOString(),
          personal_notes: `Manually added via enhanced form`,
          acquisition_method: 'manual_entry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (collectionError) {
        console.error('Collection add error:', collectionError);
        throw new Error(`Failed to add to collection: ${collectionError.message}`);
      }

      // Track submission for reward system
      await trackSubmission();
      
      toast({
        title: "✅ Successfully Added!",
        description: `${manualName} has been added to your collection and the main database.`,
        duration: 5000
      });

      // Reset form
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setManualError(err.message || 'Failed to add Pop');
      toast({
        title: "❌ Failed to Add",
        description: err.message || 'Failed to add Pop to collection',
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add to Collection</DialogTitle>
          {user && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span className="font-semibold text-orange-400">Contributor Progress</span>
                {rewardProgress.hasActiveFreeMonth && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    FREE MONTH ACTIVE
                  </span>
                )}
                {rewardProgress.hasRecognitionBadge && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                    🏆 RECOGNIZED
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {rewardProgress.approved} approved submissions • {rewardProgress.itemsUntilFreeMonth} more for FREE MONTH!
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${rewardProgress.progressToFreeMonth}%` }}
                ></div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="search" className="data-[state=active]:bg-orange-500">
              <Search className="w-4 h-4 mr-2" />
              Search Database
            </TabsTrigger>
            <TabsTrigger value="scan" className="data-[state=active]:bg-orange-500">
              <Scan className="w-4 h-4 mr-2" />
              Scan Barcode
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-orange-500">
              <Upload className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Funko Pop Database</Label>
              <Input
                id="search"
                placeholder="Enter name, series, or item number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {FILTER_OPTIONS.condition.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (Optional)</Label>
                <Input
                  id="purchasePrice"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={item.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.series} #{item.number}</p>
                    <p className="text-xs text-gray-500">{item.rarity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-500 font-semibold mb-2">
                      {formatCurrency(item.value, currency)}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={isInWishlist(item.id) ? undefined : "outline"}
                        className={isInWishlist(item.id) ? "bg-pink-600 text-white hover:bg-pink-700" : "border-gray-600 hover:bg-gray-600"}
                        disabled={isInWishlist(item.id)}
                        onClick={() => handleAddToWishlist(item)}
                      >
                        {isInWishlist(item.id) ? <Check className="w-3 h-3 mr-1" /> : <Heart className="w-3 h-3 mr-1" />}
                        Wishlist
                      </Button>
                      <Button
                        size="sm"
                        variant={isInCollection(item.id) ? undefined : "outline"}
                        className={isInCollection(item.id) ? "bg-orange-500 text-white hover:bg-orange-600" : "border-gray-600 hover:bg-gray-600"}
                        disabled={isInCollection(item.id)}
                        onClick={() => handleAddToCollection(item)}
                      >
                        {isInCollection(item.id) ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Barcode Scanner</h3>
              <p className="text-gray-400 mb-4">Position the barcode within the frame to scan</p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Scan className="w-4 h-4 mr-2" />
                Start Scanner
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-orange-400 mb-2">💡 Manual Entry</h3>
              <p className="text-sm text-gray-300">
                Add new Funko Pops to both your collection and the main database. Your submissions help other collectors and earn you rewards!
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Basic Information</h4>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Funko Pop Image</Label>
                <div className="mt-2">
                  <ImageUpload
                    bucket="funko-images"
                    onUploadComplete={(url) => setFunkoImageUrl(url)}
                    currentImageUrl={funkoImageUrl}
                    label=""
                    height="h-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manualName">Name *</Label>
                  <Input
                    id="manualName"
                    placeholder="e.g., Spider-Man"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualSeries">Series *</Label>
                  <Input
                    id="manualSeries"
                    placeholder="e.g., Marvel"
                    value={manualSeries}
                    onChange={(e) => setManualSeries(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualNumber">Item Number</Label>
                  <Input
                    id="manualNumber"
                    placeholder="e.g., 593"
                    value={manualNumber}
                    onChange={(e) => setManualNumber(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualVariant">Variant</Label>
                  <Input
                    id="manualVariant"
                    placeholder="e.g., Glow in the Dark"
                    value={manualVariant}
                    onChange={(e) => setManualVariant(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Identification Codes */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Identification Codes</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manualUpcA">UPC-A</Label>
                  <Input
                    id="manualUpcA"
                    placeholder="e.g., 889698123456"
                    value={manualUpcA}
                    onChange={(e) => setManualUpcA(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualEan13">EAN-13</Label>
                  <Input
                    id="manualEan13"
                    placeholder="e.g., 1234567890123"
                    value={manualEan13}
                    onChange={(e) => setManualEan13(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualAsin">Amazon ASIN</Label>
                  <Input
                    id="manualAsin"
                    placeholder="e.g., B08N5WRWNW"
                    value={manualAsin}
                    onChange={(e) => setManualAsin(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualModel">Model #</Label>
                  <Input
                    id="manualModel"
                    placeholder="e.g., FUN12345"
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Product Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manualCountry">Country of Registration</Label>
                  <Select value={manualCountry} onValueChange={setManualCountry}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualBrand">Brand</Label>
                  <Select value={manualBrand} onValueChange={setManualBrand}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {BRANDS.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualSize">Size</Label>
                  <Select value={manualSize} onValueChange={setManualSize}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {SIZES.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualColor">Color</Label>
                  <Input
                    id="manualColor"
                    placeholder="e.g., Red, Blue, Multicolor"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualWeight">Weight</Label>
                  <Input
                    id="manualWeight"
                    placeholder="e.g., 0.5 lbs"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualDimensions">Product Dimensions</Label>
                  <Input
                    id="manualDimensions"
                    placeholder="e.g., 3.75 x 3.75 x 4.75 inches"
                    value={manualDimensions}
                    onChange={(e) => setManualDimensions(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Database Classification */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Database Classification</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manualStatus">Status</Label>
                  <Select value={manualStatus} onValueChange={setManualStatus}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {FILTER_OPTIONS.status.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualCategory">Category</Label>
                  <Select value={manualCategory} onValueChange={setManualCategory}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {FILTER_OPTIONS.category.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualFandom">Fandom</Label>
                  <Select value={manualFandom} onValueChange={setManualFandom}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select fandom" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                      {FILTER_OPTIONS.fandom.map(fandom => (
                        <SelectItem key={fandom} value={fandom}>{fandom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualGenre">Genre</Label>
                  <Select value={manualGenre} onValueChange={setManualGenre}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {FILTER_OPTIONS.genre.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualEdition">Edition</Label>
                  <Select value={manualEdition} onValueChange={setManualEdition}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select edition" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                      {FILTER_OPTIONS.edition.map(edition => (
                        <SelectItem key={edition} value={edition}>{edition}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualRarity">Rarity</Label>
                  <Select value={manualRarity} onValueChange={setManualRarity}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {FILTER_OPTIONS.rarity.map(rarity => (
                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Collection Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Your Collection Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manualCondition">Condition</Label>
                  <Select value={manualCondition} onValueChange={setManualCondition}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {FILTER_OPTIONS.condition.map(condition => (
                        <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualPrice">Purchase Price</Label>
                  <Input
                    id="manualPrice"
                    placeholder="0.00"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Special Attributes */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Special Attributes</h4>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualExclusive}
                    onChange={(e) => setManualExclusive(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-white">Exclusive</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualVaulted}
                    onChange={(e) => setManualVaulted(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-white">Vaulted</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualChase}
                    onChange={(e) => setManualChase(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-white">Chase</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="manualDescription">Description</Label>
              <Textarea
                id="manualDescription"
                placeholder="Additional details about this Funko Pop..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="bg-gray-800 border-gray-700"
                rows={3}
              />
            </div>

            {manualError && <div className="text-red-500 text-sm mt-2">{manualError}</div>}
            
            <div className="pt-4">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                onClick={handleManualAdd} 
                disabled={manualLoading || isUpdating}
              >
                {manualLoading || isUpdating ? 'Adding...' : 'Add to Collection'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAddItemDialog;
