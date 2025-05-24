
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Scan, Upload, Heart, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCollection } from "@/hooks/useFunkoPops";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";

interface EnhancedAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedAddItemDialog = ({ open, onOpenChange }: EnhancedAddItemDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("mint");
  const [purchasePrice, setPurchasePrice] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const addToCollection = useAddToCollection();
  const { addToWishlist } = useWishlist();

  const mockSearchResults = [
    {
      id: "1",
      name: "Iron Man",
      series: "Marvel",
      number: "04",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 18.99,
      is_chase: false,
      is_exclusive: true,
    },
    {
      id: "2",
      name: "Wonder Woman",
      series: "DC Comics",
      number: "172",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 14.50,
      is_chase: true,
      is_exclusive: false,
    }
  ];

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add to Collection</DialogTitle>
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
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="near_mint">Near Mint</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (Optional)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockSearchResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.series} #{item.number}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {item.is_chase && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">Chase</span>
                      )}
                      {item.is_exclusive && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">Exclusive</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-500 font-semibold mb-2">
                      ${item.value}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-600"
                        onClick={() => handleAddToWishlist(item)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Wishlist
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleAddToCollection(item)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="text-center py-12">
              <Scan className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium mb-3">Barcode Scanner</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Use your device's camera to scan the barcode on your Funko Pop box. This will automatically identify the item and add it to your collection.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3">
                <Scan className="w-5 h-5 mr-2" />
                Start Camera
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Camera access required. Works best with good lighting.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manualName">Name</Label>
                <Input
                  id="manualName"
                  placeholder="e.g., Spider-Man"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualSeries">Series</Label>
                <Input
                  id="manualSeries"
                  placeholder="e.g., Marvel"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualNumber">Item Number</Label>
                <Input
                  id="manualNumber"
                  placeholder="e.g., 593"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualRarity">Rarity</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="chase">Chase</SelectItem>
                    <SelectItem value="exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualCondition">Condition</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="near_mint">Near Mint</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manualPrice">Purchase Price</Label>
                <Input
                  id="manualPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Add to Collection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAddItemDialog;
