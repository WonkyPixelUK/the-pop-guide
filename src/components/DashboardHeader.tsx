import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Menu, Plus, Settings, LogOut, Database, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import NotificationDropdown from '@/components/NotificationDropdown';

interface DashboardHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onAddItem?: () => void;
  searchMode?: 'collection' | 'database';
  onSearchModeChange?: (mode: 'collection' | 'database') => void;
}

const DashboardHeader = ({ 
  searchQuery = "", 
  onSearchChange, 
  searchPlaceholder = "Search...",
  showSearch = true,
  onAddItem,
  searchMode = 'collection',
  onSearchModeChange
}: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
      navigate('/')
    }
  };

  const handleDatabaseSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/directory-all?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/directory-all');
    }
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg"
              alt="PopGuide"
              className="h-16 w-auto"
            />
          </Link>
          
          {/* Desktop Search - Compact and Modern */}
          {showSearch && (
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-10"
                />
              </div>
              
              {/* Search Mode Toggle */}
              {onSearchModeChange && (
                <div className="flex bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
                  <Button
                    variant={searchMode === 'collection' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onSearchModeChange('collection')}
                    className={`rounded-none h-10 px-3 ${searchMode === 'collection' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <User className="w-4 h-4 mr-1" />
                    My Items
                  </Button>
                  <Button
                    variant={searchMode === 'database' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      onSearchModeChange('database');
                      handleDatabaseSearch();
                    }}
                    className={`rounded-none h-10 px-3 ${searchMode === 'database' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <Database className="w-4 h-4 mr-1" />
                    Database
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gray-900 border-gray-700">
                <div className="flex flex-col gap-4 pt-8">
                  <div className="text-white text-lg font-semibold mb-4">
                    Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </div>
                  
                  {onAddItem && (
                    <Button 
                      onClick={() => { onAddItem(); setMobileMenuOpen(false); }}
                      className="bg-orange-500 hover:bg-orange-600 text-white h-12 text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Item
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => { navigate('/export'); setMobileMenuOpen(false); }}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700 h-12 text-base"
                  >
                    Export Collection
                  </Button>
                  
                  <Link to="/profile-settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-700 w-full h-12 text-base"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Profile Settings
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700 h-12 text-base"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationDropdown />
            <span className="text-white text-sm">Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
            {onAddItem && (
              <Button 
                onClick={onAddItem}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            )}
            <Button
              onClick={() => navigate('/export')}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Export
            </Button>
            <Link to="/profile-settings">
              <Button 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-11"
              />
            </div>
            
            {/* Mobile Search Mode Toggle */}
            {onSearchModeChange && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant={searchMode === 'collection' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSearchModeChange('collection')}
                  className={`flex-1 ${searchMode === 'collection' ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}
                >
                  <User className="w-4 h-4 mr-1" />
                  My Items
                </Button>
                <Button
                  variant={searchMode === 'database' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onSearchModeChange('database');
                    handleDatabaseSearch();
                  }}
                  className={`flex-1 ${searchMode === 'database' ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}
                >
                  <Database className="w-4 h-4 mr-1" />
                  Database
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
