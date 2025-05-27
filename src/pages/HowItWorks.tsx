import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const HowItWorks = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
    <Navigation />
    <div className="container mx-auto px-4 py-12 flex-1">
      <h1 className="text-4xl font-bold mb-8">How It Works</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Value Calculation</h2>
        <p className="text-gray-300">We calculate the value of each Funko Pop using real-time and historical sales data from multiple sources. Our algorithm considers recent sales, average prices, and market trends to provide a fair estimate. Outliers and suspicious sales are filtered out for accuracy.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Data Sources</h2>
        <p className="text-gray-300">We scrape and aggregate data from eBay, Pop Price Guide, HobbyDB, Whatnot, and other trusted collector marketplaces. We do not use unofficial or unreliable sources. Our goal is to reflect the real collector market as closely as possible.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Scraping Process</h2>
        <p className="text-gray-300">Our automated tools regularly scan supported sites for new sales, listings, and price changes. We use a mix of APIs, web scraping, and manual review to ensure data quality. All scraping is done in compliance with site terms and with respect for privacy and fair use.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Update Frequency</h2>
        <p className="text-gray-300">Values and listings are updated several times per day. Some sources update in near real-time, while others are refreshed every few hours. We aim to keep all data as current as possible for our users.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Transparency</h2>
        <p className="text-gray-300">We believe in transparency. You can always see the sources and recent sales behind each value. If you have questions or spot an error, contact support and we'll investigate promptly.</p>
      </section>
    </div>
    <Footer />
  </div>
);

export default HowItWorks; 