import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfileByUsername } from '@/hooks/usePublicProfile';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';
import { useProfileActivities } from '@/hooks/useProfileActivities';
import { Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, ArrowLeft, ExternalLink, Gamepad2, Mail, Plus, User, LogOut, Star, Trophy, Calendar, MapPin, Link as LinkIcon, UserPlus } from 'lucide-react';
import CollectionGrid from '@/components/CollectionGrid';
import CollectionInsights from '@/components/CollectionInsights';
import ActivityFeed from '@/components/ActivityFeed';
import GamingDashboard from '@/components/GamingDashboard';
import PremiumBadge from '@/components/PremiumBadge';
import { useState, useEffect } from 'react';
import { useCustomLists } from '@/hooks/useCustomLists';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import TrophyAvatar from '@/components/TrophyAvatar';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EnhancedAddItemDialog from '@/components/EnhancedAddItemDialog';
import { useToast } from '@/hooks/use-toast';

const SEND_EMAIL_ENDPOINT = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/send-email";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading: profileLoading } = usePublicProfileByUsername(username || '');
  const { data: funkoPops = [], isLoading: funkoLoading, error: funkoError } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading, error: collectionError } = useUserCollection(profile?.user_id);
  const { activities, loading: activitiesLoading } = useProfileActivities(profile?.user_id || '');
  const [selectedItem, setSelectedItem] = useState(null);
  const { publicLists } = useCustomLists();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const checkoutSuccess = params.get('checkout') === 'success';
  const [activeTab, setActiveTab] = useState('collection');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const [dmLoading, setDmLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  
  // Add header navigation state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Friend request state
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  useEffect(() => {
    if (checkoutSuccess && user) {
      // Send thank you/confirmation email after successful subscription
      fetch(SEND_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pro_welcome', to: user.email, data: { fullName: user.full_name } })
      });
      const timeout = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [checkoutSuccess, navigate, user]);

  // Check friend status when profile loads
  useEffect(() => {
    if (user && profile && user.id !== profile.user_id) {
      checkFriendStatus();
    }
  }, [user, profile]);

  const checkFriendStatus = async () => {
    if (!user || !profile) return;
    
    // Check if already friends
    const { data: friendData } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', profile.user_id)
      .maybeSingle();
    
    if (friendData) {
      setIsFriend(true);
      return;
    }
    
    // Check for pending friend requests
    const { data: requestData } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.user_id}),and(sender_id.eq.${profile.user_id},receiver_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (requestData) {
      setFriendRequestStatus('pending');
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !profile || friendRequestLoading) return;
    
    setFriendRequestLoading(true);
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: profile.user_id,
          status: 'pending'
        });
      
      if (error) throw error;
      
      setFriendRequestStatus('pending');
      toast({
        title: "Friend request sent!",
        description: `Your friend request has been sent to ${profile.display_name || profile.username}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    } finally {
      setFriendRequestLoading(false);
    }
  };

  // Fetch API key if on API tab
  useEffect(() => {
    if (activeTab === 'api' && user && profile && user.id === profile.user_id) {
      setApiKeyLoading(true);
      setApiKeyError(null);
      supabase.auth.getSession().then(({ data }) => {
        const token = data?.session?.access_token;
        fetch(`/api/userApiKey?userId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then(res => res.json())
          .then(data => setApiKey(data.api_key || null))
          .catch(err => setApiKeyError('Failed to load API key'))
          .finally(() => setApiKeyLoading(false));
      });
    }
  }, [activeTab, user, profile]);

  useEffect(() => {
    if (user && profile && user.id === profile.user_id) {
      setLoadingSaved(true);
      supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setSavedSearches(data || []))
        .finally(() => setLoadingSaved(false));
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile && user.id === profile.user_id) {
      supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => setAuditLog(data || []));
    }
  }, [user, profile]);

  const handleGenerateApiKey = () => {
    if (!user || !profile || user.id !== profile.user_id) return;
    setApiKeyLoading(true);
    setApiKeyError(null);
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      fetch(`/api/userApiKey?userId=${user.id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(res => res.json())
        .then(data => setApiKey(data.api_key || null))
        .catch(err => setApiKeyError('Failed to generate API key'))
        .finally(() => setApiKeyLoading(false));
    });
  };

  const handleRevokeApiKey = () => {
    if (!user || !profile || user.id !== profile.user_id) return;
    setApiKeyLoading(true);
    setApiKeyError(null);
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      fetch(`/api/userApiKey?userId=${user.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(() => setApiKey(null))
        .catch(err => setApiKeyError('Failed to revoke API key'))
        .finally(() => setApiKeyLoading(false));
    });
  };

  const handleDeleteSearch = async (id) => {
    await supabase.from('saved_searches').delete().eq('id', id);
    setSavedSearches(s => s.filter(ss => ss.id !== id));
  };

  const openDm = async () => {
    if (!user || !profile) return;
    setDmOpen(true);
    setDmLoading(true);
    // Fetch messages between user and profile
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.user_id}),and(sender_id.eq.${profile.user_id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setDmMessages(data || []);
    setDmLoading(false);
  };

  const sendDm = async (e) => {
    e.preventDefault();
    if (!dmInput.trim() || !profile) return;
    setDmLoading(true);
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: profile.id, content: dmInput.trim() });
    setDmInput("");
    // Refresh messages
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setDmMessages(data || []);
    setDmLoading(false);
  };

  const closeDm = () => {
    setDmOpen(false);
    setDmMessages([]);
    setDmInput("");
    setDmLoading(false);
  };

  // Header navigation handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleExport = () => {
    if (!user || !userCollection.length) {
      toast({
        title: "Export not available",
        description: "No collection data to export",
        variant: "destructive",
      });
      return;
    }
    
    const csvData = userCollection.map(item => ({
      name: item.funko_pops?.name || '',
      series: item.funko_pops?.series || '',
      number: item.funko_pops?.number || '',
      condition: item.condition || '',
      purchase_price: item.purchase_price || '',
      estimated_value: item.funko_pops?.estimated_value || '',
    }));
    
    const csvContent = [
      ['Name', 'Series', 'Number', 'Condition', 'Purchase Price', 'Estimated Value'],
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile?.username || 'user'}-collection.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Collection exported to CSV file",
    });
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (profileLoading || funkoLoading || collectionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (funkoError || collectionError) {
    console.error('Error loading data:', funkoError || collectionError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <div>
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
            <p className="text-gray-400 mb-6">There was a problem loading this profile. Please try again later.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-orange-500 hover:bg-orange-600">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <div>
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">The profile you're looking for doesn't exist or is private.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-orange-500 hover:bg-orange-600">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate collection stats
  const totalValue = userCollection.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0);
  const rarityBreakdown = userCollection.reduce((acc, item) => {
    const rarity = item.funko_pops?.rarity || 'Common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {});

  const isOwner = user?.id === profile.user_id;

  // Transform data for collection display
  const transformedItems = funkoPops.map(pop => {
    const isOwned = userCollection.some(item => item.funko_pop_id === pop.id);
    const userItem = userCollection.find(item => item.funko_pop_id === pop.id);
    
    return {
      id: pop.id,
      name: typeof pop.name === 'string' ? pop.name : '',
      series: typeof pop.series === 'string' ? pop.series : '',
      number: pop.number || "",
      image: pop.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: pop.estimated_value || 0,
      rarity: pop.is_chase ? "Chase" : pop.is_exclusive ? "Exclusive" : "Common",
      owned: isOwned,
      condition: userItem?.condition,
      purchase_price: userItem?.purchase_price,
    };
  }).filter(item => item.owned); // Only show owned items

  const ownedCount = userCollection.length;
  const uniqueSeries = new Set(userCollection.map(item => item.funko_pops?.series)).size;

  const socialLinks = [
    {
      name: 'Spotify',
      value: profile.spotify_username,
      icon: Music,
      url: profile.spotify_username ? `https://open.spotify.com/user/${profile.spotify_username}` : null,
      color: 'text-green-500'
    },
    {
      name: 'Discord',
      value: profile.discord_username,
      icon: MessageCircle,
      url: null, // Discord doesn't have direct profile URLs
      color: 'text-indigo-500'
    },
    {
      name: 'Twitter',
      value: profile.twitter_handle,
      icon: Twitter,
      url: profile.twitter_handle ? `https://twitter.com/${profile.twitter_handle.replace('@', '')}` : null,
      color: 'text-blue-400'
    },
    {
      name: 'Instagram',
      value: profile.instagram_handle,
      icon: Instagram,
      url: profile.instagram_handle ? `https://instagram.com/${profile.instagram_handle.replace('@', '')}` : null,
      color: 'text-pink-500'
    },
    {
      name: 'TikTok',
      value: profile.tiktok_handle,
      icon: Video,
      url: profile.tiktok_handle ? `https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}` : null,
      color: 'text-red-500'
    },
    {
      name: 'eBay Store',
      value: profile.ebay_store_url,
      icon: ShoppingBag,
      url: profile.ebay_store_url,
      color: 'text-yellow-500'
    }
  ].filter(link => link.value);

  const gamingPlatforms = [
    {
      name: 'PlayStation',
      value: profile.playstation_username,
      icon: Gamepad2,
      color: 'text-blue-600'
    },
    {
      name: 'Xbox',
      value: profile.xbox_gamertag,
      icon: Gamepad2,
      color: 'text-green-600'
    },
    {
      name: 'Nintendo',
      value: profile.nintendo_friend_code,
      icon: Gamepad2,
      color: 'text-red-500'
    },
    {
      name: 'Steam',
      value: profile.steam_username,
      icon: Gamepad2,
      color: 'text-gray-500'
    }
  ].filter(platform => platform.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <DashboardHeader showSearch={false} />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="h-80 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden"
          style={{
            backgroundImage: profile.cover_image ? `url(${profile.cover_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Profile Actions for Owner */}
          {isOwner && (
            <Button
              onClick={() => navigate('/profile-settings')}
              className="absolute top-6 right-6 bg-orange-500/90 hover:bg-orange-600/90 backdrop-blur-sm"
              size="sm"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Info Card */}
        <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
          <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <Avatar className="w-32 h-32 border-4 border-orange-500 mb-4">
                    <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                    <AvatarFallback className="text-2xl bg-orange-500 text-white">
                      {profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.display_name || profile.username}
                    </h1>
                    <PremiumBadge isPro={profile.subscription_status === 'active'} />
                    {profile.is_retailer && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                        🏪 Retailer
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 mb-1">@{profile.username}</p>
                  {profile.location && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  
                  {profile.bio && (
                    <p className="text-gray-300 max-w-md mb-4">{profile.bio}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    Collecting since {new Date(profile.created_at).getFullYear()}
                  </div>

                  {/* Social Links */}
                  {(profile.social_links?.twitter || profile.social_links?.instagram || profile.social_links?.youtube) && (
                    <div className="flex gap-2 mb-4">
                      {profile.social_links?.twitter && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-blue-500/20">
                          <Twitter className="w-4 h-4" />
                        </Button>
                      )}
                      {profile.social_links?.instagram && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-pink-500/20">
                          <Instagram className="w-4 h-4" />
                        </Button>
                      )}
                      {profile.social_links?.youtube && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-red-500/20">
                          <Video className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Contact Button for Non-Owners */}
                  {!isOwner && user && (
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      {/* Friend Request Button */}
                      {!isFriend && friendRequestStatus !== 'pending' && (
                        <Button 
                          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                          onClick={sendFriendRequest}
                          disabled={friendRequestLoading}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {friendRequestLoading ? 'Sending...' : 'Send Friend Request'}
                        </Button>
                      )}
                      
                      {/* Pending Friend Request */}
                      {friendRequestStatus === 'pending' && (
                        <Button 
                          className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
                          disabled
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Friend Request Pending
                        </Button>
                      )}
                      
                      {/* Already Friends */}
                      {isFriend && (
                        <Button 
                          className="bg-green-500 hover:bg-green-600 text-white w-full"
                          disabled
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Friends ✓
                        </Button>
                      )}
                      
                      {/* Send Message Button */}
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                        onClick={openDm}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  )}
                </div>

                {/* Collection Stats */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{ownedCount}</div>
                    <div className="text-sm text-gray-400">Total Items</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">${totalValue.toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Collection Value</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{Object.keys(rarityBreakdown).length}</div>
                    <div className="text-sm text-gray-400">Rarity Types</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{publicLists?.length || 0}</div>
                    <div className="text-sm text-gray-400">Public Lists</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Collection Display */}
          <div className="lg:col-span-2 space-y-8">
            {/* Collection Highlights */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Collection Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userCollection.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userCollection
                      .sort((a, b) => (b.funko_pops?.estimated_value || 0) - (a.funko_pops?.estimated_value || 0))
                      .slice(0, 8)
                      .map((item, index) => (
                        <div key={item.id} className="group relative">
                          <div className="aspect-square bg-gray-700/50 rounded-lg p-2 group-hover:bg-gray-700/70 transition-colors">
                            <img
                              src={item.funko_pops?.image_url || '/placeholder-funko.png'}
                              alt={item.funko_pops?.name}
                              className="w-full h-full object-contain"
                            />
                            {index < 3 && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-white text-sm font-medium truncate">
                              {item.funko_pops?.name}
                            </p>
                            <p className="text-orange-400 text-xs">
                              ${item.funko_pops?.estimated_value || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-gray-400">No items in collection yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities && activities.length > 0 ? (
                  <ActivityFeed activities={activities.slice(0, 5)} />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">First Pop!</p>
                    <p className="text-gray-400 text-xs">Started your collection</p>
                  </div>
                </div>
                {userCollection.length >= 10 && (
                  <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      📈
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Growing Collection</p>
                      <p className="text-gray-400 text-xs">Reached 10 items</p>
                    </div>
                  </div>
                )}
                {totalValue >= 100 && (
                  <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      💰
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Valuable Collector</p>
                      <p className="text-gray-400 text-xs">Collection worth $100+</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Public Lists */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Public Lists</CardTitle>
              </CardHeader>
              <CardContent>
                {publicLists && publicLists.length > 0 ? (
                  <div className="space-y-2">
                    {publicLists.slice(0, 5).map(list => (
                      <Link
                        key={list.id}
                        to={`/lists/${list.id}`}
                        className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{list.name}</p>
                            <p className="text-gray-400 text-sm">{list.items?.length || 0} items</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-gray-400 text-sm">No public lists</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rarity Breakdown */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Collection Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(rarityBreakdown).map(([rarity, count]) => (
                    <div key={rarity} className="flex justify-between items-center">
                      <span className="text-gray-300">{rarity}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
