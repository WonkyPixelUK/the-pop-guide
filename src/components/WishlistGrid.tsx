import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, DollarSign, Bell } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistItem {
  id: string;
  max_price?: number;
  funko_pops: {
    id: string;
    name: string;
    series: string;
    number: string;
    image_url?: string;
    estimated_value?: number;
    is_chase?: boolean;
    is_exclusive?: boolean;
  };
}

interface WishlistGridProps {
  items: WishlistItem[];
  searchQuery: string;
}

const WishlistGrid = ({ items, searchQuery }: WishlistGridProps) => {
  const { removeFromWishlist } = useWishlist();

  const filteredItems = items.filter(item => 
    item.funko_pops.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.funko_pops.series.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRarityColor = (item: WishlistItem['funko_pops']) => {
    if (item.is_chase) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (item.is_exclusive) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getRarityText = (item: WishlistItem['funko_pops']) => {
    if (item.is_chase) return 'Chase';
    if (item.is_exclusive) return 'Exclusive';
    return 'Common';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {filteredItems.map((item) => (
        <Card 
          key={item.id}
          className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer hover:border-orange-500/50"
          onClick={() => console.log('Clicked wishlist item:', item.funko_pops.name)}
        >
          <CardContent className="p-4 w-full">
            <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              <img 
                src={item.funko_pops.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png"} 
                alt={item.funko_pops.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                }}
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-white text-sm leading-tight">{item.funko_pops.name}</h3>
                <p className="text-gray-400 text-xs">{item.funko_pops.series} #{item.funko_pops.number}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getRarityColor(item.funko_pops)}`}>
                  {getRarityText(item.funko_pops)}
                </Badge>
                <span className="text-orange-500 font-semibold text-sm">
                  ${item.funko_pops.estimated_value?.toFixed(2) || '0.00'}
                </span>
              </div>

              {item.max_price && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Bell className="w-3 h-3" />
                  <span>Alert at ${item.max_price}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                  onClick={() => removeFromWishlist.mutate(item.funko_pops.id)}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WishlistGrid;
