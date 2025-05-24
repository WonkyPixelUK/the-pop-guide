
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BarChart3, Users, Zap, LogOut, Settings, Heart, List, TrendingUp } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import WishlistGrid from "@/components/WishlistGrid";
import CustomListsManager from "@/components/CustomListsManager";
import CollectionAnalytics from "@/components/CollectionAnalytics";
import EnhancedAddItemDialog from "@/components/EnhancedAddItemDialog";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useFunkoPops, useUserCollection } from "@/hooks/useFunkoPops";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading } = useUserCollection(user?.id);
  const { wishlist, isLoading: wishlistLoading } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/');
    }
  };

  // Transform data to match the existing component interface
  const transformedItems = funkoPops.map(pop => {
    const isOwned = userCollection.some(item => item.funko_pop_id === pop.id);
    const userItem = userCollection.find(item => item.funko_pop_id === pop.id);
    
    return {
      id: pop.id,
      name: pop.name,
      series: pop.series,
      number: pop.number || "",
      image: pop.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: pop.estimated_value || 0,
      rarity: pop.is_chase ? "Chase" : pop.is_exclusive ? "Exclusive" : "Common",
      owned: isOwned,
      condition: userItem?.condition,
      purchase_price: userItem?.purchase_price,
    };
  });

  const totalValue = userCollection.reduce((sum, item) => {
    return sum + (item.funko_pops?.estimated_value || 0);
  }, 0);

  const ownedCount = userCollection.length;
  const uniqueSeries = new Set(userCollection.map(item => item.funko_pops?.series)).size;
  const wishlistCount = wishlist.length;

  if (authLoading || funkoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-500">Pop</span>
                <span className="text-white">Guide</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white mr-2">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Link to="/profile-settings">
                <Button 
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
                <div className="text-gray-400">Collection Value</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{ownedCount}</div>
                <div className="text-gray-400">Items Owned</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{wishlistCount}</div>
                <div className="text-gray-400">Wishlist Items</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{uniqueSeries}</div>
                <div className="text-gray-400">Series Collected</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-8">
              <TabsTrigger value="collection" className="data-[state=active]:bg-orange-500">
                <Zap className="w-4 h-4 mr-2" />
                Collection
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="data-[state=active]:bg-orange-500">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="lists" className="data-[state=active]:bg-orange-500">
                <List className="w-4 h-4 mr-2" />
                Custom Lists
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">My Collection</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search collection..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <CollectionGrid 
                items={transformedItems} 
                onItemClick={setSelectedItem}
                searchQuery={searchQuery}
                showWishlistOnly={false}
              />
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">My Wishlist</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search wishlist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {wishlistLoading ? (
                <div className="text-white">Loading wishlist...</div>
              ) : (
                <WishlistGrid items={wishlist} searchQuery={searchQuery} />
              )}
            </TabsContent>

            <TabsContent value="lists">
              <CustomListsManager />
            </TabsContent>

            <TabsContent value="analytics">
              <CollectionAnalytics userCollection={userCollection} funkoPops={funkoPops} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Dialogs */}
      <EnhancedAddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
      
      {selectedItem && (
        <ItemDetailsDialog 
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
