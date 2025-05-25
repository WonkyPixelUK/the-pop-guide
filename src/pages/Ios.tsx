import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Smartphone } from 'lucide-react';

const Ios = () => (
  <>
    <SEO title="iOS & iPad App | The Pop Guide" description="Native iOS/iPad app coming soon." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4 max-w-2xl">
        <div className="text-center mb-10">
          <Smartphone className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Native iOS & iPad App</h1>
          <p className="text-gray-300 mb-6">A true native iOS/iPad app is coming soon. Stay tuned for updates!</p>
        </div>
      </div>
      <Footer />
    </div>
  </>
);

export default Ios; 