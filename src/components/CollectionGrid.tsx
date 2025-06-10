import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCollection, useRemoveFromCollection } from "@/hooks/useFunkoPops";
import { useManualScraping } from "@/hooks/useManualScraping";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatCurrency";

interface CollectionItem {
  id: string;
  name: string;
  series: string;
  number: string;
  image: string;
  value: number;
  rarity: string;
  owned: boolean;
  condition?: string;
  purchase_price?: number;
}

interface CollectionGridProps {
  items: CollectionItem[];
  onItemClick: (item: CollectionItem) => void;
  searchQuery: string;
  showWishlistOnly?: boolean;
}

const CollectionGrid = ({ items, onItemClick, searchQuery, showWishlistOnly = false }: CollectionGridProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const addToCollection = useAddToCollection();
  const removeFromCollection = useRemoveFromCollection();
  const manualScraping = useManualScraping();

  const filteredItems = items.filter(item => {
    if (!item || typeof item !== 'object') return false;
    const name = typeof item.name === 'string' ? item.name : '';
    const series = typeof item.series === 'string' ? item.series : '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showWishlistOnly) {
      return matchesSearch && !item.owned;
    }
    
    return matchesSearch;
  });

  const getRarityColor = (rarity: string | undefined) => {
    if (!rarity) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    switch (rarity.toLowerCase()) {
      case 'chase':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'exclusive':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'rare':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleAddToCollection = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
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
      });
      toast({
        title: "Added to collection",
        description: `${item.name} has been added to your collection`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to collection",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromCollection = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await removeFromCollection.mutateAsync({
        funkoPopId: item.id,
        userId: user.id,
      });
      toast({
        title: "Removed from collection",
        description: `${item.name} has been removed from your collection`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from collection",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePricing = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to update pricing",
        variant: "destructive",
      });
      return;
    }

    try {
      await manualScraping.mutateAsync({
        funkoPopId: item.id,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {filteredItems.map((item) => (
        <Card 
          key={item.id}
          className={`bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer ${
            item.owned 
              ? 'hover:border-orange-500/50' 
              : 'opacity-70 hover:opacity-100'
          }`}
          onClick={() => onItemClick(item)}
        >
          <CardContent className="p-4">
            <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                {user && (
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      onClick={(e) => handleUpdatePricing(item, e)}
                      disabled={manualScraping.isPending}
                      title="Update pricing"
                    >
                      <RefreshCw className={`w-3 h-3 ${manualScraping.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    {item.owned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={(e) => handleRemoveFromCollection(item, e)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={(e) => handleAddToCollection(item, e)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-xs">{item.series} #{item.number}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                  {item.rarity}
                </Badge>
                <span className="text-orange-500 font-semibold text-sm">
                  {typeof item.value === 'number' ? formatCurrency(item.value, currency) : formatCurrency(0, currency)}
                </span>
              </div>

              {item.owned && item.condition && (
                <p className="text-xs text-gray-500">Condition: {item.condition}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollectionGrid;
