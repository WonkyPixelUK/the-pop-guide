import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, LogOut, Plus, Search, Menu, Home, List, DollarSign, Star, Server, Sun, Moon, Monitor, ChevronDown, Facebook, Users, HelpCircle, Store, Clock, Castle, Zap, Sparkles, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import { Loader2, Check } from 'lucide-react';
import { Menu as DropdownMenu, MenuItem } from '@headlessui/react';
import { FaTiktok } from 'react-icons/fa';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const { currency, setCurrency } = useCurrency();

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
          {/* Social Icons Left */}
          <div className="flex items-center gap-3">
            {/* Social Icons */}
            <a href="https://www.facebook.com/profile.php?id=61574031106533" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Facebook className="w-4 h-4" color="#e46c1b" /></a>
            <a href="https://discord.gg/J8WkTpKc" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="hover:text-orange-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="#e46c1b" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276c-.598.3428-1.2205.6447-1.8733.8923a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@popguideuk" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-orange-500 transition-colors">
              <FaTiktok className="w-4 h-4" color="#e46c1b" />
            </a>
            {/* Currency Switcher */}
            <div className="ml-3 flex items-center gap-1 bg-gray-200 rounded px-2 py-1">
              <button
                className={`text-xs font-bold px-2 py-1 rounded ${currency === 'GBP' ? 'bg-orange-500 text-white' : 'text-gray-700'}`}
                onClick={() => setCurrency('GBP')}
                aria-label="Switch to GBP"
              >£</button>
              <button
                className={`text-xs font-bold px-2 py-1 rounded ${currency === 'USD' ? 'bg-orange-500 text-white' : 'text-gray-700'}`}
                onClick={() => setCurrency('USD')}
                aria-label="Switch to USD"
              >$</button>
            </div>
          </div>
          {/* Action Buttons Right */}
          <div className="flex items-center gap-2">
          {user ? (
              <div className="ml-3 flex items-center gap-1 bg-gray-200 rounded px-2 py-1 cursor-pointer group relative" tabIndex={0}>
                <span className="text-xs text-gray-700 font-semibold mr-1">Logged in as:</span>
                <DropdownMenu as="div" className="inline-block text-left">
                  <DropdownMenu.Button className="flex items-center text-[#232837] font-bold text-xs focus:outline-none">
                    {user.email}
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-500 group-hover:text-orange-500 transition" />
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
              </div>
          ) : (
            <>
              <Link to="/get-started" className="border border-[#e46c1b] text-[#e46c1b] bg-transparent hover:bg-orange-50 rounded-md px-3 py-1 font-medium text-xs min-w-0 transition-colors" style={{ textAlign: 'center', border: '1px solid #e46c1b' }}>
                Get started
              </Link>
                <Link to="/auth?signin=true" className="border border-[#e46c1b] text-[#e46c1b] bg-transparent hover:bg-orange-50 rounded-md px-3 py-1 font-medium text-xs min-w-0 transition-colors" style={{ textAlign: 'center', border: '1px solid #e46c1b' }}>
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
          <nav className="flex items-center space-x-10 hidden md:flex">
            {/* Database Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Database <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/directory-all" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Search className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Browse Database
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/pricing-dashboard" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <DollarSign className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Live Pricing
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/new-releases" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> New Releases
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/coming-soon" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Star className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Coming Soon
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/funko-exclusives" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Funko Exclusives
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            
            <Link to="/features" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Features</Link>
            <Link to="/pricing" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Pricing</Link>
            <Link
              to="/browse-lists"
              className={`font-normal text-base transition-colors ${location.pathname === '/browse-lists' ? 'text-[#e46c1b]' : 'text-white hover:text-white'}`}
            >
              Lists
            </Link>
            
            {/* Advanced Features Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Tools <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/time-machine" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Clock className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Time Machine
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/grail-galaxy" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Castle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Grail-Galaxy
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            
            {/* Community Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Community <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/members" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Users className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Members
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/shoppers-advice" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Shoppers Advice
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/deals" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <DollarSign className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Latest Deals
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/browse-lists" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <List className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Lists
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            {/* Support Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Support <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/api" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> API
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/faq" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> FAQ
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/log-ticket" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Log a ticket
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/bug-tracker" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Bug className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Bug Tracker
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/howitworks" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> How it works
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/system-status" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Service Status
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/roadmap" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Roadmap & Changelog
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            {/* Retailers Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Retailers <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/retailers" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Store className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Browse Retailers
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/retailers/become" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Store className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Add your business
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            {user && <Link to="/dashboard" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Dashboard</Link>}
           
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
              <Link to="/auth?signin=true" className="bg-orange-500 hover:bg-orange-600 text-white">Sign In</Link>
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
