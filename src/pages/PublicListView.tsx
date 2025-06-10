import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, ArrowLeft, Calendar, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import MobileBottomNav from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CollectionGrid from '@/components/CollectionGrid';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';

const PublicListView = () => {
  const { listId } = useParams<{ listId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currency, setCurrency, isLoading } = useCurrency();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Simplified fetch function with better error handling
  useEffect(() => {
    const fetchList = async () => {
      if (!listId) {
        setError("No list ID provided");
        setLoading(false);
        return;
      }

      console.log('🔍 PublicListView - Fetching list:', listId);
      setDebugInfo({ step: 'Starting fetch', listId });
      
      try {
        // Step 1: Simple check if list exists and is public
        console.log('🔍 Step 1: Checking if list exists and is public...');
        const { data: basicList, error: basicError } = await supabase
          .from('custom_lists')
          .select('id, name, is_public, user_id, created_at, description')
          .eq('id', listId)
          .single();

        console.log('Database response:', { basicList, basicError });
        setDebugInfo(prev => ({ 
          ...prev, 
          step1: { 
            basicList, 
            basicError,
            errorCode: basicError?.code,
            errorMessage: basicError?.message 
          } 
        }));

        if (basicError) {
          console.log('❌ List query failed:', basicError);
          setError("not_found");
          setLoading(false);
          return;
        }

        if (!basicList) {
          console.log('❌ No list returned from query');
          setError("not_found");
          setLoading(false);
          return;
        }

        // Check if list is public
        if (!basicList.is_public) {
          console.log('🔒 List exists but is private');
          setError("private");
          setList({ name: basicList.name });
          setLoading(false);
          return;
        }

        console.log('✅ List found and is public:', basicList.name);

        // Step 2: Get full list data with items (optional - fallback to basic if this fails)
        console.log('🔍 Step 2: Fetching full list data with items...');
        const { data: fullList, error: fullError } = await supabase
          .from('custom_lists')
          .select(`
            *,
            list_items (
              id,
              funko_pops (
                id,
                name,
                series,
                number,
                image_url,
                estimated_value,
                is_chase,
                is_exclusive
              )
            )
          `)
          .eq('id', listId)
          .single();

        setDebugInfo(prev => ({ 
          ...prev, 
          step2: { 
            fullList, 
            fullError,
            errorCode: fullError?.code,
            errorMessage: fullError?.message,
            listItemsCount: fullList?.list_items?.length || 0
          } 
        }));

        if (fullError) {
          console.log('⚠️ Full query failed, using basic data:', fullError);
          // Use basic data but still show the list
          setList({
            ...basicList,
            list_items: []
          });
        } else {
          console.log('✅ Successfully fetched full list data');
          console.log('📊 List items raw data:', fullList?.list_items);
          console.log('📊 First list item details:', fullList?.list_items?.[0]);
          
          // Get profile info separately if needed
          let profileData = null;
          if (basicList.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', basicList.user_id)
              .single();
            profileData = profile;
          }
          
          setList({
            ...fullList,
            profiles: profileData
          });
        }

      } catch (error) {
        console.error('❌ Unexpected error fetching list:', error);
        setError("fetch_error");
        setDebugInfo(prev => ({ ...prev, unexpectedError: error }));
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [listId, user]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Loading list...</div>
            <div className="text-gray-400 text-sm">List ID: {listId}</div>
            {debugInfo && (
              <div className="text-gray-500 text-xs mt-2">
                Debug: {debugInfo.step}
              </div>
            )}
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Show private list message
  if (error === "private") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Private List</h1>
            <p className="text-gray-400 mb-2">This list is set to private and can only be viewed by its owner.</p>
            <p className="text-gray-500 text-sm mb-6">List: "{list?.name}"</p>
            <Link to="/browse-lists">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Public Lists
              </Button>
            </Link>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Show not found message
  if (error === "not_found" || error === "fetch_error" || !list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-white mb-4">List Not Found</h1>
            <p className="text-gray-400 mb-2">This list doesn't exist or has been deleted.</p>
            <p className="text-gray-500 text-sm mb-6">List ID: {listId}</p>
            <Link to="/browse-lists">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Public Lists
              </Button>
            </Link>
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <details className="mt-4 text-left">
                <summary className="text-gray-400 cursor-pointer">Debug Info</summary>
                <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Transform list items to collection grid format
  console.log('🔄 Transforming list items:', list?.list_items);
  const listItems = list.list_items?.filter((item: any) => item.funko_pops).map((item: any) => ({
    id: item.funko_pops?.id,
    name: item.funko_pops?.name,
    series: item.funko_pops?.series,
    number: item.funko_pops?.number || "",
    image: item.funko_pops?.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
    value: item.funko_pops?.estimated_value || 0,
    rarity: item.funko_pops?.is_chase ? "Chase" : item.funko_pops?.is_exclusive ? "Exclusive" : "Common",
    owned: false, // This is a list view, not personal collection
  })) || [];
  
  console.log('✨ Transformed list items:', listItems);
  console.log('🔢 Total items after transformation:', listItems.length);

  const totalValue = listItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
  const totalItems = listItems.length;

  // Debug currency and localStorage
  console.log('🔍 PublicListView Currency Debug:', { 
    currency, 
    totalValue, 
    formattedValue: formatCurrency(totalValue, currency),
    localStorage_currency: localStorage.getItem('preferred-currency'),
    isLoading
  });
  
  // Simple currency debug without useEffect to avoid hook order issues
  if (!isLoading && process.env.NODE_ENV === 'development') {
    const savedCurrency = localStorage.getItem('preferred-currency');
    console.log('💱 Currency Debug:', {
      currentCurrency: currency,
      savedInLocalStorage: savedCurrency,
      expectedDefault: 'GBP'
    });
  }

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
                  <Button onClick={handleShare} variant="outline" className="flex-1 border-gray-600 hover:bg-gray-800 text-white hover:text-white">
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
                  <Badge className="bg-green-600 text-white">
                    Public
                  </Badge>
                </div>
                {list.description && (
                  <p className="text-gray-300 text-lg mb-4">{list.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
                <div className="text-3xl font-bold text-green-500 mb-1">{formatCurrency(totalValue, currency)}</div>
                <div className="text-gray-400 text-sm">Est. Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {new Set(listItems.map((item: any) => item.series)).size}
                </div>
                <div className="text-gray-400 text-sm">Series</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">
                  {listItems.filter((item: any) => item.rarity === 'Chase' || item.rarity === 'Exclusive').length}
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

        {/* Development Debug Info */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <Card className="bg-gray-800/30 border-gray-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white text-lg">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white mb-4">
                <p><strong>List Items Count:</strong> {list?.list_items?.length || 0}</p>
                <p><strong>Transformed Items Count:</strong> {listItems.length}</p>
                <p><strong>List Name:</strong> {list?.name}</p>
                <p><strong>Is Public:</strong> {list?.is_public ? 'Yes' : 'No'}</p>
              </div>
              <pre className="text-xs text-gray-400 overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              {list?.list_items && (
                <div className="mt-4">
                  <p className="text-white mb-2">Raw List Items (first 3):</p>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                    {JSON.stringify(list.list_items.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default PublicListView; 