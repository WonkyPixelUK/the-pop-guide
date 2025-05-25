import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Android = () => (
  <>
    <SEO title="Android App | The Pop Guide" description="How to install The Pop Guide on Android." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4 max-w-2xl">
        <div className="text-center mb-10">
          <Smartphone className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Android App</h1>
          <p className="text-gray-300 mb-6">Install The Pop Guide on your Android device for a native-like experience. No Play Store download required!</p>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">How to Install</h2>
          <ol className="list-decimal pl-6 text-gray-200 space-y-2">
            <li>Open <span className="text-orange-400">popguide.co.uk</span> in Chrome on your Android device.</li>
            <li>Tap the menu (⋮) in the top right corner.</li>
            <li>Select <span className="font-semibold">Install App</span>.</li>
            <li>Follow the prompts to add to your home screen.</li>
          </ol>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">App Features</h2>
          <ul className="list-disc pl-6 text-gray-200 space-y-2">
            <li>Full-featured collection management</li>
            <li>Real-time price tracking</li>
            <li>Offline support</li>
            <li>Push notifications (coming soon)</li>
            <li>Native-like performance and experience</li>
          </ul>
        </div>
        <div className="text-center">
          <a href="#" className="inline-block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3" disabled>
              Play Store (Coming Soon)
            </Button>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  </>
);

export default Android; 