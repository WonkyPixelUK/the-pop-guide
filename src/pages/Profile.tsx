import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfileByUsername } from '@/hooks/usePublicProfile';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';
import { useProfileActivities } from '@/hooks/useProfileActivities';
import { Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, ArrowLeft, ExternalLink, Gamepad2, Mail } from 'lucide-react';
import CollectionGrid from '@/components/CollectionGrid';
import CollectionInsights from '@/components/CollectionInsights';
import ActivityFeed from '@/components/ActivityFeed';
import GamingDashboard from '@/components/GamingDashboard';
import PremiumBadge from '@/components/PremiumBadge';
import { useState, useEffect } from 'react';
import { useCustomLists } from '@/hooks/useCustomLists';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import MobileBottomNav from '@/components/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';

const SEND_EMAIL_ENDPOINT = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/send-email";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading: profileLoading } = usePublicProfileByUsername(username || '');
  const { data: funkoPops = [], isLoading: funkoLoading, error: funkoError } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading, error: collectionError } = useUserCollection(profile?.user_id || '');
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
    setDmOpen(true);
    setDmLoading(true);
    // Fetch messages between user and profile
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
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

  if (profileLoading || funkoLoading || collectionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (funkoError || collectionError) {
    console.error('Error loading data:', funkoError || collectionError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h1>
          <p className="text-gray-400 mb-6">There was a problem loading this profile. Please try again later.</p>
          <Link to="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">The profile you're looking for doesn't exist or is private.</p>
          <Link to="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const totalValue = userCollection.reduce((sum, item) => {
    return sum + (item.funko_pops?.estimated_value || 0);
  }, 0);

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 md:pb-0">
        <Navigation />
        {checkoutSuccess && (
          <div className="bg-green-700/90 border border-green-500 rounded-lg px-6 py-4 text-center shadow-lg max-w-xl mx-auto mt-8 mb-6">
            <div className="text-white text-2xl font-bold mb-2">Payment Successful!</div>
            <div className="text-green-200 mb-2">Your Pro membership is now active. Welcome to the full PopGuide experience!</div>
            <div className="text-gray-200 mb-4">You'll be redirected to your dashboard in a few seconds.</div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/dashboard')}>
              Go to Dashboard Now
            </Button>
          </div>
        )}
        {/* Profile Section */}
        <section className="py-8 px-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {/* Profile Card */}
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-orange-500 text-white text-2xl">
                      {profile.display_name ? profile.display_name[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-white text-2xl flex items-center gap-2">
                        {profile.display_name || profile.username}
                        {profile.email === 'rich@maintainhq.com' && (
                          <div className="inline-block bg-orange-500 text-white text-xs font-semibold rounded px-2 py-1 mb-2">Pop Guide Team</div>
                        )}
                        <span className="bg-blue-900/80 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded ml-2">Public Profile</span>
                      </CardTitle>
                      <PremiumBadge isPremium={profile.is_premium || false} />
                    </div>
                    {profile.username && (
                      <p className="text-gray-400 mb-3">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-300 mb-4">{profile.bio}</p>
                    )}
                    
                    {/* Collection Stats */}
                    <div className="flex gap-6 text-sm mb-2">
                      <div>
                        <span className="text-orange-500 font-bold">{ownedCount}</span>
                        <span className="text-gray-400 ml-1">Items</span>
                      </div>
                      <div>
                        <span className="text-orange-500 font-bold">{uniqueSeries}</span>
                        <span className="text-gray-400 ml-1">Series</span>
                      </div>
                      <div>
                        <span className="text-orange-500 font-bold">${totalValue.toFixed(2)}</span>
                        <span className="text-gray-400 ml-1">Total Value</span>
                      </div>
                    </div>
                    {/* Direct Message button for public profiles (not own profile) */}
                    {user && profile && user.id !== profile.user_id && (
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white mb-2 flex items-center gap-2" onClick={openDm}>
                        <Mail className="w-4 h-4" /> Direct Message
                      </Button>
                    )}
                  </div>
                  {/* If logged-in user is viewing their own profile, show dashboard/edit buttons */}
                  {user && profile && user.id === profile.user_id && (
                    <div className="flex flex-col gap-2 ml-auto">
                      <Link to="/dashboard">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">Go to Dashboard</Button>
                      </Link>
                      <Link to="/profile-settings">
                        <Button className="bg-blue-900 hover:bg-blue-800 text-white w-full">Edit Profile</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {/* Social & Gaming Links */}
              {(socialLinks.length > 0 || gamingPlatforms.length > 0) && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {socialLinks.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-4">Connect</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {socialLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <div key={link.name} className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${link.color}`} />
                                {link.url ? (
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                                  >
                                    {link.value}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-gray-300 text-sm">{link.value}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {gamingPlatforms.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4" />
                          Gaming
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {gamingPlatforms.map((platform) => {
                            const Icon = platform.icon;
                            return (
                              <div key={platform.name} className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${platform.color}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-300 text-sm">{platform.name}</p>
                                  <p className="text-gray-400 text-xs truncate">{platform.value}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Activity Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {!activitiesLoading && activities.length > 0 && (
                <ActivityFeed 
                  activities={activities} 
                  displayName={profile.display_name || profile.username || 'User'} 
                />
              )}
              
              {(profile.playstation_username || profile.xbox_gamertag || profile.nintendo_friend_code || profile.steam_username) && (
                <GamingDashboard 
                  profile={profile} 
                  activities={activities} 
                />
              )}
            </div>

            {/* Collection Insights */}
            {transformedItems.length > 0 && (
              <div className="mb-8">
                <CollectionInsights 
                  items={transformedItems} 
                  displayName={profile.display_name || profile.username || 'User'} 
                />
              </div>
            )}

            {/* Saved Searches */}
            {user && profile && user.id === profile.user_id && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Saved Searches</h2>
                {loadingSaved ? (
                  <div className="text-gray-400">Loading...</div>
                ) : savedSearches.length === 0 ? (
                  <div className="text-gray-400">No saved searches.</div>
                ) : (
                  <ul>
                    {savedSearches.map(ss => (
                      <li key={ss.id} className="flex items-center gap-2 mb-2">
                        <span className="text-white">{ss.name}</span>
                        <span className="text-gray-500 text-xs">{new Date(ss.created_at).toLocaleString()}</span>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteSearch(ss.id)}>Delete</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Audit Log */}
            {user && profile && user.id === profile.user_id && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Audit Log</h2>
                <ul className="space-y-2">
                  {auditLog.map((entry) => (
                    <li key={entry.id} className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-300">{entry.action}</div>
                      <div className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{JSON.stringify(entry.details)}</div>
                    </li>
                  ))}
                  {auditLog.length === 0 && <li className="text-gray-500 text-sm">No recent activity.</li>}
                </ul>
              </div>
            )}

            {/* Featured Lists */}
            {profile.profile_list_ids && profile.profile_list_ids.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Featured Lists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicLists
                    .filter(list => profile.profile_list_ids.includes(list.id))
                    .map(list => (
                      <Card key={list.id} className="bg-gray-800/70 border-gray-700 hover:bg-gray-800/90 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            {list.name}
                            <span className="text-xs text-gray-400 font-normal">{list.is_public ? 'Public' : 'Private'}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{list.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            {(list.list_items || []).slice(0, 4).map(item => (
                              item.funko_pops?.image_url ? (
                                <img
                                  key={item.id}
                                  src={item.funko_pops.image_url}
                                  alt={item.funko_pops.name}
                                  className="w-10 h-10 object-cover rounded border border-gray-700"
                                />
                              ) : null
                            ))}
                            {list.list_items && list.list_items.length > 4 && (
                              <span className="text-xs text-gray-400 ml-2">+{list.list_items.length - 4} more</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>{list.list_items?.length || 0} items</span>
                            <span>{new Date(list.created_at).toLocaleDateString()}</span>
                          </div>
                          <Link to={`/lists/${list.slug || list.id}`}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View List</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Collection Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">{profile.display_name || profile.username}'s Collection</h2>
              {transformedItems.length === 0 ? (
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 text-center text-gray-400 text-lg">
                  No items in collection yet.<br />
                  <span className="text-orange-500 font-semibold">Want to see something here? Ask {profile.display_name || profile.username} to make their collection public or add items!</span>
                </div>
              ) : (
                <CollectionGrid items={transformedItems} onItemClick={setSelectedItem} searchQuery="" />
              )}
            </section>
          </div>
        </section>
      </div>
      <MobileBottomNav />
      {/* DM Modal */}
      {dmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeDm}>&times;</button>
            <div className="flex items-center gap-3 mb-4">
              <img src={profile.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{profile.display_name || profile.username}</div>
                <div className="text-xs text-gray-400">@{profile.username}</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded p-3 h-64 overflow-y-auto mb-4 flex flex-col-reverse">
              <div>
                {dmLoading ? (
                  <div className="text-gray-400 text-center">Loading...</div>
                ) : (
                  dmMessages.length === 0 ? (
                    <div className="text-gray-500 text-center">No messages yet.</div>
                  ) : (
                    dmMessages.slice().reverse().map(msg => (
                      <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender_id === user.id ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-200'}`}>
                          {msg.content}
                          <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
            <form onSubmit={sendDm} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={dmInput}
                onChange={e => setDmInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                disabled={dmLoading}
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={dmLoading || !dmInput.trim()}>Send</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
