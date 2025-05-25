import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfileByUsername } from '@/hooks/usePublicProfile';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';
import { useProfileActivities } from '@/hooks/useProfileActivities';
import { Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, ArrowLeft, ExternalLink, Gamepad2 } from 'lucide-react';
import CollectionGrid from '@/components/CollectionGrid';
import CollectionInsights from '@/components/CollectionInsights';
import ActivityFeed from '@/components/ActivityFeed';
import GamingDashboard from '@/components/GamingDashboard';
import PremiumBadge from '@/components/PremiumBadge';
import { useState } from 'react';
import { useCustomLists } from '@/hooks/useCustomLists';
import Navigation from '@/components/Navigation';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading } = usePublicProfileByUsername(username || '');
  const { data: funkoPops = [] } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(profile?.user_id);
  const { activities, loading: activitiesLoading } = useProfileActivities(profile?.user_id);
  const [selectedItem, setSelectedItem] = useState(null);
  const { publicLists } = useCustomLists();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
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
      name: pop.name,
      series: pop.series,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Profile Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
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
                    <CardTitle className="text-white text-2xl">
                      {profile.display_name || profile.username}
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
                  <div className="flex gap-6 text-sm">
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
                </div>
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
              <CollectionGrid items={transformedItems} onItemClick={setSelectedItem} />
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default Profile;
