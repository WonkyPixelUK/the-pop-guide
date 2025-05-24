
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Gamepad, Trophy, Clock } from 'lucide-react';
import { ProfileActivity } from '@/hooks/useProfileActivities';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: ProfileActivity[];
  displayName: string;
}

const ActivityFeed = ({ activities, displayName }: ActivityFeedProps) => {
  const getActivityIcon = (activityType: string, platform: string) => {
    switch (activityType) {
      case 'listening':
        return <Music className="w-4 h-4 text-green-500" />;
      case 'playing':
        return <Gamepad className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return 'bg-green-500';
      case 'playstation':
        return 'bg-blue-600';
      case 'xbox':
        return 'bg-green-600';
      case 'nintendo':
        return 'bg-red-500';
      case 'steam':
        return 'bg-gray-700';
      default:
        return 'bg-gray-500';
    }
  };

  const currentActivities = activities.filter(activity => activity.is_current);
  const recentActivities = activities.filter(activity => !activity.is_current).slice(0, 5);

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Activities */}
        {currentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-orange-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Currently Active
            </h4>
            {currentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                {activity.image_url && (
                  <img
                    src={activity.image_url}
                    alt={activity.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.activity_type, activity.platform)}
                    <Badge variant="secondary" className={`${getPlatformColor(activity.platform)} text-white text-xs`}>
                      {activity.platform.charAt(0).toUpperCase() + activity.platform.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-white font-medium truncate">{activity.title}</p>
                  {activity.subtitle && (
                    <p className="text-gray-400 text-sm truncate">{activity.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-400">Recent Activity</h4>
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.activity_type, activity.platform)}
                  <Badge variant="outline" className="text-xs border-gray-600">
                    {activity.platform}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm truncate">{activity.title}</p>
                  {activity.subtitle && (
                    <p className="text-gray-500 text-xs truncate">{activity.subtitle}</p>
                  )}
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
