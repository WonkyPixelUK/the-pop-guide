import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Badge as BadgeIcon, Heart, TrendingUp, List, HelpCircle, Download, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard?section=recently-added', label: 'Recently Added', icon: Zap },
  { to: '/dashboard?section=items-owned', label: 'Items Owned', icon: BadgeIcon },
  { to: '/dashboard?section=wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard?section=new-releases', label: 'New Releases', icon: Sparkles },
  { to: '/dashboard?section=analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/dashboard?section=lists', label: 'Lists', icon: List },
  { to: '/dashboard?section=support', label: 'Support', icon: HelpCircle },
  { to: '/dashboard?section=downloads', label: 'Downloads', icon: Download },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user || !location.pathname.startsWith('/dashboard')) {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-lg">
      <ul className="flex items-center justify-center px-4 py-3 gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          // Check if this section is active by matching the URL parameter
          const urlParams = new URLSearchParams(location.search);
          const currentSection = urlParams.get('section') || 'recently-added';
          const itemSection = to.split('section=')[1];
          const active = currentSection === itemSection;
          
          return (
            <li key={to} className="flex-1">
              <button
                onClick={() => navigate(to)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-md transition-all duration-200 w-full ${
                  active ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-orange-400 hover:bg-gray-800'
                }`}
                aria-label={label}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav; 