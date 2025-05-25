import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4 mt-12">
    <div className="container mx-auto">
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
            <li><a href="#" className="hover:text-orange-500 transition-colors">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/help" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Community</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/about" className="hover:text-orange-500 transition-colors">About</Link></li>
            <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 PopGuide. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer; 