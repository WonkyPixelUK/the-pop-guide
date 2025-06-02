import { useState, useEffect, useRef, useMemo } from 'react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Filter, X, Search, Database, Heart, Share2, Plus, CheckCircle, Loader2, ChevronDown, ChevronUp, List, Sparkles, Calendar, Package, Star } from 'lucide-react';
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
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddToCollection } from "@/hooks/useFunkoPops";
import { useCustomLists } from "@/hooks/useCustomLists";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PriceHistory from '@/components/PriceHistory';

const PAGE_SIZE = 24;

// Move static filter options outside component to prevent recreation
const STATIC_FILTERS = {
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
  vaulted: ['All', 'Vaulted', 'Available'],
};

const DirectoryAll = () => {
  const { data: allPops = [], isLoading } = useFunkoPops();
  const [expandedPop, setExpandedPop] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], vaulted: 'All', year: ''
  });
  const [ownedConfirmed, setOwnedConfirmed] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [selectedPopForList, setSelectedPopForList] = useState(null);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const loader = useRef(null);
  
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const addToCollection = useAddToCollection();
  const { lists, addItemToList, createList } = useCustomLists();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Always scroll to top on mount to prevent jump-to-bottom bug
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Memoize expensive computations
  const characterOptions = useMemo(() => 
    Array.from(new Set(allPops.map(pop => pop.name).filter(Boolean))).sort(),
    [allPops]
  );
  
  const seriesOptions = useMemo(() => 
    Array.from(new Set(allPops.map(pop => pop.series).filter(Boolean))).sort(),
    [allPops]
  );

  const FILTERS = useMemo(() => ({
    ...STATIC_FILTERS,
    character: characterOptions,
    series: seriesOptions,
  }), [characterOptions, seriesOptions]);

  // Memoize filtered pops
  const filteredPops = useMemo(() => {
    return allPops.filter(pop => {
      // Search functionality
      const matchesSearch = !searchTerm || 
        pop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pop.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pop.number && pop.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pop.fandom && pop.fandom.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Existing filters
      const matchesCategory = !filters.category.length || (Array.isArray(filters.category) ? filters.category : []).includes(pop.category);
      const matchesFandom = !filters.fandom.length || (Array.isArray(filters.fandom) ? filters.fandom : []).includes(pop.fandom);
      const matchesGenre = !filters.genre.length || (Array.isArray(filters.genre) ? filters.genre : []).includes(pop.genre);
      
      // Enhanced edition filter to handle "New Releases"
      const matchesEdition = !filters.edition.length || (Array.isArray(filters.edition) ? filters.edition : []).some(edition => {
        if (edition === 'New Releases') {
          return pop.data_sources && pop.data_sources.includes('new-releases');
        }
        return pop.edition === edition;
      });
      
      const matchesVaulted = filters.vaulted === 'All' || (filters.vaulted === 'Vaulted' ? pop.is_vaulted : !pop.is_vaulted);
      const matchesYear = !filters.year || new Date(pop.created_at).getFullYear().toString() === filters.year;
      
      return matchesSearch && matchesCategory && matchesFandom && matchesGenre && matchesEdition && matchesVaulted && matchesYear;
    });
  }, [allPops, searchTerm, filters]);

  // Memoize years
  const years = useMemo(() => {
    return Array.from(new Set(
      allPops
        .map(pop => pop.created_at ? new Date(pop.created_at).getFullYear() : null)
        .filter(Boolean)
    )).sort((a, b) => b - a);
  }, [allPops]);

  // Infinite scroll - optimize dependency array
  useEffect(() => {
    const handleScroll = () => {
      if (loader.current && window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredPops.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredPops.length]); // Only depend on length, not entire arrays

  const requireLogin = () => {
    if (!user) {
      navigate('/auth');
      return true;
    }
    return false;
  };

  const handleExpandPop = (pop) => {
    setExpandedPop(expandedPop?.id === pop.id ? null : pop);
  };

  const handleWishlist = (pop) => {
    if (requireLogin()) return;
    const isWishlisted = wishlist.some((w) => w.funko_pop_id === pop.id);
    if (isWishlisted) {
      removeFromWishlist.mutate(pop.id);
    } else {
      addToWishlist.mutate({ funkoPopId: pop.id });
    }
  };

  const handleAddToCollection = (pop) => {
    if (requireLogin()) return;
    if (pop.owned || addingToCollection) return;
    
    setAddingToCollection(true);
    addToCollection.mutate(pop.id, {
      onSuccess: () => {
        setOwnedConfirmed(true);
        setAddingToCollection(false);
        toast({ 
          title: '✅ Added to Collection!', 
          description: `${pop.name} has been added to your collection.`,
          duration: 3000
        });
        // Reset the success state after 5 seconds
        setTimeout(() => setOwnedConfirmed(false), 5000);
      },
      onError: (error) => {
        setAddingToCollection(false);
        // Handle duplicate key error specifically
        if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          toast({
            title: '✅ Already in Collection',
            description: `${pop.name} is already in your collection.`,
            duration: 3000
          });
          // Mark as owned since it's already in collection
          setOwnedConfirmed(true);
          setTimeout(() => setOwnedConfirmed(false), 5000);
        } else {
          toast({
            title: '❌ Failed to Add',
            description: error.message || 'Could not add to collection. Please try again.',
            variant: 'destructive',
            duration: 5000
          });
        }
      }
    });
  };

  const handleShare = (pop) => {
    if (requireLogin()) return;
    const url = `${window.location.origin}/pop/${pop.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this Pop with others.' });
  };

  const handleAddToList = (pop) => {
    if (requireLogin()) return;
    setSelectedPopForList(pop);
    setListModalOpen(true);
  };

  const handleListSelect = (listId) => {
    if (!selectedPopForList) return;
    setAddingToListId(listId);
    addItemToList.mutate({ listId, funkoPopId: selectedPopForList.id }, {
      onSuccess: () => {
        toast({
          title: '✅ Added to List!',
          description: `${selectedPopForList.name} has been added to your list.`,
          duration: 3000
        });
        setListModalOpen(false);
        setSelectedPopForList(null);
        setAddingToListId(null);
      },
      onError: (error) => {
        toast({
          title: '❌ Failed to Add',
          description: error.message || 'Could not add to list. Please try again.',
          variant: 'destructive',
          duration: 5000
        });
        setAddingToListId(null);
      }
    });
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    createList.mutate({ name: newListName }, {
      onSuccess: (newList) => {
        setNewListName("");
        setCreatingList(false);
        // Automatically add the item to the new list
        if (selectedPopForList && newList?.id) {
          handleListSelect(newList.id);
        }
      },
      onError: () => {
        setCreatingList(false);
        toast({
          title: '❌ Failed to Create List',
          description: 'Could not create list. Please try again.',
          variant: 'destructive',
          duration: 5000
        });
      }
    });
  };

  // Helper function to determine product status badges
  const getProductBadges = (pop) => {
    const badges = [];
    
    // New Release badge (if in new-releases data source or recent)
    if (pop.data_sources?.includes('new-releases')) {
      badges.push({
        text: 'New Release',
        icon: Sparkles,
        className: 'bg-orange-500 hover:bg-orange-600 text-white border-0'
      });
    }
    
    // Coming Soon badge (if has future release date)
    const releaseDate = pop.release_date ? new Date(pop.release_date) : null;
    const now = new Date();
    if (releaseDate && releaseDate > now) {
      badges.push({
        text: 'Coming Soon',
        icon: Calendar,
        className: 'bg-blue-500 hover:bg-blue-600 text-white border-0'
      });
    }
    
    // Exclusive badge
    if (pop.is_exclusive) {
      badges.push({
        text: 'Exclusive',
        icon: Star,
        className: 'bg-purple-600 hover:bg-purple-700 text-purple-100 border-0'
      });
    }
    
    // Vaulted badge
    if (pop.is_vaulted) {
      badges.push({
        text: 'Vaulted',
        icon: Package,
        className: 'bg-red-600 hover:bg-red-700 text-red-100 border-0'
      });
    }
    
    // Source badges
    if (pop.data_sources?.includes('Funko Europe')) {
      badges.push({
        text: 'Funko Europe',
        icon: Package,
        className: 'bg-blue-600 hover:bg-blue-700 text-blue-100 border-0'
      });
    }
    
    return badges;
  };

  // Card rendering
  const renderCard = (pop, index) => {
    const isWishlisted = wishlist.some((w) => w.funko_pop_id === pop.id);
    const isOwned = pop.owned || ownedConfirmed;
    const isExpanded = expandedPop?.id === pop.id;
    const badges = getProductBadges(pop);

    return (
      <div key={pop.id}>
        <Card 
          className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer" 
          onClick={() => handleExpandPop(pop)}
        >
      <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        {pop.image_url ? (
          <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
        ) : (
          <User className="w-16 h-16 text-orange-400 animate-pulse" />
        )}
      </div>
      
      {/* Product Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 w-full justify-center">
          {badges.slice(0, 2).map((badge, idx) => {
            const IconComponent = badge.icon;
            return (
              <Badge key={idx} className={`text-xs ${badge.className}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {badge.text}
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="font-semibold text-white text-center text-base mb-1 truncate w-full">{pop.name}</div>
      <div className="text-xs text-gray-400 mb-1">Character: {pop.name}</div>
      <div className="text-xs text-gray-400 mb-1">Series: {pop.series}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.fandom}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.genre}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.edition}</div>
      <div className="text-xs text-gray-400 mb-1">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}{pop.is_vaulted ? ' • Vaulted' : ''}</div>
          <div className="text-xs text-orange-400 font-bold mb-2">{typeof pop.estimated_value === 'number' ? `£${pop.estimated_value.toFixed(2)}` : 'Pending'}</div>
      {pop.description && <div className="text-xs text-gray-300 mb-2 line-clamp-3">{pop.description}</div>}
          
          <div className="flex items-center text-gray-400 text-xs mt-auto">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="ml-1">{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          </div>
        </Card>

        {/* Expanded Details */}
        {isExpanded && (
          <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side - Large Image and Buttons */}
              <div className="lg:w-96 lg:flex-shrink-0">
                <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                  {pop.image_url ? (
                    <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="text-6xl mb-4">📦</div>
                      <div className="text-lg">No Image Available</div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    variant={pop.owned || ownedConfirmed ? 'default' : 'outline'}
                    className={
                      pop.owned || ownedConfirmed
                        ? ownedConfirmed 
                          ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse w-full h-12 text-base' 
                          : 'bg-green-600 text-white hover:bg-green-700 w-full h-12 text-base'
                        : addingToCollection 
                        ? 'border-orange-600 bg-orange-50 text-orange-600 hover:bg-orange-100 w-full h-12 text-base' 
                        : 'border-gray-600 hover:bg-gray-600 w-full h-12 text-base'
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCollection(pop);
                    }}
                    disabled={pop.owned || ownedConfirmed || addingToCollection}
                  >
                    {addingToCollection ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (pop.owned || ownedConfirmed) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {ownedConfirmed ? 'Added!' : 'Owned'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Own this Pop
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant={wishlist.some((w) => w.funko_pop_id === pop.id) ? 'default' : 'outline'}
                    className={`w-full h-12 text-base ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-400 hover:bg-red-600'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(pop);
                    }}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'fill-current' : ''}`} />
                    {wishlist.some((w) => w.funko_pop_id === pop.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 w-full h-12 text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToList(pop);
                    }}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Add to List
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 w-full h-12 text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(pop);
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white mb-6">{pop.name}</h3>
                <p className="text-gray-400 text-lg mb-6">{pop.series}</p>
                
                {/* Basic Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">
                        {pop.category === 'Bitty Pop!' ? '🧸' : 
                         pop.category === 'Vinyl Soda' ? '🥤' : 
                         pop.category === 'Loungefly' ? '🎒' :
                         pop.category === 'Mini Figures' ? '🔗' :
                         pop.category === 'REWIND' ? '📼' :
                         pop.category === 'Pop! Pins' ? '📌' :
                         '📦'}
                      </span>
                      Category
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.category || 'Pop!'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">📈</span>
                      Number
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">💎</span>
                      Value
                    </div>
                    <div className="font-semibold text-white text-lg">
                      {pop.estimated_value ? `£${pop.estimated_value.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">🎬</span>
                      Fandom
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.fandom || pop.series || '—'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">🎭</span>
                      Genre
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.genre || '—'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">🏷️</span>
                      Edition
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.edition || (pop.is_exclusive ? pop.exclusive_to || 'Exclusive' : '—')}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">🗓️</span>
                      Release Year
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">🔒</span>
                      Vaulted
                    </div>
                    <div className="font-semibold text-white text-lg">{pop.is_vaulted ? 'Yes' : 'No'}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      <span className="mr-2">👤</span>
                      Owned
                    </div>
                    <div className={`font-semibold text-lg ${(pop.owned || ownedConfirmed) ? 'text-green-400' : 'text-white'}`}>
                      {(pop.owned || ownedConfirmed) ? (ownedConfirmed ? '✅ Yes (Just Added!)' : '✅ Yes') : 'No'}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(pop.variant || pop.is_exclusive || pop.is_chase) && (
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 mb-6">
                    <h4 className="font-semibold mb-3 text-white text-lg">Additional Details</h4>
                    <div className="space-y-2 text-sm">
                      {pop.variant && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Variant:</span>
                          <span className="text-white">{pop.variant}</span>
                        </div>
                      )}
                      {pop.is_exclusive && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Exclusive to:</span>
                          <span className="text-white">{pop.exclusive_to || 'Yes'}</span>
                        </div>
                      )}
                      {pop.is_chase && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chase:</span>
                          <span className="text-yellow-400">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price History */}
                <div className="border-t border-gray-600 pt-6">
                  <PriceHistory funkoPopId={pop.id} funkoPopName={pop.name} />
                </div>
              </div>
            </div>
    </Card>
        )}
      </div>
  );
  };

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
                    <span className="text-gray-400 font-bold text-sm ml-2">
                      ({key === 'edition' && opt === 'New Releases' 
                        ? allPops.filter(pop => pop.data_sources && pop.data_sources.includes('new-releases')).length 
                        : allPops.filter(pop => pop[key] === opt).length})
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
  );

  return (
    <>
      <SEO title="All Funko Pops | PopGuide" description="Browse the entire Funko Pop database with powerful filters and infinite scroll." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <Navigation />
        
        {/* Header with count and search */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Browse Database</h1>
            <div className="flex items-center justify-center gap-2 text-xl text-gray-400 mb-4">
              <Database className="w-6 h-6" />
              <span>{allPops.length.toLocaleString()} Funko Pops</span>
            </div>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search Funko Pops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Showing {filteredPops.length.toLocaleString()} results for "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto flex flex-col md:flex-row gap-8 pb-12 px-4 flex-1">
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
              <div className="space-y-6">
                {filteredPops.slice(0, visibleCount).map((pop, index) => {
                  const isExpanded = expandedPop?.id === pop.id;
                  
                  // If this pop is expanded, render it full width
                  if (isExpanded) {
                    return (
                      <div key={pop.id} className="w-full">
                        {/* Compact card for expanded item */}
                        <Card 
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition cursor-pointer mb-4" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                            {pop.image_url ? (
                              <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                            <div className="text-sm text-gray-400">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                            <div className="text-sm text-orange-400 font-bold">{typeof pop.estimated_value === 'number' ? `£${pop.estimated_value.toFixed(2)}` : 'Pending'}</div>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <ChevronUp className="w-4 h-4 mr-1" />
                            <span>Hide Details</span>
                          </div>
                        </Card>

                        {/* Full width expanded details */}
                        <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Large Image and Buttons */}
                            <div className="lg:w-96 lg:flex-shrink-0">
                              <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                                {pop.image_url ? (
                                  <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="text-6xl mb-4">📦</div>
                                    <div className="text-lg">No Image Available</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="space-y-3">
                                <Button
                                  variant={pop.owned || ownedConfirmed ? 'default' : 'outline'}
                                  className={
                                    pop.owned || ownedConfirmed
                                      ? ownedConfirmed 
                                        ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse w-full h-12 text-base' 
                                        : 'bg-green-600 text-white hover:bg-green-700 w-full h-12 text-base'
                                      : addingToCollection 
                                      ? 'border-orange-600 bg-orange-50 text-orange-600 hover:bg-orange-100 w-full h-12 text-base' 
                                      : 'border-gray-600 hover:bg-gray-600 w-full h-12 text-base'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCollection(pop);
                                  }}
                                  disabled={pop.owned || ownedConfirmed || addingToCollection}
                                >
                                  {addingToCollection ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (pop.owned || ownedConfirmed) ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      {ownedConfirmed ? 'Added!' : 'Owned'}
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Own this Pop
                                    </>
                                  )}
                                </Button>
                                
                                <Button 
                                  variant={wishlist.some((w) => w.funko_pop_id === pop.id) ? 'default' : 'outline'}
                                  className={`w-full h-12 text-base ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-400 hover:bg-red-600'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(pop);
                                  }}
                                >
                                  <Heart className={`w-4 h-4 mr-2 ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'fill-current' : ''}`} />
                                  {wishlist.some((w) => w.funko_pop_id === pop.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                </Button>

                                <Button 
                                  variant="outline" 
                                  className="border-purple-600 text-purple-400 hover:bg-purple-600 w-full h-12 text-base"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToList(pop);
                                  }}
                                >
                                  <List className="w-4 h-4 mr-2" />
                                  Add to List
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600 w-full h-12 text-base"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(pop);
                                  }}
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-bold text-white mb-6">{pop.name}</h3>
                              <p className="text-gray-400 text-lg mb-6">{pop.series}</p>
                              
                              {/* Basic Info Cards */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">
                                      {pop.category === 'Bitty Pop!' ? '🧸' : 
                                       pop.category === 'Vinyl Soda' ? '🥤' : 
                                       pop.category === 'Loungefly' ? '🎒' :
                                       pop.category === 'Mini Figures' ? '🔗' :
                                       pop.category === 'REWIND' ? '📼' :
                                       pop.category === 'Pop! Pins' ? '📌' :
                                       '📦'}
                                    </span>
                                    Category
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.category || 'Pop!'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📈</span>
                                    Number
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">💎</span>
                                    Value
                                  </div>
                                  <div className="font-semibold text-white text-lg">
                                    {pop.estimated_value ? `£${pop.estimated_value.toFixed(2)}` : '—'}
                                  </div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎬</span>
                                    Fandom
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.fandom || pop.series || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎭</span>
                                    Genre
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.genre || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🏷️</span>
                                    Edition
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.edition || (pop.is_exclusive ? pop.exclusive_to || 'Exclusive' : '—')}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🗓️</span>
                                    Release Year
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🔒</span>
                                    Vaulted
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.is_vaulted ? 'Yes' : 'No'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">👤</span>
                                    Owned
                                  </div>
                                  <div className={`font-semibold text-lg ${(pop.owned || ownedConfirmed) ? 'text-green-400' : 'text-white'}`}>
                                    {(pop.owned || ownedConfirmed) ? (ownedConfirmed ? '✅ Yes (Just Added!)' : '✅ Yes') : 'No'}
                                  </div>
                                </div>
                              </div>

                              {/* Additional Details */}
                              {(pop.variant || pop.is_exclusive || pop.is_chase) && (
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 mb-6">
                                  <h4 className="font-semibold mb-3 text-white text-lg">Additional Details</h4>
                                  <div className="space-y-2 text-sm">
                                    {pop.variant && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Variant:</span>
                                        <span className="text-white">{pop.variant}</span>
                                      </div>
                                    )}
                                    {pop.is_exclusive && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Exclusive to:</span>
                                        <span className="text-white">{pop.exclusive_to || 'Yes'}</span>
                                      </div>
                                    )}
                                    {pop.is_chase && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Chase:</span>
                                        <span className="text-yellow-400">Yes</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price History - Full Width Bottom Section */}
                          <div className="border-t border-gray-600 pt-6 mt-6">
                            <PriceHistory funkoPopId={pop.id} funkoPopName={pop.name} />
                          </div>
                        </Card>
                      </div>
                    );
                  }
                  
                  // Regular grid item (not expanded)
                  return null; // We'll render these separately
                })}
                
                {/* Regular grid for non-expanded items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {filteredPops.slice(0, visibleCount).map((pop, index) => {
                    const isExpanded = expandedPop?.id === pop.id;
                    const badges = getProductBadges(pop);
                    
                    // Skip expanded items (they're rendered above)
                    if (isExpanded) return null;
                    
                    return (
                      <Card 
                        key={pop.id}
                        className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer" 
                        onClick={() => handleExpandPop(pop)}
                      >
                        <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                          {pop.image_url ? (
                            <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
                          ) : (
                            <User className="w-16 h-16 text-orange-400 animate-pulse" />
                          )}
                        </div>
                        
                        {/* Product Badges */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2 w-full justify-center">
                            {badges.slice(0, 2).map((badge, idx) => {
                              const IconComponent = badge.icon;
                              return (
                                <Badge key={idx} className={`text-xs ${badge.className}`}>
                                  <IconComponent className="w-3 h-3 mr-1" />
                                  {badge.text}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="font-semibold text-white text-center text-base mb-1 truncate w-full">{pop.name}</div>
                        <div className="text-xs text-gray-400 mb-1">Character: {pop.name}</div>
                        <div className="text-xs text-gray-400 mb-1">Series: {pop.series}</div>
                        <div className="text-xs text-gray-400 mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                        <div className="text-xs text-gray-400 mb-1">{pop.fandom}</div>
                        <div className="text-xs text-gray-400 mb-1">{pop.genre}</div>
                        <div className="text-xs text-gray-400 mb-1">{pop.edition}</div>
                        <div className="text-xs text-gray-400 mb-1">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}{pop.is_vaulted ? ' • Vaulted' : ''}</div>
                        <div className="text-xs text-orange-400 font-bold mb-2">{typeof pop.estimated_value === 'number' ? `£${pop.estimated_value.toFixed(2)}` : 'Pending'}</div>
                        {pop.description && <div className="text-xs text-gray-300 mb-2 line-clamp-3">{pop.description}</div>}
                        
                        <Button 
                          variant="default"
                          className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-auto py-2 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandPop(pop);
                          }}
                        >
                          <ChevronDown className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            <div ref={loader} />
          </div>
        </div>
        <Footer />
      </div>

      {/* Custom Lists Modal */}
      {listModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add to List</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a list for "{selectedPopForList?.name}"</p>
            
            {/* Existing Lists */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {lists.length > 0 ? (
                lists.map((list) => (
                  <Button
                    key={list.id}
                    variant="outline"
                    className="w-full justify-between border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-orange-500 transition-all duration-200 p-4 h-auto bg-white dark:bg-gray-700"
                    onClick={() => handleListSelect(list.id)}
                    disabled={addingToListId === list.id}
                  >
                    <div className="flex items-center">
                      {addingToListId === list.id ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin text-orange-500" />
                      ) : (
                        <List className="w-5 h-5 mr-3 text-orange-500" />
                      )}
                      <span className="text-left font-medium text-gray-900 dark:text-white">{list.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No custom lists yet</p>
                  <p className="text-sm">Create your first list below</p>
                </div>
              )}
            </div>

            {/* Create New List */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New List</h4>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                />
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || creatingList}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0 px-6"
                >
                  {creatingList ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={() => {
                  setListModalOpen(false);
                  setSelectedPopForList(null);
                  setAddingToListId(null);
                  setNewListName("");
                }}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectoryAll; 