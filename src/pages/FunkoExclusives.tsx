import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Star, Crown, Sparkles, Flame, Award, Zap, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const exclusiveCategories = [
  { id: 'all', title: 'All Exclusives', icon: '⭐', color: 'purple' },
  { id: 'web', title: 'Web Exclusives', icon: '🌐', color: 'blue' },
  { id: 'convention', title: 'Convention Exclusives', icon: '🎪', color: 'red' },
  { id: 'chase', title: 'Chase Variants', icon: '🏃', color: 'orange' },
  { id: 'limited', title: 'Limited Edition', icon: '💎', color: 'green' },
  { id: 'glow', title: 'Glow in the Dark', icon: '💡', color: 'yellow' },
  { id: 'metallic', title: 'Metallic', icon: '✨', color: 'gray' },
  { id: 'flocked', title: 'Flocked', icon: '🧸', color: 'pink' },
  { id: 'chrome', title: 'Chrome', icon: '🪞', color: 'indigo' }
];

const statusFilters = [
  { id: 'all', title: 'All', icon: '📦', description: 'All items' },
  { id: 'coming-soon', title: 'Coming Soon', icon: '🚀', description: 'Items releasing soon' },
  { id: 'new-releases', title: 'New Releases', icon: '✨', description: 'Recently released items' },
  { id: 'funko-exclusive', title: 'Funko Exclusive', icon: '👑', description: 'Funko official exclusives' },
  { id: 'pre-order', title: 'Pre-Order', icon: '📅', description: 'Available for pre-order' },
  { id: 'in-stock', title: 'In Stock', icon: '✅', description: 'Currently available' },
  { id: 'sold-out', title: 'Sold Out', icon: '❌', description: 'No longer available' }
];

const rarityLevels = [
  { id: 'ultra-rare', title: 'Ultra Rare', color: 'bg-red-500', textColor: 'text-red-100', percentage: '< 1%' },
  { id: 'very-rare', title: 'Very Rare', color: 'bg-orange-500', textColor: 'text-orange-100', percentage: '1-5%' },
  { id: 'rare', title: 'Rare', color: 'bg-yellow-500', textColor: 'text-yellow-900', percentage: '5-15%' },
  { id: 'limited', title: 'Limited', color: 'bg-blue-500', textColor: 'text-blue-100', percentage: '15-30%' }
];

// Real Funko Europe Exclusive products
const exclusiveProducts = [
  {
    id: 1,
    name: 'SPIDER-MAN (SYMBIOTE SUIT) - MARVEL',
    series: 'Marvel',
    price: '£16',
    originalPrice: '£13',
    type: 'POP!',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'very-rare',
    exclusive: 'Funko Europe Exclusive',
    features: ['Glow in Dark', 'Metallic'],
    description: 'Exclusive Spider-Man in Symbiote Suit with glow-in-the-dark and metallic finish',
    releaseDate: '2024-03-15',
    stock: 'Low Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 2,
    name: 'BATMAN (DARK KNIGHT) - DC COMICS',
    series: 'DC Comics',
    price: '£18',
    originalPrice: '£15',
    type: 'POP!',
    category: 'convention',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'ultra-rare',
    exclusive: 'NYCC 2024 Exclusive',
    features: ['Chrome Finish'],
    description: 'New York Comic Con exclusive Dark Knight Batman with chrome finish',
    releaseDate: '2024-10-10',
    stock: 'Sold Out',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 3,
    name: 'IRON MAN (MARK 85) - AVENGERS',
    series: 'Marvel',
    price: '£22',
    originalPrice: '£18',
    type: 'POP!',
    category: 'limited',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'rare',
    exclusive: 'Limited Edition 2500 Pieces',
    features: ['Metallic', 'Light-Up'],
    description: 'Limited edition Iron Man Mark 85 with metallic finish and light-up arc reactor',
    releaseDate: '2024-05-01',
    stock: 'In Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 4,
    name: 'PIKACHU (FLOCKED) - POKÉMON',
    series: 'Pokémon',
    price: '£20',
    originalPrice: '£16',
    type: 'POP!',
    category: 'flocked',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    rarity: 'very-rare',
    exclusive: 'Pokémon Center Exclusive',
    features: ['Flocked Texture'],
    description: 'Ultra-soft flocked Pikachu exclusive to Pokémon Center',
    releaseDate: '2024-07-20',
    stock: 'Pre-Order',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 5,
    name: 'STITCH (GLOW) - LILO & STITCH',
    series: 'Disney',
    price: '£17',
    originalPrice: '£13',
    type: 'POP!',
    category: 'glow',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    rarity: 'rare',
    exclusive: 'Disney Store Exclusive',
    features: ['Glow in Dark'],
    description: 'Disney Store exclusive Stitch with glow-in-the-dark blue fur',
    releaseDate: '2024-06-15',
    stock: 'In Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 6,
    name: 'DEADPOOL (CHROME) - X-MEN',
    series: 'Marvel',
    price: '£25',
    originalPrice: '£20',
    type: 'POP!',
    category: 'chrome',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'ultra-rare',
    exclusive: 'SDCC 2024 Exclusive',
    features: ['Chrome Finish', 'Holographic'],
    description: 'San Diego Comic Con exclusive chrome Deadpool with holographic details',
    releaseDate: '2024-07-25',
    stock: 'Sold Out',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 7,
    name: 'NARUTO (CHASE) - NARUTO SHIPPUDEN',
    series: 'Anime',
    price: '£45',
    originalPrice: '£13',
    type: 'POP!',
    category: 'chase',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rarity: 'ultra-rare',
    exclusive: 'Chase Variant 1:6 Ratio',
    features: ['Translucent', 'Glow Effects'],
    description: 'Ultra-rare chase variant Naruto with translucent nine-tails chakra',
    releaseDate: '2024-04-10',
    stock: 'Extremely Rare',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 8,
    name: 'GOKU (METALLIC) - DRAGON BALL Z',
    series: 'Anime',
    price: '£19',
    originalPrice: '£15',
    type: 'POP!',
    category: 'metallic',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rarity: 'rare',
    exclusive: 'GameStop Exclusive',
    features: ['Metallic Finish'],
    description: 'GameStop exclusive Super Saiyan Goku with stunning metallic hair',
    releaseDate: '2024-08-05',
    stock: 'Low Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 9,
    name: 'MANDALORIAN (BESKAR) - STAR WARS',
    series: 'Star Wars',
    price: '£24',
    originalPrice: '£18',
    type: 'POP!',
    category: 'limited',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    rarity: 'very-rare',
    exclusive: 'Disney+ Exclusive',
    features: ['Metallic Beskar Armor'],
    description: 'Disney+ exclusive Mandalorian with authentic metallic Beskar armor finish',
    releaseDate: '2024-05-04',
    stock: 'In Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 10,
    name: 'ELEVEN (UPSIDE DOWN) - STRANGER THINGS',
    series: 'Netflix',
    price: '£21',
    originalPrice: '£16',
    type: 'POP!',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    rarity: 'rare',
    exclusive: 'Netflix Store Exclusive',
    features: ['Glow in Dark', 'Floating Effect'],
    description: 'Netflix exclusive Eleven with Upside Down glow effects and floating pose',
    releaseDate: '2024-10-31',
    stock: 'Pre-Order',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 11,
    name: 'GROOT (FLOCKED) - GUARDIANS OF GALAXY',
    series: 'Marvel',
    price: '£18',
    originalPrice: '£14',
    type: 'POP!',
    category: 'flocked',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'rare',
    exclusive: 'Hot Topic Exclusive',
    features: ['Flocked Texture'],
    description: 'Hot Topic exclusive Baby Groot with ultra-soft flocked texture',
    releaseDate: '2024-09-15',
    stock: 'In Stock',
    url: 'https://funkoeurope.com/collections/exclusives'
  },
  {
    id: 12,
    name: 'VENOM (GLOW) - SPIDER-MAN',
    series: 'Marvel',
    price: '£19',
    originalPrice: '£15',
    type: 'POP!',
    category: 'glow',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    rarity: 'very-rare',
    exclusive: 'BoxLunch Exclusive',
    features: ['Glow in Dark', 'Translucent'],
    description: 'BoxLunch exclusive Venom with glow-in-the-dark symbiote effects',
    releaseDate: '2024-11-01',
    stock: 'Coming Soon',
    url: 'https://funkoeurope.com/collections/exclusives'
  }
];

const conventionHighlights = [
  {
    name: 'San Diego Comic-Con 2024',
    date: 'July 25-28, 2024',
    exclusives: 15,
    highlights: ['Chrome Deadpool', 'Metallic Wonder Woman', 'Glow Green Lantern']
  },
  {
    name: 'New York Comic Con 2024',
    date: 'October 10-13, 2024',
    exclusives: 12,
    highlights: ['Chrome Batman', 'Flocked Chewbacca', 'Metallic Iron Man']
  },
  {
    name: 'London Comic Con 2024',
    date: 'October 25-27, 2024',
    exclusives: 8,
    highlights: ['Glow Doctor Who', 'Metallic Sherlock', 'Chrome James Bond']
  }
];

// Filters matching the main database page EXACTLY
const STATIC_FILTERS = {
  status: ['All', 'Coming Soon', 'New Releases', 'Funko Exclusive', 'Pre-Order', 'In Stock', 'Sold Out'],
  category: [
    'Pop!', 'Bitty Pop!', 'Mini Figures', 'Vinyl Soda', 'Loungefly', 'REWIND', 'Pop! Pins', 'Toys and Plushies', 'Clothing', 'Funko Gear', 'Funko Games'
  ],
  fandom: [
    '8-Bit', 'Ad Icons', 'Air Force', 'Albums', 'Animation', 'Aquasox', 'Army', 'Around the World', 'Artists', 'Art Covers', 'Art Series', 'Asia', 'Bape', 'Basketball', 'Board Games', 'Books', 'Boxing', 'Broadway', 'Build a Bear', 'Candy', 'Christmas', 'Classics', 'College', 'Comedians', 'Comic Covers', 'Comics', 'Conan', 'Custom', 'Deluxe', 'Deluxe Moments', 'Die-Cast', 'Digital', 'Disney', 'Directors', 'Drag Queens', 'Fantastic Beasts', 'Fashion', 'Foodies', 'Football', 'Freddy Funko', 'Fantastik Plastik', 'Lance', 'Game of Thrones', 'Games', 'Game Covers', 'Golf', 'GPK', 'Halo', 'Harry Potter', 'Heroes', 'Hockey', 'Holidays', 'House of the Dragons', 'Icons', 'League of Legends', 'Magic: The Gathering', 'Marines', 'Marvel', 'Magazine Covers', 'Minis', 'MLB', 'Moments', 'Monsters', 'Movie Posters', 'Movies', 'Muppets', 'Myths', 'My Little Pony', 'NASCAR', 'Navy', 'NBA Mascots', 'NFL', 'Pets', 'Pusheen', 'Racing', 'Retro Toys', 'Rides', 'Rocks', 'Royals', 'Sanrio', 'Sci-Fi', 'Sesame Street', 'SNL', 'South Park', 'Special Edition', 'Sports', 'Sports Legends', 'Stan Lee', 'Star Wars', 'Television', 'Tennis', 'The Vote', 'Town', 'Town Christmas', 'Trading Cards', 'Trains', 'Trolls', 'UFC', 'Uglydoll', 'Valiant', 'Vans', 'VHS Covers', 'Wreck-It Ralph', 'Wrestling', 'WWE', 'WWE Covers', 'Zodiac'
  ],
  genre: [
    'Animation', 'Anime & Manga', '80s Flashback', 'Movies & TV', 'Horror', 'Music', 'Sports', 'Video Games', 'Retro Toys', 'Ad Icons'
  ],
  edition: [
    'New Releases', 'Exclusives', 'Convention Style', 'Character Cosplay', 'Rainbow Brights', 'Retro Rewind', 'Theme Park Favourites', 'Disney Princesses', 'All The Sparkles', 'Back in Stock', 'BLACK LIGHT', 'BRONZE', 'BTS X MINIONS', 'CHASE', 'CONVENTION', 'DIAMON COLLECTION', 'DIAMOND COLLECTION', 'EASTER', 'FACET COLLECTION', 'FLOCKED', 'GLITTER', 'GLOW IN THE DARK', 'HOLIDAY', 'HYPERSPACE HEROES', 'LIGHTS AND SOUND', 'MEME', 'METALLIC', 'PEARLESCENT', 'PRIDE', 'RETRO COMIC', 'RETRO SERIES', 'SCOOPS AHOY', 'SOFT COLOUR', "VALENTINE'S"
  ],
  vaulted: ['All', 'Vaulted', 'Available']
};

export default function FunkoExclusives() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], status: [], character: [], series: [], vaulted: 'All', year: ''
  });

  // Generate years and other filter options from exclusiveProducts data
  const years = Array.from(new Set(
    exclusiveProducts
      .map(product => product.releaseDate ? new Date(product.releaseDate).getFullYear() : null)
      .filter(Boolean)
  )).sort((a, b) => b - a);

  const FILTERS = {
    ...STATIC_FILTERS,
    character: Array.from(new Set(exclusiveProducts.map(product => product.name.split(' ')[0]).filter(Boolean))).sort(),
    series: Array.from(new Set(exclusiveProducts.map(product => product.series).filter(Boolean))).sort(),
  };

  const filteredProducts = exclusiveProducts.filter(product => {
    // Search functionality
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.exclusive.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category.length || filters.category.some(cat => {
      if (cat === 'Pop!') return product.type === 'POP!';
      return product.type.toLowerCase().includes(cat.toLowerCase());
    });
    
    // Series filter
    const matchesSeries = !filters.series.length || filters.series.includes(product.series);
    
    // Character filter 
    const matchesCharacter = !filters.character.length || filters.character.some(char => product.name.includes(char));
    
    // Status filter
    const matchesStatus = !filters.status.length || filters.status.some(status => {
      switch (status) {
        case 'All': return true;
        case 'Coming Soon': return product.stock === 'Coming Soon';
        case 'New Releases': {
          const releaseDate = new Date(product.releaseDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return releaseDate >= threeMonthsAgo && product.stock === 'In Stock';
        }
        case 'Funko Exclusive': return product.exclusive.toLowerCase().includes('funko');
        case 'Pre-Order': return product.stock === 'Pre-Order';
        case 'In Stock': return product.stock === 'In Stock';
        case 'Sold Out': return product.stock === 'Sold Out';
        default: return false;
      }
    });
    
    // Year filter
    const matchesYear = !filters.year || new Date(product.releaseDate).getFullYear().toString() === filters.year;
    
    // Legacy filters for backward compatibility with existing category buttons
    const legacyCategoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const legacyRarityMatch = selectedRarity === 'all' || product.rarity === selectedRarity;
    
    return matchesSearch && matchesCategory && matchesSeries && matchesCharacter && matchesStatus && matchesYear && legacyCategoryMatch && legacyRarityMatch;
  });

  const handleSaveItem = (itemId: number) => {
    setSavedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleVisitSource = () => {
    window.open('https://funkoeurope.com/collections/exclusives', '_blank');
  };

  // Collection Stats
  const totalExclusives = exclusiveProducts.length;
  const averagePrice = Math.round(exclusiveProducts.reduce((sum, product) => 
    sum + parseFloat(product.price.replace('£', '')), 0) / totalExclusives);
  const ultraRareCount = exclusiveProducts.filter(p => p.rarity === 'ultra-rare').length;
  const soldOutCount = exclusiveProducts.filter(p => p.stock === 'Sold Out').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Navigation />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">Home</Link>
          <span className="mx-1 text-orange-400">/</span>
          <Link to="/database" className="text-orange-400 font-bold tracking-wide uppercase hover:underline">Database</Link>
          <span className="mx-1 text-orange-400">/</span>
          <span className="text-orange-400 font-bold tracking-wide uppercase">Funko Exclusives</span>
        </nav>
        {/* Title & Description */}
        <div className="mb-6 text-left">
          <h1 className="text-4xl font-bold mb-2">Funko Exclusives</h1>
          <p className="text-lg text-gray-200 max-w-2xl mb-2">Browse all Funko Exclusive Pops. Find rare and limited edition items only available through special releases.</p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Input
            placeholder="Search exclusive items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 bg-gray-800 border-gray-700 text-white"
          />
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Showing {filteredProducts.length} results for "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row gap-8 pb-12 px-4 flex-1">
        {/* Filter Sidebar */}
        <aside className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-24 max-h-[80vh] overflow-y-auto min-w-[220px] w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Filters</h2>
          </div>
          <div className="mb-4 text-center">
            <a href="/sticker-guide" className="text-orange-400 underline text-sm">Need help understanding stickers?</a>
          </div>
          
          {Object.entries(FILTERS).map(([key, options]) => (
            key !== 'vaulted' ? (
              <div key={key} className="mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <Filter className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                    <div className="p-2">
                      <Input
                        placeholder={`Search ${key}...`}
                        className="mb-2"
                        onChange={e => setFilters(f => ({ ...f, [`${key}Search`]: e.target.value }))}
                        value={filters[`${key}Search`] || ''}
                      />
                    </div>
                    {options.filter(opt => !filters[`${key}Search`] || opt.toLowerCase().includes(filters[`${key}Search`].toLowerCase())).map(opt => (
                      <div key={opt} className="flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors hover:text-[#e46c1b] hover:bg-gray-800" onClick={() => {
                        setFilters(f => {
                          const arr = (Array.isArray(f[key]) ? f[key] : []).includes(opt) ? f[key].filter(x => x !== opt) : [...f[key], opt];
                          return { ...f, [key]: arr };
                        });
                      }}>
                        <input type="checkbox" checked={(Array.isArray(filters[key]) ? filters[key] : []).includes(opt)} readOnly className="mr-2 accent-[#232837] border-[#232837]" style={{ borderColor: '#232837' }} />
                        <span className="font-medium text-sm flex-1 truncate">{opt}</span>
                        <span className="text-gray-400 font-bold text-sm ml-2">
                          ({exclusiveProducts.filter(product => {
                            if (key === 'status') {
                              switch (opt) {
                                case 'All': return true;
                                case 'Coming Soon': return product.stock === 'Coming Soon';
                                case 'New Releases': {
                                  const releaseDate = new Date(product.releaseDate);
                                  const threeMonthsAgo = new Date();
                                  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                                  return releaseDate >= threeMonthsAgo && product.stock === 'In Stock';
                                }
                                case 'Funko Exclusive': return product.exclusive.toLowerCase().includes('funko');
                                case 'Pre-Order': return product.stock === 'Pre-Order';
                                case 'In Stock': return product.stock === 'In Stock';
                                case 'Sold Out': return product.stock === 'Sold Out';
                                default: return false;
                              }
                            }
                            if (key === 'category') {
                              if (opt === 'Pop!') return product.type === 'POP!';
                              return product.type.toLowerCase().includes(opt.toLowerCase());
                            }
                            if (key === 'series') return product.series === opt;
                            if (key === 'character') return product.name.includes(opt);
                            return false;
                          }).length})
                        </span>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null
          ))}
          
          {/* Vaulted filter */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 font-semibold mb-2 uppercase">Vaulted</div>
            <div className="flex gap-2">
              {FILTERS.vaulted.map(opt => (
                <Button
                  key={opt}
                  size="sm"
                  variant={filters.vaulted === opt ? 'default' : 'outline'}
                  className={filters.vaulted === opt ? 'bg-orange-500 text-white' : ''}
                  onClick={() => setFilters(f => ({ ...f, vaulted: opt }))}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Release year filter */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 font-semibold mb-2 uppercase">Release Year</div>
            <select
              className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 w-full"
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
            >
              <option value="">All</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Source Attribution */}
          <Card className="bg-blue-900/20 border border-blue-500/30 rounded-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Data Source: Funko Europe Exclusives</h3>
                    <p className="text-blue-300 text-sm">Curated collection of exclusive and limited edition Funko Pop! figures</p>
                  </div>
                </div>
                <Button
                  onClick={handleVisitSource}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browse Source
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{totalExclusives}</div>
                <div className="text-gray-300 text-sm">Total Exclusives</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">£{averagePrice}</div>
                <div className="text-gray-300 text-sm">Average Price</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{ultraRareCount}</div>
                <div className="text-gray-300 text-sm">Ultra Rare</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{soldOutCount}</div>
                <div className="text-gray-300 text-sm">Sold Out</div>
              </CardContent>
            </Card>
          </div>

          {/* Results Count */}
          <div className="text-gray-400 text-sm mb-6">
            {filteredProducts.length} exclusive items found
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProducts.map(product => {
              const rarity = rarityLevels.find(r => r.id === product.rarity);
              return (
                <Card key={product.id} className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden group hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                  <div className="relative">
                    {/* Rarity Badge */}
                    <div className={`absolute top-3 left-3 ${rarity?.color} ${rarity?.textColor} px-2 py-1 rounded-full text-xs font-bold z-10`}>
                      {rarity?.title}
                    </div>
                    
                    {/* Stock Status */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold z-10 ${
                      product.stock === 'Sold Out' ? 'bg-red-500 text-white' :
                      product.stock === 'Low Stock' ? 'bg-orange-500 text-white' :
                      product.stock === 'Pre-Order' ? 'bg-blue-500 text-white' :
                      product.stock === 'Coming Soon' ? 'bg-purple-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {product.stock}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSaveItem(product.id)}
                      className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors z-10 ${
                        savedItems.includes(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${savedItems.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>

                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-xs text-orange-400 font-semibold mb-2">{product.series}</div>
                    <h3 className="font-bold text-white text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-600 text-gray-100 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Exclusive Info */}
                    <div className="bg-gray-900/60 border border-gray-600/30 rounded p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-semibold text-sm">Exclusive</span>
                      </div>
                      <div className="text-gray-300 text-xs">{product.exclusive}</div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-orange-400 font-bold text-xl">{product.price}</span>
                        {product.originalPrice !== product.price && (
                          <span className="text-gray-500 text-sm line-through ml-2">{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">Released: {new Date(product.releaseDate).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        className={`flex-1 transition-colors ${
                          product.stock === 'Sold Out' 
                            ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        } text-white`}
                        disabled={product.stock === 'Sold Out'}
                      >
                        {product.stock === 'Sold Out' ? 'Sold Out' :
                         product.stock === 'Pre-Order' ? 'Pre-Order' :
                         product.stock === 'Coming Soon' ? 'Notify Me' : 'View Details'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                        onClick={() => window.open(product.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Convention Highlights */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-orange-400" />
                Convention Exclusives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {conventionHighlights.map((con, idx) => (
                  <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="font-bold text-white text-lg mb-2">{con.name}</div>
                    <div className="text-orange-400 font-semibold mb-3">{con.date}</div>
                    <div className="text-gray-300 text-sm mb-3">{con.exclusives} exclusive releases</div>
                    <div className="text-gray-300 text-sm">
                      <div className="font-semibold mb-1">Notable Exclusives:</div>
                      {con.highlights.map((highlight, i) => (
                        <div key={i} className="mb-1">• {highlight}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collection Tips */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">💡 Collector Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gray-900/40 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Chase Variants</h4>
                  <p className="text-gray-300 text-sm">Chase figures typically have a 1:6 ratio and can be worth 3-10x retail value</p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Convention Exclusives</h4>
                  <p className="text-gray-300 text-sm">SDCC and NYCC exclusives often become the most valuable in collections</p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Condition Matters</h4>
                  <p className="text-gray-300 text-sm">Mint condition boxes can significantly increase the value of exclusive figures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 