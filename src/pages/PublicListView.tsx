import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, ArrowLeft, Eye, Calendar } from "lucide-react";
import { useListById } from "@/hooks/useCustomLists";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import MobileBottomNav from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CollectionGrid from '@/components/CollectionGrid';

const PublicListView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: list, isLoading, error } = useListById(id!);
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const increaseViews = async () => {
    if (user && list?.id) {
      await supabase.from('custom_lists').update({
        views: (list.views || 0) + 1
      }).eq('id', list.id);
    }
  };

  // Increase view count when component mounts (must be before early returns)
  useEffect(() => {
    if (list?.id) {
      increaseViews();
    }
  }, [list?.id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading list...</div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">List Not Found</h1>
            <p className="text-gray-400 mb-6">This list doesn't exist or is no longer available.</p>
            <Link to="/browse-lists">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Other Lists
              </Button>
            </Link>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Transform list items to collection grid format
  const listItems = list.list_items?.map(item => ({
    id: item.funko_pops?.id,
    name: item.funko_pops?.name,
    series: item.funko_pops?.series,
    number: item.funko_pops?.number || "",
    image: item.funko_pops?.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
    value: item.funko_pops?.estimated_value || 0,
    rarity: item.funko_pops?.is_chase ? "Chase" : item.funko_pops?.is_exclusive ? "Exclusive" : "Common",
    owned: false, // This is a list view, not personal collection
  })) || [];

  const totalValue = listItems.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalItems = listItems.length;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name,
          text: list.description || `Check out this awesome Funko Pop list: ${list.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The list link has been copied to your clipboard.",
    });
    setShareDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link to="/browse-lists">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </Button>
            </Link>
          </div>
          
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 hover:text-white focus:text-white active:text-white bg-gray-800/50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share List
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Share this List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300">Share this awesome Funko Pop list with your friends!</p>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} className="flex-1 bg-orange-500 hover:bg-orange-600">
                    Copy Link
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="flex-1 border-gray-600 hover:bg-gray-800">
                    Native Share
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List Info Card */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl font-bold text-white">{list.name}</CardTitle>
                  {list.is_public && (
                    <Badge className="bg-green-600 text-white">
                      Public
                    </Badge>
                  )}
                </div>
                {list.description && (
                  <p className="text-gray-300 text-lg mb-4">{list.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{list.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-blue-400 font-medium">
                    by {list.profiles?.full_name || list.profiles?.username || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">{totalItems}</div>
                <div className="text-gray-400 text-sm">Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">${totalValue.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">Est. Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {new Set(listItems.map(item => item.series)).size}
                </div>
                <div className="text-gray-400 text-sm">Series</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">
                  {listItems.filter(item => item.rarity === 'Chase' || item.rarity === 'Exclusive').length}
                </div>
                <div className="text-gray-400 text-sm">Rare Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List Items Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Items in this List</h2>
          {listItems.length === 0 ? (
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 text-lg">This list is empty.</div>
                <p className="text-gray-500 mt-2">No items have been added to this list yet.</p>
              </CardContent>
            </Card>
          ) : (
            <CollectionGrid 
              items={listItems}
              onItemClick={() => {}} // We can add item details later if needed
              searchQuery=""
              showWishlistOnly={false}
            />
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default PublicListView; 