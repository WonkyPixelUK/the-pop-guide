import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFunkoPopWithPricing } from '@/hooks/useFunkoPops';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import SEO from '@/components/SEO';
import PriceHistory from '@/components/PriceHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Heart, 
  Plus, 
  Share2, 
  Star, 
  Calendar, 
  Package, 
  TrendingUp, 
  Eye,
  Shield,
  Sparkles,
  Crown,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Helper function to get signed URL for Supabase storage images
const getSignedImageUrl = async (imageUrl: string) => {
  if (!imageUrl) return null;
  
  // Check if it's a Supabase storage URL
  if (imageUrl.includes('supabase') && imageUrl.includes('storage')) {
    try {
      // Extract the file path from the storage URL
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length > 1) {
        const [bucket, ...pathParts] = urlParts[1].split('/');
        const filePath = pathParts.join('/');
        
        // Create a signed URL that doesn't require authentication
        const { data } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        
        return data?.signedUrl || imageUrl;
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return imageUrl;
    }
  }
  
  return imageUrl;
};

const PublicPopView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const { data: pop, isLoading } = useFunkoPopWithPricing(id);
  const navigate = useNavigate();
  
  // State management
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  // Load user-specific data and prepare image URL
  useEffect(() => {
    if (pop) {
      if (user) {
        checkUserStatus();
        incrementViewCount();
      }
      
      // Get signed URL for image if it's from Supabase storage
      const prepareImageUrl = async () => {
        const imageUrl = pop.image_url || (pop.image_urls && pop.image_urls[0]);
        const signedUrl = await getSignedImageUrl(imageUrl);
        setSignedImageUrl(signedUrl);
      };
      
      prepareImageUrl();
    }
  }, [user, pop]);

  const checkUserStatus = async () => {
    if (!user || !pop) return;

    try {
      // Check if in collection
      const { data: collectionData } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', user.id)
        .eq('funko_pop_id', pop.id)
        .single();

      setIsOwned(!!collectionData);

      // Check if in wishlist
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('funko_pop_id', pop.id)
        .single();

      setIsWishlisted(!!wishlistData);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const incrementViewCount = async () => {
    if (!pop) return;

    try {
      // Get current view count and increment
      const { data: currentData } = await supabase
        .from('funko_pops')
        .select('view_count')
        .eq('id', pop.id)
        .single();

      const newViewCount = (currentData?.view_count || 0) + 1;
      setViewCount(newViewCount);

      // Update view count in database
      await supabase
        .from('funko_pops')
        .update({ view_count: newViewCount })
        .eq('id', pop.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleAddToCollection = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add items to your collection.",
        variant: "destructive",
      });
      return;
    }

    if (isOwned) return;

    setAddingToCollection(true);
    try {
      const { error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          funko_pop_id: pop.id,
          condition: 'mint',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsOwned(true);
      toast({
        title: "Added to Collection!",
        description: `${pop.name} has been added to your collection.`,
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: "Error",
        description: "Failed to add to collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setAddingToWishlist(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('funko_pop_id', pop.id);

        if (error) throw error;

        setIsWishlisted(false);
        toast({
          title: "Removed from Wishlist",
          description: `${pop.name} has been removed from your wishlist.`,
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            funko_pop_id: pop.id,
            priority: 'medium',
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        setIsWishlisted(true);
        toast({
          title: "Added to Wishlist!",
          description: `${pop.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pop.name,
          text: `Check out this Funko Pop: ${pop.name} from ${pop.series}`,
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
      title: "Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
    setShareDialogOpen(false);
  };

  const getBadges = () => {
    const badges = [];
    
    if (pop.is_chase) {
      badges.push({ text: 'Chase', className: 'bg-yellow-600 text-yellow-100', icon: Crown });
    }
    if (pop.is_exclusive) {
      badges.push({ text: 'Exclusive', className: 'bg-purple-600 text-purple-100', icon: Star });
    }
    if (pop.is_vaulted) {
      badges.push({ text: 'Vaulted', className: 'bg-red-600 text-red-100', icon: Shield });
    }
    if (pop.data_sources && pop.data_sources.includes('new-releases')) {
      badges.push({ text: 'New Release', className: 'bg-orange-600 text-orange-100', icon: Sparkles });
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Funko Pop details...</div>
        </div>
      </div>
    );
  }

  if (!pop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Funko Pop Not Found</h1>
          <p className="text-gray-400 mb-6">The Funko Pop you're looking for doesn't exist or has been removed.</p>
          <Link to="/directory">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Pops
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const badges = getBadges();

  return (
    <>
      <SEO title={`${pop.name} | The Pop Guide`} description={pop.description || `${pop.name} from ${pop.series}. View pricing, stats, and add to your collection.`} />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link to="/directory" className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Link>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image and Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700 mb-6">
                <CardContent className="p-6">
                  {/* Main Image */}
                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-6 relative">
                    {signedImageUrl ? (
                      <>
                        <img 
                          src={signedImageUrl} 
                          alt={pop.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.log('Image failed to load:', signedImageUrl);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', signedImageUrl);
                          }}
                        />
                        <div className="image-fallback w-full h-full flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                          <div className="text-center">
                            <User className="w-24 h-24 text-orange-400 animate-pulse mx-auto mb-2" />
                            <div className="text-xs text-gray-400">Image not available</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <User className="w-24 h-24 text-orange-400 animate-pulse mx-auto mb-2" />
                          <div className="text-xs text-gray-400">No image available</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {badges.map((badge, index) => {
                        const IconComponent = badge.icon;
                        return (
                          <Badge key={index} className={badge.className}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {badge.text}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={handleAddToCollection}
                      disabled={isOwned || addingToCollection}
                      className={
                        isOwned 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }
                    >
                      {addingToCollection ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {isOwned ? 'In Collection' : 'Add to Collection'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleWishlist}
                      disabled={addingToWishlist}
                      className={
                        isWishlisted 
                          ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                          : 'border-blue-600 text-blue-600 hover:bg-blue-50 hover:bg-gray-700'
                      }
                    >
                      {addingToWishlist ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      )}
                      {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </Button>

                    <Button 
                      asChild
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50 hover:bg-gray-700"
                    >
                      <Link to={`/where-to-buy/${pop.id}`}>
                        <Package className="w-4 h-4 mr-2" />
                        Where to Buy
                      </Link>
                    </Button>

                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-gray-700">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Pop
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Share This Pop</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-gray-300">Share this Funko Pop with your friends!</p>
                          <div className="flex gap-2">
                            <Button onClick={copyToClipboard} className="flex-1 bg-orange-500 hover:bg-orange-600">
                              Copy Link
                            </Button>
                            <Button onClick={handleShare} variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-gray-700">
                              Native Share
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views</span>
                      <span className="text-white font-medium">{viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Release Year</span>
                      <span className="text-white font-medium">{pop.release_year || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Number</span>
                      <span className="text-white font-medium">#{pop.number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-medium ${pop.is_vaulted ? 'text-red-400' : 'text-green-400'}`}>
                        {pop.is_vaulted ? 'Vaulted' : 'Active'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details and Data */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h1 className="text-4xl font-bold text-white mb-2">{pop.name}</h1>
                  <div className="text-xl text-gray-300 mb-4">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                  
                  {/* Current Price */}
                  {user ? (
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                      <div className="text-sm text-gray-400 mb-1">Current Estimated Value</div>
                      <div className="text-3xl font-bold text-orange-400">
                        {pop.estimated_value !== null && pop.estimated_value !== undefined 
                          ? formatCurrency(pop.estimated_value, currency) 
                          : 'Pending'
                        }
                      </div>
                      {(pop.estimated_value === null || pop.estimated_value === undefined) && (
                        <div className="text-xs text-blue-400 mt-2">
                          Market pricing updates within 5 working days
                        </div>
                      )}
                      {pop.estimated_value !== null && pop.estimated_value !== undefined && (
                        <div className="text-xs text-gray-400 mt-2">
                          {(pop.data_sources && pop.data_sources.length > 0) ? 'Market data' : 'User contributed data'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-center">
                      <div className="text-4xl mb-3">🔒</div>
                      <div className="text-lg font-semibold text-white mb-2">Premium Pricing Data</div>
                      <p className="text-gray-400 text-sm mb-4">
                        Sign in to view detailed pricing information and market value
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={() => navigate('/auth')} 
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Sign In
                        </Button>
                        <Button 
                          onClick={() => navigate('/auth')} 
                          variant="outline"
                          className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                        >
                          Join Now
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {pop.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300 leading-relaxed">{pop.description}</p>
                    </div>
                  )}

                  {/* Details Grid */}
                  {user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Series:</span>
                            <span className="text-white">{pop.series}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fandom:</span>
                            <span className="text-white">{pop.fandom || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Genre:</span>
                            <span className="text-white">{pop.genre || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Edition:</span>
                            <span className="text-white">{pop.edition || 'Standard'}</span>
                          </div>
                          {pop.exclusive_to && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Exclusive to:</span>
                              <span className="text-white">{pop.exclusive_to}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Rarity & Features</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Chase Variant:</span>
                            <span className={pop.is_chase ? 'text-yellow-400' : 'text-gray-500'}>
                              {pop.is_chase ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Exclusive:</span>
                            <span className={pop.is_exclusive ? 'text-purple-400' : 'text-gray-500'}>
                              {pop.is_exclusive ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vaulted:</span>
                            <span className={pop.is_vaulted ? 'text-red-400' : 'text-green-400'}>
                              {pop.is_vaulted ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {pop.variant && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Variant:</span>
                              <span className="text-white">{pop.variant}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Premium Details</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Access detailed product information including series, fandom, genre, and edition details
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            onClick={() => navigate('/auth')} 
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Sign In
                          </Button>
                          <Button 
                            onClick={() => navigate('/auth')} 
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                          >
                            Join Now
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">✨</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Rarity & Features</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Discover exclusive details like chase variants, exclusivity status, and special features
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            onClick={() => navigate('/auth')} 
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Sign In
                          </Button>
                          <Button 
                            onClick={() => navigate('/auth')} 
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                          >
                            Join Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price History */}
              {user ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Price History & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PriceHistory 
                      funkoPopId={pop.id} 
                      funkoPop={{
                        id: pop.id,
                        name: pop.name,
                        series: pop.series,
                        number: pop.number || '',
                        image_url: pop.image_url,
                        estimated_value: pop.estimated_value
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Price History & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
                      <p className="text-gray-400 mb-6">
                        Sign in to view detailed price history, analytics, and market trends for this Funko Pop.
                      </p>
                      <Button 
                        onClick={() => navigate('/auth')} 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Sign In to View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        {/* Join PopGuide Banner */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-orange-500/20 rounded-lg p-6 text-center relative overflow-hidden group hover:border-orange-500/40 transition-all duration-500">
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-orange-500/5 animate-pulse"></div>
            
            {/* Floating background accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full -ml-12 -mb-12 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/5 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
            
            {/* Sparkle elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse border border-orange-500/30 shadow-lg shadow-orange-500/20">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '2s' }} />
                3-Day Free Trial
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-full animate-pulse"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-100 transition-colors duration-300">
                Join PopGuide Premium
              </h2>
              <p className="text-gray-300 mb-6 text-base group-hover:text-gray-200 transition-colors duration-300">
                Get full price analytics, collection tracking, and market insights
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link to="/get-started">
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-orange-400/20"
                  >
                    <span className="relative z-10">Start Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
                <Link to="/pricing" className="text-gray-400 hover:text-orange-400 transition-all duration-300 text-sm hover:underline decoration-orange-400">
                  View plans →
                </Link>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse"></div>
                  Price History
                </span>
                <span className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  Collection Tools
                </span>
                <span className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  Market Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
      <MobileBottomNav />
    </>
  );
};

export default PublicPopView; 