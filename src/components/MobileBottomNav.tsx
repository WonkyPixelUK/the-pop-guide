import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Badge as BadgeIcon, Heart, TrendingUp, List, HelpCircle, Download, Sparkles, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { RetailerService } from '@/services/retailerService';

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
  const [retailerStatus, setRetailerStatus] = useState<{
    is_retailer?: boolean;
    retailer_subscription_status?: string;
    retailer_subscription_expires_at?: string;
  } | null>(null);
  
  // Check retailer status when component mounts
  useEffect(() => {
    const checkRetailerStatus = async () => {
      if (user?.id) {
        try {
          const status = await RetailerService.checkRetailerStatus(user.id);
          setRetailerStatus(status);
        } catch (error) {
          console.error('Error checking retailer status:', error);
        }
      }
    };

    checkRetailerStatus();
  }, [user?.id]);
  
  if (!user || !location.pathname.startsWith('/dashboard')) {
    return null;
  }

  // Create retailer navigation items
  const allNavItems = [...navItems];
  
  // Add retailer tab for all users (temporarily until database is fully configured)
  // TODO: Replace with proper retailer status check when database is working
  allNavItems.push({
    to: '/retailer-dashboard',
    label: 'Retailers',
    icon: Store
  });
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-lg">
      <ul className="flex items-center justify-center px-4 py-3 gap-1">
        {allNavItems.map(({ to, label, icon: Icon }) => {
          // Special handling for retailer dashboard
          const isRetailerDashboard = to === '/retailer-dashboard';
          const active = isRetailerDashboard 
            ? location.pathname === '/retailer-dashboard'
            : (() => {
                // Check if this section is active by matching the URL parameter
                const urlParams = new URLSearchParams(location.search);
                const currentSection = urlParams.get('section') || 'recently-added';
                const itemSection = to.split('section=')[1];
                return currentSection === itemSection;
              })();
          
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