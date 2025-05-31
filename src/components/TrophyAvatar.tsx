import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Award, Trophy } from 'lucide-react';

interface TrophyAvatarProps {
  avatarUrl?: string;
  displayName?: string;
  userStatus?: 'free' | 'pro' | 'top_member' | 'team';
  size?: string;
  email?: string;
}

const TrophyAvatar = ({ 
  avatarUrl, 
  displayName, 
  userStatus = 'free', 
  size = "w-16 h-16",
  email 
}: TrophyAvatarProps) => {
  
  // Determine user status based on email and other factors
  const getUserStatus = (): 'free' | 'pro' | 'top_member' | 'team' => {
    if (email === 'rich@maintainhq.com') return 'team';
    return userStatus;
  };

  const getTrophyIcon = () => {
    const status = getUserStatus();
    switch (status) {
      case 'team':
        return <Crown className="w-6 h-6 text-orange-500 absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 border border-orange-500" />;
      case 'top_member':
        return <Trophy className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 border border-yellow-500" />;
      case 'pro':
        return <Award className="w-5 h-5 text-blue-500 absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className={size}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-gray-700 text-white">
          {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      {getTrophyIcon()}
    </div>
  );
};

export default TrophyAvatar; 