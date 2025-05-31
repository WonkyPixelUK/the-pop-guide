import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, BarChart3, Users, Zap, LogOut, Settings, Heart, List, TrendingUp, MessageCircle, ChevronLeft, ChevronRight, Download, Badge, Filter, ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import WishlistGrid from "@/components/WishlistGrid";
import CustomListsManager from "@/components/CustomListsManager";
import CollectionAnalytics from "@/components/CollectionAnalytics";
import EnhancedAddItemDialog from "@/components/EnhancedAddItemDialog";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useFunkoPops, useUserCollection } from "@/hooks/useFunkoPops";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import GlobalSearch from '@/components/GlobalSearch';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import MobileBottomNav from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import FriendsList from "@/components/FriendsList";
import Paywall from '@/components/Paywall';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useCustomLists } from '@/hooks/useCustomLists';
import MessagesInbox from '@/components/MessagesInbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useRemoveFromCollection } from '@/hooks/useFunkoPops';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const AnimatedFallback = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <Icon className="w-12 h-12 text-orange-500 animate-bounce mb-4" />
    <div className="text-orange-500 text-lg font-semibold animate-pulse">{message}</div>
  </div>
);

const SORT_OPTIONS = [
  { label: 'High to Low', value: 'high-to-low', icon: ArrowDownWideNarrow },
  { label: 'Low to High', value: 'low-to-high', icon: ArrowUpWideNarrow },
  { label: 'Alphabetical', value: 'alphabetical', icon: ArrowDownAZ },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSection, setActiveSection] = useState("recently-added");
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [importCsvOpen, setImportCsvOpen] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [editCondition, setEditCondition] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editing, setEditing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], vaulted: 'All', year: '', character: [], series: []
  });
  const [sort, setSort] = useState('high-to-low');
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading } = useUserCollection(user?.id);
  const { wishlist, isLoading: wishlistLoading } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { lists = [] } = useCustomLists();
  const removeFromCollection = useRemoveFromCollection();
  const mainRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [activeSection]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarVisible(false); // Auto-hide sidebar on mobile
      } else {
        setSidebarVisible(true); // Show sidebar on desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/');
    }
  };

  const handleExport = () => {
    const exportData = {
      collection: userCollection,
      wishlist,
      customLists: lists,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'popguide-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Transform data to match the existing component interface
  const transformedItems = funkoPops.map(pop => {
    const isOwned = userCollection.some(item => item.funko_pop_id === pop.id);
    const userItem = userCollection.find(item => item.funko_pop_id === pop.id);
    
    return {
      id: pop.id,
      name: pop.name,
      series: pop.series,
      number: pop.number || "",
      image: pop.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: pop.estimated_value || 0,
      rarity: pop.is_chase ? "Chase" : pop.is_exclusive ? "Exclusive" : "Common",
      owned: isOwned,
      condition: userItem?.condition,
      purchase_price: userItem?.purchase_price,
    };
  });

  const totalValue = userCollection.reduce((sum, item) => {
    return sum + (item.funko_pops?.estimated_value || 0);
  }, 0);

  const ownedCount = userCollection.length;
  const uniqueSeries = new Set(userCollection.map(item => item.funko_pops?.series)).size;
  const wishlistCount = wishlist.length;

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkSelectAll = () => {
    setBulkSelected(userCollection.map((item) => item.funko_pops?.id).filter(Boolean));
  };
  const handleBulkClear = () => setBulkSelected([]);

  // Sidebar toggle button (always visible)
  const SidebarToggleButton = (
    <button
      className="fixed left-2 top-20 z-50 bg-orange-500 text-white rounded-full p-1 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
      onClick={() => setSidebarVisible(v => !v)}
      aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
      style={{ display: sidebarVisible ? 'none' : 'block' }}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  );

  // Filtering logic for dashboard tabs
  const filteredItems = userCollection.filter(item => {
    // Apply all filters
    const matchesCategory = !filters.category.length || filters.category.includes(item.funko_pops?.category);
    const matchesFandom = !filters.fandom.length || filters.fandom.includes(item.funko_pops?.fandom);
    const matchesGenre = !filters.genre.length || filters.genre.includes(item.funko_pops?.genre);
    const matchesEdition = !filters.edition.length || filters.edition.includes(item.funko_pops?.edition);
    const matchesVaulted = filters.vaulted === 'All' || (filters.vaulted === 'Vaulted' ? item.funko_pops?.is_vaulted : !item.funko_pops?.is_vaulted);
    const matchesYear = !filters.year || String(item.funko_pops?.release_year) === filters.year;
    const matchesCharacter = !filters.character.length || filters.character.includes(item.funko_pops?.name);
    const matchesSeries = !filters.series.length || filters.series.includes(item.funko_pops?.series);
    return matchesCategory && matchesFandom && matchesGenre && matchesEdition && matchesVaulted && matchesYear && matchesCharacter && matchesSeries;
  });

  // Sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sort === 'high-to-low') return (b.funko_pops?.estimated_value || 0) - (a.funko_pops?.estimated_value || 0);
    if (sort === 'low-to-high') return (a.funko_pops?.estimated_value || 0) - (b.funko_pops?.estimated_value || 0);
    if (sort === 'alphabetical') return (a.funko_pops?.name || '').localeCompare(b.funko_pops?.name || '');
    return 0;
  });

  // Place this after userCollection is defined
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
    character: Array.from(new Set(userCollection.map(item => item.funko_pops?.name).filter(Boolean))).sort(),
    series: Array.from(new Set(userCollection.map(item => item.funko_pops?.series).filter(Boolean))).sort(),
  };

  // Helper to map userCollection item to CollectionGrid item shape
  const mapToGridItem = (item) => ({
    id: item.funko_pops?.id,
    name: item.funko_pops?.name,
    series: item.funko_pops?.series,
    number: item.funko_pops?.number || "",
    image: item.funko_pops?.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
    value: item.funko_pops?.estimated_value || 0,
    rarity: item.funko_pops?.is_chase ? "Chase" : item.funko_pops?.is_exclusive ? "Exclusive" : "Common",
    owned: true,
    condition: item.condition,
    purchase_price: item.purchase_price,
  });

  if (authLoading || funkoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Redirecting...</div>;
  }

  // Show paywall for non-Pro users
  return (
    <>
      <Paywall />
      {/* The Paywall component will return null for Pro users, so dashboard will show. For non-Pro, it will show the paywall and nothing else. */}
      {/* Only render dashboard if user is Pro */}
      {/* We'll check subStatus in Paywall, so if Paywall returns null, user is Pro */}
      <SEO title="Dashboard | The Pop Guide" description="Your personal Funko Pop collection dashboard." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className={`flex flex-col gap-4 ${isMobile ? 'space-y-3' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'flex-col' : 'sm:flex-row'}`}>
                <img
                  src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
                  alt="PopGuide Logo"
                  className={`${isMobile ? 'h-8' : 'h-10'} w-auto mx-auto sm:mx-0`}
                />
                <GlobalSearch />
              </div>
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'}`}>
                <NotificationDropdown />
                <span className={`text-white text-center sm:text-left ${isMobile ? 'text-sm' : ''}`}>Welcome, {user.user_metadata?.full_name || user.email}</span>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className={`bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto ${isMobile ? 'h-12 text-base' : ''}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className={`border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto ${isMobile ? 'h-12 text-base' : ''}`}
                >
                  Export Collection
                </Button>
                <Link to="/profile-settings">
                  <Button 
                    variant="outline"
                    className={`border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto ${isMobile ? 'h-12 text-base' : ''}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className={`border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto ${isMobile ? 'h-12 text-base' : ''}`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Sticky bottom tab bar for dashboard/app only */}
        <div className={`fixed bottom-0 left-0 w-full z-40 bg-[#fef5ed] border-t border-[#232837] shadow-lg ${isMobile ? 'h-16' : 'h-10'}`}>
          <div className={`flex w-full max-w-6xl mx-auto h-full items-center justify-center gap-1 px-1 overflow-x-auto scrollbar-hide ${isMobile ? 'py-2' : ''}`}>
            <button onClick={() => setActiveSection('recently-added')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'recently-added' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Zap className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
              {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Recently Added</span>}
            </button>
            <button onClick={() => setActiveSection('items-owned')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'items-owned' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Zap className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
              {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Items Owned</span>}
            </button>
            <button onClick={() => setActiveSection('wishlist')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'wishlist' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Heart className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
              {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Wishlist</span>}
            </button>
            <button onClick={() => setActiveSection('analytics')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'analytics' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
              <TrendingUp className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
              {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Analytics</span>}
            </button>
            {/* Hide less important tabs on mobile */}
            {(!isMobile || activeSection === 'lists' || activeSection === 'friends' || activeSection === 'messages' || activeSection === 'downloads') && (
              <>
                <button onClick={() => setActiveSection('lists')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'lists' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
                  <List className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
                  {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Lists</span>}
                </button>
                <button onClick={() => setActiveSection('downloads')} className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'h-12 min-w-[80px] flex-col' : 'h-8'} ${activeSection === 'downloads' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
                  <Download className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-1'}`} />
                  {(!isMobile || sidebarVisible) && <span className={isMobile ? 'text-xs' : ''}>Downloads</span>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Layout: sidebar (left) for stats, main content (right) */}
        {SidebarToggleButton}
        <div className={`flex flex-row ${isMobile ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-40px)]'}`}>{/* Account for mobile bottom bar height */}
          {/* Sidebar: Stats */}
          <aside
            className={`relative bg-gray-900/70 border-r border-gray-800 py-8 px-4 flex flex-col gap-4 transition-all duration-300 ease-in-out ${sidebarVisible ? 'w-64 min-w-[220px] max-w-xs opacity-100' : 'w-0 min-w-0 max-w-0 opacity-0 overflow-hidden'}`}
            style={{zIndex: 41}}
          >
            <button
              className="absolute -right-4 top-4 z-50 bg-orange-500 text-white rounded-full p-1 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onClick={() => setSidebarVisible(v => !v)}
              aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => setActiveSection("analytics")}> 
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
                <div className="text-gray-400">Collection Value</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => setActiveSection("items-owned")}> 
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{ownedCount}</div>
                <div className="text-gray-400">Items Owned</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => setActiveSection("wishlist")}> 
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{wishlistCount}</div>
                <div className="text-gray-400">Wishlist Items</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => setActiveSection("series-owned")}> 
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{uniqueSeries}</div>
                <div className="text-gray-400">Series Collected</div>
              </CardContent>
            </Card>
          </aside>
          {/* Main dashboard content */}
          <main ref={mainRef} className="flex-1 pt-20 px-4 md:px-8">
            {/* Tab content at the top */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="flex items-center gap-2 text-3xl font-bold text-white mb-4 md:mb-0 border-b-4 border-orange-500 pb-1 w-fit">
                {activeSection === 'recently-added' && <Zap className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'items-owned' && <Zap className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'series-owned' && <Users className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'wishlist' && <Heart className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'lists' && <List className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'friends' && <Users className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'analytics' && <TrendingUp className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'messages' && <MessageCircle className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'downloads' && <Download className="w-7 h-7 text-orange-500" />} 
                {activeSection === 'recently-added' && 'Recently Added'}
                {activeSection === 'items-owned' && 'Items Owned'}
                {activeSection === 'series-owned' && 'Series Owned'}
                {activeSection === 'wishlist' && 'My Wishlist'}
                {activeSection === 'lists' && 'Custom Lists'}
                {activeSection === 'friends' && 'Friends'}
                {activeSection === 'analytics' && 'Analytics'}
                {activeSection === 'messages' && 'Messages'}
                {activeSection === 'downloads' && 'Downloads'}
              </h2>
              {/* Filters and sort dropdowns */}
              <div className={`flex items-center gap-2 w-full ${isMobile ? 'flex-col space-y-2' : 'md:w-auto'}`}>
                {/* Filters - stack on mobile */}
                <div className={`flex items-center gap-2 ${isMobile ? 'w-full flex-wrap' : ''}`}>
                  {['category','fandom','genre','edition','character','series'].map(key => (
                    <DropdownMenu key={key}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`flex items-center gap-1 ${isMobile ? 'flex-1 min-w-[100px]' : ''}`}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                          <Filter className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                        {FILTERS[key].map(opt => (
                          <DropdownMenuCheckboxItem
                            key={opt}
                            checked={filters[key]?.includes(opt)}
                            onCheckedChange={() => {
                              setFilters(f => {
                                const arr = (Array.isArray(f[key]) ? f[key] : []).includes(opt) ? f[key].filter(x => x !== opt) : [...f[key], opt];
                                return { ...f, [key]: arr };
                              });
                            }}
                          >
                            {opt}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
                
                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={`flex items-center gap-1 ${isMobile ? 'w-full' : ''}`}>
                      Sort
                      {(() => {
                        const Icon = SORT_OPTIONS.find(opt => opt.value === sort)?.icon;
                        return Icon ? <Icon className="w-4 h-4 ml-1" /> : null;
                      })()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {SORT_OPTIONS.map(opt => (
                      <DropdownMenuItem key={opt.value} onClick={() => setSort(opt.value)}>
                        <opt.icon className="w-4 h-4 mr-2" /> {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Search bar */}
                <div className={`relative ${isMobile ? 'w-full' : 'flex-1 md:w-80'}`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={
                      activeSection === 'recently-added' ? 'Search recently added...' :
                      activeSection === 'items-owned' ? 'Search owned items...' :
                      activeSection === 'series-owned' ? 'Search series...' :
                      activeSection === 'wishlist' ? 'Search wishlist...' :
                      'Search...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
              </div>
            </div>
            {activeSection === 'recently-added' && (
              userCollection.length === 0 ? (
                <AnimatedFallback icon={Zap} message="No items found! Time to add some Pops to your collection." />
              ) : (
                <CollectionGrid 
                  items={sortedItems.slice(0, 24).map(mapToGridItem)}
                  onItemClick={setSelectedItem}
                  searchQuery={searchQuery}
                  showWishlistOnly={false}
                />
              )
            )}
            {activeSection === 'items-owned' && (
              userCollection.length === 0 ? (
                <AnimatedFallback icon={Zap} message="No items found! Time to add some Pops to your collection." />
              ) : (
                <CollectionGrid 
                  items={sortedItems.map(mapToGridItem)}
                  onItemClick={setSelectedItem}
                  searchQuery={searchQuery}
                  showWishlistOnly={false}
                />
              )
            )}
            {activeSection === 'wishlist' && (
              wishlist.length === 0 ? (
                <AnimatedFallback icon={Heart} message="Your wishlist is empty!" />
              ) : (
                <WishlistGrid items={sortedItems} searchQuery={searchQuery} />
              )
            )}
            {activeSection === 'series-owned' && (
              (() => {
                // Build a map of series to { count, firstPop }
                const seriesMap = {};
                sortedItems.forEach(item => {
                  const series = item.funko_pops?.series || 'Unknown';
                  if (!seriesMap[series]) {
                    seriesMap[series] = {
                      count: 1,
                      firstPop: item.funko_pops
                    };
                  } else {
                    seriesMap[series].count++;
                  }
                });
                const seriesList = Object.entries(seriesMap).map(([series, data]) => ({
                  series,
                  count: data.count,
                  firstPop: data.firstPop
                }));
                if (seriesList.length === 0) {
                  return <AnimatedFallback icon={Users} message="No series found in your collection." />;
                }
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {seriesList.map(({ series, count, firstPop }) => (
                      <Card key={series} className="bg-gray-800/70 border-gray-700 flex flex-row items-center gap-4 p-4">
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                          <img
                            src={firstPop?.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png"}
                            alt={firstPop?.name || series}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-lg truncate">{series}</div>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs mt-1">{count} owned</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })()
            )}
            {activeSection === 'lists' && (
              <CustomListsManager />
            )}
            {activeSection === 'friends' && (
              <FriendsList />
            )}
            {activeSection === 'analytics' && (
              <CollectionAnalytics 
                userCollection={userCollection}
                funkoPops={funkoPops}
                profile={null}
              />
            )}
            {activeSection === 'messages' && (
              <MessagesInbox />
            )}
            {activeSection === 'downloads' && (
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Download className="w-8 h-8 text-orange-500" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Export Your Data</h3>
                        <p className="text-gray-400">Download your collection, wishlist, and custom lists</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Download className="w-5 h-5 text-orange-500" />
                            <h4 className="font-semibold text-white">Full Export</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Export everything: collection, wishlist, and custom lists in JSON format
                          </p>
                          <Button 
                            onClick={handleExport}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            Download All Data
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5 text-orange-500" />
                            <h4 className="font-semibold text-white">Collection CSV</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Export your collection in CSV format for spreadsheet apps
                          </p>
                          <Button 
                            onClick={() => {
                              const csvContent = [
                                ['Name', 'Series', 'Number', 'Condition', 'Purchase Price', 'Estimated Value', 'Notes'],
                                ...userCollection.map(item => [
                                  item.funko_pops?.name || '',
                                  item.funko_pops?.series || '',
                                  item.funko_pops?.number || '',
                                  item.condition || 'mint',
                                  item.purchase_price || '',
                                  item.funko_pops?.estimated_value || '',
                                  item.personal_notes || ''
                                ])
                              ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
                              
                              const blob = new Blob([csvContent], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'popguide-collection.csv';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            variant="outline"
                            className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            disabled={userCollection.length === 0}
                          >
                            Download CSV
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Heart className="w-5 h-5 text-orange-500" />
                            <h4 className="font-semibold text-white">Wishlist Export</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Export your wishlist in CSV format for easy sharing
                          </p>
                          <Button 
                            onClick={() => {
                              const csvContent = [
                                ['Name', 'Series', 'Number', 'Estimated Value', 'Priority'],
                                ...wishlist.map(item => [
                                  item.funko_pops?.name || '',
                                  item.funko_pops?.series || '',
                                  item.funko_pops?.number || '',
                                  item.funko_pops?.estimated_value || '',
                                  item.priority || 'medium'
                                ])
                              ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
                              
                              const blob = new Blob([csvContent], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'popguide-wishlist.csv';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            variant="outline"
                            className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            disabled={wishlist.length === 0}
                          >
                            Download Wishlist
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className="w-8 h-8 text-orange-500" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Collection Summary</h3>
                        <p className="text-gray-400">Quick stats about your collection</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-500">{ownedCount}</div>
                        <div className="text-sm text-gray-400">Total Items</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">${totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Total Value</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">{uniqueSeries}</div>
                        <div className="text-sm text-gray-400">Unique Series</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-500">{wishlistCount}</div>
                        <div className="text-sm text-gray-400">Wishlist Items</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
      <MobileBottomNav />

      {/* Dialogs */}
      <EnhancedAddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
      
      {selectedItem && (
        <ItemDetailsDialog 
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        />
      )}

      <Dialog open={bulkActionsOpen} onOpenChange={setBulkActionsOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="mb-4 flex items-center gap-4">
            <Button size="sm" onClick={handleBulkSelectAll} disabled={userCollection.length === 0}>Select All</Button>
            <Button size="sm" onClick={handleBulkClear} disabled={bulkSelected.length === 0}>Clear</Button>
            <span className="text-sm text-gray-400">{bulkSelected.length} selected</span>
          </div>
          <div className="max-h-80 overflow-y-auto border rounded-lg divide-y divide-gray-800 mb-4">
            {userCollection.length === 0 ? (
              <div className="p-4 text-gray-400">No items in your collection.</div>
            ) : (
              userCollection.map((item) => (
                <div key={item.funko_pops?.id} className="flex items-center gap-3 p-3 hover:bg-gray-800">
                  <Checkbox
                    checked={bulkSelected.includes(item.funko_pops?.id)}
                    onCheckedChange={() => handleBulkSelect(item.funko_pops?.id)}
                    className="mr-2"
                  />
                  <img
                    src={item.funko_pops?.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                    alt={item.funko_pops?.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-white">{item.funko_pops?.name}</div>
                    <div className="text-xs text-gray-400 truncate">{item.funko_pops?.series} #{item.funko_pops?.number}</div>
                  </div>
                  <div className="text-xs text-gray-400">{item.condition || 'mint'}</div>
                  <div className="text-xs text-orange-400 font-semibold">${item.funko_pops?.estimated_value || 0}</div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-4">
            <Button
              size="sm"
              disabled={bulkSelected.length === 0}
              onClick={() => setBulkEditOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
            >
              Bulk Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={bulkSelected.length === 0}
              onClick={() => setConfirmRemoveOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400"
            >
              Bulk Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={importCsvOpen} onOpenChange={setImportCsvOpen}>
        <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Import Collection from CSV</DialogTitle>
          </DialogHeader>
          <div>CSV import UI coming soon.</div>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Bulk Remove</DialogTitle>
          </DialogHeader>
          <div className="mb-4">Are you sure you want to remove {bulkSelected.length} item(s) from your collection? This cannot be undone.</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRemoveOpen(false)}
              className="border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white"
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setRemoving(true);
                try {
                  await Promise.all(
                    bulkSelected.map(funkoPopId =>
                      removeFromCollection.mutateAsync({ funkoPopId, userId: user.id })
                    )
                  );
                  setBulkSelected([]);
                  setConfirmRemoveOpen(false);
                  setBulkActionsOpen(false);
                  toast({
                    title: "Removed",
                    description: `${bulkSelected.length} item(s) removed from your collection`,
                    variant: "default",
                  });
                } catch (err) {
                  toast({
                    title: "Error",
                    description: "Failed to remove one or more items.",
                    variant: "destructive",
                  });
                } finally {
                  setRemoving(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400"
              disabled={removing}
            >
              {removing ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Bulk Edit</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEditing(true);
              try {
                await Promise.all(
                  bulkSelected.map(async (funkoPopId) => {
                    const collectionItem = userCollection.find((item) => item.funko_pops?.id === funkoPopId);
                    if (!collectionItem) return;
                    const updates: any = {};
                    if (editCondition) updates.condition = editCondition;
                    if (editPrice) updates.purchase_price = parseFloat(editPrice);
                    if (editNotes) updates.personal_notes = editNotes;
                    if (Object.keys(updates).length === 0) return;
                    await supabase
                      .from('user_collections')
                      .update(updates)
                      .eq('id', collectionItem.id)
                      .eq('user_id', user.id);
                    await supabase.from('audit_log').insert({
                      user_id: user.id,
                      action: 'bulk_edit_collection',
                      details: { funkoPopId, updates },
                    });
                  })
                );
                setBulkEditOpen(false);
                setBulkSelected([]);
                setEditCondition('');
                setEditPrice('');
                setEditNotes('');
                toast({
                  title: 'Updated',
                  description: `${bulkSelected.length} item(s) updated`,
                  variant: 'default',
                });
              } catch (err) {
                toast({
                  title: 'Error',
                  description: 'Failed to update one or more items.',
                  variant: 'destructive',
                });
              } finally {
                setEditing(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm mb-1">Condition</label>
              <select
                value={editCondition}
                onChange={(e) => setEditCondition(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">-- No Change --</option>
                <option value="mint">Mint</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Purchase Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="-- No Change --"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="-- No Change --"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkEditOpen(false)}
                className="border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white"
                disabled={editing}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
                disabled={editing}
              >
                {editing ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Dashboard;
