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

// Babylon.js imports
import { 
  Engine, 
  Scene, 
  ArcRotateCamera, 
  Vector3, 
  HemisphericLight, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  ActionManager, 
  ExecuteCodeAction 
} from '@babylonjs/core';

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

interface UserLand extends VirtualLand {
  // Removed profiles join - no longer needed
}

const GrailGalaxyWorld = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{x: number, z: number} | null>(null);
  
  // User data
  const [popCoins, setPopCoins] = useState(100);
  const [userLands, setUserLands] = useState<UserLand[]>([]);
  const [allLands, setAllLands] = useState<VirtualLand[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<VirtualEvent[]>([]);
  
  // Purchase form state
  const [selectedLandType, setSelectedLandType] = useState<'basic' | 'premium' | 'deluxe'>('basic');
  const [selectedSize, setSelectedSize] = useState<{x: number, z: number}>({x: 5, z: 5});

  // Initialize Babylon.js scene (only once)
  useEffect(() => {
    console.log('🚀 useEffect for Babylon.js called!');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ Canvas ref not available yet');
      return;
    }

    console.log('✅ Canvas found:', canvas);
    console.log('✅ Babylon imports available:', { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3 });

    // Add a small delay to ensure the canvas is properly mounted
    const timer = setTimeout(() => {
      console.log('⏰ Starting delayed Babylon.js initialization...');
      
      let engine: Engine | null = null;
      let scene: Scene | null = null;

      try {
        // Create the Babylon.js engine
        console.log('🔧 Creating Babylon.js engine...');
        engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        engineRef.current = engine;
        console.log('✅ Engine created successfully:', engine);

        // Create a basic scene
        console.log('🌍 Creating scene...');
        scene = new Scene(engine);
        sceneRef.current = scene;
        
        // Set scene background
        scene.clearColor = new Color3(0.2, 0.2, 0.3);
        console.log('✅ Scene created successfully:', scene);

        // Create a camera
        console.log('📷 Creating camera...');
        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());
        
        // Set as active camera first
        scene.activeCamera = camera;
        
        // Try different methods to attach controls
        console.log('🎮 Attaching camera controls...');
        try {
          camera.attachControls(canvas, true);
          console.log('✅ Camera controls attached via camera.attachControls');
        } catch (controlError) {
          console.log('⚠️ camera.attachControls failed, trying alternative...');
          // Alternative method
          scene.actionManager = new ActionManager(scene);
          console.log('✅ ActionManager created as fallback');
        }
        
        console.log('✅ Camera created successfully:', camera);

        // Create a light
        console.log('💡 Creating light...');
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
        light.intensity = 1;
        console.log('✅ Light created successfully:', light);

        // Create a visible orange sphere
        console.log('🟠 Creating orange sphere...');
        const sphere = MeshBuilder.CreateSphere('sphere1', { diameter: 2 }, scene);
        const sphereMaterial = new StandardMaterial('sphereMaterial', scene);
        sphereMaterial.diffuseColor = new Color3(1, 0.5, 0); // Orange
        sphere.material = sphereMaterial;
        sphere.position.y = 1;
        console.log('✅ Sphere created successfully:', sphere);

        // Create a green ground
        console.log('🟢 Creating green ground...');
        const ground = MeshBuilder.CreateGround('ground1', { width: 10, height: 10 }, scene);
        const groundMaterial = new StandardMaterial('groundMaterial', scene);
        groundMaterial.diffuseColor = new Color3(0.4, 0.8, 0.4); // Green
        ground.material = groundMaterial;
        console.log('✅ Ground created successfully:', ground);

        // Start the render loop
        console.log('🔄 Starting render loop...');
        engine.runRenderLoop(() => {
          if (scene) {
            scene.render();
          }
        });
        console.log('✅ Render loop started successfully');

        // Handle window resize
        const handleResize = () => {
          if (engine) {
            engine.resize();
          }
        };
        window.addEventListener('resize', handleResize);

        console.log('🎉 Babylon.js initialization completed successfully!');

      } catch (error) {
        console.error('❌ Error during Babylon.js initialization:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Fallback: Draw something simple on the 2D canvas
        console.log('🎨 Falling back to 2D canvas...');
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
          ctx.fillText('(Babylon.js initialization failed - showing 2D fallback)', canvas.width / 2, 75);
          ctx.fillText('Orange circle = Virtual Funko Pop', canvas.width / 2, canvas.height - 130);
          ctx.fillText('Green area = Virtual Ground', canvas.width / 2, canvas.height - 110);
          
          console.log('✅ 2D fallback rendered successfully');
        }
        
        toast({
          title: 'Error',
          description: `Failed to initialize 3D world: ${error.message}`,
          variant: 'destructive'
        });
      }
    }, 100); // 100ms delay

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Babylon.js...');
      clearTimeout(timer);
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };

  }, [toast]); // Add toast as dependency

  // Load data separately when user changes or component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading Grail-Galaxy data...');
        
        if (user) {
          await loadUserData();
        } else {
          await loadWorldData();
        }

        // Update 3D world with loaded data
        if (allLands.length > 0) {
          renderLandsIn3D(allLands);
        }

        // Show welcome modal for first-time visitors (only for guests)
        const hasSeenWelcome = localStorage.getItem('grailGalaxyWelcomeSeen');
        if (!hasSeenWelcome && !user) {
          setTimeout(() => setShowWelcomeModal(true), 1000);
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
  }, [user, allLands.length]); // Dependencies: user and allLands length

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
        // Don't throw error, just log it and continue
      } else {
        setAllLands(allLandsData || []);
        // renderLandsIn3D call removed - handled by useEffect
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
        // Don't throw error, just log it and continue
      } else {
        setUpcomingEvents(eventsData || []);
      }

    } catch (error) {
      console.error('Error loading world data:', error);
      // Don't throw error - allow component to render in limited state
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
      setUserLands(userLandsData as UserLand[] || []);

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

      // renderLandsIn3D call removed - handled by useEffect

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Grail-Galaxy data',
        variant: 'destructive'
      });
    }
  };

  // Render lands in the 3D world
  const renderLandsIn3D = (lands: VirtualLand[]) => {
    if (!sceneRef.current) return;

    // Clear existing land meshes to prevent duplicates
    const existingMeshes = sceneRef.current.meshes.filter(mesh => 
      mesh.name.startsWith('land_') || mesh.name.startsWith('label_')
    );
    existingMeshes.forEach(mesh => mesh.dispose());

    console.log('Rendering', lands.length, 'lands in 3D world');

    lands.forEach(land => {
      // Create land platform
      const landPlatform = MeshBuilder.CreateBox(`land_${land.id}`, {
        width: land.size_x,
        height: 0.5,
        depth: land.size_z
      }, sceneRef.current!);

      landPlatform.position = new Vector3(land.position_x * 10, 0.25, land.position_z * 10);

      // Material based on ownership
      const material = new StandardMaterial(`landMat_${land.id}`, sceneRef.current!);
      if (land.user_id === user?.id) {
        material.diffuseColor = new Color3(0, 1, 0); // Green for owned
      } else if (land.user_id) {
        material.diffuseColor = new Color3(1, 0.5, 0); // Orange for other owners
      } else {
        material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Gray for available
      }
      landPlatform.material = material;

      // Add click interaction for available lands
      if (!land.user_id && user) {
        landPlatform.actionManager = new ActionManager(sceneRef.current!);
        landPlatform.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          handleLandClick(land.position_x, land.position_z);
        }));
      }
    });

    // Create grid lines for reference
    createGridLines();
  };

  // Create grid lines for the world
  const createGridLines = () => {
    if (!sceneRef.current) return;

    // Clear existing grid lines
    const existingGrids = sceneRef.current.meshes.filter(mesh => mesh.name.startsWith('grid_'));
    existingGrids.forEach(mesh => mesh.dispose());

    const gridSize = 20;
    const gridSpacing = 10;

    for (let i = -gridSize; i <= gridSize; i++) {
      // Vertical lines
      const vLine = MeshBuilder.CreateBox(`grid_v_${i}`, {
        width: 0.1,
        height: 0.1,
        depth: gridSize * gridSpacing * 2
      }, sceneRef.current!);
      vLine.position = new Vector3(i * gridSpacing, 0, 0);

      // Horizontal lines
      const hLine = MeshBuilder.CreateBox(`grid_h_${i}`, {
        width: gridSize * gridSpacing * 2,
        height: 0.1,
        depth: 0.1
      }, sceneRef.current!);
      hLine.position = new Vector3(0, 0, i * gridSpacing);

      // Grid material
      const gridMaterial = new StandardMaterial(`gridMat_${i}`, sceneRef.current!);
      gridMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3);
      gridMaterial.alpha = 0.5;
      vLine.material = gridMaterial;
      hLine.material = gridMaterial.clone(`gridMat_h_${i}`);
    }
  };

  // Handle land click
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

  // Handle land purchase
  const handlePurchaseLand = async () => {
    if (!user || !selectedPosition) return;

    try {
      const response = await fetch('/api/grail-galaxy-purchase-land', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          position_x: selectedPosition.x,
          position_z: selectedPosition.z,
          size_x: selectedSize.x,
          size_z: selectedSize.z,
          land_type: selectedLandType,
          price: calculatePrice()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Purchase failed');
      }

      toast({
        title: 'Success!',
        description: 'Land purchased successfully!',
      });

      // Refresh data
      await loadUserData();
      setShowPurchaseModal(false);
      setSelectedPosition(null);

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
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
                    Funko Grail-Galaxy World
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
                      Mouse: Rotate | Wheel: Zoom | Click: Select Land
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

              {/* Tabs for different content */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-0">
                  <Tabs defaultValue="world" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                      <TabsTrigger value="world" className="text-xs">World</TabsTrigger>
                      <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
                      <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                      <TabsTrigger value="help" className="text-xs">Help</TabsTrigger>
                    </TabsList>
                    
                    <div className="p-4">
                      <TabsContent value="world" className="space-y-4 mt-0">
                        <div>
                          <h3 className="font-semibold mb-2">World Stats</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Lands:</span>
                              <span>400</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Owned:</span>
                              <span>{allLands.filter(l => l.user_id).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Available:</span>
                              <span>{allLands.filter(l => !l.user_id).length}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="events" className="space-y-4 mt-0">
                        <div>
                          <h3 className="font-semibold mb-2">Upcoming Events</h3>
                          {upcomingEvents.length > 0 ? (
                            <div className="space-y-2">
                              {upcomingEvents.map(event => (
                                <div key={event.id} className="p-2 bg-gray-700/50 rounded text-sm">
                                  <div className="font-medium">{event.event_name}</div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(event.start_time).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 mb-4">Be the first to create an event in the Grail-Galaxy!</p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="market" className="space-y-4 mt-0">
                        <div>
                          <h3 className="font-semibold mb-2">Land Marketplace</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Basic Land:</span>
                              <span>50+ coins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Premium Land:</span>
                              <span>100+ coins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deluxe Land:</span>
                              <span>150+ coins</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="help" className="space-y-4 mt-0">
                        <div>
                          <h3 className="font-semibold mb-2">How to Play</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Click on gray plots to purchase land</p>
                            <p>• Green plots are yours, orange belong to others</p>
                            <p>• Use Pop Coins to buy larger/premium plots</p>
                            <p>• Host events to earn more coins</p>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
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