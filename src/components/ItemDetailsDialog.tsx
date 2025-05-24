
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface Item {
  id: number;
  name: string;
  series: string;
  number: string;
  image: string;
  value: number;
  rarity: string;
  owned: boolean;
}

interface ItemDetailsDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ItemDetailsDialog = ({ item, open, onOpenChange }: ItemDetailsDialogProps) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-600 hover:bg-gray-800"
              >
                <Heart className="w-4 h-4 mr-2" />
                {item.owned ? 'In Collection' : 'Add to Wishlist'}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-gray-600 hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Series:</span>
                  <span>{item.series}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Item Number:</span>
                  <span>#{item.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rarity:</span>
                  <Badge className={getRarityColor(item.rarity)}>
                    {item.rarity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Release Date:</span>
                  <span>2023</span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div>
              <h3 className="text-lg font-semibold mb-2">Market Value</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">
                    ${item.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5.2% this month</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: 2 hours ago</span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {item.owned && (
              <div>
                <h3 className="text-lg font-semibold mb-2">My Item</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Purchase Date:</span>
                    <span>Dec 15, 2023</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Purchase Price:</span>
                    <span>$12.99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Condition:</span>
                    <span>Mint</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;
