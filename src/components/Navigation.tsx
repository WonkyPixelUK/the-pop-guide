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
import { Menu as DropdownMenu, MenuItem } from '@headlessui/react';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'system';
  return localStorage.getItem('theme') || 'system';
};

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
      <div className="sticky top-0 z-50 w-full bg-[#FFF6ED] border-b border-orange-200">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-0.5" style={{ minHeight: '28px' }}>
          {/* Theme Toggle Left */}
          <div className="flex items-center gap-1">
            <button aria-label="System" className={`p-1 rounded-full ${theme==='system' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('system')}><Monitor className="w-4 h-4 text-[#232837]" /></button>
            <button aria-label="Light" className={`p-1 rounded-full ${theme==='light' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('light')}><Sun className="w-4 h-4 text-[#232837]" /></button>
            <button aria-label="Dark" className={`p-1 rounded-full ${theme==='dark' ? 'bg-gray-200' : ''}`} onClick={() => setTheme('dark')}><Moon className="w-4 h-4 text-[#232837]" /></button>
          </div>
          {/* Action Buttons Right */}
          <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu as="div" className="relative inline-block text-left">
                <DropdownMenu.Button className="text-gray-900 mr-2 text-xs font-semibold hover:underline focus:outline-none">
                  {user.user_metadata?.full_name || user.email}
                </DropdownMenu.Button>
                <DropdownMenu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                  <MenuItem>
                    {({ active }) => (
                      <Link to="/profile-settings" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Profile</Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}
                      >
                        Logout
                      </button>
                    )}
                  </MenuItem>
                </DropdownMenu.Items>
              </DropdownMenu>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="border border-[#e46c1b] text-[#e46c1b] bg-transparent hover:bg-orange-50 rounded-md px-3 py-1 font-medium text-xs min-w-0 shadow-none hidden md:inline-block"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/get-started" className="border border-[#e46c1b] text-[#e46c1b] bg-transparent hover:bg-orange-50 rounded-md px-3 py-1 font-medium text-xs min-w-0 transition-colors" style={{ textAlign: 'center', border: '1px solid #e46c1b' }}>
                Get started
              </Link>
              <Link to="/auth" className="border border-[#e46c1b] text-[#e46c1b] bg-transparent hover:bg-orange-50 rounded-md px-3 py-1 font-medium text-xs min-w-0 transition-colors" style={{ textAlign: 'center', border: '1px solid #e46c1b' }}>
                Sign In
              </Link>
            </>
          )}
          </div>
        </div>
      </div>
      {/* Sticky Main Navigation Bar */}
      <header className="sticky top-[28px] z-40 bg-[#232837] border-b border-gray-800" style={{ boxShadow: '0 2px 12px 0 rgba(35,40,55,0.18)' }}>
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/">
              <img
                src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
                alt="PopGuide Logo"
                className="h-20 w-auto"
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-10">
            <Link to="/recently-added" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Recently Added</Link>
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="text-white hover:text-orange-500 font-medium text-base transition-colors focus:outline-none flex items-center gap-1">
                Directory
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </DropdownMenu.Button>
              <DropdownMenu.Items className="absolute left-0 mt-2 min-w-[160px] origin-top-left bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <MenuItem>
                  {({ active }) => (
                    <Link to="/directory" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Directory</Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <Link to="/retailers/become" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Become a Retailer</Link>
                  )}
                </MenuItem>
              </DropdownMenu.Items>
            </DropdownMenu>
            <Link to="/features" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Features</Link>
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="text-white hover:text-orange-500 font-medium text-base transition-colors focus:outline-none flex items-center gap-1">
                Support
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </DropdownMenu.Button>
              <DropdownMenu.Items className="absolute left-0 mt-2 min-w-[160px] origin-top-left bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <MenuItem>
                  {({ active }) => (
                    <a href="https://support.popguide.co.uk" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Support</a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a href="https://statuslist.app/status/z8kbza" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Service Status</a>
                  )}
                </MenuItem>
              </DropdownMenu.Items>
            </DropdownMenu>
            <Link to="/pricing" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Pricing</Link>
            {user && (
              <Link to="/dashboard" className="text-white hover:text-orange-500 font-medium text-base transition-colors">Dashboard</Link>
            )}
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
