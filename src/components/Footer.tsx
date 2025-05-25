import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Monitor } from 'lucide-react';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'system';
  return localStorage.getItem('theme') || 'system';
};

const Footer = () => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4 mt-12">
      <div className="container mx-auto">
        {/* System Status Row */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400 inline-block"></span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">All systems normal</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
              alt="PopGuide Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400">
              The ultimate platform for Funko Pop collectors to track, value, and showcase their collections.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/features" className="hover:text-orange-500 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
              <li><Link to="/api" className="hover:text-orange-500 transition-colors">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/community" className="hover:text-orange-500 transition-colors">Community (coming soon)</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Terms</Link></li>
              <li><Link to="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PopGuide. All rights reserved.</p>
          <div className="mt-4 flex justify-center">
            <img src="https://api.checklyhq.com/v1/badges/checks/e94c9b1a-d3da-4b89-b8d8-2606014dad8d?style=for-the-badge&theme=light" alt="Uptime monitored by Checkly" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 