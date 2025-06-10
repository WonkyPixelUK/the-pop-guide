import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, BarChart3, Users, Zap, LogOut, Settings, Heart, List, TrendingUp, MessageCircle, ChevronLeft, ChevronRight, Download, Badge, Filter, ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow, ArrowUpDown, ChevronDown, ChevronUp, User, Share2, HelpCircle, Menu, X, CheckCircle, Loader2 } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import WishlistGrid from "@/components/WishlistGrid";
import CustomListsManager from "@/components/CustomListsManager";
import CollectionAnalytics from "@/components/CollectionAnalytics";
import EnhancedAddItemDialog from "@/components/EnhancedAddItemDialog";
import PriceHistory from "@/components/PriceHistory";
import SupportCenter from "@/components/SupportCenter";
import { useAuth } from "@/hooks/useAuth";
import { useFunkoPops, useUserCollection, useAddToCollection } from "@/hooks/useFunkoPops";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link, useLocation } from "react-router-dom";
import GlobalSearch from '@/components/GlobalSearch';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import MobileBottomNav from '@/components/MobileBottomNav';
import DashboardHeader from '@/components/DashboardHeader';

import FriendsList from "@/components/FriendsList";
import Paywall from '@/components/Paywall';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useCustomLists } from '@/hooks/useCustomLists';
import MessagesInbox from '@/components/MessagesInbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useRemoveFromCollection } from '@/hooks/useFunkoPops';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [searchMode, setSearchMode] = useState<'collection' | 'database'>('collection');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedPop, setExpandedPop] = useState(null);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], vaulted: 'All', year: '', character: [], series: []
  });
  const [sort, setSort] = useState('high-to-low');
  const [ownedConfirmed, setOwnedConfirmed] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [selectedPopForList, setSelectedPopForList] = useState(null);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading } = useUserCollection(user?.id);
  const { wishlist, isLoading: wishlistLoading, addToWishlist, removeFromWishlist } = useWishlist();
  const addToCollection = useAddToCollection();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { lists = [] } = useCustomLists();
  const removeFromCollection = useRemoveFromCollection();
  const { currency } = useCurrency();
  const mainRef = useRef<HTMLDivElement>(null);

  // Helper function to get the primary image URL (handles both old and new storage methods)
  const getPrimaryImageUrl = (pop) => {
    // If there are user-uploaded images in image_urls array, use the first one
    if (pop.image_urls && Array.isArray(pop.image_urls) && pop.image_urls.length > 0) {
      return pop.image_urls[0];
    }
    // Fall back to the original scraped/imported image_url
    return pop.image_url;
  };

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

  // Sync activeSection with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam && sectionParam !== activeSection) {
      setActiveSection(sectionParam);
    }
  }, [location.search]);

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

  // Action button handlers
  const handleAddToCollection = (pop) => {
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
        setTimeout(() => setOwnedConfirmed(false), 5000);
      },
      onError: (error) => {
        setAddingToCollection(false);
        if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          toast({
            title: '✅ Already in Collection',
            description: `${pop.name} is already in your collection.`,
            duration: 3000
          });
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

  const handleWishlist = (pop) => {
    const isInWishlist = wishlist.some((w) => w.funko_pop_id === pop.id);
    if (isInWishlist) {
      removeFromWishlist.mutate(pop.id, {
        onSuccess: () => {
          toast({ title: '💔 Removed from Wishlist', description: `${pop.name} removed from your wishlist.` });
        }
      });
    } else {
      addToWishlist.mutate(pop.id, {
        onSuccess: () => {
          toast({ title: '❤️ Added to Wishlist!', description: `${pop.name} added to your wishlist.` });
        }
      });
    }
  };

  const handleShare = (pop) => {
    const url = `${window.location.origin}/pop/${pop.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this Pop with others.' });
  };

  const handleAddToList = (pop) => {
    setSelectedPopForList(pop);
    setListModalOpen(true);
  };

  const handleListSelect = (listId) => {
    if (!selectedPopForList) return;
    setAddingToListId(listId);
    // Note: You'll need to implement addItemToList from useCustomLists hook
    // addItemToList.mutate({ listId, funkoPopId: selectedPopForList.id }, {
    //   onSuccess: () => {
    //     toast({
    //       title: '✅ Added to List!',
    //       description: `${selectedPopForList.name} has been added to your list.`,
    //       duration: 3000
    //     });
    //     setListModalOpen(false);
    //     setSelectedPopForList(null);
    //     setAddingToListId(null);
    //   },
    //   onError: (error) => {
    //     toast({
    //       title: '❌ Failed to Add',
    //       description: error.message || 'Could not add to list. Please try again.',
    //       variant: 'destructive',
    //       duration: 5000
    //     });
    //     setAddingToListId(null);
    //   }
    // });
  };

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

  // Filtering logic for dashboard tabs - handle both collection and database modes
  const filteredItems = searchMode === 'database' 
    ? funkoPops.filter(pop => {
        // Database search - search through all funkoPops
        const matchesSearch = !searchQuery || 
          pop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pop.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pop.number && pop.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.fandom && pop.fandom.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.upc && pop.upc.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.upc_a && pop.upc_a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.ean_13 && pop.ean_13.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.amazon_asin && pop.amazon_asin.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.country_of_registration && pop.country_of_registration.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.brand && pop.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.model_number && pop.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.size && pop.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.color && pop.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.weight && pop.weight.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.product_dimensions && pop.product_dimensions.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.variant && pop.variant.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (pop.description && pop.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesSearch;
      }).map(pop => ({
        funko_pops: pop,
        // Add fake collection fields for compatibility
        id: pop.id,
        condition: null,
        purchase_price: null,
        user_id: user?.id,
        funko_pop_id: pop.id,
        created_at: new Date().toISOString()
      }))
    : userCollection.filter(item => {
        // Collection search - existing logic
        const matchesSearch = !searchQuery || 
          item.funko_pops?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.funko_pops?.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.funko_pops?.number && item.funko_pops.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.fandom && item.funko_pops.fandom.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.upc && item.funko_pops.upc.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.upc_a && item.funko_pops.upc_a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.ean_13 && item.funko_pops.ean_13.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.amazon_asin && item.funko_pops.amazon_asin.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.country_of_registration && item.funko_pops.country_of_registration.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.brand && item.funko_pops.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.model_number && item.funko_pops.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.size && item.funko_pops.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.color && item.funko_pops.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.weight && item.funko_pops.weight.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.product_dimensions && item.funko_pops.product_dimensions.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.variant && item.funko_pops.variant.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.funko_pops?.description && item.funko_pops.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply all filters
        const matchesCategory = !filters.category.length || filters.category.includes(item.funko_pops?.category);
        const matchesFandom = !filters.fandom.length || filters.fandom.includes(item.funko_pops?.fandom);
        const matchesGenre = !filters.genre.length || filters.genre.includes(item.funko_pops?.genre);
        const matchesEdition = !filters.edition.length || filters.edition.includes(item.funko_pops?.edition);
        const matchesVaulted = filters.vaulted === 'All' || (filters.vaulted === 'Vaulted' ? item.funko_pops?.is_vaulted : !item.funko_pops?.is_vaulted);
        const matchesYear = !filters.year || String(item.funko_pops?.release_year) === filters.year;
        const matchesCharacter = !filters.character.length || filters.character.includes(item.funko_pops?.name);
        const matchesSeries = !filters.series.length || filters.series.includes(item.funko_pops?.series);
        return matchesSearch && matchesCategory && matchesFandom && matchesGenre && matchesEdition && matchesVaulted && matchesYear && matchesCharacter && matchesSeries;
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
    owned: searchMode === 'database' ? userCollection.some(collectionItem => collectionItem.funko_pop_id === item.funko_pops?.id) : true,
    condition: item.condition,
    purchase_price: item.purchase_price,
  });

  // Handle expanding pop details
  const handleExpandPop = (pop) => {
    console.log('Expanding pop:', pop?.name);
    setExpandedPop(expandedPop?.id === pop.id ? null : pop);
  };

  // Get product badges
  const getProductBadges = (pop) => {
    const badges = [];
    
    if (pop.data_sources?.includes('new-releases') || pop.data_sources?.includes('Funko Europe')) {
      badges.push({
        text: 'New Release',
        className: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: Zap
      });
    }
    
    if (pop.is_chase) {
      badges.push({
        text: 'Chase',
        className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: Zap
      });
    }
    
    if (pop.is_exclusive) {
      badges.push({
        text: 'Exclusive',
        className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: Badge
      });
    }
    
    if (pop.is_vaulted) {
      badges.push({
        text: 'Vaulted',
        className: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: Badge
      });
    }
    
    return badges;
  };

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
      <SEO title="Dashboard | The Pop Guide" description="Your personal Funko Pop collection dashboard." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        
        <DashboardHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            searchMode === 'database' ? 'Search entire Funko database...' :
            activeSection === 'recently-added' ? 'Search recently added...' :
            activeSection === 'items-owned' ? 'Search owned items...' :
            activeSection === 'wishlist' ? 'Search wishlist...' :
            'Search your collection...'
          }
          showSearch={true}
          onAddItem={() => setIsAddDialogOpen(true)}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
        />



        {/* Main Content */}
        <main className="pb-20"> {/* Account for bottom navigation */}
          {/* Quick Stats Cards - Responsive Container */}
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/70 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setActiveSection("analytics")}> 
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{formatCurrency(totalValue, currency)}</div>
                <div className="text-xs text-gray-400">Total Value</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/70 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setActiveSection("items-owned")}> 
              <CardContent className="p-4 text-center">
                <Badge className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{ownedCount}</div>
                <div className="text-xs text-gray-400">Items Owned</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/70 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setActiveSection("wishlist")}> 
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{wishlistCount}</div>
                <div className="text-xs text-gray-400">Wishlist</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/70 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setActiveSection("analytics")}> 
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{uniqueSeries}</div>
                <div className="text-xs text-gray-400">Series</div>
              </CardContent>
            </Card>
          </div>

            {/* Section Header + Mobile-Friendly Filters */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {activeSection === 'recently-added' && <><Zap className="w-6 h-6 text-orange-500" />Recently Added</>}
                {activeSection === 'items-owned' && <><Badge className="w-6 h-6 text-orange-500" />Items Owned</>}
                {activeSection === 'wishlist' && <><Heart className="w-6 h-6 text-orange-500" />My Wishlist</>}
                {activeSection === 'analytics' && <><TrendingUp className="w-6 h-6 text-orange-500" />Analytics</>}
                {activeSection === 'lists' && <><List className="w-6 h-6 text-orange-500" />Custom Lists</>}
              </h2>
              
              {/* Mobile-Friendly Filter Button */}
              {(activeSection === 'recently-added' || activeSection === 'items-owned' || activeSection === 'wishlist') && (
                <Button 
                  variant="outline"
                  onClick={() => setFiltersOpen(true)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter & Sort
                </Button>
              )}
            </div>
          </div>



          {activeSection === 'recently-added' && (
            userCollection.length === 0 ? (
              <AnimatedFallback icon={Zap} message="No items found! Time to add some Pops to your collection." />
            ) : (
              <div className="space-y-6">
                {sortedItems.slice(0, 24).map((item) => {
                  const pop = item.funko_pops;
                  const isExpanded = expandedPop?.id === pop?.id;
                  const badges = getProductBadges(pop);
                  
                  // If this pop is expanded, render it full width
                  if (isExpanded) {
                    return (
                      <div key={pop.id} className="container mx-auto px-4 max-w-7xl">
                        {/* Compact card for expanded item */}
                        <Card 
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition cursor-pointer mb-4" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                            <div className="text-sm text-gray-400">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                            <div className="text-sm text-orange-400 font-bold">
                              {item.purchase_price ? (
                                <>
                                  {formatCurrency(item.purchase_price, currency)} <span className="text-xs text-gray-400">(Your Price)</span>
                                </>
                              ) : (
                                formatCurrency(pop.estimated_value || 0, currency)
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <ChevronUp className="w-4 h-4 mr-1" />
                            <span>Hide Details</span>
                          </div>
                        </Card>

                        {/* Full width expanded details */}
                        <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Large Image */}
                            <div className="lg:w-96 lg:flex-shrink-0">
                              <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                                {getPrimaryImageUrl(pop) ? (
                                  <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="text-6xl mb-4">📦</div>
                                    <div className="text-lg">No Image Available</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant={pop.owned || ownedConfirmed ? 'default' : 'outline'}
                                  className={
                                    pop.owned || ownedConfirmed
                                      ? ownedConfirmed 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg' 
                                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium'
                                      : addingToCollection 
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium' 
                                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCollection(pop);
                                  }}
                                  disabled={pop.owned || ownedConfirmed || addingToCollection}
                                >
                                  {addingToCollection ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (pop.owned || ownedConfirmed) ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1.5" />
                                      {ownedConfirmed ? 'Added!' : 'Owned'}
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-1.5" />
                                      Own this Pop
                                    </>
                                  )}
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  className={`h-9 text-sm font-medium transition-all duration-200 ${
                                    wishlist.some((w) => w.funko_pop_id === pop.id) 
                                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-500/20 border-0 hover:shadow-lg' 
                                      : 'border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md hover:shadow-red-500/20 bg-red-500/5'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(pop);
                                  }}
                                >
                                  <Heart className={`w-4 h-4 mr-1.5 ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'fill-current' : ''}`} />
                                  {wishlist.some((w) => w.funko_pop_id === pop.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                </Button>

                                <Button 
                                  variant="outline" 
                                  className="border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20 h-9 text-sm font-medium transition-all duration-200 bg-purple-500/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToList(pop);
                                  }}
                                >
                                  <List className="w-4 h-4 mr-1.5" />
                                  Add to List
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="border border-gray-500/50 text-gray-300 hover:bg-gray-500 hover:text-white hover:border-gray-500 hover:shadow-md hover:shadow-gray-500/20 h-9 text-sm font-medium transition-all duration-200 bg-gray-500/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(pop);
                                  }}
                                >
                                  <Share2 className="w-4 h-4 mr-1.5" />
                                  Share
                                </Button>

                                {/* View Full Details Button - spans both columns */}
                                <Button 
                                  asChild
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white col-span-2 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 border-0"
                                >
                                  <Link to={`/pop/${pop.id}`} className="flex items-center justify-center">
                                    <Search className="w-4 h-4 mr-1.5" />
                                    View Full Details
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="flex-1 min-w-0">
                              {/* Basic Info Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🏷️</span>
                                    Category
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.category || 'Pop!'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📝</span>
                                    Number
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">💎</span>
                                    {item.purchase_price ? 'Your Purchase Price' : 'Estimated Value'}
                                  </div>
                                  <div className="font-semibold text-white text-lg">
                                    {item.purchase_price ? formatCurrency(item.purchase_price, currency) : formatCurrency(pop.estimated_value || 0, currency)}
                                  </div>
                                  {item.purchase_price && (
                                    <div className="text-xs text-blue-400 mt-1">
                                      Market pricing updates within 5 working days
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎭</span>
                                    Fandom
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.fandom || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎬</span>
                                    Genre
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.genre || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📦</span>
                                    Edition
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.edition || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📅</span>
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
                                  <div className="font-semibold text-white text-lg">{pop.owned ? 'Yes' : 'No'}</div>
                                </div>
                              </div>

                              {/* Product Details Section */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">UPC:</span>
                                    <span className="text-white ml-2">{pop.upc || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">UPC-A:</span>
                                    <span className="text-white ml-2">{pop.upc_a || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">EAN-13:</span>
                                    <span className="text-white ml-2">{pop.ean13 || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Brand:</span>
                                    <span className="text-white ml-2">{pop.brand || 'Funko'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Color:</span>
                                    <span className="text-white ml-2">{pop.color || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Dimensions:</span>
                                    <span className="text-white ml-2">{pop.dimensions || '6.25 in'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Details Section */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">Variant:</span>
                                    <span className="text-white ml-2">{pop.is_exclusive ? 'Exclusive' : pop.is_chase ? 'Chase' : 'Standard'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Exclusive to:</span>
                                    <span className="text-white ml-2">{pop.is_exclusive ? 'Yes' : '—'}</span>
                                  </div>
                                  {pop.description && (
                                    <div className="col-span-1 md:col-span-2">
                                      <span className="text-gray-400">Description:</span>
                                      <p className="text-white mt-1">{pop.description}</p>
                                    </div>
                                  )}
                                  {item.personal_notes && (
                                    <div className="col-span-1 md:col-span-2">
                                      <span className="text-gray-400">Your Notes:</span>
                                      <p className="text-white mt-1">{item.personal_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Price History */}
                              <div className="border-t border-gray-600 pt-6">
                                <PriceHistory 
                                  funkoPopId={pop.id} 
                                  funkoPop={{
                                    id: pop.id,
                                    name: pop.name,
                                    series: pop.series,
                                    number: pop.number,
                                    image_url: getPrimaryImageUrl(pop),
                                    estimated_value: item.purchase_price || pop.estimated_value
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  }
                  
                  // Regular grid item (not expanded) - return null, we'll render these separately
                  return null;
                })}
                
                {/* RESPONSIVE GRID for non-expanded items */}
                <div className="container mx-auto px-4 max-w-7xl">
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'}`}>
                    {sortedItems.slice(0, 24).map((item) => {
                      const pop = item.funko_pops;
                      const isExpanded = expandedPop?.id === pop?.id;
                      const badges = getProductBadges(pop);
                      
                      // Skip expanded items (they're rendered above)
                      if (isExpanded) return null;
                      
                      return isMobile ? (
                        // MOBILE: Horizontal card layout
                        <Card 
                          key={pop.id}
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition-all duration-200 cursor-pointer" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                            <div className="text-sm text-gray-400 truncate">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                            <div className="text-sm text-orange-400 font-bold">
                              {item.purchase_price ? (
                                <>
                                  {formatCurrency(item.purchase_price, currency)} <span className="text-xs text-gray-400">(Your Price)</span>
                                </>
                              ) : (
                                formatCurrency(pop.estimated_value || 0, currency)
                              )}
                            </div>
                            <div className="text-xs text-gray-400">Condition: {item.condition || 'Mint'}</div>
                            
                            {/* Mobile Badges */}
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
                          </div>
                          
                          <div className="flex flex-col items-center text-gray-400 text-sm ml-2">
                            <ChevronDown className="w-5 h-5 mb-1" />
                            <span className="text-xs">Details</span>
                          </div>
                        </Card>
                      ) : (
                        // DESKTOP: Vertical card layout (smaller than before)
                        <Card 
                          key={pop.id}
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-full aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-12 h-12 text-orange-400 animate-pulse" />
                            )}
                          </div>
                          
                          {/* Product Badges */}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2 justify-center">
                              {badges.slice(0, 1).map((badge, idx) => {
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
                          
                          <div className="font-semibold text-white text-center text-sm mb-1 line-clamp-2">{pop.name}</div>
                          <div className="text-xs text-gray-400 text-center mb-2 truncate">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                          <div className="text-sm text-orange-400 font-bold text-center mb-2">
                            {item.purchase_price ? (
                              <>
                                {formatCurrency(item.purchase_price, currency)}
                                <div className="text-xs text-gray-400">(Your Price)</div>
                              </>
                            ) : (
                              formatCurrency(pop.estimated_value || 0, currency)
                            )}
                          </div>
                          <div className="text-xs text-gray-400 text-center mb-3">Condition: {item.condition || 'Mint'}</div>
                          
                          <Button 
                            variant="default"
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-auto text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandPop(pop);
                            }}
                          >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
          {activeSection === 'items-owned' && (
            userCollection.length === 0 ? (
              <AnimatedFallback icon={Zap} message="No items found! Time to add some Pops to your collection." />
            ) : (
              <div className="space-y-6">
                {sortedItems.map((item) => {
                  const pop = item.funko_pops;
                  const isExpanded = expandedPop?.id === pop?.id;
                  const badges = getProductBadges(pop);
                  
                  // If this pop is expanded, render it full width
                  if (isExpanded) {
                    return (
                      <div key={pop.id} className="container mx-auto px-4 max-w-7xl">
                        {/* Compact card for expanded item */}
                        <Card 
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition cursor-pointer mb-4" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                            <div className="text-sm text-gray-400">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                            <div className="text-sm text-orange-400 font-bold">
                              {item.purchase_price ? (
                                <>
                                  {formatCurrency(item.purchase_price, currency)} <span className="text-xs text-gray-400">(Your Price)</span>
                                </>
                              ) : (
                                formatCurrency(pop.estimated_value || 0, currency)
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <ChevronUp className="w-4 h-4 mr-1" />
                            <span>Hide Details</span>
                          </div>
                        </Card>

                        {/* Full width expanded details */}
                        <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Large Image */}
                            <div className="lg:w-96 lg:flex-shrink-0">
                              <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                                {getPrimaryImageUrl(pop) ? (
                                  <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="text-6xl mb-4">📦</div>
                                    <div className="text-lg">No Image Available</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant={pop.owned || ownedConfirmed ? 'default' : 'outline'}
                                  className={
                                    pop.owned || ownedConfirmed
                                      ? ownedConfirmed 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg' 
                                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium'
                                      : addingToCollection 
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium' 
                                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCollection(pop);
                                  }}
                                  disabled={pop.owned || ownedConfirmed || addingToCollection}
                                >
                                  {addingToCollection ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (pop.owned || ownedConfirmed) ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1.5" />
                                      {ownedConfirmed ? 'Added!' : 'Owned'}
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-1.5" />
                                      Own this Pop
                                    </>
                                  )}
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  className={`h-9 text-sm font-medium transition-all duration-200 ${
                                    wishlist.some((w) => w.funko_pop_id === pop.id) 
                                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-500/20 border-0 hover:shadow-lg' 
                                      : 'border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md hover:shadow-red-500/20 bg-red-500/5'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(pop);
                                  }}
                                >
                                  <Heart className={`w-4 h-4 mr-1.5 ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'fill-current' : ''}`} />
                                  {wishlist.some((w) => w.funko_pop_id === pop.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                </Button>

                                <Button 
                                  variant="outline" 
                                  className="border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20 h-9 text-sm font-medium transition-all duration-200 bg-purple-500/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToList(pop);
                                  }}
                                >
                                  <List className="w-4 h-4 mr-1.5" />
                                  Add to List
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="border border-gray-500/50 text-gray-300 hover:bg-gray-500 hover:text-white hover:border-gray-500 hover:shadow-md hover:shadow-gray-500/20 h-9 text-sm font-medium transition-all duration-200 bg-gray-500/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(pop);
                                  }}
                                >
                                  <Share2 className="w-4 h-4 mr-1.5" />
                                  Share
                                </Button>

                                {/* View Full Details Button - spans both columns */}
                                <Button 
                                  asChild
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white col-span-2 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 border-0"
                                >
                                  <Link to={`/pop/${pop.id}`} className="flex items-center justify-center">
                                    <Search className="w-4 h-4 mr-1.5" />
                                    View Full Details
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="flex-1 min-w-0">
                              {/* Basic Info Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🏷️</span>
                                    Category
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.category || 'Pop!'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📝</span>
                                    Number
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">💎</span>
                                    {item.purchase_price ? 'Your Purchase Price' : 'Estimated Value'}
                                  </div>
                                  <div className="font-semibold text-white text-lg">
                                    {item.purchase_price ? formatCurrency(item.purchase_price, currency) : formatCurrency(pop.estimated_value || 0, currency)}
                                  </div>
                                  {item.purchase_price && (
                                    <div className="text-xs text-blue-400 mt-1">
                                      Market pricing updates within 5 working days
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎭</span>
                                    Fandom
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.fandom || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">🎬</span>
                                    Genre
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.genre || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📦</span>
                                    Edition
                                  </div>
                                  <div className="font-semibold text-white text-lg">{pop.edition || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                                    <span className="mr-2">📅</span>
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
                                  <div className="font-semibold text-white text-lg">{pop.owned ? 'Yes' : 'No'}</div>
                                </div>
                              </div>

                              {/* Product Details Section */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">UPC:</span>
                                    <span className="text-white ml-2">{pop.upc || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">UPC-A:</span>
                                    <span className="text-white ml-2">{pop.upc_a || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">EAN-13:</span>
                                    <span className="text-white ml-2">{pop.ean13 || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Brand:</span>
                                    <span className="text-white ml-2">{pop.brand || 'Funko'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Color:</span>
                                    <span className="text-white ml-2">{pop.color || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Dimensions:</span>
                                    <span className="text-white ml-2">{pop.dimensions || '6.25 in'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Details Section */}
                              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">Variant:</span>
                                    <span className="text-white ml-2">{pop.is_exclusive ? 'Exclusive' : pop.is_chase ? 'Chase' : 'Standard'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Exclusive to:</span>
                                    <span className="text-white ml-2">{pop.is_exclusive ? 'Yes' : '—'}</span>
                                  </div>
                                  {pop.description && (
                                    <div className="col-span-1 md:col-span-2">
                                      <span className="text-gray-400">Description:</span>
                                      <p className="text-white mt-1">{pop.description}</p>
                                    </div>
                                  )}
                                  {item.personal_notes && (
                                    <div className="col-span-1 md:col-span-2">
                                      <span className="text-gray-400">Your Notes:</span>
                                      <p className="text-white mt-1">{item.personal_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Price History */}
                              <div className="border-t border-gray-600 pt-6">
                                <PriceHistory 
                                  funkoPopId={pop.id} 
                                  funkoPop={{
                                    id: pop.id,
                                    name: pop.name,
                                    series: pop.series,
                                    number: pop.number,
                                    image_url: getPrimaryImageUrl(pop),
                                    estimated_value: item.purchase_price || pop.estimated_value
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  }
                  
                  // Regular grid item (not expanded) - return null, we'll render these separately
                  return null;
                })}
                
                {/* RESPONSIVE GRID for non-expanded items */}
                <div className="container mx-auto px-4 max-w-7xl">
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'}`}>
                    {sortedItems.map((item) => {
                      const pop = item.funko_pops;
                      const isExpanded = expandedPop?.id === pop?.id;
                      const badges = getProductBadges(pop);
                      
                      // Skip expanded items (they're rendered above)
                      if (isExpanded) return null;
                      
                      return isMobile ? (
                        // MOBILE: Horizontal card layout
                        <Card 
                          key={pop.id}
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition-all duration-200 cursor-pointer" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                            <div className="text-sm text-gray-400 truncate">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                            <div className="text-sm text-orange-400 font-bold">
                              {item.purchase_price ? (
                                <>
                                  {formatCurrency(item.purchase_price, currency)} <span className="text-xs text-gray-400">(Your Price)</span>
                                </>
                              ) : (
                                formatCurrency(pop.estimated_value || 0, currency)
                              )}
                            </div>
                            <div className="text-xs text-gray-400">Condition: {item.condition || 'Mint'}</div>
                            
                            {/* Mobile Badges */}
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
                          </div>
                          
                          <div className="flex flex-col items-center text-gray-400 text-sm ml-2">
                            <ChevronDown className="w-5 h-5 mb-1" />
                            <span className="text-xs">Details</span>
                          </div>
                        </Card>
                      ) : (
                        // DESKTOP: Vertical card layout (smaller than before)
                        <Card 
                          key={pop.id}
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer" 
                          onClick={() => handleExpandPop(pop)}
                        >
                          <div className="w-full aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                            ) : (
                              <User className="w-12 h-12 text-orange-400 animate-pulse" />
                            )}
                          </div>
                          
                          {/* Product Badges */}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2 justify-center">
                              {badges.slice(0, 1).map((badge, idx) => {
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
                          
                          <div className="font-semibold text-white text-center text-sm mb-1 line-clamp-2">{pop.name}</div>
                          <div className="text-xs text-gray-400 text-center mb-2 truncate">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                          <div className="text-sm text-orange-400 font-bold text-center mb-2">
                            {item.purchase_price ? (
                              <>
                                {formatCurrency(item.purchase_price, currency)}
                                <div className="text-xs text-gray-400">(Your Price)</div>
                              </>
                            ) : (
                              formatCurrency(pop.estimated_value || 0, currency)
                            )}
                          </div>
                          <div className="text-xs text-gray-400 text-center mb-3">Condition: {item.condition || 'Mint'}</div>
                          
                          <Button 
                            variant="default"
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-auto text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandPop(pop);
                            }}
                          >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
          {activeSection === 'wishlist' && (
            <div className="container mx-auto px-4 max-w-7xl">
              {wishlist.length === 0 ? (
                <AnimatedFallback icon={Heart} message="Your wishlist is empty!" />
              ) : (
                <WishlistGrid items={sortedItems} searchQuery={searchQuery} />
              )}
            </div>
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
            <div className="container mx-auto px-4 max-w-7xl">
              <CustomListsManager />
            </div>
          )}
          {activeSection === 'friends' && (
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="container mx-auto px-4 max-w-7xl"><FriendsList /></div>
            </div>
          )}
          {activeSection === 'analytics' && (
            <AdvancedAnalytics 
              userCollection={userCollection}
              funkoPops={funkoPops}
              profile={null}
            />
          )}
          {activeSection === 'messages' && (
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="container mx-auto px-4 max-w-7xl"><MessagesInbox /></div>
            </div>
          )}
          {activeSection === 'downloads' && (
            <div className="container mx-auto px-4 max-w-7xl space-y-6">
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
                      <div className="text-2xl font-bold text-green-500">{formatCurrency(totalValue, currency)}</div>
                      <div className="text-sm text-gray-400">Total Value</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">{uniqueSeries}</div>
                      <div className="text-sm text-gray-400">Unique Series</div>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === 'new-releases' && (
            (() => {
              // Filter items that have new-releases in their data_sources
              const newReleaseItems = userCollection.filter(item => 
                item.funko_pops?.data_sources?.includes('new-releases') || 
                item.funko_pops?.data_sources?.includes('Funko Europe')
              );
              
              if (newReleaseItems.length === 0) {
                return <AnimatedFallback icon={Zap} message="No new releases in your collection yet!" />;
              }
              
              return (
                <div className="container mx-auto px-4 max-w-7xl space-y-6">
                  {newReleaseItems.map((item) => {
                    const pop = item.funko_pops;
                    const isExpanded = expandedPop?.id === pop?.id;
                    const badges = getProductBadges(pop);
                    
                    // If this pop is expanded, render it full width
                    if (isExpanded) {
                      return (
                        <div key={pop.id} className="container mx-auto px-4 max-w-7xl">
                          {/* Compact card for expanded item */}
                          <Card 
                            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-row items-center hover:shadow-lg transition cursor-pointer mb-4" 
                            onClick={() => handleExpandPop(pop)}
                          >
                            <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                              {getPrimaryImageUrl(pop) ? (
                                <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                              ) : (
                                <User className="w-8 h-8 text-orange-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-lg truncate">{pop.name}</div>
                              <div className="text-sm text-gray-400">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                              <div className="text-sm text-orange-400 font-bold">
                                {item.purchase_price ? (
                                  <>
                                    {formatCurrency(item.purchase_price, currency)} <span className="text-xs text-gray-400">(Your Price)</span>
                                  </>
                                ) : (
                                  formatCurrency(pop.estimated_value || 0, currency)
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <ChevronUp className="w-4 h-4 mr-1" />
                              <span>Hide Details</span>
                            </div>
                          </Card>

                          {/* Full width expanded details */}
                          <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                            <div className="flex flex-col lg:flex-row gap-8">
                              {/* Left Side - Large Image */}
                              <div className="lg:w-96 lg:flex-shrink-0">
                                <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                                  {getPrimaryImageUrl(pop) ? (
                                    <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                      <div className="text-6xl mb-4">📦</div>
                                      <div className="text-lg">No Image Available</div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={pop.owned || ownedConfirmed ? 'default' : 'outline'}
                                    className={
                                      pop.owned || ownedConfirmed
                                        ? ownedConfirmed 
                                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg' 
                                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:text-white shadow-md shadow-green-500/20 border-0 h-9 text-sm font-medium'
                                        : addingToCollection 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium' 
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:text-white shadow-md shadow-orange-500/20 border-0 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg'
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCollection(pop);
                                    }}
                                    disabled={pop.owned || ownedConfirmed || addingToCollection}
                                  >
                                    {addingToCollection ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                        Adding...
                                      </>
                                    ) : (pop.owned || ownedConfirmed) ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        {ownedConfirmed ? 'Added!' : 'Owned'}
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Own this Pop
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Button 
                                    variant="outline"
                                    className={`h-9 text-sm font-medium transition-all duration-200 ${
                                      wishlist.some((w) => w.funko_pop_id === pop.id) 
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-500/20 border-0 hover:shadow-lg' 
                                        : 'border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md hover:shadow-red-500/20 bg-red-500/5'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWishlist(pop);
                                    }}
                                  >
                                    <Heart className={`w-4 h-4 mr-1.5 ${wishlist.some((w) => w.funko_pop_id === pop.id) ? 'fill-current' : ''}`} />
                                    {wishlist.some((w) => w.funko_pop_id === pop.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                  </Button>

                                  <Button 
                                    variant="outline" 
                                    className="border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20 h-9 text-sm font-medium transition-all duration-200 bg-purple-500/5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToList(pop);
                                    }}
                                  >
                                    <List className="w-4 h-4 mr-1.5" />
                                    Add to List
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    className="border border-gray-500/50 text-gray-300 hover:bg-gray-500 hover:text-white hover:border-gray-500 hover:shadow-md hover:shadow-gray-500/20 h-9 text-sm font-medium transition-all duration-200 bg-gray-500/5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(pop);
                                    }}
                                  >
                                    <Share2 className="w-4 h-4 mr-1.5" />
                                    Share
                                  </Button>

                                  {/* View Full Details Button - spans both columns */}
                                  <Button 
                                    asChild
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white col-span-2 h-9 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 border-0"
                                  >
                                    <Link to={`/pop/${pop.id}`} className="flex items-center justify-center">
                                      <Search className="w-4 h-4 mr-1.5" />
                                      View Full Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>

                              {/* Right Side - Details */}
                              <div className="flex-1 min-w-0">
                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">🏷️</span>
                                      Category
                                    </div>
                                    <div className="font-semibold text-white text-lg">{pop.category || 'Pop!'}</div>
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">📝</span>
                                      Number
                                    </div>
                                    <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">💎</span>
                                      {item.purchase_price ? 'Your Purchase Price' : 'Estimated Value'}
                                    </div>
                                    <div className="font-semibold text-white text-lg">
                                      {item.purchase_price ? formatCurrency(item.purchase_price, currency) : formatCurrency(pop.estimated_value || 0, currency)}
                                    </div>
                                    {item.purchase_price && (
                                      <div className="text-xs text-blue-400 mt-1">
                                        Market pricing updates within 5 working days
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">🎭</span>
                                      Fandom
                                    </div>
                                    <div className="font-semibold text-white text-lg">{pop.fandom || '—'}</div>
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">🎬</span>
                                      Genre
                                    </div>
                                    <div className="font-semibold text-white text-lg">{pop.genre || '—'}</div>
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">📦</span>
                                      Edition
                                    </div>
                                    <div className="font-semibold text-white text-lg">{pop.edition || '—'}</div>
                                  </div>
                                  
                                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                                      <span className="mr-2">📅</span>
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
                                      <span className="mr-2">⚡</span>
                                      Source
                                    </div>
                                    <div className="font-semibold text-green-300 text-lg">New Release</div>
                                  </div>
                                </div>

                                {/* Product Details Section */}
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                  <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400">UPC:</span>
                                      <span className="text-white ml-2">{pop.upc || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">UPC-A:</span>
                                      <span className="text-white ml-2">{pop.upc_a || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">EAN-13:</span>
                                      <span className="text-white ml-2">{pop.ean13 || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Brand:</span>
                                      <span className="text-white ml-2">{pop.brand || 'Funko'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Color:</span>
                                      <span className="text-white ml-2">{pop.color || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Dimensions:</span>
                                      <span className="text-white ml-2">{pop.dimensions || '6.25 in'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Details Section */}
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
                                  <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400">Variant:</span>
                                      <span className="text-white ml-2">{pop.is_exclusive ? 'Exclusive' : pop.is_chase ? 'Chase' : 'Standard'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Exclusive to:</span>
                                      <span className="text-white ml-2">{pop.is_exclusive ? 'Yes' : '—'}</span>
                                    </div>
                                    {pop.description && (
                                      <div className="col-span-1 md:col-span-2">
                                        <span className="text-gray-400">Description:</span>
                                        <p className="text-white mt-1">{pop.description}</p>
                                      </div>
                                    )}
                                    {item.personal_notes && (
                                      <div className="col-span-1 md:col-span-2">
                                        <span className="text-gray-400">Your Notes:</span>
                                        <p className="text-white mt-1">{item.personal_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Price History */}
                                <div className="border-t border-gray-600 pt-6">
                                  <PriceHistory 
                                    funkoPopId={pop.id} 
                                    funkoPop={{
                                      id: pop.id,
                                      name: pop.name,
                                      series: pop.series,
                                      number: pop.number,
                                      image_url: getPrimaryImageUrl(pop),
                                      estimated_value: item.purchase_price || pop.estimated_value
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    }
                    
                    // Regular grid item (not expanded) - return null, we'll render these separately
                    return null;
                  })}
                  
                  {/* Regular grid for non-expanded items */}
                  <div className={`grid gap-4 px-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {newReleaseItems.map((item) => {
                      const pop = item.funko_pops;
                      const isExpanded = expandedPop?.id === pop?.id;
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
                            {getPrimaryImageUrl(pop) ? (
                              <img src={getPrimaryImageUrl(pop)} alt={pop.name} className="w-full h-full object-contain" />
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
                          <div className="text-xs text-gray-400 mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                          <div className="text-xs text-orange-400 font-bold mb-2">
                            {item.purchase_price ? (
                              <>
                                {formatCurrency(item.purchase_price, currency)} <span className="text-gray-400">(Your Price)</span>
                              </>
                            ) : (
                              formatCurrency(pop.estimated_value || 0, currency)
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">Condition: {item.condition || 'Mint'}</div>
                          
                          <Button 
                            variant="default"
                            className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-auto py-2 px-4 rounded-lg font-semibold transition-all duration-200"
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
              );
            })()
          )}
          {activeSection === 'support' && (
            <div className="container mx-auto px-4 max-w-7xl">
              <SupportCenter />
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav />

      {/* Dialogs */}
      <EnhancedAddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />

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
                  <div className="text-xs text-orange-400 font-semibold">{formatCurrency(item.funko_pops?.estimated_value || 0, currency)}</div>
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

      {/* FILTER DIALOG - RESPONSIVE FOR MOBILE & DESKTOP */}
      {isMobile ? (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="h-[80vh] bg-gray-900 border-gray-700">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Filter & Sort</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setFiltersOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Sort Options */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Sort By</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <Button
                        key={opt.value}
                        variant={sort === opt.value ? "default" : "outline"}
                        className={`justify-start h-12 ${sort === opt.value ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}
                        onClick={() => setSort(opt.value)}
                      >
                        <opt.icon className="w-5 h-5 mr-3" />
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                <div className="border-t border-gray-600 pt-4">
                  <Button
                    onClick={() => {
                      setFilters({ category: [], fandom: [], genre: [], edition: [], character: [], series: [], vaulted: 'All', year: '' });
                      setSort('high-to-low');
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-orange-400 hover:bg-orange-600 hover:text-white h-12"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-4 mt-4">
                <Button 
                  onClick={() => setFiltersOpen(false)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Filter & Sort</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Sort Options */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Sort By</h4>
                <div className="grid grid-cols-1 gap-2">
                  {SORT_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      variant={sort === opt.value ? "default" : "outline"}
                      className={`justify-start h-10 ${sort === opt.value ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}
                      onClick={() => setSort(opt.value)}
                    >
                      <opt.icon className="w-4 h-4 mr-2" />
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={() => {
                    setFilters({ category: [], fandom: [], genre: [], edition: [], character: [], series: [], vaulted: 'All', year: '' });
                    setSort('high-to-low');
                  }}
                  variant="outline"
                  className="w-full border-gray-600 text-orange-400 hover:bg-orange-600 hover:text-white h-10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-600 pt-4 mt-4">
              <Button 
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10"
              >
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Dashboard;
