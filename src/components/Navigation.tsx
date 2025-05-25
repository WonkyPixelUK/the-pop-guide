import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, LogOut, Plus, Search, Menu, Home, List, DollarSign, Star, Server, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import { Loader2, Check } from 'lucide-react';
import { headerButton } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);
  const addToCollection = useAddToCollection();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('theme') || 'system';
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
      {/* Sticky Top Bar for Action Buttons */}
      <div className="sticky top-0 z-50 w-full bg-[#FFF6ED] border-b border-orange-200 flex justify-between items-center px-6 py-2" style={{ minHeight: '48px' }}>
        {/* Theme Toggle Left */}
        <div className="flex items-center gap-1">
          <button aria-label="System" className={`p-1 rounded-full ${theme==='system' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('system')}><Monitor className="w-4 h-4" /></button>
          <button aria-label="Light" className={`p-1 rounded-full ${theme==='light' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('light')}><Sun className="w-4 h-4" /></button>
          <button aria-label="Dark" className={`p-1 rounded-full ${theme==='dark' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('dark')}><Moon className="w-4 h-4" /></button>
        </div>
        {/* Action Buttons Right */}
        <div className="flex items-center">
        {user ? (
          <>
            <span className="text-gray-900 mr-4">Welcome, {user.user_metadata?.full_name || user.email}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="rounded-full border-orange-500 text-orange-500 bg-white hover:bg-orange-50 px-6 py-2 font-semibold text-base shadow-none"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/auth" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 font-semibold text-base shadow-none mr-2 transition-colors" style={{ minWidth: 140, textAlign: 'center' }}>
              Create an Account
            </Link>
            <Link to="/auth" className="rounded-full border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 px-6 py-2 font-semibold text-base shadow-none transition-colors" style={{ minWidth: 110, textAlign: 'center' }}>
              Sign In
            </Link>
          </>
        )}
        </div>
      </div>
      {/* Sticky Main Navigation Bar */}
      <header className="sticky top-[48px] z-40 bg-[#232837] border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/">
              <img
                src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
                alt="PopGuide Logo"
                className="h-16 w-auto"
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-10">
            <Link to="/features" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Features</Link>
            <a href="https://statuslist.app/status/z8kbza" className="text-white hover:text-orange-500 font-medium text-base transition-colors" target="_blank" rel="noopener noreferrer">Service Status</a>
            <Link to="/pricing" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>
      
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
              <Link to="/auth" className="bg-orange-500 hover:bg-orange-600 text-white">Sign In</Link>
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
