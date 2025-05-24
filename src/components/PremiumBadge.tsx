
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PremiumBadgeProps {
  isPremium: boolean;
  className?: string;
}

const PremiumBadge = ({ isPremium, className = "" }: PremiumBadgeProps) => {
  if (!isPremium) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 ${className}`}
    >
      <Award className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  );
};

export default PremiumBadge;
