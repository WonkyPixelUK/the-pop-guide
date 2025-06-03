import { useState } from 'react';
import { useNewReleases, useNewReleasesBySource, useRecentReleases } from '@/hooks/useNewReleases';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Filter, Star, TrendingUp, Package } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

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

const NewReleases = () => {
  const [filter, setFilter] = useState<'all' | 'funko-europe' | 'recent-30' | 'recent-7'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], status: [], character: [], series: [], vaulted: 'All', year: ''
  });
  
  const { data: allNewReleases, isLoading: loadingAll } = useNewReleases();
  const { data: funkoEuropeReleases, isLoading: loadingFE } = useNewReleasesBySource('Funko Europe');
  const { data: recent30, isLoading: loading30 } = useRecentReleases(30);
  const { data: recent7, isLoading: loading7 } = useRecentReleases(7);

  // Determine which data to show based on filter
  const getCurrentData = () => {
    switch (filter) {
      case 'funko-europe': return funkoEuropeReleases || [];
      case 'recent-30': return recent30 || [];
      case 'recent-7': return recent7 || [];
      default: return allNewReleases || [];
    }
  };

  // Generate years and other filter options from the current data
  const currentData = getCurrentData();
  const years = Array.from(new Set(
    currentData
      .map(pop => pop.created_at ? new Date(pop.created_at).getFullYear() : null)
      .filter(Boolean)
  )).sort((a, b) => b - a);

  const FILTERS = {
    ...STATIC_FILTERS,
    character: Array.from(new Set(currentData.map(pop => pop.name).filter(Boolean))).sort(),
    series: Array.from(new Set(currentData.map(pop => pop.series).filter(Boolean))).sort(),
  };

  // Apply advanced filters and search
  const filteredData = getCurrentData().filter(pop => {
    // Search functionality
    const matchesSearch = !searchTerm || 
      pop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pop.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pop.fandom && pop.fandom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Advanced filters
    const matchesCategory = !filters.category.length || filters.category.some(cat => {
      if (cat === 'Pop!') return pop.category === 'Pop!' || !pop.category;
      return pop.category === cat;
    });
    
    const matchesGenre = !filters.genre.length || filters.genre.includes(pop.genre);
    
    const matchesStatus = !filters.status.length || filters.status.some(status => {
      switch (status) {
        case 'New Releases': return true; // All items on this page are new releases
        case 'Funko Exclusive': return pop.is_exclusive;
        case 'In Stock': return !pop.is_vaulted;
        case 'Vaulted': return pop.is_vaulted;
        default: return false;
      }
    });
    
    return matchesSearch && matchesCategory && matchesGenre && matchesStatus;
  });

  const isLoading = loadingAll || loadingFE || loading30 || loading7;
  const currentDataFiltered = filteredData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Sparkles className="w-6 h-6 animate-pulse text-orange-400" />
          Loading new releases...
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="New Releases | PopGuide" description="Discover the latest Funko Pop releases from Funko Europe and other sources." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <Navigation />
        
        {/* Header */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-orange-400" />
              <h1 className="text-4xl font-bold text-white">New Releases</h1>
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover the latest Funko Pop releases from Funko Europe and other trusted sources
            </p>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 ${
                  filter === 'all' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-[#1e3a8a] hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                All New Releases ({allNewReleases?.length || 0})
              </Button>
              <Button
                variant={filter === 'funko-europe' ? 'default' : 'outline'}
                onClick={() => setFilter('funko-europe')}
                className={`flex items-center gap-2 ${
                  filter === 'funko-europe' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-[#1e3a8a] hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                Funko Europe ({funkoEuropeReleases?.length || 0})
              </Button>
              <Button
                variant={filter === 'recent-30' ? 'default' : 'outline'}
                onClick={() => setFilter('recent-30')}
                className={`flex items-center gap-2 ${
                  filter === 'recent-30' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-[#1e3a8a] hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Last 30 Days ({recent30?.length || 0})
              </Button>
              <Button
                variant={filter === 'recent-7' ? 'default' : 'outline'}
                onClick={() => setFilter('recent-7')}
                className={`flex items-center gap-2 ${
                  filter === 'recent-7' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-[#1e3a8a] hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Last 7 Days ({recent7?.length || 0})
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Input
                placeholder="Search new releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 bg-gray-800 border-gray-700 text-white"
              />
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Showing {currentDataFiltered.length} results for "{searchTerm}"
                </p>
              )}
            </div>

            {/* Current Filter Info */}
            <div className="text-lg text-gray-300 font-medium mt-4">
              Showing <span className="text-orange-400 font-bold">{currentDataFiltered.length}</span> new releases
              {filter === 'funko-europe' && ' from Funko Europe'}
              {filter === 'recent-30' && ' from the last 30 days'}
              {filter === 'recent-7' && ' from the last 7 days'}
            </div>
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
                            ({getCurrentData().filter(pop => {
                              if (key === 'status') {
                                switch (opt) {
                                  case 'All': return true;
                                  case 'New Releases': return true;
                                  case 'Funko Exclusive': return pop.is_exclusive;
                                  case 'In Stock': return !pop.is_vaulted;
                                  case 'Vaulted': return pop.is_vaulted;
                                  default: return false;
                                }
                              }
                              if (key === 'category') return pop.category === opt || (opt === 'Pop!' && !pop.category);
                              if (key === 'genre') return pop.genre === opt;
                              if (key === 'fandom') return pop.fandom === opt;
                              if (key === 'series') return pop.series === opt;
                              if (key === 'character') return pop.name === opt;
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
            {/* Products Grid */}
            {currentDataFiltered.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-800/50 rounded-xl p-8 max-w-md mx-auto">
                  <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-300 mb-2">No new releases found</h3>
                  <p className="text-gray-400">Check back soon for the latest Funko Pop releases!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {currentDataFiltered.map((pop) => (
                  <Card key={pop.id} className="bg-gray-800/70 border-gray-700 hover:bg-gray-700/70 transition-all duration-200 hover:shadow-lg hover:border-orange-500/30">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                        <img
                          src={pop.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                          alt={pop.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm leading-tight text-white line-clamp-2">{pop.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">{pop.series}</p>
                        {pop.number && (
                          <p className="text-xs text-gray-500">#{pop.number}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-green-400 font-bold text-sm">
                            £{pop.estimated_value || 0}
                          </div>
                          {pop.is_exclusive && (
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-purple-100 text-xs border-0">
                              Exclusive
                            </Badge>
                          )}
                        </div>
                        
                        {/* Single New Release Badge */}
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs border-0 w-full justify-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New Release
                        </Badge>
                        
                        {/* Data Sources - Only show Funko Europe if present */}
                        {pop.data_sources?.includes('Funko Europe') && (
                          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400 hover:bg-blue-400/10 w-full justify-center">
                            <Package className="w-3 h-3 mr-1" />
                            Funko Europe
                          </Badge>
                        )}
                        
                        {/* Release Date */}
                        <p className="text-xs text-gray-500 text-center">
                          Added {new Date(pop.created_at).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default NewReleases; 