
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfileByUsername } from '@/hooks/usePublicProfile';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';
import { Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import CollectionGrid from '@/components/CollectionGrid';
import CollectionInsights from '@/components/CollectionInsights';
import { useState } from 'react';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading } = usePublicProfileByUsername(username || '');
  const { data: funkoPops = [] } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(profile?.user_id);
  const [selectedItem, setSelectedItem] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-500">Pop</span>
                <span className="text-white">Guide</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
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
                  <CardTitle className="text-white text-2xl mb-2">
                    {profile.display_name || profile.username}
                  </CardTitle>
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
            
            {socialLinks.length > 0 && (
              <CardContent>
                <h3 className="text-white font-semibold mb-4">Connect</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              </CardContent>
            )}
          </Card>

          {/* Collection Insights */}
          {transformedItems.length > 0 && (
            <div className="mb-8">
              <CollectionInsights 
                items={transformedItems} 
                displayName={profile.display_name || profile.username || 'User'} 
              />
            </div>
          )}

          {/* Collection Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              {profile.display_name || profile.username}'s Collection
            </h2>
            
            {transformedItems.length > 0 ? (
              <CollectionGrid 
                items={transformedItems} 
                onItemClick={setSelectedItem}
                searchQuery=""
                showWishlistOnly={false}
              />
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400 text-lg">No items in collection yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
