import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, LogOut, Plus, Search, Menu, Home, List, DollarSign, Star, Server, ChevronDown, Facebook, Users, HelpCircle, Store, Clock, Castle, Zap, Sparkles, Bug, Database, Filter, Package, Calendar, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import { Loader2, Check } from 'lucide-react';
import { Menu as DropdownMenu } from '@headlessui/react';
import { FaTiktok } from 'react-icons/fa';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatCurrency';
import { useIsMobile } from '@/hooks/use-mobile';

const DATABASE_MENU = [
  { label: 'See all Funko Pops', to: '/database/all', icon: Database },
  { label: 'Status', to: '/database/status', icon: Filter },
  { label: 'Category', to: '/database/category', icon: Package },
  { label: 'Fandom', to: '/database/fandom', icon: Sparkles },
  { label: 'Genre', to: '/database/genres', icon: Star },
  { label: 'Edition', to: '/database/edition', icon: Calendar },
  { label: 'Character', to: '/database/character', icon: User },
  { label: 'Series', to: '/database/series', icon: List },
  { label: 'New Releases', to: '/database/new-releases', icon: Sparkles },
  { label: 'Coming Soon', to: '/database/coming-soon', icon: Star },
  { label: 'Funko Exclusives', to: '/database/funko-exclusives', icon: Sparkles },
];

const BROWSE_DESCRIPTIONS = {
  Status: "Filter by availability and release status",
  Category: "Browse different Funko product lines",
  Fandom: "Explore Pops by franchise and theme",
  Genre: "Find Pops by entertainment category",
  Edition: "Special and limited edition releases",
  Character: "Search your favorite characters",
  Series: "Browse complete Pop collections"
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
  const { currency, setCurrency } = useCurrency();
  const [dbMenuOpen, setDbMenuOpen] = useState(false);

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
    await addToCollection.mutateAsync(pop.id);
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
                className={`text-xs font-bold px-2 py-1 rounded transition-all ${currency === 'GBP' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setCurrency('GBP')}
                aria-label="Switch to British Pounds"
                title="Switch to British Pounds (GBP)"
              >£</button>
              <button
                className={`text-xs font-bold px-2 py-1 rounded transition-all ${currency === 'USD' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setCurrency('USD')}
                aria-label="Switch to US Dollars"
                title="Switch to US Dollars (USD) - Prices converted automatically"
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
                  <DropdownMenu.Item>
                    {({ active }) => (
                      <Link to="/profile-settings" className={`block px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}>Profile</Link>
                    )}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-orange-50 text-[#e46c1b]' : 'text-gray-900'}`}
                      >
                        Logout
                      </button>
                    )}
                  </DropdownMenu.Item>
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
            <div className="relative">
              <button
                className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors"
                onMouseEnter={() => setDbMenuOpen(true)}
                onMouseLeave={() => setDbMenuOpen(false)}
                onClick={() => setDbMenuOpen(!dbMenuOpen)}
                type="button"
              >
                Database <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </button>
              {dbMenuOpen && (
                <div
                  className="fixed top-[80px] left-1/2 -translate-x-1/2 w-[720px] rounded-xl shadow-2xl ring-2 ring-white/20 bg-[#232837] border border-gray-800 z-50"
                  onMouseEnter={() => setDbMenuOpen(true)}
                  onMouseLeave={() => setDbMenuOpen(false)}
                >
                  <div className="p-8">
                    {/* Main Browse Section */}
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">Browse By</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        {DATABASE_MENU.slice(1, 8).map(({ label, to, icon: Icon }) => (
                          <Link key={to} to={to} className="group">
                            <div className="flex items-center gap-3 mb-1">
                              <Icon className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                              <span className="text-base font-medium text-white group-hover:text-orange-400 transition-colors">{label}</span>
                            </div>
                            <p className="text-sm text-gray-400 pl-8">{BROWSE_DESCRIPTIONS[label] || ''}</p>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-700 my-6" />

                    {/* Featured Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">Featured Collections</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {DATABASE_MENU.slice(8).map(({ label, to, icon: Icon }) => (
                          <Link key={to} to={to} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group">
                            <Icon className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                            <span className="text-base font-medium text-white">{label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Full Database Link */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <Link 
                        to="/database/all" 
                        className="flex items-center justify-between px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Database className="w-6 h-6 text-white" />
                          <span className="text-lg font-bold text-white">See all Funko Pops</span>
                        </div>
                        <span className="text-white text-sm">Browse the complete database →</span>
                      </Link>
                    </div>

                    {/* CTA Row */}
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <Link to="/get-started" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors">Get started today</Link>
                      <a href="mailto:brains@popguide.co.uk" className="text-orange-400 hover:text-orange-500 font-medium underline">Contact us</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Features Dropdown */}
            <DropdownMenu as="div" className="relative inline-block text-left">
              <DropdownMenu.Button className="flex items-center text-white hover:text-orange-500 font-normal text-base transition-colors">
                Features <ChevronDown className="ml-1 w-5 h-5 text-[#e46c1b] animate-bounce-y" />
              </DropdownMenu.Button>
              <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 focus:outline-none z-50 p-2">
                <DropdownMenu.Item>
                  <Link to="/features" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Star className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> All Features
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/live-pricing" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <DollarSign className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Live Pricing
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/features/time-machine" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Clock className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Time Machine
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <Link to="/features/grail-galaxy" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500">
                    <Castle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Grail-Galaxy
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            <Link to="/pricing" className="text-white hover:text-orange-500 font-normal text-base transition-colors">Pricing</Link>
            <Link
              to="/browse-lists"
              className={`font-normal text-base transition-colors ${location.pathname === '/browse-lists' ? 'text-[#e46c1b]' : 'text-white hover:text-white'}`}
            >
              Lists
            </Link>
            

            
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
            {/* Dashboard Link (if user logged in) */}
            {user && (
              <Link to="/dashboard" className="flex flex-row items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors flex-shrink-0 min-w-[60px] gap-2">
                <span className="text-base font-medium text-white">Dashboard</span>
                <Home className="w-5 h-5 text-orange-400" />
              </Link>
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

      {/* Mobile Sticky Footer Menu */}
      <MobileStickyFooterMenu />
    </>
  );
};

// Mobile Sticky Footer Menu Component
const MobileStickyFooterMenu = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Don't show on auth pages or if not mobile
  if (!isMobile || location.pathname.startsWith('/auth')) {
    return null;
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FEF6ED] border-t border-orange-200">
      {/* Scroll indicator gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#FEF6ED] to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#FEF6ED] to-transparent pointer-events-none z-10"></div>
      
      <div className="flex items-center justify-start px-2 py-2 overflow-x-auto gap-1 scrollbar-hide">
        {/* Database Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => toggleDropdown('database')}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors min-w-[60px]"
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Database</span>
          </button>
          {activeDropdown === 'database' && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setActiveDropdown(null)}
              />
              <div className="absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 z-[9999] p-2">
                <Link 
                  to="/database/all" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Search className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Browse Database
                </Link>
                <Link 
                  to="/live-pricing" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <DollarSign className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Live Pricing
                </Link>
                <Link 
                  to="/database/new-releases" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> New Releases
                </Link>
                <Link 
                  to="/database/coming-soon" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Star className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Coming Soon
                </Link>
                <Link 
                  to="/database/funko-exclusives" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Funko Exclusives
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Features Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => toggleDropdown('features')}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors min-w-[60px]"
          >
            <Star className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Features</span>
          </button>
          {activeDropdown === 'features' && (
            <>
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setActiveDropdown(null)}
              />
              <div className="absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 z-[9999] p-2">
                <Link 
                  to="/features" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Star className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> All Features
                </Link>
                <Link 
                  to="/features/time-machine" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Clock className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Time Machine
                </Link>
                <Link 
                  to="/features/grail-galaxy" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Castle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Grail-Galaxy
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Pricing Direct Link */}
        <Link to="/pricing" className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors flex-shrink-0 min-w-[60px]">
          <DollarSign className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Pricing</span>
        </Link>

        {/* Lists Direct Link */}
        <Link to="/browse-lists" className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors flex-shrink-0 min-w-[60px]">
          <List className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Lists</span>
        </Link>



        {/* Community Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => toggleDropdown('community')}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors min-w-[60px]"
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Community</span>
          </button>
          {activeDropdown === 'community' && (
            <>
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setActiveDropdown(null)}
              />
              <div className="absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 z-[9999] p-2">
                <Link 
                  to="/members" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Users className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Members
                </Link>
                <Link 
                  to="/shoppers-advice" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Shoppers Advice
                </Link>
                <Link 
                  to="/deals" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <DollarSign className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Latest Deals
                </Link>
                <Link 
                  to="/browse-lists" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <List className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Lists
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Support Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => toggleDropdown('support')}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors min-w-[60px]"
          >
            <HelpCircle className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Support</span>
          </button>
          {activeDropdown === 'support' && (
            <>
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setActiveDropdown(null)}
              />
              <div className="absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 z-[9999] p-2">
                <Link 
                  to="/api" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> API
                </Link>
                <Link 
                  to="/faq" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> FAQ
                </Link>
                <Link 
                  to="/log-ticket" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Log a ticket
                </Link>
                <Link 
                  to="/bug-tracker" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Bug className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Bug Tracker
                </Link>
                <Link 
                  to="/howitworks" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> How it works
                </Link>
                <Link 
                  to="/system-status" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Service Status
                </Link>
                <Link 
                  to="/roadmap" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <HelpCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Roadmap & Changelog
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Retailers Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => toggleDropdown('retailers')}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors min-w-[60px]"
          >
            <Store className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Retailers</span>
          </button>
          {activeDropdown === 'retailers' && (
            <>
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setActiveDropdown(null)}
              />
              <div className="absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-2xl bg-[#232837] border border-gray-800 z-[9999] p-2">
                <Link 
                  to="/retailers" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Store className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Browse Retailers
                </Link>
                <Link 
                  to="/retailers/become" 
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg transition group hover:bg-gray-800/80 hover:border-l-4 hover:border-orange-500"
                >
                  <Store className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" /> Add your business
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Dashboard Link (if user logged in) */}
        {user && (
          <Link to="/dashboard" className="flex flex-row items-center justify-center py-1 px-2 text-[#232837] hover:text-[#1a1e28] transition-colors flex-shrink-0 min-w-[60px] gap-2">
            <span className="text-base font-medium text-white">Dashboard</span>
            <Home className="w-5 h-5 text-orange-400" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;