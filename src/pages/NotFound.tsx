import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

const NotFound = () => (
  <>
    <SEO title="404 Not Found | The Pop Guide" description="Page not found." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation className="hidden md:block" />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <img
          src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
          alt="PopGuide Logo"
          className="h-20 w-auto mb-8"
        />
        <h1 className="text-5xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">Page Not Found</h2>
        <p className="text-gray-300 mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.<br />
          If you think this is a mistake, please contact support.
        </p>
        <Link to="/" className="inline-block">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold transition">
            Go to Homepage
          </button>
        </Link>
      </div>
      <Footer />
    </div>
    <MobileBottomNav />
  </>
);

export default NotFound;
