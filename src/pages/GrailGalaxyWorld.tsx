import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import SEO from '@/components/SEO';
import { Coins, MapPin, Users, Calendar, ShoppingCart, Info, Gamepad2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface VirtualLand {
  id: string;
  user_id: string | null;
  position_x: number;
  position_z: number;
  size_x: number;
  size_z: number;
  land_type: 'basic' | 'premium' | 'deluxe';
  land_name: string;
  price_paid: number | null;
  purchase_date: string | null;
  created_at: string;
}

interface VirtualEvent {
  id: string;
  event_name: string;
  description: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  entry_fee: number;
  host_user_id: string;
}

const GrailGalaxyWorld = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{x: number, z: number} | null>(null);
  
  // User data
  const [popCoins, setPopCoins] = useState(100);
  const [userLands, setUserLands] = useState<VirtualLand[]>([]);
  const [allLands, setAllLands] = useState<VirtualLand[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<VirtualEvent[]>([]);
  
  // Purchase form state
  const [selectedLandType, setSelectedLandType] = useState<'basic' | 'premium' | 'deluxe'>('basic');
  const [selectedSize, setSelectedSize] = useState<{x: number, z: number}>({x: 5, z: 5});

  // Simplified canvas setup (temporarily removed Babylon.js)
  useEffect(() => {
    console.log('🚀 Canvas effect called!');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ Canvas ref not available yet');
      return;
    }

    console.log('✅ Canvas found, drawing simple 2D scene...');
    
    // Simple 2D canvas rendering
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Ensure canvas has proper dimensions
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 800;
      canvas.height = rect.height * window.devicePixelRatio || 500;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Draw background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw orange sphere (representing Funko)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 30, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw green ground
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Grail-Galaxy 3D World', canvas.width / 2, 50);
      ctx.font = '14px Arial';
      ctx.fillText('(Simplified version for testing)', canvas.width / 2, 75);
      ctx.fillText('Orange circle = Virtual Funko Pop', canvas.width / 2, canvas.height - 130);
      ctx.fillText('Green area = Virtual Ground', canvas.width / 2, canvas.height - 110);
      
      console.log('✅ 2D scene rendered successfully');
    }

  }, []); // Empty dependency array for one-time setup

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading Grail-Galaxy data...');
        
        if (user) {
          await loadUserData();
        } else {
          await loadWorldData();
        }
        
        console.log('Grail-Galaxy data loaded successfully');
      } catch (error) {
        console.error('Error loading Grail-Galaxy data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Grail-Galaxy data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]); // Only depend on user

  // Load basic world data for non-authenticated users
  const loadWorldData = async () => {
    try {
      console.log('Loading world data...');
      
      // Load all lands for visualization (public data)
      const { data: allLandsData, error: allLandsError } = await supabase
        .from('virtual_lands')
        .select('*');

      if (allLandsError) {
        console.error('Error loading lands:', allLandsError);
      } else {
        setAllLands(allLandsData || []);
      }

      // Load upcoming events (public data)
      const { data: eventsData, error: eventsError } = await supabase
        .from('virtual_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (eventsError) {
        console.error('Error loading events:', eventsError);
      } else {
        setUpcomingEvents(eventsData || []);
      }

    } catch (error) {
      console.error('Error loading world data:', error);
    }
  };

  // Load user-specific data
  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user's lands
      const { data: userLandsData, error: userLandsError } = await supabase
        .from('virtual_lands')
        .select('*')
        .eq('user_id', user.id);

      if (userLandsError) throw userLandsError;
      setUserLands(userLandsData as VirtualLand[] || []);

      // Load all lands for visualization
      const { data: allLandsData, error: allLandsError } = await supabase
        .from('virtual_lands')
        .select('*');

      if (allLandsError) throw allLandsError;
      setAllLands(allLandsData || []);

      // Load upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('virtual_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (eventsError) throw eventsError;
      setUpcomingEvents(eventsData || []);

      // Load pop coins from user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('pop_coins')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setPopCoins(profileData?.pop_coins || 100);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Grail-Galaxy data',
        variant: 'destructive'
      });
    }
  };

  // Handle land click (simplified)
  const handleLandClick = (x: number, z: number) => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to purchase land',
        variant: 'destructive'
      });
      return;
    }

    setSelectedPosition({ x, z });
    setShowPurchaseModal(true);
  };

  // Calculate land price
  const calculatePrice = () => {
    const basePrice = selectedLandType === 'basic' ? 50 : selectedLandType === 'premium' ? 100 : 150;
    const sizeMultiplier = (selectedSize.x * selectedSize.z) / 25; // Base size is 5x5
    return Math.round(basePrice * sizeMultiplier);
  };

  // Handle land purchase (simplified)
  const handlePurchaseLand = async () => {
    if (!user || !selectedPosition) return;

    toast({
      title: 'Feature Coming Soon',
      description: 'Land purchasing will be available in the full 3D version!',
    });

    setShowPurchaseModal(false);
    setSelectedPosition(null);
  };

  // Handle welcome modal close
  const handleWelcomeClose = () => {
    localStorage.setItem('grailGalaxyWelcomeSeen', 'true');
    setShowWelcomeModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <SEO title="Grail-Galaxy 3D World | The Pop Guide" description="Explore the 3D virtual Funko universe where collecting meets the metaverse." />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <Navigation />
          
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading Grail-Galaxy...</h2>
              <p className="text-gray-400">Initializing your virtual Funko world...</p>
            </div>
          </div>
          
          <Footer />
        </div>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <SEO title="Grail-Galaxy 3D World | The Pop Guide" description="Explore the 3D virtual Funko universe where collecting meets the metaverse." />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />

        {/* Header with back button */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/grail-galaxy" className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grail-Galaxy Info
          </Link>
        </div>

        {/* Welcome Modal */}
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          <DialogContent className="bg-gray-800 border-orange-500/50">
            <DialogHeader>
              <DialogTitle className="text-2xl text-orange-500 flex items-center gap-2">
                🏰 Welcome to Funko Grail-Galaxy!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-white">
              <p>Welcome to the ultimate virtual Funko experience! Here you can:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>🏞️ Explore a vast 3D world of virtual land</li>
                <li>🏠 Purchase and customize your own plots</li>
                <li>🎉 Host events and treasure hunts</li>
                <li>💰 Trade using Pop Coins</li>
                <li>👥 Connect with other collectors</li>
              </ul>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleWelcomeClose} className="bg-orange-500 hover:bg-orange-600 flex-1">
                  {user ? 'Enter the Grail-Galaxy' : 'Explore as Guest'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purchase Modal */}
        <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
          <DialogContent className="bg-gray-800 border-orange-500/50">
            <DialogHeader>
              <DialogTitle className="text-orange-500">Purchase Virtual Land</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Land Type</Label>
                <Select value={selectedLandType} onValueChange={(value: 'basic' | 'premium' | 'deluxe') => setSelectedLandType(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="basic">Basic (50 base coins)</SelectItem>
                    <SelectItem value="premium">Premium (100 base coins)</SelectItem>
                    <SelectItem value="deluxe">Deluxe (150 base coins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Size</Label>
                <Select 
                  value={`${selectedSize.x}x${selectedSize.z}`} 
                  onValueChange={(value) => {
                    const [x, z] = value.split('x').map(Number);
                    setSelectedSize({ x, z });
                  }}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="5x5">5x5 (1x multiplier)</SelectItem>
                    <SelectItem value="10x10">10x10 (4x multiplier)</SelectItem>
                    <SelectItem value="15x15">15x15 (9x multiplier)</SelectItem>
                    <SelectItem value="20x20">20x20 (16x multiplier)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between items-center">
                  <span>Total Cost:</span>
                  <span className="text-orange-500 font-bold">{calculatePrice()} Pop Coins</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Your Balance:</span>
                  <span>{popCoins} Pop Coins</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handlePurchaseLand}
                  disabled={calculatePrice() > popCoins}
                  className="bg-orange-500 hover:bg-orange-600 flex-1"
                >
                  Purchase Land
                </Button>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main 3D World */}
            <div className="lg:w-2/3">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-orange-500 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Funko Grail-Galaxy World (Testing Mode)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas 
                      ref={canvasRef}
                      width={800}
                      height={500}
                      className="rounded-lg border border-gray-600 bg-gray-900 w-full"
                      style={{ display: 'block', width: '100%', height: '500px' }}
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded text-sm">
                      Simplified 2D Version | Full 3D Coming Soon
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="lg:w-1/3 space-y-6">
              {/* User Stats */}
              {user && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Your Grail-Galaxy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Pop Coins</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500">{popCoins}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Owned Lands</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">{userLands.length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user ? (
                    <>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        View My Lands
                      </Button>
                      <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Host Event
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <Users className="w-4 h-4 mr-2" />
                      Sign In to Purchase
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Testing Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    This is a simplified version to test the page structure. 
                    The full 3D Babylon.js experience will be restored once we confirm the basic page loads correctly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <MobileBottomNav />
    </>
  );
};

export default GrailGalaxyWorld; 