import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, LogOut, Plus, Search, Menu, Home, List, DollarSign, Star, Server } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import AuthDialog from '@/components/AuthDialog';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import { Loader2, Check } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);
  const addToCollection = useAddToCollection();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    }
  };

  // Filter Funko Pops for search
  const filteredResults =
    searchValue.length > 1
      ? funkoPops.filter(
          (pop) =>
            pop.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            (pop.series && pop.series.toLowerCase().includes(searchValue.toLowerCase())) ||
            (pop.number && pop.number.toLowerCase().includes(searchValue.toLowerCase()))
        )
      : [];

  const isOwned = (id: string) =>
    userCollection.some((item: any) => item.funko_pop_id === id);

  const handleQuickAdd = async (pop: any) => {
    if (!user) return;
    await addToCollection.mutateAsync({ funkoPopId: pop.id, userId: user.id });
    setAddedId(pop.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (authLoading) {
    return (
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="text-white">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Link to="/">
                <img
                  src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
                  alt="PopGuide Logo"
                  className="h-14 w-auto"
                />
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                className="p-2 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
              >
                <Menu className="w-6 h-6 text-gray-300" />
              </button>
            </div>
            <nav className={`$${mobileMenuOpen ? 'block' : 'hidden'} md:flex items-center space-x-6 w-full md:w-auto mt-4 md:mt-0 bg-gray-900 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none z-50 absolute md:static left-0 top-16 md:top-auto`}>
              <Link to="/dashboard" className="block md:inline text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 mb-2 md:mb-0"><Home className="w-4 h-4" />Dashboard</Link>
              <Link to="/features" className="block md:inline text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 mb-2 md:mb-0"><Star className="w-4 h-4" />Features</Link>
              <Link to="/scraping-status" className="block md:inline text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 mb-2 md:mb-0"><Activity className="w-4 h-4" />Scraping Status</Link>
              <a href="https://statuslist.app/status/z8kbza" className="block md:inline text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 mb-2 md:mb-0" target="_blank" rel="noopener noreferrer"><Server className="w-4 h-4" />Service Status</a>
              <Link to="/pricing" className="block md:inline text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2"> <DollarSign className="w-4 h-4" />Pricing</Link>
            </nav>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              {user ? (
                <>
                  <span className="text-white mr-2">Welcome, {user.user_metadata?.full_name || user.email}</span>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <AuthDialog 
        open={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen} 
      />
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Search the entire database..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          {funkoLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="animate-spin mr-2" /> Loading database...
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <p className="mb-2">Sign in to add items to your collection.</p>
              <Button onClick={() => setIsAuthDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">Sign In</Button>
            </div>
          ) : filteredResults.length === 0 && searchValue.length > 1 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            filteredResults.slice(0, 20).map((pop) => (
              <CommandItem key={pop.id} className="flex items-center gap-3 py-2">
                <img
                  src={pop.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                  alt={pop.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-white">{pop.name}</div>
                  <div className="text-xs text-gray-400 truncate">{pop.series} #{pop.number}</div>
                </div>
                {isOwned(pop.id) ? (
                  <span className="text-green-500 text-xs font-semibold ml-2">Owned</span>
                ) : addedId === pop.id ? (
                  <span className="flex items-center text-green-500 text-xs font-semibold ml-2"><Check className="w-4 h-4 mr-1" />Added!</span>
                ) : (
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white ml-2"
                    disabled={addToCollection.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(pop);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </CommandItem>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Navigation;
