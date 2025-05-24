
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Music, MessageCircle, Twitter, Instagram, Video, ShoppingBag, Gamepad2 } from 'lucide-react';

const ProfileEditor = () => {
  const { profile, loading, createProfile, updateProfile } = usePublicProfile();
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
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {formData.display_name ? formData.display_name[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url" className="text-gray-300">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username" className="text-gray-300">Username (for profile URL)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="mycoolpopguide"
                className="bg-gray-700 border-gray-600 text-white"
              />
              {formData.username && (
                <p className="text-sm text-gray-400 mt-1">
                  Your profile will be at: /profile/{formData.username}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Your display name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-300">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell others about your Funko Pop collecting journey..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              />
              <Label htmlFor="is_public" className="text-gray-300">
                Make profile public
              </Label>
            </div>
          </div>

          {/* Social Integrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Integrations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spotify_username" className="text-gray-300 flex items-center gap-2">
                  <Music className="w-4 h-4 text-green-500" />
                  Spotify Username
                </Label>
                <Input
                  id="spotify_username"
                  value={formData.spotify_username}
                  onChange={(e) => handleInputChange('spotify_username', e.target.value)}
                  placeholder="spotify_username"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="discord_username" className="text-gray-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  Discord Username
                </Label>
                <Input
                  id="discord_username"
                  value={formData.discord_username}
                  onChange={(e) => handleInputChange('discord_username', e.target.value)}
                  placeholder="discord#1234"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="twitter_handle" className="text-gray-300 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter Handle
                </Label>
                <Input
                  id="twitter_handle"
                  value={formData.twitter_handle}
                  onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                  placeholder="@twitter_handle"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="instagram_handle" className="text-gray-300 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram Handle
                </Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                  placeholder="@instagram_handle"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="tiktok_handle" className="text-gray-300 flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  TikTok Handle
                </Label>
                <Input
                  id="tiktok_handle"
                  value={formData.tiktok_handle}
                  onChange={(e) => handleInputChange('tiktok_handle', e.target.value)}
                  placeholder="@tiktok_handle"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="ebay_store_url" className="text-gray-300 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-yellow-500" />
                  eBay Store URL
                </Label>
                <Input
                  id="ebay_store_url"
                  value={formData.ebay_store_url}
                  onChange={(e) => handleInputChange('ebay_store_url', e.target.value)}
                  placeholder="https://ebay.com/str/yourstore"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Gaming Platforms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Gaming Platforms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="playstation_username" className="text-gray-300 flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  PlayStation ID
                </Label>
                <Input
                  id="playstation_username"
                  value={formData.playstation_username}
                  onChange={(e) => handleInputChange('playstation_username', e.target.value)}
                  placeholder="your_psn_id"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="xbox_gamertag" className="text-gray-300 flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  Xbox Gamertag
                </Label>
                <Input
                  id="xbox_gamertag"
                  value={formData.xbox_gamertag}
                  onChange={(e) => handleInputChange('xbox_gamertag', e.target.value)}
                  placeholder="YourGamertag"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="nintendo_friend_code" className="text-gray-300 flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  Nintendo Friend Code
                </Label>
                <Input
                  id="nintendo_friend_code"
                  value={formData.nintendo_friend_code}
                  onChange={(e) => handleInputChange('nintendo_friend_code', e.target.value)}
                  placeholder="SW-1234-5678-9012"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="steam_username" className="text-gray-300 flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  Steam Username
                </Label>
                <Input
                  id="steam_username"
                  value={formData.steam_username}
                  onChange={(e) => handleInputChange('steam_username', e.target.value)}
                  placeholder="steamusername"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
