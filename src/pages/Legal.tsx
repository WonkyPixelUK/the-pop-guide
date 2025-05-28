import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Legal = () => (
  <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <div className="flex-1 container mx-auto py-16 px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-6">Legal</h1>
        <p className="text-gray-300 mb-8">Legal information and terms will be published here soon.</p>
      </div>
      <Footer />
    </div>
  </>
);

export default Legal; 