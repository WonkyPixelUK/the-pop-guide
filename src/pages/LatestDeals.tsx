import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

const dealCategories = [
  { id: 'all', title: 'All Deals', icon: '🏷️' },
  { id: 'flash', title: 'Flash Sales', icon: '⚡' },
  { id: 'price-drops', title: 'Price Drops', icon: '📉' },
  { id: 'bundle-deals', title: 'Bundle Deals', icon: '📦' },
  { id: 'clearance', title: 'Clearance', icon: '🔥' },
  { id: 'pre-order', title: 'Pre-Order Discounts', icon: '⭐' },
];

const featuredDeals = [
  {
    id: 1,
    title: 'SDCC 2024 Exclusive Bundle',
    description: '5 SDCC exclusives for the price of 4',
    originalPrice: '£150.00',
    salePrice: '£120.00',
    discount: '20%',
    retailer: 'Pop in a Box',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    expires: '2024-12-31',
    category: 'bundle-deals',
    popular: true
  },
  {
    id: 2,
    title: 'Marvel Multiverse Collection',
    description: 'Spider-Verse Pops with exclusive variants',
    originalPrice: '£89.99',
    salePrice: '£69.99',
    discount: '22%',
    retailer: 'Forbidden Planet',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    expires: '2024-12-25',
    category: 'flash',
    popular: false
  },
  {
    id: 3,
    title: 'Harry Potter House Sets',
    description: 'Complete Hogwarts house collections',
    originalPrice: '£199.99',
    salePrice: '£149.99',
    discount: '25%',
    retailer: 'Entertainment Earth',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    expires: '2024-12-30',
    category: 'bundle-deals',
    popular: true
  },
  {
    id: 4,
    title: 'Disney 100th Anniversary',
    description: 'Limited edition Disney centennial Pops',
    originalPrice: '£45.00',
    salePrice: '£32.99',
    discount: '27%',
    retailer: 'Hot Topic',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
    expires: '2024-12-28',
    category: 'clearance',
    popular: false
  },
  {
    id: 5,
    title: 'Anime Convention Exclusives',
    description: 'Dragon Ball Z and Naruto rare finds',
    originalPrice: '£75.00',
    salePrice: '£55.00',
    discount: '27%',
    retailer: 'BigBadToyStore',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    expires: '2024-12-29',
    category: 'price-drops',
    popular: true
  },
  {
    id: 6,
    title: 'Pre-Order: Marvel Phase 5',
    description: 'Get 15% off upcoming Marvel releases',
    originalPrice: '£12.99',
    salePrice: '£10.99',
    discount: '15%',
    retailer: 'SWAU',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    expires: '2025-01-15',
    category: 'pre-order',
    popular: false
  }
];

const priceAlerts = [
  { pop: 'SDCC Luna Lovegood', was: '£420', now: '£380', savings: '£40' },
  { pop: 'GITD Martian Manhunter', was: '£180', now: '£155', savings: '£25' },
  { pop: 'Metallic Iron Man', was: '£95', now: '£79', savings: '£16' },
  { pop: 'Chase Eleven', was: '£65', now: '£52', savings: '£13' }
];

export default function LatestDeals() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');

  const filteredDeals = featuredDeals.filter(deal => 
    selectedCategory === 'all' || deal.category === selectedCategory
  );

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'discount') return parseInt(b.discount) - parseInt(a.discount);
    if (sortBy === 'price-low') return parseFloat(a.salePrice.replace('£', '')) - parseFloat(b.salePrice.replace('£', ''));
    if (sortBy === 'price-high') return parseFloat(b.salePrice.replace('£', '')) - parseFloat(a.salePrice.replace('£', ''));
    if (sortBy === 'expires') return new Date(a.expires).getTime() - new Date(b.expires).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.28.6 4.18 1.77 4.18 3.84 0 1.91-1.71 2.95-3.12 3.18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-4xl font-bold text-white">Latest Deals</h1>
        </div>

        {/* Price Alerts Banner */}
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-orange-400 animate-pulse" fill="none" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h2 className="text-xl font-bold text-white">🔔 Price Drop Alerts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {priceAlerts.map((alert, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
                  <div className="font-semibold text-white text-sm">{alert.pop}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 line-through text-xs">{alert.was}</span>
                    <span className="text-green-400 font-bold text-sm">{alert.now}</span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">-{alert.savings}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {dealCategories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full font-semibold transition border ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-800/70 text-gray-300 border-gray-600 hover:bg-orange-500/20 hover:border-orange-400'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400 text-sm">
            {sortedDeals.length} deals found
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-orange-400 focus:outline-none"
          >
            <option value="discount">Highest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="expires">Expires Soon</option>
          </select>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedDeals.map(deal => (
            <Card key={deal.id} className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden group hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="relative">
                {deal.popular && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    🔥 Popular
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold z-10">
                  -{deal.discount}
                </div>
                <img 
                  src={deal.image} 
                  alt={deal.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="text-xs text-orange-400 font-semibold mb-2">{deal.retailer}</div>
                <h3 className="font-bold text-white text-lg mb-2">{deal.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{deal.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400 line-through text-sm">{deal.originalPrice}</span>
                  <span className="text-green-400 font-bold text-xl">{deal.salePrice}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-gray-400">
                    Expires: {new Date(deal.expires).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-orange-400">
                    Save {(parseFloat(deal.originalPrice.replace('£', '')) - parseFloat(deal.salePrice.replace('£', ''))).toFixed(2)}
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition-colors">
                  View Deal
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deal Submission Section */}
        <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Found a Great Deal?</h3>
            <p className="text-gray-400 mb-6">Help the community by sharing deals you've discovered!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded transition-colors">
                Submit a Deal
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded transition-colors">
                Join Deal Alerts
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 