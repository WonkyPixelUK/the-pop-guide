import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, TrendingUp, Calendar, DollarSign, User, CheckCircle, Plus, Link as LinkIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddToCollection } from "@/hooks/useFunkoPops";
import { useCustomLists } from "@/hooks/useCustomLists";
import { useToast } from '@/hooks/use-toast';
import { usePriceHistory } from '@/hooks/usePriceScraping';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PriceHistory from './PriceHistory';

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
  image_url?: string;
  estimated_value?: number;
  variant?: string;
  is_exclusive?: boolean;
  exclusive_to?: string;
  is_chase?: boolean;
  release_date?: string;
  category?: string;
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
  const [addingToCollection, setAddingToCollection] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: priceHistory = [], isLoading: priceLoading } = usePriceHistory(item.id);

  const isWishlisted = wishlist.some((w: any) => w.funko_pop_id === item.id);
  const isOwned = item.owned || ownedConfirmed;

  const requireLogin = () => {
    if (!user) {
      navigate('/login');
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
    if (isOwned || addingToCollection) return;
    
    setAddingToCollection(true);
    addToCollection.mutate(item.id, {
      onSuccess: () => {
        setOwnedConfirmed(true);
        setAddingToCollection(false);
        toast({ 
          title: '✅ Added to Collection!', 
          description: `${item.name} has been added to your collection.`,
          duration: 3000
        });
        // Reset the success state after 5 seconds
        setTimeout(() => setOwnedConfirmed(false), 5000);
      },
      onError: (error: any) => {
        setAddingToCollection(false);
        toast({
          title: '❌ Failed to Add',
          description: error.message || 'Could not add to collection. Please try again.',
          variant: 'destructive',
          duration: 5000
        });
      }
    });
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
      <DialogContent className="max-w-[90vw] w-full rounded-lg p-6 bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogDescription>
          {item.description ? item.description : <span className="sr-only">Funko Pop details and actions</span>}
        </DialogDescription>
        
        {/* Header */}
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-bold text-white pr-8">{item.name}</DialogTitle>
          <p className="text-gray-400 text-xl">{item.series}</p>
        </DialogHeader>
        
        {/* Main Content - Side by Side Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Image and Buttons */}
          <div className="lg:w-96 lg:flex-shrink-0">
            <div className="aspect-square bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
              {(item.image || item.image_url) ? (
                <img 
                  src={item.image || item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${(item.image || item.image_url) ? 'hidden' : ''}`}>
                <div className="text-6xl mb-4">📦</div>
                <div className="text-lg">No Image Available</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant={isOwned ? 'default' : 'outline'}
                className={
                  isOwned 
                    ? ownedConfirmed 
                      ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse w-full h-12 text-base' 
                      : 'bg-green-600 text-white hover:bg-green-700 w-full h-12 text-base'
                    : addingToCollection 
                    ? 'border-orange-600 bg-orange-50 text-orange-600 hover:bg-orange-100 w-full h-12 text-base' 
                    : 'border-gray-600 hover:bg-gray-600 w-full h-12 text-base'
                }
                onClick={handleAddToCollection}
                disabled={isOwned || addingToCollection}
              >
                {addingToCollection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : isOwned ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {ownedConfirmed ? 'Added!' : 'Owned'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Own this Pop
                  </>
                )}
              </Button>
              
              <Button 
                variant={isWishlisted ? 'default' : 'outline'}
                className={`w-full h-12 text-base ${isWishlisted ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-400 hover:bg-red-600'}`}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
              
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-400 hover:bg-blue-600 w-full h-12 text-base"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex-1 min-w-0">
            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">📦</span>
                  Category
                </div>
                <div className="font-semibold text-white text-lg">{item.category || 'Pop!'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">📈</span>
                  Number
                </div>
                <div className="font-semibold text-white text-lg">{item.number || '—'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">💎</span>
                  Value
                </div>
                <div className="font-semibold text-white text-lg">
                  {item.estimated_value ? `£${item.estimated_value.toFixed(2)}` : '—'}
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">🎬</span>
                  Fandom
                </div>
                <div className="font-semibold text-white text-lg">{item.fandom || item.series || '—'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">🎭</span>
                  Genre
                </div>
                <div className="font-semibold text-white text-lg">{item.genre || '—'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">🏷️</span>
                  Edition
                </div>
                <div className="font-semibold text-white text-lg">{item.edition || (item.is_exclusive ? item.exclusive_to || 'Exclusive' : '—')}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">🗓️</span>
                  Release Year
                </div>
                <div className="font-semibold text-white text-lg">{item.release_date ? new Date(item.release_date).getFullYear() : '—'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">🔒</span>
                  Vaulted
                </div>
                <div className="font-semibold text-white text-lg">{item.is_vaulted ? 'Yes' : 'No'}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1 flex items-center">
                  <span className="mr-2">👤</span>
                  Owned
                </div>
                <div className={`font-semibold text-lg ${isOwned ? 'text-green-400' : 'text-white'}`}>
                  {isOwned ? (ownedConfirmed ? '✅ Yes (Just Added!)' : '✅ Yes') : 'No'}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(item.variant || item.is_exclusive || item.is_chase) && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
                <h3 className="font-semibold mb-3 text-white text-lg">Additional Details</h3>
                <div className="space-y-2 text-sm">
                  {item.variant && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variant:</span>
                      <span className="text-white">{item.variant}</span>
                    </div>
                  )}
                  {item.is_exclusive && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exclusive to:</span>
                      <span className="text-white">{item.exclusive_to || 'Yes'}</span>
                    </div>
                  )}
                  {item.is_chase && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chase:</span>
                      <span className="text-yellow-400">Yes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price History - Full Width */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <PriceHistory funkoPopId={item.id} funkoPopName={item.name} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;
