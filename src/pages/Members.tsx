import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAllPublicProfiles } from '@/hooks/usePublicProfile';
import { Heart, Mail, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Members = () => {
  const { profiles, loading } = useAllPublicProfiles();
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({});

  const filtered = profiles.filter(
    (p) =>
      (p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        '')
  );

  const handleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Placeholder: generate a random worth and up/down for each user
  const getCollectionWorth = (id: string) => {
    // For demo, use id hash for deterministic value
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const worth = Math.abs(hash % 5000) + 100; // £100-£5100
    const up = hash % 2 === 0;
    const change = Math.round(Math.abs(hash % 200) + 10); // £10-£210
    return { worth, up, change };
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <div className="container mx-auto py-12 px-4 max-w-5xl flex-1">
          <h1 className="text-4xl font-bold mb-8">Members</h1>
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-8 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((profile) => {
                const { worth, up, change } = getCollectionWorth(profile.id);
                return (
                  <Link key={profile.id} to={profile.username ? `/profile/${profile.username}` : '#'} className="block h-full group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
                    <Card className="bg-gray-800/70 border border-gray-700 flex flex-col h-full group-hover:border-orange-500 transition-colors">
                      <CardContent className="flex flex-col items-center p-6 flex-1">
                        <Avatar className="w-20 h-20 mb-4">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-orange-500 text-white text-2xl">
                            {profile.display_name ? profile.display_name[0].toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xl font-bold text-white mb-1">{profile.display_name || profile.username}</div>
                        <div className="text-gray-400 mb-2">@{profile.username}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-300">Collection Worth:</span>
                          <span className="font-semibold text-orange-400">£{worth}</span>
                          {up ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" title="Up last 12mo" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" title="Down last 12mo" />
                          )}
                          <span className={up ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                            {up ? '+' : '-'}£{change} / 12mo
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-auto w-full justify-between">
                          <Button
                            variant={liked[profile.id] ? 'default' : 'outline'}
                            size="icon"
                            aria-label="Like user"
                            onClick={e => { e.preventDefault(); handleLike(profile.id); }}
                            className={liked[profile.id] ? 'text-orange-500' : ''}
                          >
                            <Heart fill={liked[profile.id] ? 'currentColor' : 'none'} className="w-5 h-5" />
                          </Button>
                          <div className="flex items-center gap-2 text-orange-400">
                            <Mail className="w-5 h-5" />
                            <span className="text-sm font-medium">Direct Message</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Members; 