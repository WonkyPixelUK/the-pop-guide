import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BarChart3, Users, Zap, LogOut, Settings, Heart, List, TrendingUp, MessageCircle } from "lucide-react";
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

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSection, setActiveSection] = useState("collection");
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
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [], isLoading: collectionLoading } = useUserCollection(user?.id);
  const { wishlist, isLoading: wishlistLoading } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { lists = [] } = useCustomLists();
  const removeFromCollection = useRemoveFromCollection();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const handleStatClick = (section) => setActiveSection(section);

  const handleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkSelectAll = () => {
    setBulkSelected(userCollection.map((item) => item.funko_pops?.id).filter(Boolean));
  };
  const handleBulkClear = () => setBulkSelected([]);

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
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <img
                  src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
                  alt="PopGuide Logo"
                  className="h-10 w-auto mx-auto sm:mx-0"
                />
                <GlobalSearch />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <NotificationDropdown />
                <span className="text-white text-center sm:text-left">Welcome, {user.user_metadata?.full_name || user.email}</span>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto"
                >
                  Export Collection
                </Button>
                <Link to="/profile-settings">
                  <Button 
                    variant="outline"
                    className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200 w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Move Tabs menu here, above stats section */}
        <section className="pt-8 px-2 sm:px-4">
          <div className="container mx-auto">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <div className="overflow-x-auto scrollbar-hide mb-8">
                <TabsList className="flex w-max min-w-full bg-gray-800 flex-nowrap">
                  <TabsTrigger value="recently-added" className="data-[state=active]:bg-orange-500">
                    <Zap className="w-4 h-4 mr-2" /> Recently Added
                  </TabsTrigger>
                  <TabsTrigger value="items-owned" className="data-[state=active]:bg-orange-500">
                    <Zap className="w-4 h-4 mr-2" /> Items Owned
                  </TabsTrigger>
                  <TabsTrigger value="series-owned" className="data-[state=active]:bg-orange-500">
                    <Users className="w-4 h-4 mr-2" /> Series Owned
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="data-[state=active]:bg-orange-500">
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                  </TabsTrigger>
                  <TabsTrigger value="lists" className="data-[state=active]:bg-orange-500">
                    <List className="w-4 h-4 mr-2" /> Custom Lists
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="data-[state=active]:bg-orange-500">
                    <Users className="w-4 h-4 mr-2" /> Friends
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
                    <TrendingUp className="w-4 h-4 mr-2" /> Analytics
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-orange-500">
                    <MessageCircle className="w-4 h-4 mr-2" /> Messages
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Stats Section - move this below the Tabs menu */}
              <section className="pb-8">
                <div className="container mx-auto">
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8">
                    <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => handleStatClick("analytics")}> 
                      <CardContent className="p-6 text-center">
                        <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
                        <div className="text-gray-400">Collection Value</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => handleStatClick("items-owned")}> 
                      <CardContent className="p-6 text-center">
                        <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{ownedCount}</div>
                        <div className="text-gray-400">Items Owned</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => handleStatClick("wishlist")}> 
                      <CardContent className="p-6 text-center">
                        <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{wishlistCount}</div>
                        <div className="text-gray-400">Wishlist Items</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors" onClick={() => handleStatClick("series-owned")}> 
                      <CardContent className="p-6 text-center">
                        <Users className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{uniqueSeries}</div>
                        <div className="text-gray-400">Series Collected</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Main Content */}
              <section className="py-8 px-2 sm:px-4">
                <div className="container mx-auto">
                  {userCollection.length > 0 && (
                    <div className="mb-8">
                      <CollectionAnalytics userCollection={userCollection} funkoPops={funkoPops} profile={user} />
                    </div>
                  )}
                  <TabsContent value="recently-added" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                      <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Recently Added</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1 md:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search recently added..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                    <CollectionGrid 
                      items={userCollection
                        .slice()
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 24)
                        .map(item => ({
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
                        }))
                      }
                      onItemClick={setSelectedItem}
                      searchQuery={searchQuery}
                      showWishlistOnly={false}
                    />
                  </TabsContent>

                  <TabsContent value="items-owned" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                      <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Items Owned</h2>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200"
                          onClick={() => setBulkActionsOpen(true)}
                        >
                          Bulk Actions
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200"
                          onClick={() => setImportCsvOpen(true)}
                        >
                          Import CSV
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white dark:text-gray-200"
                          onClick={handleExport}
                        >
                          Export CSV
                        </Button>
                        <div className="relative flex-1 md:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search owned items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                    <CollectionGrid 
                      items={userCollection
                        .filter(item => {
                          // Search filter
                          const q = searchQuery.toLowerCase();
                          return (
                            item.funko_pops?.name?.toLowerCase().includes(q) ||
                            item.funko_pops?.series?.toLowerCase().includes(q) ||
                            item.funko_pops?.number?.toLowerCase().includes(q)
                          );
                        })
                        .map(item => ({
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
                        }))
                      }
                      onItemClick={setSelectedItem}
                      searchQuery={searchQuery}
                      showWishlistOnly={false}
                    />
                  </TabsContent>

                  <TabsContent value="series-owned" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                      <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Series Owned</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1 md:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search series..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {Array.from(new Set(userCollection.map(item => item.funko_pops?.series)))
                        .filter(series => series && series.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(series => {
                          const seriesItems = userCollection.filter(item => item.funko_pops?.series === series);
                          const seriesValue = seriesItems.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0);
                          return (
                            <Card key={series} className="bg-gray-800/50 border-gray-700">
                              <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{series}</h3>
                                <div className="space-y-2">
                                  <p className="text-gray-400">{seriesItems.length} item{seriesItems.length !== 1 ? 's' : ''}</p>
                                  <p className="text-orange-500 font-semibold">${seriesValue.toFixed(2)} total value</p>
                                  <div className="flex flex-wrap gap-2">
                                    {seriesItems.slice(0, 3).map(item => (
                                      <div key={item.id} className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
                                        <img 
                                          src={item.funko_pops?.image_url || "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png"} 
                                          alt={item.funko_pops?.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                    {seriesItems.length > 3 && (
                                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">+{seriesItems.length - 3}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </TabsContent>

                  <TabsContent value="wishlist" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                      <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">My Wishlist</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1 md:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search wishlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                    {wishlistLoading ? (
                      <div className="text-white">Loading wishlist...</div>
                    ) : (
                      <WishlistGrid items={wishlist} searchQuery={searchQuery} />
                    )}
                  </TabsContent>

                  <TabsContent value="lists">
                    <CustomListsManager />
                  </TabsContent>

                  <TabsContent value="friends">
                    <FriendsList />
                  </TabsContent>

                  <TabsContent value="analytics">
                    <CollectionAnalytics userCollection={userCollection} funkoPops={funkoPops} />
                  </TabsContent>

                  <TabsContent value="messages">
                    <MessagesInbox />
                  </TabsContent>
                </div>
              </section>
            </Tabs>
          </div>
        </section>

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
      </div>
      <MobileBottomNav />
    </>
  );
};

export default Dashboard;
