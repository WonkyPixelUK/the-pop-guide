import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, LogOut, Plus, Search, Menu, Home, List, DollarSign, Star, Server, Sun, Moon, Monitor, ChevronDown, Facebook } from 'lucide-react';
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
      <header className="sticky top-[28px] z-40 bg-[#232837] border-b border-gray-800 hidden md:block" style={{ boxShadow: '0 2px 12px 0 rgba(35,40,55,0.18)' }}>
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
          <nav className="flex items-center space-x-10 hidden md:flex">
            <Link to="/recently-added" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Recently Added</Link>
            <Link to="/features" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Features</Link>
            <Link to="/pricing" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Pricing</Link>
            <Link to="/browse-lists" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Lists</Link>
            <Link to="/about" className="text-white hover:text-orange-500 font-normal text-base transition-colors">About</Link>
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Support <ChevronDown className="ml-1 w-5 h-5" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <DropdownMenu.Item>
                  <Link to="/system-status" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Service Status</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/faq" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">FAQ</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/log-ticket" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Log a ticket</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/howitworks" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">How it works</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Directory <ChevronDown className="ml-1 w-5 h-5" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <DropdownMenu.Item>
                  <Link to="/directory" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Browse Directory</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/retailers/become" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Add your business</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            {user && <Link to="/dashboard" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Dashboard</Link>}
            <a href="https://facebook.com/the-pop-guide" target="_blank" rel="noopener noreferrer" className="ml-4 text-white hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="https://discord.gg/J8WkTpKc" target="_blank" rel="noopener noreferrer" className="ml-2 text-white hover:text-orange-500 transition-colors" aria-label="Discord">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276c-.598.3428-1.2205.6447-1.8733.8923a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
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
