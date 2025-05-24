
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CollectionItem {
  id: number;
  name: string;
  series: string;
  number: string;
  image: string;
  value: number;
  rarity: string;
  owned: boolean;
}

interface CollectionGridProps {
  items: CollectionItem[];
  onItemClick: (item: CollectionItem) => void;
  searchQuery: string;
}

const CollectionGrid = ({ items, onItemClick, searchQuery }: CollectionGridProps) => {
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.series.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRarityColor = (rarity: string) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => (
        <Card 
          key={item.id}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
            item.owned 
              ? 'bg-gray-800/70 border-gray-600 hover:border-orange-500/50' 
              : 'bg-gray-800/30 border-gray-700 opacity-70 hover:opacity-100'
          }`}
          onClick={() => onItemClick(item)}
        >
          <CardContent className="p-4">
            <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                {!item.owned && (
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                    Wishlist
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-400 text-xs">{item.series} #{item.number}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                  {item.rarity}
                </Badge>
                <span className="text-orange-500 font-semibold text-sm">
                  ${item.value.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollectionGrid;
