import { useState, useEffect, useRef } from 'react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import ItemDetailsDialog from '@/components/ItemDetailsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Filter, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 24;

const DirectoryAll = () => {
  const { data: allPops = [], isLoading } = useFunkoPops();
  const [selectedPop, setSelectedPop] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], vaulted: 'All', year: ''
  });
  const loader = useRef(null);

  // Move these inside the component, after allPops is defined
  const characterOptions = Array.from(new Set(allPops.map(pop => pop.name).filter(Boolean))).sort();
  const seriesOptions = Array.from(new Set(allPops.map(pop => pop.series).filter(Boolean))).sort();
  const FILTERS = {
    category: [
      'Pop!', 'Bitty Pop!', 'Mini Figures', 'Vinyl Soda', 'REWIND', 'Pop! Pins', 'Toys and Plushies', 'Clothing', 'Funko Gear', 'Funko Games'
    ],
    fandom: [
      '8-Bit', 'Ad Icons', 'Air Force', 'Albums', 'Animation', 'Aquasox', 'Army', 'Around the World', 'Artists', 'Art Covers', 'Art Series', 'Asia', 'Bape', 'Basketball', 'Board Games', 'Books', 'Boxing', 'Broadway', 'Build a Bear', 'Candy', 'Christmas', 'Classics', 'College', 'Comedians', 'Comic Covers', 'Comics', 'Conan', 'Custom', 'Deluxe', 'Deluxe Moments', 'Die-Cast', 'Digital', 'Disney', 'Directors', 'Drag Queens', 'Fantastic Beasts', 'Fashion', 'Foodies', 'Football', 'Freddy Funko', 'Fantastik Plastik', 'Lance', 'Game of Thrones', 'Games', 'Game Covers', 'Golf', 'GPK', 'Halo', 'Harry Potter', 'Heroes', 'Hockey', 'Holidays', 'House of the Dragons', 'Icons', 'League of Legends', 'Magic: The Gathering', 'Marines', 'Marvel', 'Magazine Covers', 'Minis', 'MLB', 'Moments', 'Monsters', 'Movie Posters', 'Movies', 'Muppets', 'Myths', 'My Little Pony', 'NASCAR', 'Navy', 'NBA Mascots', 'NFL', 'Pets', 'Pusheen', 'Racing', 'Retro Toys', 'Rides', 'Rocks', 'Royals', 'Sanrio', 'Sci-Fi', 'Sesame Street', 'SNL', 'South Park', 'Special Edition', 'Sports', 'Sports Legends', 'Stan Lee', 'Star Wars', 'Television', 'Tennis', 'The Vote', 'Town', 'Town Christmas', 'Trading Cards', 'Trains', 'Trolls', 'UFC', 'Uglydoll', 'Valiant', 'Vans', 'VHS Covers', 'Wreck-It Ralph', 'Wrestling', 'WWE', 'WWE Covers', 'Zodiac'
    ],
    genre: [
      'Animation', 'Anime & Manga', '80s Flashback', 'Movies & TV', 'Horror', 'Music', 'Sports', 'Video Games', 'Retro Toys', 'Ad Icons'
    ],
    edition: [
      'Exclusives', 'Convention Style', 'Character Cosplay', 'Rainbow Brights', 'Retro Rewind', 'Theme Park Favourites', 'Disney Princesses', 'All The Sparkles', 'Back in Stock', 'BLACK LIGHT', 'BRONZE', 'BTS X MINIONS', 'CHASE', 'CONVENTION', 'DIAMON COLLECTION', 'DIAMOND COLLECTION', 'EASTER', 'FACET COLLECTION', 'FLOCKED', 'GLITTER', 'GLOW IN THE DARK', 'HOLIDAY', 'HYPERSPACE HEROES', 'LIGHTS AND SOUND', 'MEME', 'METALLIC', 'PEARLESCENT', 'PRIDE', 'RETRO COMIC', 'RETRO SERIES', 'SCOOPS AHOY', 'SOFT COLOUR', "VALENTINE'S"
    ],
    vaulted: ['All', 'Vaulted', 'Available'],
    character: characterOptions,
    series: seriesOptions,
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loader.current && window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredPops.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allPops, filters]);

  // Filtering logic
  const filteredPops = allPops.filter(pop => {
    const matchesCategory = !filters.category.length || (Array.isArray(filters.category) ? filters.category : []).includes(pop.category);
    const matchesFandom = !filters.fandom.length || (Array.isArray(filters.fandom) ? filters.fandom : []).includes(pop.fandom);
    const matchesGenre = !filters.genre.length || (Array.isArray(filters.genre) ? filters.genre : []).includes(pop.genre);
    const matchesEdition = !filters.edition.length || (Array.isArray(filters.edition) ? filters.edition : []).includes(pop.edition);
    const matchesVaulted = filters.vaulted === 'All' || (filters.vaulted === 'Vaulted' ? pop.is_vaulted : !pop.is_vaulted);
    const matchesYear = !filters.year || String(pop.release_year) === filters.year;
    return matchesCategory && matchesFandom && matchesGenre && matchesEdition && matchesVaulted && matchesYear;
  });

  // Unique years for filter
  const years = Array.from(new Set(allPops.map(pop => pop.release_year).filter(Boolean))).sort((a, b) => b - a);

  // Card rendering
  const renderCard = (pop) => (
    <Card key={pop.id} className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedPop({
      id: pop.id,
      name: pop.name,
      series: pop.series,
      number: pop.number || '',
      image: pop.image_url || '',
      value: typeof pop.estimated_value === 'number' ? pop.estimated_value : null,
      rarity: pop.rarity || pop.is_chase ? 'Chase' : pop.is_exclusive ? 'Exclusive' : 'Common',
      owned: !!pop.owned,
      description: pop.description || '',
    })}>
      <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        {pop.image_url ? (
          <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
        ) : (
          <User className="w-16 h-16 text-orange-400 animate-pulse" />
        )}
      </div>
      <div className="font-semibold text-white text-center text-base mb-1 truncate w-full">{pop.name}</div>
      <div className="text-xs text-gray-400 mb-1">Character: {pop.name}</div>
      <div className="text-xs text-gray-400 mb-1">Series: {pop.series}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.fandom}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.genre}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.edition}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.release_year || '—'}{pop.is_vaulted ? ' • Vaulted' : ''}</div>
      <div className="text-xs text-orange-400 font-bold mb-2">{typeof pop.estimated_value === 'number' ? `£${pop.estimated_value}` : 'N/A'}</div>
      {pop.description && <div className="text-xs text-gray-300 mb-2 line-clamp-3">{pop.description}</div>}
      {/* Usual action buttons can be added here if needed */}
    </Card>
  );

  // Filter UI
  const renderFilterSection = () => (
    <aside className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-24 max-h-[80vh] overflow-y-auto min-w-[220px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Filters</h2>
        <Button size="icon" variant="ghost" onClick={() => setFilterOpen(false)} className="md:hidden"><X /></Button>
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
                    <span className="text-gray-400 font-bold text-sm ml-2">({allPops.filter(pop => pop[key] === opt).length})</span>
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
  );

  return (
    <>
      <SEO title="All Funko Pops | PopGuide" description="Browse the entire Funko Pop database with powerful filters and infinite scroll." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <Navigation />
        <div className="container mx-auto flex flex-col md:flex-row gap-8 py-12 px-4 flex-1">
          {/* Filter sidebar (desktop) or drawer (mobile) */}
          <div className="hidden md:block w-64 flex-shrink-0">{renderFilterSection()}</div>
          <div className="md:hidden flex justify-end mb-4">
            <Button variant="outline" onClick={() => setFilterOpen(true)}><Filter className="mr-2" />Filters</Button>
          </div>
          {filterOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex">
              <div className="w-72 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">{renderFilterSection()}</div>
              <div className="flex-1" onClick={() => setFilterOpen(false)} />
            </div>
          )}
          {/* Pop grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-gray-300">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {filteredPops.slice(0, visibleCount).map(renderCard)}
              </div>
            )}
            <div ref={loader} />
          </div>
        </div>
        {selectedPop && (
          <ItemDetailsDialog
            item={selectedPop}
            open={!!selectedPop}
            onOpenChange={() => setSelectedPop(null)}
          />
        )}
        <Footer />
      </div>
    </>
  );
};

export default DirectoryAll; 