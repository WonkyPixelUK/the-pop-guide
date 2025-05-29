import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAllPublicProfiles } from '@/hooks/usePublicProfile';
import { Heart, Mail, ArrowUpRight, ArrowDownRight, Info, Award } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Members = () => {
  const { profiles, loading } = useAllPublicProfiles();
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({});
  const [dmOpen, setDmOpen] = useState(false);
  const [dmUser, setDmUser] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const [dmLoading, setDmLoading] = useState(false);
  const { user } = useAuth();

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

  // Leaderboard logic
  const leaderboard = [...profiles]
    .map((profile) => ({
      ...profile,
      worth: getCollectionWorth(profile.id),
    }))
    .sort((a, b) => b.worth.worth - a.worth.worth)
    .slice(0, 10);

  const openDm = async (profile) => {
    setDmUser(profile);
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
    if (!dmInput.trim() || !dmUser) return;
    setDmLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: dmUser.id, content: dmInput.trim() });
      if (error) {
        alert('Failed to send message');
      } else {
        setDmInput("");
        // Refresh messages
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${dmUser.id}),and(sender_id.eq.${dmUser.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
        setDmMessages(data || []);
      }
    } finally {
      setDmLoading(false);
    }
  };

  const closeDm = () => {
    setDmOpen(false);
    setDmUser(null);
    setDmMessages([]);
    setDmInput("");
    setDmLoading(false);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <div className="container mx-auto py-12 px-4 max-w-5xl flex-1">
          <h1 className="text-4xl font-bold mb-8">Members</h1>
          {/* Leaderboard Section */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">PopGuide's Top Collectors!</h2>
              <div className="relative group inline-block">
                <Info className="w-5 h-5 text-orange-400 cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded shadow-lg p-3 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  Ranked by estimated collection value (for demo: randomised). Only public profiles are shown. Want to see your name here? Make your profile public!
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {leaderboard.map((profile, idx) => (
                <div key={profile.id} className="flex items-center gap-4 bg-gray-800/70 border border-gray-700 rounded p-4">
                  <div className="text-2xl font-bold w-8 text-center flex items-center justify-center">
                    {idx === 0 && <Award className="w-6 h-6 text-yellow-400" title="Gold" />} 
                    {idx === 1 && <Award className="w-6 h-6 text-gray-300" title="Silver" />} 
                    {idx === 2 && <Award className="w-6 h-6 text-orange-700" title="Bronze" />} 
                    {idx > 2 && idx + 1}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-orange-500 text-white text-xl">
                      {profile.display_name ? profile.display_name[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{profile.display_name || profile.username}</div>
                    <div className="text-gray-400 text-xs truncate">@{profile.username}</div>
                  </div>
                  <div className="font-bold text-orange-400 text-lg ml-auto">£{profile.worth.worth}</div>
                </div>
              ))}
            </div>
          </div>
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
                            <button className="text-sm font-medium" onClick={e => { e.preventDefault(); openDm(profile); }}>Direct Message</button>
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
      {dmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeDm}>&times;</button>
            <div className="flex items-center gap-3 mb-4">
              <img src={dmUser?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{dmUser?.display_name || dmUser?.username}</div>
                <div className="text-xs text-gray-400">@{dmUser?.username}</div>
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

export default Members; 