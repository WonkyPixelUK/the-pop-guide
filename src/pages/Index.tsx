import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, BarChart3, Users, Zap, LogOut } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import EnhancedAddItemDialog from "@/components/EnhancedAddItemDialog";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFunkoPops, useUserCollection } from "@/hooks/useFunkoPops";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { user, loading: authLoading } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading } = useUserCollection(user?.id);

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

  if (authLoading || funkoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Your <span className="text-orange-500">Ultimate</span> Funko Pop Collection
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Track, value, and showcase your Funko Pop collection with real-time market data, comprehensive analytics, and social features.
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
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
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{uniqueSeries}</div>
                <div className="text-gray-400">Series Collected</div>
              </CardContent>
            </Card>
          </div>

          {user && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </section>

      {/* Collection Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
              {user ? "My Collection" : "Funko Pop Database"}
            </h2>
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

          {!user && (
            <div className="text-center py-8 bg-gray-800/30 rounded-lg mb-8">
              <p className="text-gray-300 mb-4">Sign in to start tracking your personal collection with advanced features!</p>
            </div>
          )}

          <CollectionGrid 
            items={transformedItems} 
            onItemClick={setSelectedItem}
            searchQuery={searchQuery}
            showWishlistOnly={false}
          />
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

export default Index;
