import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Monitor, Facebook } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

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
    <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="flex flex-col items-start">
            <img 
              src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
              alt="PopGuide Logo" 
              className="h-16 w-auto mb-4"
            />
            <div className="flex gap-2 mb-4 mt-1">
              <button aria-label="System" className={`p-1 rounded-full ${theme==='system' ? 'bg-orange-100' : ''}`} onClick={() => setTheme('system')}><Monitor className="w-4 h-4" color="#e46c1b" /></button>
              <button aria-label="Light" className={`p-1 rounded-full ${theme==='light' ? 'bg-orange-100' : ''}`} onClick={() => setTheme('light')}><Sun className="w-4 h-4" color="#e46c1b" /></button>
              <button aria-label="Dark" className={`p-1 rounded-full ${theme==='dark' ? 'bg-orange-100' : ''}`} onClick={() => setTheme('dark')}><Moon className="w-4 h-4" color="#e46c1b" /></button>
            </div>
            <p className="text-gray-400">
              The ultimate platform for Funko Pop collectors to track, value, and showcase their collections.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/database/all" className="hover:text-orange-500 transition-colors">Browse Database</Link></li>
              <li><Link to="/features" className="hover:text-orange-500 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/api" className="hover:text-orange-500 transition-colors">API</Link></li>
              <li><Link to="/faq" className="hover:text-orange-500 transition-colors">FAQ</Link></li>
              <li><Link to="/log-ticket" className="hover:text-orange-500 transition-colors">Log a Ticket</Link></li>
              <li><Link to="/howitworks" className="hover:text-orange-500 transition-colors">How it Works</Link></li>
              <li><Link to="/system-status" className="hover:text-orange-500 transition-colors">Service Status</Link></li>
              <li><Link to="/roadmap" className="hover:text-orange-500 transition-colors">Roadmap & Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/members" className="hover:text-orange-500 transition-colors">Members</Link></li>
              <li><Link to="/browse-lists" className="hover:text-orange-500 transition-colors">Lists</Link></li>
              <li><Link to="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
              <li><a href="https://discord.gg/J8WkTpKc" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Discord</a></li>
              <li><a href="https://www.tiktok.com/@popguideuk" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">TikTok</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Retailers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/directory" className="hover:text-orange-500 transition-colors">Browse Retailers</Link></li>
              <li><Link to="/retailers/become" className="hover:text-orange-500 transition-colors">Add your business</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024-2025 PopGuide. All rights reserved.</p>
            <p className="text-sm mt-2 text-gray-500">Version 1.3.0 • Released June 12th, 2025</p>
            <div className="mt-4 flex justify-center">
              <img src="https://api.checklyhq.com/v1/badges/checks/e94c9b1a-d3da-4b89-b8d8-2606014dad8d?style=for-the-badge&theme=light" alt="Uptime monitored by Checkly" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-6">
          <span className="text-xs text-gray-400">Support PopGuide:</span>
          <a href="https://www.buymeacoffee.com/thepopguide" target="_blank" rel="noopener noreferrer">
            <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thepopguide&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" className="h-8" />
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-400">
          <Link to="/privacy" className="hover:text-orange-500">Privacy</Link>
          <span>|</span>
          <Link to="/legal" className="hover:text-orange-500">Terms</Link>
          <span>|</span>
          <Link to="/cookie-policy" className="hover:text-orange-500">Cookie Policy</Link>
        </div>
        <div className="flex justify-center gap-6 mt-6">
          <a href="https://www.facebook.com/profile.php?id=61574031106533" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="https://discord.gg/J8WkTpKc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Discord">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276c-.598.3428-1.2205.6447-1.8733.8923a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@popguideuk" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <FaTiktok className="w-5 h-5" color="white" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 