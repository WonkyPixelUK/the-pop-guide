import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, TrendingUp, Calendar, DollarSign, User, CheckCircle, Plus, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddToCollection } from "@/hooks/useFunkoPops";
import { useCustomLists } from "@/hooks/useCustomLists";
import { useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Item {
  id: number;
  name: string;
  series: string;
  number: string;
  image: string;
  value: number;
  rarity: string;
  owned: boolean;
  description?: string;
}

interface ItemDetailsDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ItemDetailsDialog = ({ item, open, onOpenChange }: ItemDetailsDialogProps) => {
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const addToCollection = useAddToCollection();
  const { lists, addItemToList, createList } = useCustomLists();
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [ownedConfirmed, setOwnedConfirmed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isWishlisted = wishlist.some((w: any) => w.funko_pop_id === item.id);
  const isOwned = item.owned;

  const requireLogin = () => {
    if (!user) {
      navigate('/auth');
      return true;
    }
    return false;
  };

  const handleWishlist = () => {
    if (requireLogin()) return;
    if (isWishlisted) {
      removeFromWishlist.mutate(item.id);
    } else {
      addToWishlist.mutate({ funkoPopId: item.id });
    }
  };

  const handleAddToCollection = () => {
    if (requireLogin()) return;
    if (!isOwned && user) {
      addToCollection.mutate({ funkoPopId: item.id, userId: user.id }, {
        onSuccess: () => {
          setOwnedConfirmed(true);
          setTimeout(() => setOwnedConfirmed(false), 2000);
        }
      });
    }
  };

  const handleAddToList = (listId: string) => {
    if (requireLogin()) return;
    setAddingToListId(listId);
    addItemToList.mutate({ listId, funkoPopId: item.id });
    setListModalOpen(false);
    setAddingToListId(null);
  };

  const handleShare = () => {
    if (requireLogin()) return;
    const url = `${window.location.origin}/pop/${item.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this Pop with others.' });
  };

  const handleCreateList = () => {
    if (requireLogin()) return;
    if (!newListName.trim()) return;
    createList.mutate({ name: newListName }, {
      onSuccess: () => {
        setNewListName("");
        setCreatingList(false);
      }
    });
  };

  const getRarityColor = (rarity: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>
        {/* Description */}
        {item.description && (
          <div className="text-gray-300 mb-2 text-base">{item.description}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentNode.querySelector('.pop-fallback-icon');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Fallback Icon for missing or failed images */}
              <div className="pop-fallback-icon w-full h-full flex items-center justify-center animate-pulse" style={{display: item.image ? 'none' : 'flex'}}>
                <User className="w-16 h-16 text-orange-400 drop-shadow-lg" />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-600 hover:bg-gray-800 min-w-[120px]"
                  onClick={handleWishlist}
                  disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                <Button 
                  variant={ownedConfirmed ? "default" : "outline"}
                  className={`flex-1 border-gray-600 hover:bg-gray-800 min-w-[120px] ${ownedConfirmed ? 'bg-green-600 text-white' : ''}`}
                  onClick={handleAddToCollection}
                  disabled={isOwned || addToCollection.isPending}
                >
                  {ownedConfirmed ? <><CheckCircle className="w-4 h-4 mr-2 text-white" /> Added!</> : isOwned ? 'In Collection' : 'Own this Pop'}
                </Button>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-600 hover:bg-gray-800 min-w-[120px]"
                  onClick={() => { if (!requireLogin()) setListModalOpen(true); }}
                >
                  Add to List
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-gray-600 hover:bg-gray-800"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Value History Placeholder */}
            <div className="bg-gray-800 rounded-lg p-4 mt-2 flex flex-col items-center">
              <span className="text-gray-400 text-xs mb-2">Value History (placeholder)</span>
              <svg width="100%" height="60" viewBox="0 0 200 60">
                <polyline fill="none" stroke="#f97316" strokeWidth="3" points="0,50 40,40 80,45 120,30 160,35 200,20" />
              </svg>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Character:</span>
                  <span>{item.name}</span>
                </div>
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
                    {typeof item.value === "number" && !isNaN(item.value)
                      ? `$${item.value.toFixed(2)}`
                      : "N/A"}
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
      {/* Add to List Modal */}
      {listModalOpen && (
        <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">Add to List
                <Button size="icon" variant="ghost" className="ml-auto" onClick={() => setCreatingList(v => !v)}>
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            {creatingList && (
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  placeholder="New list name"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); }}
                />
                <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                  Create
                </Button>
              </div>
            )}
            <div className="space-y-2">
              {lists && lists.length > 0 ? (
                lists.map((list: any) => (
                  <Button
                    key={list.id}
                    className="w-full justify-start border-gray-700"
                    variant="outline"
                    onClick={() => handleAddToList(list.id)}
                    disabled={addingToListId === list.id || addItemToList.isPending}
                  >
                    {list.name}
                  </Button>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No lists found. Create a list first.</div>
              )}
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setListModalOpen(false)}>
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      )}
      {/* Sticker Guide Link */}
      <div className="mt-4 text-center">
        <a href="/sticker-guide" className="text-orange-400 underline text-sm">Need help understanding stickers?</a>
      </div>
    </Dialog>
  );
};

export default ItemDetailsDialog;
