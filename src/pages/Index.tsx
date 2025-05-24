
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BarChart3, Users, Zap } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import AddItemDialog from "@/components/AddItemDialog";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock collection data
  const mockCollection = [
    {
      id: 1,
      name: "Spider-Man",
      series: "Marvel",
      number: "593",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 15.99,
      rarity: "Common",
      owned: true
    },
    {
      id: 2,
      name: "Batman",
      series: "DC Comics",
      number: "144",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 12.50,
      rarity: "Common",
      owned: true
    },
    {
      id: 3,
      name: "Pikachu (Chase)",
      series: "Pokemon",
      number: "553",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 89.99,
      rarity: "Chase",
      owned: false
    }
  ];

  const totalValue = mockCollection
    .filter(item => item.owned)
    .reduce((sum, item) => sum + item.value, 0);

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
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Your <span className="text-orange-500">Ultimate</span> Funko Pop Collection
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Track, value, and showcase your Funko Pop collection with real-time market data and comprehensive management tools.
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
                <div className="text-2xl font-bold text-white">{mockCollection.filter(item => item.owned).length}</div>
                <div className="text-gray-400">Items Owned</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-gray-400">Series Collected</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">My Collection</h2>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <CollectionGrid 
            items={mockCollection} 
            onItemClick={setSelectedItem}
            searchQuery={searchQuery}
          />
        </div>
      </section>

      {/* Dialogs */}
      <AddItemDialog 
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
