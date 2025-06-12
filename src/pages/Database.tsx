import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Filter, List, Star, Calendar, Package, User, Sparkles, Database, Rocket } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  character: [], // To be filled dynamically if needed
  series: [], // To be filled dynamically if needed
};

const FILTER_META = [
  { key: 'status', label: 'Status', icon: Filter },
  { key: 'category', label: 'Category', icon: Package },
  { key: 'fandom', label: 'Fandom', icon: Sparkles },
  { key: 'genre', label: 'Genre', icon: Star },
  { key: 'edition', label: 'Edition', icon: Calendar },
  { key: 'character', label: 'Character', icon: User },
  { key: 'series', label: 'Series', icon: List },
];

export default function DatabaseLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Navigation />
      <div className="container mx-auto mt-6 mb-4">
        {/* Main Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-orange-500 to-yellow-400 border-l-4 border-orange-700 rounded-lg px-6 py-5 shadow-lg relative overflow-hidden">
          {/* Floating V1.3.0 Badge */}
          <Link to="/roadmap" aria-label="See what's new in v1.3.0">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold shadow-lg animate-pulse hover:scale-105 transition-transform cursor-pointer absolute top-2 right-2 z-20">
              <Sparkles className="w-5 h-5 text-white drop-shadow" />
              V1.3.0 is here!
              <ChevronRight className="w-4 h-4 text-white" />
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Rocket className="w-10 h-10 text-white drop-shadow-lg animate-bounce" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-extrabold text-white">PopGuide</span>
                <span className="bg-white/20 text-white text-sm font-bold px-2 py-1 rounded">v1.3.0</span>
              </div>
              <div className="text-base text-white font-medium">Major update: Segment-style Database Mega Menu, all "Browse by" group pages scaffolded, navigation/UX overhaul, admin/user management upgrades, live Supabase integration, and more.</div>
            </div>
          </div>
          <Link to="/roadmap" className="mt-4 md:mt-0">
            <button className="bg-white text-orange-700 font-bold px-6 py-3 rounded-lg shadow hover:bg-orange-100 transition text-lg">See full roadmap & changelog</button>
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 pt-8 pb-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">Home</Link>
          <span className="mx-1 text-orange-400">/</span>
          <span className="text-orange-400 font-bold tracking-wide uppercase">Database</span>
        </nav>
        {/* Title & Description */}
        <div className="mb-6 text-left">
          <h1 className="text-4xl font-bold mb-2">Funko Pop Database</h1>
          <p className="text-lg text-gray-200 max-w-2xl mb-2">Browse the entire Funko Pop database by any attribute. Select a filter below to explore by status, category, fandom, genre, edition, character, or series.</p>
        </div>
        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FILTER_META.map(({ key, label, icon: Icon }) => (
            <Link key={key} to={`/database/${key === 'genre' ? 'genres' : key}`} className="transform transition-all duration-200 hover:scale-105">
              <Card className="bg-gray-800 border border-gray-700 shadow-lg hover:border-orange-500 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{label}</h2>
                    <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                      {STATIC_FILTERS[key]?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Icon className="w-6 h-6 mr-2 text-orange-400" />
                    <span>Browse by {label.toLowerCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Link to="/database/all" className="transform transition-all duration-200 hover:scale-105">
            <Card className="bg-gray-800 border border-gray-700 shadow-lg hover:border-orange-500 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">See all Funko Pops</h2>
                </div>
                <div className="flex items-center text-gray-300">
                  <Database className="w-6 h-6 mr-2 text-orange-400" />
                  <span>Browse the full database</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
} 