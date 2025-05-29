import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, UserPlus, Star, List, Heart, Users } from 'lucide-react';

const TABS = ["Friends", "Requests", "Groups"];
const REACTIONS = ["👍", "❤️", "😂", "🔥", "😮", "😢"];

const FriendsList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [addUsername, setAddUsername] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupStatus, setGroupStatus] = useState("");
  const [renameGroupId, setRenameGroupId] = useState(null);
  const [renameGroupName, setRenameGroupName] = useState("");
  // DM state
  const [dmOpen, setDmOpen] = useState(false);
  const [dmFriend, setDmFriend] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const [dmLoading, setDmLoading] = useState(false);
  // Group DM state
  const [groupDmOpen, setGroupDmOpen] = useState(false);
  const [groupDmGroup, setGroupDmGroup] = useState(null);
  const [groupDmMessages, setGroupDmMessages] = useState([]);
  const [groupDmInput, setGroupDmInput] = useState("");
  const [groupDmLoading, setGroupDmLoading] = useState(false);
  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchAll();
    fetchUnreadCount();
    fetchActivityFeed();
    // Optionally, set up a real-time listener for notifications
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchUnreadCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Inject dummy activity data for dev/testing if feed is empty
  useEffect(() => {
    if (activityFeed.length === 0) {
      setActivityFeed([
        {
          id: '1',
          type: 'add_to_collection',
          created_at: new Date().toISOString(),
          profile: { display_name: 'Rich', username: 'rich', avatar_url: '' },
          data: { funkoPopId: 'pop1' },
        },
        {
          id: '2',
          type: 'add_to_wishlist',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          profile: { display_name: 'Jess', username: 'jess', avatar_url: '' },
          data: { funkoPopId: 'pop2' },
        },
        {
          id: '3',
          type: 'create_list',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          profile: { display_name: 'Sam', username: 'sam', avatar_url: '' },
          data: { listId: 'list1', name: 'Disney Faves' },
        },
        {
          id: '4',
          type: 'became_friends',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          profile: { display_name: 'Rich', username: 'rich', avatar_url: '' },
          data: { friendId: 'user2' },
        },
        {
          id: '5',
          type: 'collection_value_change',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          profile: { display_name: 'Jess', username: 'jess', avatar_url: '' },
          data: { oldValue: 100, newValue: 150, change: 50 },
        },
      ]);
    }
  }, [activityFeed.length]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchFriends(),
      fetchRequests(),
      fetchOutgoingRequests(),
      fetchGroups()
    ]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, profiles:friend_id (username, display_name, avatar_url)')
      .eq('user_id', user.id);
    if (!error) setFriends(data || []);
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, sender:sender_id (username, display_name, avatar_url)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    if (!error) setRequests(data || []);
  };

  const fetchOutgoingRequests = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, receiver:receiver_id (username, display_name, avatar_url)')
      .eq('sender_id', user.id)
      .eq('status', 'pending');
    if (!error) setOutgoingRequests(data || []);
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('friend_groups')
      .select('id, name')
      .eq('user_id', user.id);
    if (!error) {
      setGroups(data || []);
      // Fetch group members for each group
      const groupIds = (data || []).map(g => g.id);
      if (groupIds.length > 0) {
        const { data: membersData } = await supabase
          .from('friend_group_members')
          .select('group_id, friend_id, profiles:friend_id (username, display_name, avatar_url)')
          .in('group_id', groupIds);
        const membersByGroup = {};
        (membersData || []).forEach(m => {
          if (!membersByGroup[m.group_id]) membersByGroup[m.group_id] = [];
          membersByGroup[m.group_id].push(m);
        });
        setGroupMembers(membersByGroup);
      } else {
        setGroupMembers({});
      }
    }
  };

  const acceptRequest = async (id) => {
    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', id);
    // Fetch the request to get both user IDs
    const { data: req } = await supabase.from('friend_requests').select('sender_id,receiver_id').eq('id', id).single();
    if (req) {
      // Log for both users
      await supabase.from('activity_log').insert([
        { user_id: req.sender_id, type: 'became_friends', data: { friendId: req.receiver_id } },
        { user_id: req.receiver_id, type: 'became_friends', data: { friendId: req.sender_id } },
      ]);
    }
    await fetchAll();
  };

  const rejectRequest = async (id) => {
    await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', id);
    await fetchAll();
  };

  const removeFriend = async (friendId) => {
    await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId);
    await fetchAll();
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    setAddStatus("");
    if (!addUsername.trim()) return;
    const { data: profile, error } = await supabase
      .from('public_profiles')
      .select('id, user_id, username')
      .eq('username', addUsername.trim())
      .maybeSingle();
    if (error || !profile) {
      setAddStatus("User not found");
      return;
    }
    if (profile.user_id === user.id) {
      setAddStatus("That's you!");
      return;
    }
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.user_id}),and(sender_id.eq.${profile.user_id},receiver_id.eq.${user.id})`)
      .in('status', ['pending', 'accepted']);
    if (existing && existing.length > 0) {
      setAddStatus("Already friends or pending");
      return;
    }
    const { error: reqError } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: profile.user_id, status: 'pending' });
    if (reqError) {
      setAddStatus("Error sending request");
    } else {
      setAddStatus("Request sent!");
      setAddUsername("");
      await fetchAll();
    }
  };

  // Group management
  const createGroup = async (e) => {
    e.preventDefault();
    setGroupStatus("");
    if (!newGroupName.trim()) return;
    const { error } = await supabase
      .from('friend_groups')
      .insert({ user_id: user.id, name: newGroupName.trim() });
    if (error) {
      setGroupStatus("Error creating group");
    } else {
      setGroupStatus("Group created!");
      setNewGroupName("");
      await fetchGroups();
    }
  };

  const deleteGroup = async (groupId) => {
    await supabase.from('friend_groups').delete().eq('id', groupId);
    await fetchGroups();
  };

  const startRenameGroup = (groupId, name) => {
    setRenameGroupId(groupId);
    setRenameGroupName(name);
  };

  const renameGroup = async (e) => {
    e.preventDefault();
    if (!renameGroupName.trim()) return;
    await supabase.from('friend_groups').update({ name: renameGroupName.trim() }).eq('id', renameGroupId);
    setRenameGroupId(null);
    setRenameGroupName("");
    await fetchGroups();
  };

  const addFriendToGroup = async (groupId, friendId) => {
    await supabase.from('friend_group_members').insert({ group_id: groupId, friend_id: friendId });
    await fetchGroups();
  };

  const removeFriendFromGroup = async (groupId, friendId) => {
    await supabase.from('friend_group_members').delete().eq('group_id', groupId).eq('friend_id', friendId);
    await fetchGroups();
  };

  // DMs
  const openDm = async (friend) => {
    setDmFriend(friend);
    setDmOpen(true);
    setDmLoading(true);
    // Fetch messages between user and friend
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.friend_id}),and(sender_id.eq.${friend.friend_id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setDmMessages(data || []);
    setDmLoading(false);
  };

  const sendDm = async (e) => {
    e.preventDefault();
    if (!dmInput.trim() || !dmFriend) return;
    setDmLoading(true);
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: dmFriend.friend_id, content: dmInput.trim() });
    setDmInput("");
    // Refresh messages
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${dmFriend.friend_id}),and(sender_id.eq.${dmFriend.friend_id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setDmMessages(data || []);
    setDmLoading(false);
  };

  const closeDm = () => {
    setDmOpen(false);
    setDmFriend(null);
    setDmMessages([]);
    setDmInput("");
    setDmLoading(false);
  };

  // Group DMs
  const openGroupDm = async (group) => {
    setGroupDmGroup(group);
    setGroupDmOpen(true);
    setGroupDmLoading(true);
    // Fetch messages for this group
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true });
    setGroupDmMessages(data || []);
    setGroupDmLoading(false);
  };

  const sendGroupDm = async (e) => {
    e.preventDefault();
    if (!groupDmInput.trim() || !groupDmGroup) return;
    setGroupDmLoading(true);
    await supabase.from('messages').insert({ sender_id: user.id, group_id: groupDmGroup.id, content: groupDmInput.trim() });
    setGroupDmInput("");
    // Refresh messages
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupDmGroup.id)
      .order('created_at', { ascending: true });
    setGroupDmMessages(data || []);
    setGroupDmLoading(false);
  };

  const closeGroupDm = () => {
    setGroupDmOpen(false);
    setGroupDmGroup(null);
    setGroupDmMessages([]);
    setGroupDmInput("");
    setGroupDmLoading(false);
  };

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setUnreadCount(count || 0);
  };

  // Add reaction to a message
  const addReaction = async (msg, reaction) => {
    await supabase.from('messages').update({ reaction }).eq('id', msg.id);
    // Optionally, notify the recipient
    if (msg.receiver_id && msg.receiver_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: msg.receiver_id,
        type: 'reaction',
        data: { messageId: msg.id, reaction },
      });
    }
    if (msg.group_id) {
      // Notify all group members except sender
      // (fetch group members and insert notifications)
    }
    // Refresh messages
    if (dmOpen) openDm(dmFriend);
    if (groupDmOpen) openGroupDm(groupDmGroup);
  };

  // Fetch activity feed for user and friends
  const fetchActivityFeed = async () => {
    // Get friend IDs
    const { data: friendRows } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user.id);
    const friendIds = (friendRows || []).map(f => f.friend_id);
    const ids = [user.id, ...friendIds];
    // Fetch recent activity (last 30 days, limit 40)
    const { data: activities } = await supabase
      .from('activity_log')
      .select('*, profile: user_id (username, display_name, avatar_url)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(40);
    setActivityFeed(activities || []);
  };

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 text-white">
      <div className="flex gap-4 mb-6">
        {TABS.map(tab => (
          <Button
            key={tab}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Friends" && unreadCount > 0 && (
              <span className="ml-2 bg-red-600 text-white rounded-full px-2 text-xs">{unreadCount}</span>
            )}
          </Button>
        ))}
      </div>
      {activeTab === "Friends" && (
        <form onSubmit={sendRequest} className="mb-6 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Add friend by username"
            value={addUsername}
            onChange={e => setAddUsername(e.target.value)}
            className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none"
          />
          <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">Add</Button>
          {addStatus && <span className="ml-2 text-sm text-orange-400">{addStatus}</span>}
        </form>
      )}
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <>
          {activeTab === "Friends" && (
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-400" />
                  Friends Activity
                </h3>
                {activityFeed.length === 0 ? (
                  <div className="text-gray-400">No recent activity.</div>
                ) : (
                  <ul className="space-y-4">
                    {activityFeed.map(ev => {
                      const profile = ev.profile || {};
                      let icon = <Clock className="w-4 h-4 text-gray-400" />;
                      let text = '';
                      switch (ev.type) {
                        case 'add_to_collection':
                          icon = <Star className="w-4 h-4 text-yellow-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'} added a Pop to their collection.`;
                          break;
                        case 'add_to_wishlist':
                          icon = <Heart className="w-4 h-4 text-pink-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'} added a Pop to their wishlist.`;
                          break;
                        case 'create_list':
                          icon = <List className="w-4 h-4 text-blue-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'} created a custom list.`;
                          break;
                        case 'add_to_list':
                          icon = <List className="w-4 h-4 text-blue-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'} added a Pop to a custom list.`;
                          break;
                        case 'collection_value_change':
                          icon = <Star className="w-4 h-4 text-green-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'}'s collection value changed by £${Math.abs(ev.data?.change || 0)}.`;
                          break;
                        case 'became_friends':
                          icon = <UserPlus className="w-4 h-4 text-orange-400" />;
                          text = `${profile.display_name || profile.username || 'Someone'} became friends with someone.`;
                          break;
                        default:
                          text = `${profile.display_name || profile.username || 'Someone'} did something.`;
                      }
                      return (
                        <li key={ev.id} className="flex items-center gap-3 bg-gray-900/60 rounded p-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-orange-500 text-white">
                              {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {icon}
                          <span className="flex-1">{text}</span>
                          <span className="text-xs text-gray-400 ml-2">{new Date(ev.created_at).toLocaleString()}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {friends.length === 0 ? (
                <div className="text-gray-400">No friends yet.</div>
              ) : (
                <ul className="space-y-4">
                  {friends.map(friend => (
                    <li key={friend.friend_id} className="flex items-center gap-4 bg-gray-900/60 rounded p-3">
                      <img src={friend.profiles?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="font-semibold">{friend.profiles?.display_name || friend.profiles?.username}</div>
                        <div className="text-xs text-gray-400">@{friend.profiles?.username}</div>
                      </div>
                      <Button className="bg-blue-700 hover:bg-blue-800 text-white mr-2" onClick={() => openDm(friend)}>Message</Button>
                      <Button className="bg-red-700 hover:bg-red-800 text-white" onClick={() => removeFriend(friend.friend_id)}>Remove</Button>
                      {groups.length > 0 && (
                        <div className="ml-4">
                          <select
                            className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                            onChange={e => addFriendToGroup(e.target.value, friend.friend_id)}
                            defaultValue=""
                          >
                            <option value="">Add to group...</option>
                            {groups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {outgoingRequests.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
                  <ul className="space-y-4">
                    {outgoingRequests.map(req => (
                      <li key={req.id} className="flex items-center gap-4 bg-gray-900/60 rounded p-3">
                        <img src={req.receiver?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="font-semibold">{req.receiver?.display_name || req.receiver?.username}</div>
                          <div className="text-xs text-gray-400">@{req.receiver?.username}</div>
                        </div>
                        <span className="text-orange-400">Pending</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === "Requests" && (
            <div>
              {requests.length === 0 ? (
                <div className="text-gray-400">No pending requests.</div>
              ) : (
                <ul className="space-y-4">
                  {requests.map(req => (
                    <li key={req.id} className="flex items-center gap-4 bg-gray-900/60 rounded p-3">
                      <img src={req.sender?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="font-semibold">{req.sender?.display_name || req.sender?.username}</div>
                        <div className="text-xs text-gray-400">@{req.sender?.username}</div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700 text-white mr-2" onClick={() => acceptRequest(req.id)}>Accept</Button>
                      <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => rejectRequest(req.id)}>Reject</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "Groups" && (
            <div>
              <form onSubmit={createGroup} className="mb-4 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="New group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none"
                />
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">Create</Button>
                {groupStatus && <span className="ml-2 text-sm text-orange-400">{groupStatus}</span>}
              </form>
              {groups.length === 0 ? (
                <div className="text-gray-400">No groups yet.</div>
              ) : (
                <ul className="space-y-4">
                  {groups.map(group => (
                    <li key={group.id} className="bg-gray-900/60 rounded p-3">
                      <div className="flex items-center gap-4 mb-2">
                        {renameGroupId === group.id ? (
                          <form onSubmit={renameGroup} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={renameGroupName}
                              onChange={e => setRenameGroupName(e.target.value)}
                              className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                            />
                            <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-2 py-1">Save</Button>
                            <Button type="button" className="bg-gray-700 text-white px-2 py-1" onClick={() => setRenameGroupId(null)}>Cancel</Button>
                          </form>
                        ) : (
                          <>
                            <div className="font-semibold flex-1">{group.name}</div>
                            <Button className="bg-yellow-700 hover:bg-yellow-800 text-white px-2 py-1 mr-2" onClick={() => startRenameGroup(group.id, group.name)}>Rename</Button>
                            <Button className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 mr-2" onClick={() => deleteGroup(group.id)}>Delete</Button>
                            <Button className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1" onClick={() => openGroupDm(group)}>Group Message</Button>
                          </>
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-xs text-gray-400 mb-1">Members:</div>
                        <ul className="space-y-2">
                          {(groupMembers[group.id] || []).length === 0 && <li className="text-gray-500 text-xs">No members</li>}
                          {(groupMembers[group.id] || []).map(member => (
                            <li key={member.friend_id} className="flex items-center gap-2">
                              <img src={member.profiles?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-7 h-7 rounded-full" />
                              <span className="text-sm">{member.profiles?.display_name || member.profiles?.username}</span>
                              <Button className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 ml-2" onClick={() => removeFriendFromGroup(group.id, member.friend_id)}>Remove</Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
      {/* DM Modal */}
      {dmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeDm}>&times;</button>
            <div className="flex items-center gap-3 mb-4">
              <img src={dmFriend?.profiles?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{dmFriend?.profiles?.display_name || dmFriend?.profiles?.username}</div>
                <div className="text-xs text-gray-400">@{dmFriend?.profiles?.username}</div>
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
                          <div className="flex gap-1 mt-1">
                            {REACTIONS.map(r => (
                              <button key={r} className="text-lg" onClick={() => addReaction(msg, r)}>{r}</button>
                            ))}
                          </div>
                          {msg.reaction && (
                            <div className="mt-1 text-xl">{msg.reaction}</div>
                          )}
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
      {/* Group DM Modal */}
      {groupDmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeGroupDm}>&times;</button>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-semibold text-lg">Group: {groupDmGroup?.name}</div>
            </div>
            <div className="bg-gray-800 rounded p-3 h-64 overflow-y-auto mb-4 flex flex-col-reverse">
              <div>
                {groupDmLoading ? (
                  <div className="text-gray-400 text-center">Loading...</div>
                ) : (
                  groupDmMessages.length === 0 ? (
                    <div className="text-gray-500 text-center">No messages yet.</div>
                  ) : (
                    groupDmMessages.slice().reverse().map(msg => (
                      <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender_id === user.id ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-200'}`}>
                          {msg.content}
                          <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="flex gap-1 mt-1">
                            {REACTIONS.map(r => (
                              <button key={r} className="text-lg" onClick={() => addReaction(msg, r)}>{r}</button>
                            ))}
                          </div>
                          {msg.reaction && (
                            <div className="mt-1 text-xl">{msg.reaction}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
            <form onSubmit={sendGroupDm} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={groupDmInput}
                onChange={e => setGroupDmInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                disabled={groupDmLoading}
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={groupDmLoading || !groupDmInput.trim()}>Send</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList; 