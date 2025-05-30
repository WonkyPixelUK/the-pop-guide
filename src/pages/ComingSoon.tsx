import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

const releaseCategories = [
  { id: 'all', title: 'All Releases', icon: '⭐' },
  { id: 'this-month', title: 'This Month', icon: '📅' },
  { id: 'next-month', title: 'Next Month', icon: '⏭️' },
  { id: 'convention', title: 'Convention Exclusives', icon: '🎪' },
  { id: 'movie-tv', title: 'Movie & TV', icon: '🎬' },
  { id: 'anime', title: 'Anime & Manga', icon: '🈯' },
  { id: 'games', title: 'Games', icon: '🎮' },
];

const upcomingReleases = [
  {
    id: 1,
    title: 'Deadpool & Wolverine Movie Collection',
    description: 'Complete set featuring all variants from the latest MCU film',
    releaseDate: '2024-12-15',
    preOrderDate: '2024-11-01',
    price: '£12.99',
    retailer: 'Funko Europe',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    category: 'movie-tv',
    limited: true,
    preOrderAvailable: true
  },
  {
    id: 2,
    title: 'SDCC 2025 Preview Wave',
    description: 'First look at next year\'s San Diego Comic-Con exclusives',
    releaseDate: '2025-07-20',
    preOrderDate: '2025-06-01',
    price: 'TBA',
    retailer: 'SDCC Exclusive',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    category: 'convention',
    limited: true,
    preOrderAvailable: false
  },
  {
    id: 3,
    title: 'Demon Slayer Season 4 Collection',
    description: 'Hashira Training Arc figures with special effects',
    releaseDate: '2024-12-28',
    preOrderDate: '2024-11-15',
    price: '£14.99',
    retailer: 'Crunchyroll Store',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    category: 'anime',
    limited: false,
    preOrderAvailable: true
  },
  {
    id: 4,
    title: 'Baldur\'s Gate 3 Companion Set',
    description: 'All main companions with exclusive variants',
    releaseDate: '2025-01-10',
    preOrderDate: '2024-12-01',
    price: '£13.99',
    retailer: 'Larian Studios',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    category: 'games',
    limited: true,
    preOrderAvailable: false
  },
  {
    id: 5,
    title: 'Marvel Phase 5 Wave 2',
    description: 'Featuring characters from upcoming Disney+ shows',
    releaseDate: '2025-02-14',
    preOrderDate: '2025-01-01',
    price: '£12.99',
    retailer: 'Entertainment Earth',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    category: 'movie-tv',
    limited: false,
    preOrderAvailable: false
  },
  {
    id: 6,
    title: 'Pokemon 25th Anniversary Specials',
    description: 'Oversized and metallic variants of classic Pokemon',
    releaseDate: '2024-12-31',
    preOrderDate: '2024-11-20',
    price: '£19.99',
    retailer: 'Pokemon Center',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    category: 'games',
    limited: true,
    preOrderAvailable: true
  }
];

const releaseCalendar = [
  { month: 'November 2024', count: 23, highlights: ['Marvel Wave 3', 'Star Wars Mandalorian', 'Disney Villains'] },
  { month: 'December 2024', count: 31, highlights: ['Deadpool Movie Set', 'Holiday Exclusives', 'Anime Wave 2'] },
  { month: 'January 2025', count: 18, highlights: ['Gaming Collection', 'Winter Con Exclusives', 'Retro Wave'] },
  { month: 'February 2025', count: 25, highlights: ['Valentine Specials', 'Marvel Phase 5', 'Cartoon Classics'] }
];

const conventionSchedule = [
  { 
    event: 'London Comic Con Winter', 
    date: '2024-11-30', 
    exclusives: ['Exclusive Doctor Who', 'UK Sherlock Holmes', 'Wallace & Gromit'],
    status: 'Confirmed'
  },
  { 
    event: 'NYCC 2025', 
    date: '2025-10-09', 
    exclusives: ['Marvel Previews', 'DC Universe', 'Anime Specials'],
    status: 'Planned'
  },
  { 
    event: 'SDCC 2025', 
    date: '2025-07-24', 
    exclusives: ['Movie Tie-ins', 'TV Show Exclusives', 'Artist Series'],
    status: 'Planned'
  }
];

export default function ComingSoon() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or calendar

  const filteredReleases = upcomingReleases.filter(release => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'this-month') {
      const releaseMonth = new Date(release.releaseDate).getMonth();
      const currentMonth = new Date().getMonth();
      return releaseMonth === currentMonth;
    }
    if (selectedCategory === 'next-month') {
      const releaseMonth = new Date(release.releaseDate).getMonth();
      const nextMonth = (new Date().getMonth() + 1) % 12;
      return releaseMonth === nextMonth;
    }
    return release.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-4xl font-bold text-white">Coming Soon</h1>
        </div>

        {/* Release Calendar Overview */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h2 className="text-xl font-bold text-white">📅 Release Calendar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {releaseCalendar.map((month, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                  <div className="font-bold text-white text-lg mb-2">{month.month}</div>
                  <div className="text-orange-400 font-semibold mb-2">{month.count} releases</div>
                  <div className="text-gray-400 text-sm">
                    {month.highlights.map((highlight, i) => (
                      <div key={i} className="mb-1">• {highlight}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded transition ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button
              className={`px-4 py-2 rounded transition ${
                viewMode === 'calendar' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {releaseCategories.map(category => (
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

        {/* Results Count */}
        <div className="text-gray-400 text-sm mb-6">
          {filteredReleases.length} upcoming releases
        </div>

        {/* Releases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredReleases.map(release => (
            <Card key={release.id} className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden group hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="relative">
                {release.limited && (
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    ✨ Limited
                  </div>
                )}
                {release.preOrderAvailable && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    Pre-Order
                  </div>
                )}
                <img 
                  src={release.image} 
                  alt={release.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="text-xs text-orange-400 font-semibold mb-2">{release.retailer}</div>
                <h3 className="font-bold text-white text-lg mb-2">{release.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{release.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white font-semibold">{new Date(release.releaseDate).toLocaleDateString()}</span>
                  </div>
                  {release.preOrderAvailable && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Pre-Order:</span>
                      <span className="text-green-400 font-semibold">{new Date(release.preOrderDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-orange-400 font-bold text-lg">{release.price}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {release.preOrderAvailable ? (
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition-colors">
                      Pre-Order Now
                    </button>
                  ) : (
                    <button className="flex-1 bg-gray-600 text-gray-300 font-bold py-2 rounded cursor-not-allowed">
                      Coming Soon
                    </button>
                  )}
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded transition-colors">
                    🔔
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Convention Schedule */}
        <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
                <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Convention Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {conventionSchedule.map((con, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-white text-lg">{con.event}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      con.status === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                      {con.status}
                    </span>
                  </div>
                  <div className="text-orange-400 font-semibold mb-3">{new Date(con.date).toLocaleDateString()}</div>
                  <div className="text-gray-400 text-sm">
                    <div className="font-semibold mb-1">Expected Exclusives:</div>
                    {con.exclusives.map((exclusive, i) => (
                      <div key={i} className="mb-1">• {exclusive}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Signup */}
        <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Release!</h3>
            <p className="text-gray-400 mb-6">Get notified about pre-orders, release dates, and exclusive drops</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded transition-colors">
                🔔 Enable Release Alerts
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded transition-colors">
                📧 Email Notifications
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded transition-colors">
                📱 Push Notifications
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 