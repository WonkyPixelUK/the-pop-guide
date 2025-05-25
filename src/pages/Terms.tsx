import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Terms = () => (
  <>
    <SEO title="Terms of Service | The Pop Guide" description="Read our terms of service." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-gray-300 mb-8">These are placeholder terms of service. By using PopGuide, you agree to our terms. Full terms coming soon.</p>
      </div>
      <Footer />
    </div>
  </>
);

export default Terms; 