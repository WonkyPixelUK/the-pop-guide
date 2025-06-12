import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function StatusGroupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 pt-8 pb-4">
        <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
          <a href="/" className="hover:text-orange-400 font-semibold transition-colors">Home</a>
          <span className="mx-1 text-orange-400">/</span>
          <a href="/database" className="text-orange-400 font-bold tracking-wide uppercase hover:underline">Database</a>
          <span className="mx-1 text-orange-400">/</span>
          <span className="text-orange-400 font-bold tracking-wide uppercase">Status</span>
        </nav>
        <div className="mb-6 text-left">
          <h1 className="text-4xl font-bold mb-2">Browse by Status</h1>
          <p className="text-lg text-gray-200 max-w-2xl mb-2">Filter Funko Pops by availability, release status, and more. Select a status below to see all related Pops.</p>
        </div>
        {/* TODO: Render status filter cards here */}
        <div className="text-gray-400">Status filter cards coming soon.</div>
      </div>
      <Footer />
    </div>
  );
} 