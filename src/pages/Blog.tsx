import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Blog = () => (
  <>
    <SEO title="Blog | The Pop Guide" description="Read the latest news and updates from The Pop Guide." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-white mb-6">Blog</h1>
        <p className="text-gray-300 mb-8">No blog posts yet. Check back soon for updates!</p>
      </div>
      <Footer />
    </div>
  </>
);

export default Blog; 