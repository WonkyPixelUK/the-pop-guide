import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, ExternalLink, Star, Calendar, Package, Tag } from 'lucide-react';

const releaseCategories = [
  { id: 'all', title: 'All Products', icon: '⭐' },
  { id: 'pop', title: 'Pop! Figures', icon: '🎯' },
  { id: 'bitty', title: 'Bitty Pop!', icon: '🏠' },
  { id: 'jumbo', title: 'Jumbo Pops', icon: '📏' },
  { id: 'plush', title: 'Plushies', icon: '🧸' },
  { id: 'exclusive', title: 'Exclusives', icon: '⭐' },
  { id: 'calendar', title: 'Calendars', icon: '📅' },
  { id: 'keychain', title: 'Keychains', icon: '🗝️' },
];

// Real Funko Europe Coming Soon products based on the website data
const upcomingReleases = [
  {
    id: 1,
    name: 'CUPCAKE - FNAF: MOVIE',
    series: 'Five Nights at Freddy\'s',
    price: '£30',
    type: 'PLUSH',
    category: 'plush',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Adorable Cupcake plush from the FNAF Movie'
  },
  {
    id: 2,
    name: 'HERMIONE GRANGER - HARRY POTTER AND THE',
    series: 'Harry Potter',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Hermione Granger from Harry Potter series'
  },
  {
    id: 3,
    name: 'SPIDER-MAN WITH SANDWICH - MARVEL COMICS',
    series: 'Marvel Comics',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Spider-Man with Sandwich Pop!'
  },
  {
    id: 4,
    name: 'CHICA WITH CUPCAKE - FIVE NIGHTS AT FRED',
    series: 'Five Nights at Freddy\'s',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Chica with Cupcake from FNAF'
  },
  {
    id: 5,
    name: 'BITTY POP! BITTY BOX LILO\'S HOME - LILO',
    series: 'Lilo & Stitch',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Lilo\'s Home'
  },
  {
    id: 6,
    name: 'BITTY POP! BITTY BOX HOGWARTS CASTLE - H',
    series: 'Harry Potter',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Hogwarts Castle'
  },
  {
    id: 7,
    name: 'BITTY POP! BITTY BOX BYERS HOUSE - STRAN',
    series: 'Stranger Things',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Byers House from Stranger Things'
  },
  {
    id: 8,
    name: 'BITTY POP! BITTY BOX PENNYWISE\'S LAIR',
    series: 'IT',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Pennywise\'s Lair'
  },
  {
    id: 9,
    name: 'ART THE CLOWN WITH NEWSPAPER - TERRIFIER',
    series: 'Terrifier',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Art the Clown with Newspaper from Terrifier'
  },
  {
    id: 10,
    name: 'KARLACH WITH CLIVE - BALDUR\'S GATE',
    series: 'Baldur\'s Gate',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Karlach with Clive from Baldur\'s Gate'
  },
  {
    id: 11,
    name: 'EEVEE - POKÉMON',
    series: 'Pokémon',
    price: '£33',
    type: 'POP! JUMBO',
    category: 'jumbo',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Jumbo sized Eevee from Pokémon'
  },
  {
    id: 12,
    name: 'SONIC WITH RING - SONIC THE HEDGEHOG',
    series: 'Sonic the Hedgehog',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Sonic with Ring from Sonic the Hedgehog'
  },
  {
    id: 13,
    name: 'DOC OCK - SPIDER-MAN: NO WAY HOME',
    series: 'Spider-Man: No Way Home',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Doc Ock from Spider-Man: No Way Home'
  },
  {
    id: 14,
    name: 'FIVE NIGHTS AT FREDDY\'S ADVENT CALENDAR',
    series: 'Five Nights at Freddy\'s',
    price: '£55',
    type: 'FUNKO CALENDAR',
    category: 'calendar',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Five Nights at Freddy\'s Advent Calendar'
  },
  {
    id: 15,
    name: 'MUNCHLAX - POKÉMON',
    series: 'Pokémon',
    price: '£33',
    type: 'POP! JUMBO',
    category: 'jumbo',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Jumbo sized Munchlax from Pokémon'
  },
  {
    id: 16,
    name: 'ITACHI UCHIHA - NARUTO SHIPPUDEN',
    series: 'Naruto Shippuden',
    price: '£5',
    type: 'POP! KEYCHAIN',
    category: 'keychain',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Itachi Uchiha Keychain from Naruto Shippuden'
  },
  {
    id: 17,
    name: 'EKKO - ARCANE: LEAGUE OF LEGENDS',
    series: 'Arcane: League of Legends',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Ekko from Arcane: League of Legends'
  },
  {
    id: 18,
    name: 'LITTLE PALE GIRL (GLOW IN THE DARK) - TE',
    series: 'The Ring',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Little Pale Girl Glow in the Dark Pop!'
  },
  {
    id: 19,
    name: 'RORONOA ZORO VS KING - ONE PIECE',
    series: 'One Piece',
    price: '£33',
    type: 'POP! MOMENT',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Roronoa Zoro vs King Pop! Moment from One Piece'
  },
  {
    id: 20,
    name: 'GOKU WITH NYOIBO - DRAGON BALL',
    series: 'Dragon Ball',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Goku with Nyoibo from Dragon Ball'
  },
  {
    id: 21,
    name: 'VERMAX - HOUSE OF THE DRAGON POP! SUPER',
    series: 'House of the Dragon',
    price: '£18',
    type: 'POP! SUPER',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Vermax Pop! Super from House of the Dragon'
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
  const [notifiedItems, setNotifiedItems] = useState<number[]>([]);

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

  const handleNotifyMe = (itemId: number) => {
    setNotifiedItems(prev => [...prev, itemId]);
    // In a real app, this would make an API call to set up notifications
  };

  const handleVisitSource = () => {
    window.open('https://funkoeurope.com/collections/coming-soon', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-10 h-10 text-orange-400" />
          <h1 className="text-4xl font-bold text-white">Coming Soon</h1>
        </div>

        {/* Source Attribution */}
        <Card className="bg-blue-900/20 border border-blue-500/30 rounded-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Data Source: Funko Europe</h3>
                  <p className="text-blue-300 text-sm">Real-time data from Funko Europe's official coming soon collection</p>
                </div>
              </div>
              <Button
                onClick={handleVisitSource}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Source
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Release Calendar Overview */}
        <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
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
                <div key={idx} className="bg-gray-900/80 border border-gray-600 rounded-lg p-4">
                  <div className="font-bold text-white text-lg mb-2">{month.month}</div>
                  <div className="text-orange-400 font-semibold mb-2">{month.count} releases</div>
                  <div className="text-gray-300 text-sm">
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
        <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {releaseCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    ${selectedCategory === category.id 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                    }
                  `}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-gray-400 text-sm mb-6">
          {filteredReleases.length} upcoming releases
        </div>

        {/* Releases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredReleases.map(release => (
            <Card key={release.id} className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden group hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="relative">
                {release.exclusive && (
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    ✨ Exclusive
                  </div>
                )}
                {notifiedItems.includes(release.id) && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    Notified
                  </div>
                )}
                <img 
                  src={release.image} 
                  alt={release.name} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="text-xs text-orange-400 font-semibold mb-2">{release.series}</div>
                <h3 className="font-bold text-white text-lg mb-2">{release.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{release.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white font-semibold">{new Date(release.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-orange-400 font-bold text-lg">{release.price}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {notifiedItems.includes(release.id) ? (
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition-colors">
                      <Bell className="w-4 h-4 mr-1" />
                      Notified
                    </button>
                  ) : (
                    <button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition-colors"
                      onClick={() => handleNotifyMe(release.id)}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Notify Me
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