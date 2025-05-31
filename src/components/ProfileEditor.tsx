import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, Gamepad2, Copy as CopyIcon, Mail, Lock, Eye, EyeOff, Crown, Award, Trophy } from 'lucide-react';
import { useCustomLists } from '@/hooks/useCustomLists';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TrophyAvatar from '@/components/TrophyAvatar';

function ProfileEditor({ section }: { section?: string }) {
  const { profile, loading, createProfile, updateProfile } = usePublicProfile();
  const { lists, createList } = useCustomLists();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    is_public: false,
    spotify_username: '',
    discord_username: '',
    twitter_handle: '',
    instagram_handle: '',
    tiktok_handle: '',
    ebay_store_url: '',
    playstation_username: '',
    xbox_gamertag: '',
    nintendo_friend_code: '',
    steam_username: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [selectedListIds, setSelectedListIds] = useState<string[]>(profile?.profile_list_ids || []);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<'free' | 'pro' | 'top_member' | 'team'>('free');
  
  // Public profile visibility controls
  const [publicProfileSettings, setPublicProfileSettings] = useState({
    show_bio: true,
    show_avatar: true,
    show_social_links: true,
    show_gaming_profiles: true,
    show_lists: true,
    show_join_date: true,
    show_collection_stats: true
  });

  // Function to calculate user status based on various factors
  const calculateUserStatus = async () => {
    if (!user) return 'free';
    
    try {
      // Check if user is team member
      if (user.email === 'rich@maintainhq.com') {
        setUserStatus('team');
        return 'team';
      }

      // Check subscription status
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (userData?.subscription_status === 'active') {
        // Check if they're a top member (based on collection size, activity, etc.)
        const { data: collection } = await supabase
          .from('collection_items')
          .select('id')
          .eq('user_id', user.id);

        const collectionSize = collection?.length || 0;
        
        // Top member criteria: 100+ items OR active for 6+ months
        if (collectionSize >= 100) {
          setUserStatus('top_member');
          return 'top_member';
        }
        
        setUserStatus('pro');
        return 'pro';
      }

      setUserStatus('free');
      return 'free';
    } catch (error) {
      console.error('Error calculating user status:', error);
      setUserStatus('free');
      return 'free';
    }
  };

  useEffect(() => {
    if (user) {
      calculateUserStatus();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        is_public: profile.is_public,
        spotify_username: profile.spotify_username || '',
        discord_username: profile.discord_username || '',
        twitter_handle: profile.twitter_handle || '',
        instagram_handle: profile.instagram_handle || '',
        tiktok_handle: profile.tiktok_handle || '',
        ebay_store_url: profile.ebay_store_url || '',
        playstation_username: profile.playstation_username || '',
        xbox_gamertag: profile.xbox_gamertag || '',
        nintendo_friend_code: profile.nintendo_friend_code || '',
        steam_username: profile.steam_username || '',
      });
      setSelectedListIds(profile.profile_list_ids || []);
      
      // Load public profile visibility settings
      if (profile.public_profile_settings) {
        setPublicProfileSettings({
          ...publicProfileSettings,
          ...profile.public_profile_settings
        });
      }
    }
    
    // Set current email
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [profile, user]);

  const validateUsername = (username: string) => /^[a-z0-9-_]+$/.test(username);
  const checkUsernameAvailability = async (username: string) => {
    if (!validateUsername(username)) {
      setUsernameError('Only a-z, 0-9, hyphens, and underscores allowed');
      return false;
    }
    if (profile && username === profile.username) {
      setUsernameError('');
      return true;
    }
    const { data } = await updateProfile.mutateAsync.supabase
      .from('public_profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (data) {
      setUsernameError('Username is already taken');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleListSelection = (listId: string) => {
    setSelectedListIds(prev =>
      prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (formData.username && !(await checkUsernameAvailability(formData.username))) {
      setIsSubmitting(false);
      return;
    }
    try {
      const profileData = { ...formData, profile_list_ids: selectedListIds };
      if (profile) {
        await updateProfile(profileData);
      } else {
        await createProfile(profileData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'username') {
      value = (value as string).replace(/[^a-z0-9-_]/gi, '').toLowerCase();
      setFormData(prev => ({ ...prev, [field]: value }));
      setUsernameError("");
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleConnectProvider = async (provider: 'spotify' | 'discord') => {
    try {
      if (supabase.auth.linkIdentity) {
        // Use linkIdentity if available (Supabase v2+)
        const { data, error } = await supabase.auth.linkIdentity({ provider });
        if (error) {
          if (error.message && error.message.toLowerCase().includes('manual linked disabled')) {
            toast({ title: `Manual identity linking is not enabled`, description: 'Enable it in your Supabase Auth settings.', variant: 'destructive' });
          } else {
            toast({ title: `Failed to connect ${provider}`, description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected!`, variant: 'success' });
        }
      } else {
        // Fallback: signInWithOAuth (will sign in as new user, not link)
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
          },
        });
        if (error) {
          toast({ title: `Failed to connect ${provider}`, description: error.message, variant: 'destructive' });
        } else {
          toast({ title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected!`, variant: 'success' });
        }
      }
    } catch (e: any) {
      toast({ title: `Failed to connect ${provider}`, description: e.message, variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `user-profiles/${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload to Bunny CDN
      const response = await fetch(`https://storage.bunnycdn.com/popguide-storage/${fileName}`, {
        method: 'PUT',
        headers: {
          'AccessKey': process.env.REACT_APP_BUNNY_CDN_API_KEY || '',
          'Content-Type': 'application/octet-stream',
        },
        body: file
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      // Generate CDN URL
      const fileUrl = `https://popguide-cdn.b-cdn.net/${fileName}`;
      
      setFormData(prev => ({ ...prev, avatar_url: fileUrl }));
      // Auto-save profile with new avatar_url
      await updateProfile({ ...formData, avatar_url: fileUrl });
      toast({ title: 'Profile picture updated!', variant: 'default' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === user?.email) return;
    
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Email update initiated', 
        description: 'Please check both your old and new email for confirmation links.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Email update failed', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ 
        title: 'Password mismatch', 
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ 
        title: 'Password too short', 
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }
    
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Password updated', 
        description: 'Your password has been successfully changed.',
        variant: 'default'
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ 
        title: 'Password update failed', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          {profile ? 'Edit Profile' : 'Create Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile fields only */}
          {(!section || section === 'profile') && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <TrophyAvatar avatarUrl={formData.avatar_url} displayName={formData.display_name} userStatus={userStatus} />
                <div>
                  <label htmlFor="avatar_upload" className="cursor-pointer">
                    <Button 
                      type="button" 
                      disabled={uploading}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => document.getElementById('avatar_upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                  </label>
                  <input
                    id="avatar_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="username" className="text-gray-300 text-sm font-medium">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="username"
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  required
                />
                {usernameError && <p className="text-red-400 text-sm mt-1">{usernameError}</p>}
                {formData.username && !usernameError && (
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                    Your profile: {window.location.origin}/profile/{formData.username}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/profile/${formData.username}`);
                        toast({ title: 'Copied!', description: 'Profile URL copied to clipboard', variant: 'success' });
                      }}
                    >
                      <CopyIcon className="w-4 h-4 text-gray-400 hover:text-orange-500" />
                    </button>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="display_name" className="text-gray-300 text-sm font-medium">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Your display name"
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="bio" className="text-gray-300 text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell others about your Funko Pop collecting journey..."
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public" className="text-gray-300 text-sm font-medium">
                  Make profile public
                </Label>
              </div>
            </div>
          )}
          {/* Social Integrations only */}
          {section === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-6">Social Integrations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="spotify_username" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-500" />
                    Spotify
                    {formData.spotify_username ? (
                      <span className="ml-2 text-xs text-green-400">Connected as {formData.spotify_username}</span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="ml-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                        onClick={() => handleConnectProvider('spotify')}
                      >
                        Connect
                      </Button>
                    )}
                  </Label>
                  <Input
                    id="spotify_username"
                    value={formData.spotify_username}
                    onChange={(e) => handleInputChange('spotify_username', e.target.value)}
                    placeholder="spotify_username"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    disabled={!!formData.spotify_username}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="discord_username" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    Discord
                    {formData.discord_username ? (
                      <span className="ml-2 text-xs text-indigo-400">Connected as {formData.discord_username}</span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1"
                        onClick={() => handleConnectProvider('discord')}
                      >
                        Connect
                      </Button>
                    )}
                  </Label>
                  <Input
                    id="discord_username"
                    value={formData.discord_username}
                    onChange={(e) => handleInputChange('discord_username', e.target.value)}
                    placeholder="discord#1234"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    disabled={!!formData.discord_username}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="twitter_handle" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter Handle
                  </Label>
                  <Input
                    id="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                    placeholder="@twitter_handle"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="instagram_handle" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                    placeholder="@instagram_handle"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tiktok_handle" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    TikTok Handle
                  </Label>
                  <Input
                    id="tiktok_handle"
                    value={formData.tiktok_handle}
                    onChange={(e) => handleInputChange('tiktok_handle', e.target.value)}
                    placeholder="@tiktok_handle"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ebay_store_url" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-yellow-500" />
                    eBay Store URL
                  </Label>
                  <Input
                    id="ebay_store_url"
                    value={formData.ebay_store_url}
                    onChange={(e) => handleInputChange('ebay_store_url', e.target.value)}
                    placeholder="https://ebay.com/str/yourstore"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Gaming Platforms only */}
          {section === 'gaming' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Gaming Platforms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="playstation_username" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    PlayStation ID
                  </Label>
                  <Input
                    id="playstation_username"
                    value={formData.playstation_username}
                    onChange={(e) => handleInputChange('playstation_username', e.target.value)}
                    placeholder="your_psn_id"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="xbox_gamertag" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    Xbox Gamertag
                  </Label>
                  <Input
                    id="xbox_gamertag"
                    value={formData.xbox_gamertag}
                    onChange={(e) => handleInputChange('xbox_gamertag', e.target.value)}
                    placeholder="YourGamertag"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="nintendo_friend_code" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    Nintendo Friend Code
                  </Label>
                  <Input
                    id="nintendo_friend_code"
                    value={formData.nintendo_friend_code}
                    onChange={(e) => handleInputChange('nintendo_friend_code', e.target.value)}
                    placeholder="SW-1234-5678-9012"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="steam_username" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    Steam Username
                  </Label>
                  <Input
                    id="steam_username"
                    value={formData.steam_username}
                    onChange={(e) => handleInputChange('steam_username', e.target.value)}
                    placeholder="steamusername"
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Add Lists only */}
          {section === 'lists' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-6">Add Lists to Your Public Profile</h3>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white mb-4">Create List</Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                  </DialogHeader>
                  <CreateListDialogContent />
                </DialogContent>
              </Dialog>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lists.map(list => (
                  <div key={list.id} className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedListIds.includes(list.id)}
                      onChange={() => handleListSelection(list.id)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-medium block">{list.name}</span>
                      <span className="text-gray-400 text-sm block">{list.description}</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="ml-auto bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1">Transfer</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700 text-white">
                        <DialogHeader>
                          <DialogTitle>Transfer List</DialogTitle>
                        </DialogHeader>
                        <TransferListDialogContent list={list} user={user} toast={toast} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
                {lists.length === 0 && (
                  <span className="text-gray-400 col-span-2 text-center py-8">You have no custom lists yet.</span>
                )}
              </div>
            </div>
          )}
          
          {/* Account Security & Privacy */}
          {section === 'account' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-orange-500" />
                  Account Security
                </h2>
                
                {/* Email Change */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-lg font-semibold text-white">Email Address</h3>
                  <div className="space-y-3">
                    <Label htmlFor="new_email" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="new_email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-gray-700 border-gray-600 text-white flex-1"
                      />
                      <Button
                        onClick={handleEmailChange}
                        disabled={emailLoading || newEmail === user?.email}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {emailLoading ? 'Updating...' : 'Update Email'}
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Changing your email will require verification at both your old and new email addresses.
                    </p>
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-lg font-semibold text-white">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="new_password" className="text-gray-300 text-sm font-medium">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confirm_password" className="text-gray-300 text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-8">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-orange-500" />
                  Public Profile Visibility
                </h2>
                <p className="text-gray-400 mb-6">
                  Choose what information is visible on your public profile. Even when hidden, this information is still saved.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    show_avatar: 'Profile Picture',
                    show_bio: 'Bio/Description',
                    show_social_links: 'Social Media Links',
                    show_gaming_profiles: 'Gaming Profiles',
                    show_lists: 'Public Lists',
                    show_join_date: 'Join Date',
                    show_collection_stats: 'Collection Statistics'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {publicProfileSettings[key as keyof typeof publicProfileSettings] ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <span className="text-white font-medium">{label}</span>
                          <p className="text-gray-400 text-sm">
                            {publicProfileSettings[key as keyof typeof publicProfileSettings] ? 'Visible to everyone' : 'Hidden from public'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={publicProfileSettings[key as keyof typeof publicProfileSettings]}
                        onCheckedChange={(checked) => 
                          setPublicProfileSettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      // Save public profile settings
                      const profileData = { 
                        ...formData, 
                        public_profile_settings: publicProfileSettings,
                        profile_list_ids: selectedListIds 
                      };
                      if (profile) {
                        updateProfile(profileData);
                      } else {
                        createProfile(profileData);
                      }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Save Visibility Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-6 border-t border-gray-700">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-medium"
            >
              {isSubmitting ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TransferListDialogContent({ list, user, toast }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    setError('');
    if (!user) {
      toast({ title: 'You must be logged in', description: 'Please log in to transfer a list.', variant: 'destructive' });
      return;
    }
    if (!input.trim()) {
      setError('Please enter a username or email.');
      return;
    }
    setLoading(true);
    try {
      // Look up recipient by username or email
      let { data: recipient, error: lookupError } = await supabase
        .from('public_profiles')
        .select('user_id,username,email')
        .or(`username.eq.${input},email.eq.${input}`)
        .maybeSingle();
      if (lookupError || !recipient) {
        setError('User not found.');
        setLoading(false);
        return;
      }
      if (recipient.user_id === user.id) {
        setError('You cannot transfer a list to yourself.');
        setLoading(false);
        return;
      }
      // Create transfer request
      const { error: transferError } = await supabase
        .from('list_transfers')
        .insert({
          list_id: list.id,
          from_user_id: user.id,
          to_user_id: recipient.user_id,
          status: 'pending',
        });
      if (transferError) throw transferError;
      // Create notification for recipient
      await supabase.from('notifications').insert({
        user_id: recipient.user_id,
        type: 'list_transfer',
        message: `${user.email || 'A user'} wants to transfer the list '${list.name}' to you.`,
        data: { list_id: list.id, from_user_id: user.id },
      });
      // Optionally, send email (if you have a utility)
      // await sendListTransferEmail(recipient.user_id, user.email, list.name);
      toast({ title: 'Transfer request sent!', description: 'The user has been notified.' });
      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to request transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p>Enter the username or email of the user you want to transfer this list to:</p>
      <Input placeholder="Username or email" value={input} onChange={e => setInput(e.target.value)} />
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <Button className="bg-orange-500 hover:bg-orange-600 w-full" onClick={handleTransfer} disabled={loading}>{loading ? 'Sending...' : 'Send Transfer Request'}</Button>
    </div>
  );
}

function CreateListDialogContent() {
  const { createList } = useCustomLists();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!name.trim()) {
      setError('List name is required.');
      return;
    }
    setLoading(true);
    try {
      await createList.mutateAsync({ name, description, isPublic });
      toast({ title: 'List created!', description: 'Your new list has been created.' });
      setName('');
      setDescription('');
      setIsPublic(false);
      // Close dialog by triggering parent Dialog's onOpenChange
      document.activeElement?.blur();
    } catch (err: any) {
      setError(err.message || 'Failed to create list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input 
        placeholder="List name" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="bg-white text-[#232837] placeholder:text-gray-400"
      />
      <Textarea 
        placeholder="Description (optional)" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        className="bg-white text-[#232837] placeholder:text-gray-400"
      />
      <div className="flex items-center space-x-2">
        <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="isPublic">Make this list public</Label>
      </div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <Button className="bg-orange-500 hover:bg-orange-600 w-full" onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create List'}</Button>
    </div>
  );
}

export default ProfileEditor;
