import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { usePriceHistory } from '@/hooks/usePriceScraping';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  fandom?: string;
  genre?: string;
  edition?: string;
  release_year?: string;
  is_vaulted?: boolean;
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
  const { data: priceHistory = [], isLoading: priceLoading } = usePriceHistory(item.id);

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
      <DialogContent className="max-w-md w-full rounded-lg p-2 bg-gray-900 border-gray-700 text-white md:max-w-2xl md:p-8">
        <DialogDescription>
          {item.description ? item.description : <span className="sr-only">Funko Pop details and actions</span>}
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-shrink-0 flex flex-col items-center w-full md:w-56">
            <div className="w-40 h-40 md:w-56 md:h-56 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <User className="w-16 h-16 text-orange-400 animate-pulse" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getRarityColor(item.rarity)}>{item.rarity || 'Common'}</Badge>
              {item.value !== null && item.value !== undefined ? (
                <Badge className="bg-green-700/20 text-green-300 border-green-700/30 flex items-center"><DollarSign className="w-4 h-4 mr-1" />£{item.value}</Badge>
              ) : (
                <Badge className="bg-gray-700/20 text-gray-300 border-gray-700/30">Pending</Badge>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-gray-300 mb-2 text-base">{item.description}</div>
            <Separator className="my-2 bg-gray-700" />
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
              <span className="flex items-center"><User className="w-4 h-4 mr-1" />Character: {item.name}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Series: {item.series}</span>
              <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-1" />Number: {item.number}</span>
              <span className="flex items-center">Fandom: {item.fandom || '—'}</span>
              <span className="flex items-center">Genre: {item.genre || '—'}</span>
              <span className="flex items-center">Edition: {item.edition || '—'}</span>
              <span className="flex items-center">Release Year: {item.release_year || '—'}</span>
              <span className="flex items-center">Vaulted: {item.is_vaulted ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-2">
              <span className="flex items-center"><User className="w-4 h-4 mr-1" />Owned: {item.owned ? 'Yes' : 'No'}</span>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={isWishlisted ? 'default' : 'outline'}
                className={isWishlisted ? 'bg-pink-600 text-white hover:bg-pink-700' : 'border-gray-600 hover:bg-gray-600'}
                onClick={handleWishlist}
              >
                {isWishlisted ? <CheckCircle className="w-4 h-4 mr-1" /> : <Heart className="w-4 h-4 mr-1" />}
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button
                variant={isOwned ? 'default' : 'outline'}
                className={isOwned ? 'bg-orange-500 text-white hover:bg-orange-600' : 'border-gray-600 hover:bg-gray-600'}
                onClick={handleAddToCollection}
                disabled={isOwned}
              >
                {isOwned ? <CheckCircle className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                {isOwned ? 'Owned' : 'Own this Pop'}
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 hover:bg-gray-600"
                onClick={() => setListModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />Add to List
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-gray-700"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />Share
              </Button>
            </div>
            {/* Add to List Modal */}
            {listModalOpen && (
              <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="mb-2 font-semibold text-white">Add to List</div>
                <div className="flex flex-col gap-2">
                  {lists && lists.length > 0 ? (
                    lists.map((list: any) => (
                      <Button
                        key={list.id}
                        variant="outline"
                        className="justify-start border-gray-600 hover:bg-gray-700"
                        onClick={() => handleAddToList(list.id)}
                        disabled={addingToListId === list.id}
                      >
                        {addingToListId === list.id ? 'Adding...' : list.name}
                      </Button>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No lists found.</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="New list name"
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white flex-1"
                      disabled={creatingList}
                    />
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleCreateList}
                      disabled={creatingList || !newListName.trim()}
                    >
                      {creatingList ? 'Creating...' : 'Create List'}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="mt-2 text-gray-400 hover:text-white"
                    onClick={() => setListModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {/* Value History Graph */}
            <div className="mt-8">
              <div className="font-semibold text-white mb-2">Value History</div>
              {priceLoading ? (
                <div className="text-gray-400 text-sm">Loading value history...</div>
              ) : priceHistory && priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={priceHistory.slice().reverse()} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date_scraped" tickFormatter={d => d && d.slice(0, 10)} stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-sm">No value history available.</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;
