
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Trophy, Users } from 'lucide-react';
import { ProfileActivity } from '@/hooks/useProfileActivities';
import { PublicProfile } from '@/hooks/usePublicProfile';

interface GamingDashboardProps {
  profile: PublicProfile;
  activities: ProfileActivity[];
}

const GamingDashboard = ({ profile, activities }: GamingDashboardProps) => {
  const gamingPlatforms = [
    {
      name: 'PlayStation',
      username: profile.playstation_username,
      color: 'bg-blue-600',
      platform: 'playstation'
    },
    {
      name: 'Xbox',
      username: profile.xbox_gamertag,
      color: 'bg-green-600',
      platform: 'xbox'
    },
    {
      name: 'Nintendo',
      username: profile.nintendo_friend_code,
      color: 'bg-red-500',
      platform: 'nintendo'
    },
    {
      name: 'Steam',
      username: profile.steam_username,
      color: 'bg-gray-700',
      platform: 'steam'
    }
  ].filter(platform => platform.username);

  const currentGames = activities.filter(
    activity => activity.is_current && activity.activity_type === 'playing'
  );

  const recentGames = activities
    .filter(activity => !activity.is_current && activity.activity_type === 'playing')
    .slice(0, 6);

  const achievements = activities.filter(
    activity => activity.activity_type === 'achievement'
  ).slice(0, 3);

  if (gamingPlatforms.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Gaming Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Platforms */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Connected Platforms</h4>
          <div className="grid grid-cols-2 gap-3">
            {gamingPlatforms.map((platform) => (
              <div key={platform.platform} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{platform.name}</p>
                  <p className="text-gray-400 text-xs truncate">{platform.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Currently Playing */}
        {currentGames.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-500 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Currently Playing
            </h4>
            <div className="space-y-2">
              {currentGames.map((game) => (
                <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  {game.image_url && (
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{game.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {game.platform}
                      </Badge>
                      {game.subtitle && (
                        <span className="text-gray-400 text-xs">{game.subtitle}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Recently Played</h4>
            <div className="grid grid-cols-3 gap-2">
              {recentGames.map((game) => (
                <div key={game.id} className="text-center p-2 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full aspect-square rounded object-cover mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-600 rounded flex items-center justify-center mb-2">
                      <Gamepad2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-white text-xs font-medium truncate">{game.title}</p>
                  <p className="text-gray-400 text-xs truncate">{game.platform}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{achievement.title}</p>
                    <p className="text-gray-400 text-xs">{achievement.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                    {achievement.platform}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GamingDashboard;
