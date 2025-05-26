import { Link, useLocation } from 'react-router-dom';
import { Home, Search, List, User, Grid } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/dashboard', label: 'Dashboard', icon: Grid },
  { to: '/browse-lists', label: 'Lists', icon: List },
  { to: '/profile-settings', label: 'Profile', icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-orange-200 shadow-lg md:hidden">
      <ul className="flex justify-between items-center px-1 py-1 overflow-x-auto whitespace-nowrap">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors ${active ? 'text-orange-600' : 'text-[#232837]'} hover:text-orange-500`}
                aria-label={label}
              >
                <Icon className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav; 