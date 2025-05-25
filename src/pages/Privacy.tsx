import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Privacy = () => (
  <>
    <SEO title="Privacy Policy | The Pop Guide" description="Read our privacy policy." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-300 mb-8">(Privacy policy content goes here...)</p>
      </div>
      <Footer />
    </div>
  </>
);

export default Privacy; 