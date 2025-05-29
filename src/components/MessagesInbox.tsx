import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MessagesInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoading(true);
      // Fetch all messages where user is sender or receiver
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, profiles:sender_id (username, display_name, avatar_url), profiles_receiver:receiver_id (username, display_name, avatar_url)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) {
        setConversations([]);
        setLoading(false);
        return;
      }
      // Group by the other user
      const convMap = {};
      (data || []).forEach(msg => {
        const otherUser = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap[otherUser]) {
          convMap[otherUser] = { ...msg, otherUser };
        }
      });
      setConversations(Object.values(convMap));
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="text-white">Loading messages...</div>;
  if (conversations.length === 0) return <div className="text-gray-400">No conversations yet.</div>;

  return (
    <div className="space-y-4">
      {conversations.map(conv => {
        const profile = conv.sender_id === user.id ? conv.profiles_receiver : conv.profiles;
        return (
          <div key={conv.otherUser} className="flex items-center gap-3 bg-gray-800 rounded p-3">
            <img src={profile?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="font-semibold text-white">{profile?.display_name || profile?.username}</div>
              <div className="text-gray-400 text-xs line-clamp-1">{conv.content}</div>
            </div>
            <button className="text-orange-500 text-sm" disabled>Open DM</button>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesInbox; 