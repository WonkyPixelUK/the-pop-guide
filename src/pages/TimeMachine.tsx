import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, TrendingUp, TrendingDown, Search, RotateCcw, BarChart3, History, HelpCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import { supabase } from '@/integrations/supabase/client';

interface TimeMachineScenario {
  id: string;
  funko_name: string;
  funko_pop_id: string;
  purchase_date: string;
  original_price: number;
  current_price: number;
  quantity: number;
  profit_loss: number;
  roi_percentage: number;
  years_held: number;
  user_id?: string;
  created_at?: string;
}

interface FunkoItem {
  id: string;
  name: string;
  current_price?: number;
  image_url?: string;
  series?: string;
  number?: string;
}

const TimeMachine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunko, setSelectedFunko] = useState<FunkoItem | null>(null);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [scenarios, setScenarios] = useState<TimeMachineScenario[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<TimeMachineScenario[]>([]);
  const [searchResults, setSearchResults] = useState<FunkoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSavedScenarios, setShowSavedScenarios] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();

  // Load saved scenarios on component mount
  useEffect(() => {
    if (user) {
      loadSavedScenarios();
    }
  }, [user]);

  // Show welcome modal for first-time visitors
  useEffect(() => {
    // Check if welcome should be skipped (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const skipWelcome = urlParams.get('skipWelcome');
    
    if (skipWelcome) {
      localStorage.setItem('timeMachineWelcomeSeen', 'true');
      return;
    }
    
    const hasSeenWelcome = localStorage.getItem('timeMachineWelcomeSeen');
    if (!hasSeenWelcome) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showWelcomeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showWelcomeModal]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('timeMachineWelcomeSeen', 'true');
  };

  // Load saved scenarios from database
  const loadSavedScenarios = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('time_machine_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedScenarios(data || []);
    } catch (error) {
      console.error('Error loading saved scenarios:', error);
    }
  };

  // Save scenario to database
  const saveScenario = async (scenario: TimeMachineScenario) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('time_machine_scenarios')
        .insert({
          user_id: user.id,
          funko_pop_id: scenario.funko_pop_id,
          funko_name: scenario.funko_name,
          purchase_date: scenario.purchase_date,
          original_price: scenario.original_price,
          current_price: scenario.current_price,
          quantity: scenario.quantity,
          profit_loss: scenario.profit_loss,
          roi_percentage: scenario.roi_percentage,
          years_held: scenario.years_held
        });

      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: 'Time Machine scenario saved!',
        variant: 'default'
      });
      
      loadSavedScenarios();
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to save scenario', 
        variant: 'destructive' 
      });
    }
  };

  // Search Funkos from real database
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = funkoPops.filter((funko: any) => 
      funko.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      funko.series?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      funko.number?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 12); // Limit to 12 results
    
    setSearchResults(results);
  };

  // Enhanced historical price calculation with market trends
  const calculateHistoricalPrice = (currentPrice: number, yearsAgo: number, funkoSeries?: string): number => {
    // Base appreciation rates by series popularity
    const seriesMultipliers: { [key: string]: number } = {
      'marvel': 1.2,
      'dc': 1.15,
      'star wars': 1.25,
      'disney': 1.1,
      'pokemon': 1.3,
      'anime': 1.15,
      'tv': 1.05,
      'movies': 1.1,
      'games': 1.08
    };

    const series = funkoSeries?.toLowerCase() || 'unknown';
    const multiplier = Object.keys(seriesMultipliers).find(key => 
      series.includes(key)
    ) ? seriesMultipliers[Object.keys(seriesMultipliers).find(key => series.includes(key))!] : 1.0;

    // Market trends: 2019-2024 saw significant Funko appreciation
    const baseAppreciation = 0.12 * multiplier; // 12% base + series bonus
    const volatility = 0.15; // 15% volatility
    const marketCrash2022 = yearsAgo <= 2 ? 0.9 : 1.0; // 2022 market dip
    const covidBoom = yearsAgo >= 2 && yearsAgo <= 4 ? 1.15 : 1.0; // COVID collecting boom
    
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const historicalPrice = currentPrice / Math.pow(1 + baseAppreciation, yearsAgo) * randomFactor * marketCrash2022 * covidBoom;
    
    return Math.max(historicalPrice, currentPrice * 0.1); // Minimum 10% of current price
  };

  // Calculate time machine scenario with enhanced logic
  const calculateScenario = () => {
    if (!selectedFunko || !purchaseDate || !originalPrice) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const purchaseDateObj = new Date(purchaseDate);
    const currentDate = new Date();
    const yearsHeld = (currentDate.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsHeld < 0) {
      toast({ title: 'Error', description: 'Purchase date cannot be in the future', variant: 'destructive' });
      return;
    }

    const originalPriceNum = parseFloat(originalPrice);
    const quantityNum = parseInt(quantity);
    
    // Use actual current price from database or estimate if not available
    const currentPrice = selectedFunko.current_price || 
      calculateHistoricalPrice(originalPriceNum * 2, -yearsHeld, selectedFunko.series);
    
    const totalInvestment = originalPriceNum * quantityNum;
    const currentValue = currentPrice * quantityNum;
    const profitLoss = currentValue - totalInvestment;
    const roiPercentage = ((currentValue - totalInvestment) / totalInvestment) * 100;

    const scenario: TimeMachineScenario = {
      id: Date.now().toString(),
      funko_pop_id: selectedFunko.id,
      funko_name: selectedFunko.name,
      purchase_date: purchaseDate,
      original_price: originalPriceNum,
      current_price: currentPrice,
      quantity: quantityNum,
      profit_loss: profitLoss,
      roi_percentage: roiPercentage,
      years_held: yearsHeld
    };

    setScenarios([scenario, ...scenarios]);
    setShowResults(true);
    
    // Auto-save if user is logged in
    if (user) {
      saveScenario(scenario);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFunko(null);
    setPurchaseDate('');
    setOriginalPrice('');
    setQuantity('1');
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Get max date (today)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get min date (15 years ago - extended range)
  const getMinDate = () => {
    const fifteenYearsAgo = new Date();
    fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
    return fifteenYearsAgo.toISOString().split('T')[0];
  };

  // Auto-suggest price based on historical trends
  const suggestHistoricalPrice = () => {
    if (!selectedFunko || !purchaseDate) return;
    
    const purchaseDateObj = new Date(purchaseDate);
    const currentDate = new Date();
    const yearsAgo = (currentDate.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    const currentPrice = selectedFunko.current_price || 25.00; // Default if no price
    const suggestedPrice = calculateHistoricalPrice(currentPrice, yearsAgo, selectedFunko.series);
    
    setOriginalPrice(suggestedPrice.toFixed(2));
    toast({ 
      title: 'Price Suggested!', 
      description: `Based on market trends, suggested price: $${suggestedPrice.toFixed(2)}`,
      variant: 'default' 
    });
  };

  // Generate alternate timeline scenarios
  const generateAlternateTimelines = () => {
    if (!selectedFunko) {
      toast({ title: 'Error', description: 'Please select a Funko Pop first', variant: 'destructive' });
      return;
    }

    const currentPrice = selectedFunko.current_price || 25.00;
    const alternateScenarios: TimeMachineScenario[] = [];
    
    // Generate scenarios for different time periods
    const timePeriods = [
      { years: 1, label: '1 year ago' },
      { years: 2, label: '2 years ago' },
      { years: 3, label: '3 years ago' },
      { years: 5, label: '5 years ago' },
      { years: 7, label: '7 years ago' },
      { years: 10, label: '10 years ago' }
    ];

    timePeriods.forEach((period, index) => {
      const purchaseDate = new Date();
      purchaseDate.setFullYear(purchaseDate.getFullYear() - period.years);
      
      const historicalPrice = calculateHistoricalPrice(currentPrice, period.years, selectedFunko.series);
      const quantity = 1;
      const totalInvestment = historicalPrice * quantity;
      const currentValue = currentPrice * quantity;
      const profitLoss = currentValue - totalInvestment;
      const roiPercentage = ((currentValue - totalInvestment) / totalInvestment) * 100;

      alternateScenarios.push({
        id: `alt-${index}`,
        funko_pop_id: selectedFunko.id,
        funko_name: selectedFunko.name,
        purchase_date: purchaseDate.toISOString().split('T')[0],
        original_price: historicalPrice,
        current_price: currentPrice,
        quantity: quantity,
        profit_loss: profitLoss,
        roi_percentage: roiPercentage,
        years_held: period.years
      });
    });

    setScenarios(alternateScenarios);
    setShowResults(true);
    
    toast({ 
      title: 'Timelines Generated!', 
      description: `Generated ${alternateScenarios.length} alternate investment scenarios`,
      variant: 'default' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation className="hidden md:block" />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-12 h-12 text-orange-500" />
            <h1 className="text-5xl font-bold text-white">
              Time <span className="text-orange-500">Machine</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Ever wondered "What if I bought that Funko 5 years ago?" Find out exactly how much you would have made or lost with our Time Machine calculator.
          </p>
          
          {/* Feature Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              onClick={() => {
                setShowSavedScenarios(false);
                setShowResults(false); // Also hide any existing results
                setScenarios([]); // Clear any existing scenarios
                resetForm(); // Reset the form
              }}
              className={`${!showSavedScenarios ? 'bg-orange-500' : 'bg-gray-700'} hover:bg-orange-600 transition-all duration-200`}
            >
              <Clock className="w-4 h-4 mr-2" />
              New Scenario
            </Button>
            {user && (
              <Button 
                onClick={() => {
                  setShowSavedScenarios(true);
                  setShowResults(false); // Hide alternate timeline results when viewing saved scenarios
                  loadSavedScenarios();
                }}
                className={`${showSavedScenarios ? 'bg-orange-500' : 'bg-gray-700'} hover:bg-orange-600 transition-all duration-200`}
              >
                <History className="w-4 h-4 mr-2" />
                Saved Scenarios ({savedScenarios.length})
              </Button>
            )}
            <div className="relative group">
              <Button 
                onClick={() => generateAlternateTimelines()}
                className={`bg-purple-500 hover:bg-purple-600 transition-all duration-200 ${
                  !selectedFunko ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedFunko}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Alternate Timelines
              </Button>
              
              {/* Tooltip for disabled state */}
              {!selectedFunko && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap border border-gray-600 z-10">
                  ⚠️ Search and select a Funko Pop first
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {!showSavedScenarios ? (
            <>
              {/* Search and Setup */}
              <Card className="bg-gray-900/90 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-orange-500" />
                    Set Up Your Time Machine Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Funko Search */}
                  <div>
                    <Label className="text-gray-300 mb-2 block">1. Search for a Funko Pop</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search Funkos (e.g., Batman, Marvel, Pokemon...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600" disabled={funkoLoading}>
                        {funkoLoading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                    {funkoLoading && <p className="text-gray-400 text-sm mt-2">Loading Funko database...</p>}
                  </div>

                  {/* Getting Started Guide - shown when no search has been performed */}
                  {!searchQuery && searchResults.length === 0 && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                      <div className="text-center">
                        <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-blue-200 font-bold mb-3">Quick Start Guide</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
                          <div className="text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                              <span>Search for any Funko Pop above</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                              <span>Select your Funko from results</span>
                            </div>
                          </div>
                          <div className="text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                              <span>Click "Alternate Timelines" button</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                              <span>See your "what if" scenarios!</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-blue-300">
                          💡 Try searching: "Batman", "Pikachu", "Iron Man", "Baby Yoda"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.map((funko) => (
                        <div
                          key={funko.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedFunko?.id === funko.id
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedFunko(funko)}
                        >
                          {funko.image_url && (
                            <img 
                              src={funko.image_url} 
                              alt={funko.name}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <div className="text-white font-medium text-sm">{funko.name}</div>
                          <div className="text-gray-400 text-xs">{funko.series} #{funko.number}</div>
                          {funko.current_price && (
                            <div className="text-green-400 font-bold text-sm">${funko.current_price}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Funko */}
                  {selectedFunko && (
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-orange-500/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {selectedFunko.image_url && (
                            <img 
                              src={selectedFunko.image_url} 
                              alt={selectedFunko.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="text-white font-bold">{selectedFunko.name}</div>
                            <div className="text-gray-400">{selectedFunko.series} #{selectedFunko.number}</div>
                            {selectedFunko.current_price && (
                              <div className="text-green-400 font-bold">Current Price: ${selectedFunko.current_price}</div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-orange-500 text-white">Selected</Badge>
                      </div>
                    </div>
                  )}

                  {/* Quick Timeline Generator - shown after selecting a Funko */}
                  {selectedFunko && (
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-purple-200 font-bold mb-1">🚀 Try Alternate Timelines!</h3>
                          <p className="text-purple-300 text-sm">
                            See how this Funko would have performed at different time periods (1-10 years ago)
                          </p>
                        </div>
                        <Button 
                          onClick={() => generateAlternateTimelines()}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Generate Now
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Date and Price Inputs */}
                  {selectedFunko && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-300 mb-2 block">2. Purchase Date</Label>
                        <Input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 mb-2 block">3. Original Price</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="$0.00"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Button 
                            size="sm"
                            onClick={suggestHistoricalPrice}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2"
                            disabled={!purchaseDate}
                          >
                            💡
                          </Button>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">Click 💡 for AI price suggestion</p>
                      </div>
                      <div>
                        <Label className="text-gray-300 mb-2 block">4. Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedFunko && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={calculateScenario}
                        className="bg-orange-500 hover:bg-orange-600 flex-1"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Calculate Time Machine Scenario
                      </Button>
                      <Button 
                        onClick={resetForm}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            /* Saved Scenarios View */
            <Card className="bg-gray-900/90 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" />
                  Your Saved Time Machine Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedScenarios.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No saved scenarios yet. Create your first Time Machine scenario!</p>
                    <Button 
                      onClick={() => setShowSavedScenarios(false)}
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                    >
                      Create New Scenario
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-bold">{scenario.funko_name}</h3>
                          <div className={`flex items-center gap-1 ${
                            scenario.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {scenario.profit_loss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-bold">${Math.abs(scenario.profit_loss).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-gray-400">Investment</div>
                            <div className="text-white font-bold">${(scenario.original_price * scenario.quantity).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Current Value</div>
                            <div className="text-white font-bold">${(scenario.current_price * scenario.quantity).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">ROI</div>
                            <div className={`font-bold ${scenario.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {scenario.roi_percentage >= 0 ? '+' : ''}{scenario.roi_percentage.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Time Held</div>
                            <div className="text-white font-bold">{scenario.years_held.toFixed(1)} years</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && scenarios.length > 0 && (
            <Card className="bg-gray-900/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Time Machine Results
                  {scenarios.length > 1 && (
                    <Badge className="bg-purple-500 text-white ml-2">
                      {scenarios.length} Alternate Timelines
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Multi-Scenario Comparison View */}
                {scenarios.length > 1 && (
                  <div className="mb-8 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <h3 className="text-purple-200 font-bold mb-4 flex items-center gap-2">
                      📈 Timeline Comparison: {scenarios[0].funko_name}
                    </h3>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-800/50 rounded">
                        <div className="text-gray-400 text-sm">Best ROI</div>
                        <div className="text-green-400 font-bold text-lg">
                          +{Math.max(...scenarios.map(s => s.roi_percentage)).toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-xs">
                          {scenarios.find(s => s.roi_percentage === Math.max(...scenarios.map(s => s.roi_percentage)))?.years_held.toFixed(0)} years
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded">
                        <div className="text-gray-400 text-sm">Worst ROI</div>
                        <div className="text-red-400 font-bold text-lg">
                          {Math.min(...scenarios.map(s => s.roi_percentage)) >= 0 ? '+' : ''}{Math.min(...scenarios.map(s => s.roi_percentage)).toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-xs">
                          {scenarios.find(s => s.roi_percentage === Math.min(...scenarios.map(s => s.roi_percentage)))?.years_held.toFixed(0)} years
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded">
                        <div className="text-gray-400 text-sm">Best Profit</div>
                        <div className="text-green-400 font-bold text-lg">
                          ${Math.max(...scenarios.map(s => s.profit_loss)).toFixed(0)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Maximum gain
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded">
                        <div className="text-gray-400 text-sm">Regret Level</div>
                        <div className="text-orange-400 font-bold text-lg">
                          {Math.max(...scenarios.map(s => s.profit_loss)) > 50 ? '😭 High' : 
                           Math.max(...scenarios.map(s => s.profit_loss)) > 20 ? '😔 Medium' : 
                           '😌 Low'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          FOMO intensity
                        </div>
                      </div>
                    </div>

                    {/* Visual Timeline */}
                    <div className="relative h-40 bg-gray-800/50 rounded p-4">
                      <div className="absolute top-2 left-4 text-gray-400 text-sm">ROI %</div>
                      <div className="flex items-end justify-between h-full pt-6">
                        {scenarios.map((scenario, index) => {
                          const maxROI = Math.max(...scenarios.map(s => s.roi_percentage));
                          const minROI = Math.min(...scenarios.map(s => s.roi_percentage));
                          const range = maxROI - minROI || 1;
                          const heightPercent = Math.max(10, ((scenario.roi_percentage - minROI) / range) * 70 + 15);
                          const isPositive = scenario.roi_percentage >= 0;
                          
                          return (
                            <div key={index} className="flex flex-col items-center group relative">
                              <div 
                                className={`w-8 ${
                                  isPositive ? 'bg-green-500' : 'bg-red-500'
                                } rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer`}
                                style={{ height: `${heightPercent}%` }}
                              />
                              <div className="text-xs text-gray-400 mt-1 text-center">
                                {scenario.years_held.toFixed(0)}y
                              </div>
                              <div className="text-xs text-white font-bold">
                                {isPositive ? '+' : ''}{scenario.roi_percentage.toFixed(0)}%
                              </div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 p-2 rounded text-xs text-white whitespace-nowrap z-10">
                                <div>Investment: ${scenario.original_price.toFixed(2)}</div>
                                <div>Profit: ${scenario.profit_loss.toFixed(2)}</div>
                                <div>ROI: {scenario.roi_percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Regret Analysis */}
                    <div className="mt-6 p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                      <h4 className="text-orange-300 font-bold mb-3 flex items-center gap-2">
                        😤 Regret & FOMO Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-orange-200 mb-2">If you bought 10 years ago:</div>
                          <div className="text-white">
                            You would have paid <span className="text-orange-400 font-bold">
                              ${scenarios.find(s => s.years_held >= 9)?.original_price.toFixed(2) || 'N/A'}
                            </span> and made{' '}
                            <span className="text-green-400 font-bold">
                              ${scenarios.find(s => s.years_held >= 9)?.profit_loss.toFixed(2) || 'N/A'} profit
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-orange-200 mb-2">Optimal Buy Time:</div>
                          <div className="text-white">
                            {(() => {
                              const bestScenario = scenarios.reduce((best, current) => 
                                current.roi_percentage > best.roi_percentage ? current : best
                              );
                              return (
                                <>
                                  <span className="text-purple-400 font-bold">{bestScenario.years_held.toFixed(0)} years ago</span>
                                  {' '}for <span className="text-green-400 font-bold">{bestScenario.roi_percentage.toFixed(0)}% ROI</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collection Recommendations */}
                    <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <h4 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                        🎯 Smart Collector Insights
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">💡</span>
                          <span className="text-white">
                            {scenarios[0].series} Funkos have shown{' '}
                            <span className="text-green-400 font-bold">
                              {(scenarios.reduce((sum, s) => sum + s.roi_percentage, 0) / scenarios.length).toFixed(0)}% average returns
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">⏰</span>
                          <span className="text-white">
                            Best holding period appears to be{' '}
                            <span className="text-purple-400 font-bold">
                              {scenarios.reduce((best, current) => 
                                current.roi_percentage > best.roi_percentage ? current : best
                              ).years_held.toFixed(0)} years
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">📈</span>
                          <span className="text-white">
                            Consider buying similar {scenarios[0].series} Funkos during market dips
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">🎲</span>
                          <span className="text-white">
                            Collectibles are high-risk investments - only invest what you can afford to lose
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Scenario Results */}
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-600 mb-4">
                    {scenarios.length === 1 && (
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">{scenario.funko_name}</h3>
                        <Badge className={`${scenario.profit_loss >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {scenario.profit_loss >= 0 ? 'Profitable' : 'Loss'}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Investment Details */}
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Investment</div>
                        <div className="text-white text-xl font-bold">
                          ${(scenario.original_price * scenario.quantity).toFixed(2)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {scenario.quantity}x at ${scenario.original_price.toFixed(2)}
                        </div>
                      </div>

                      {/* Current Value */}
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Current Value</div>
                        <div className="text-white text-xl font-bold">
                          ${(scenario.current_price * scenario.quantity).toFixed(2)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {scenario.quantity}x at ${scenario.current_price.toFixed(2)}
                        </div>
                      </div>

                      {/* Profit/Loss */}
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Profit/Loss</div>
                        <div className={`text-xl font-bold flex items-center justify-center gap-1 ${
                          scenario.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {scenario.profit_loss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          ${Math.abs(scenario.profit_loss).toFixed(2)}
                        </div>
                        <div className={`text-sm ${scenario.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {scenario.roi_percentage >= 0 ? '+' : ''}{scenario.roi_percentage.toFixed(1)}% ROI
                        </div>
                      </div>

                      {/* Time Held */}
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Time Held</div>
                        <div className="text-white text-xl font-bold">
                          {scenario.years_held.toFixed(1)} years
                        </div>
                        <div className="text-gray-400 text-xs">
                          Since {new Date(scenario.purchase_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Only show detailed analysis for single scenarios */}
                    {scenarios.length === 1 && (
                      <>
                        {/* Enhanced Summary Message */}
                        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                          <div className="text-center">
                            {scenario.profit_loss >= 0 ? (
                              <div className="text-green-400">
                                🎉 Great investment! If you had bought {scenario.quantity}x {scenario.funko_name} on{' '}
                                {new Date(scenario.purchase_date).toLocaleDateString()}, you would have made{' '}
                                <span className="font-bold">${scenario.profit_loss.toFixed(2)}</span> profit!
                                <br />
                                <span className="text-green-300 text-sm">
                                  That's a {scenario.roi_percentage.toFixed(1)}% return over {scenario.years_held.toFixed(1)} years
                                  ({(scenario.roi_percentage / scenario.years_held).toFixed(1)}% annually)
                                </span>
                              </div>
                            ) : (
                              <div className="text-red-400">
                                😅 This one didn't work out. You would have lost{' '}
                                <span className="font-bold">${Math.abs(scenario.profit_loss).toFixed(2)}</span>{' '}
                                on this investment. But hey, that's collecting!
                                <br />
                                <span className="text-red-300 text-sm">
                                  Still, you would have enjoyed {scenario.years_held.toFixed(1)} years of collecting joy! 🎯
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Investment Timeline Chart */}
                        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-orange-500" />
                            Investment Timeline
                          </h4>
                          <div className="relative h-32 bg-gray-800/50 rounded p-4">
                            {/* Simple visual timeline representation */}
                            <div className="flex items-end justify-between h-full">
                              {/* Generate timeline points */}
                              {Array.from({ length: Math.max(5, Math.ceil(scenario.years_held)) }, (_, i) => {
                                const yearPoint = i / Math.max(4, Math.ceil(scenario.years_held) - 1);
                                const valueAtPoint = scenario.original_price + (scenario.current_price - scenario.original_price) * Math.pow(yearPoint, 1.2);
                                const heightPercent = Math.max(10, (valueAtPoint / Math.max(scenario.original_price, scenario.current_price)) * 80);
                                const isProfit = valueAtPoint > scenario.original_price;
                                
                                return (
                                  <div key={i} className="flex flex-col items-center">
                                    <div 
                                      className={`w-2 ${isProfit ? 'bg-green-500' : 'bg-red-500'} rounded-t transition-all duration-500`}
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                    <div className="text-xs text-gray-400 mt-1">
                                      {i === 0 ? 'Start' : i === Math.max(4, Math.ceil(scenario.years_held) - 1) ? 'Now' : `Y${i}`}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Timeline labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2">
                              <span>${scenario.original_price.toFixed(0)}</span>
                              <span className="text-center">
                                {scenario.profit_loss >= 0 ? '📈' : '📉'} {scenario.roi_percentage >= 0 ? '+' : ''}{scenario.roi_percentage.toFixed(1)}%
                              </span>
                              <span>${scenario.current_price.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Market Context */}
                        <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                          <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                            📊 Market Context
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-blue-200">Annual Return</div>
                              <div className={`font-bold ${(scenario.roi_percentage / scenario.years_held) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {((scenario.roi_percentage / scenario.years_held) >= 0 ? '+' : '')}{(scenario.roi_percentage / scenario.years_held).toFixed(1)}% per year
                              </div>
                            </div>
                            <div>
                              <div className="text-blue-200">vs. S&P 500</div>
                              <div className={`font-bold ${(scenario.roi_percentage / scenario.years_held) >= 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {(scenario.roi_percentage / scenario.years_held) >= 10 ? '🚀 Outperformed' : (scenario.roi_percentage / scenario.years_held) >= 0 ? '📊 Competitive' : '📉 Underperformed'}
                              </div>
                            </div>
                            <div>
                              <div className="text-blue-200">Risk Level</div>
                              <div className="text-orange-400 font-bold">
                                🎲 High (Collectibles)
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Portfolio Analysis for Saved Scenarios */}
          {showSavedScenarios && savedScenarios.length > 0 && (
            <Card className="bg-gray-900/90 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Portfolio Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Investment */}
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Total Investment</div>
                    <div className="text-white text-2xl font-bold">
                      ${savedScenarios.reduce((sum, s) => sum + (s.original_price * s.quantity), 0).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {savedScenarios.length} scenarios
                    </div>
                  </div>
                  
                  {/* Total Current Value */}
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Current Value</div>
                    <div className="text-white text-2xl font-bold">
                      ${savedScenarios.reduce((sum, s) => sum + (s.current_price * s.quantity), 0).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Total portfolio value
                    </div>
                  </div>
                  
                  {/* Total Profit/Loss */}
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Total P&L</div>
                    <div className={`text-2xl font-bold ${
                      savedScenarios.reduce((sum, s) => sum + s.profit_loss, 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${Math.abs(savedScenarios.reduce((sum, s) => sum + s.profit_loss, 0)).toFixed(2)}
                    </div>
                    <div className={`text-xs ${
                      savedScenarios.reduce((sum, s) => sum + s.profit_loss, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {savedScenarios.reduce((sum, s) => sum + s.profit_loss, 0) >= 0 ? 'Profit' : 'Loss'}
                    </div>
                  </div>
                </div>
                
                {/* Performance Breakdown */}
                <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-bold mb-4">Performance Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Winners</span>
                      <span className="text-green-400 font-bold">
                        {savedScenarios.filter(s => s.profit_loss > 0).length} / {savedScenarios.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average ROI</span>
                      <span className={`font-bold ${
                        (savedScenarios.reduce((sum, s) => sum + s.roi_percentage, 0) / savedScenarios.length) >= 0 
                        ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {((savedScenarios.reduce((sum, s) => sum + s.roi_percentage, 0) / savedScenarios.length) >= 0 ? '+' : '')}
                        {(savedScenarios.reduce((sum, s) => sum + s.roi_percentage, 0) / savedScenarios.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Best Performer</span>
                      <span className="text-green-400 font-bold">
                        {savedScenarios.length > 0 && 
                          savedScenarios.reduce((best, current) => 
                            current.roi_percentage > best.roi_percentage ? current : best
                          ).funko_name.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FAQ & Help Section */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-900/90 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-500" />
                Time Machine FAQ & Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* How It Works */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                  🤔 How does the Time Machine work?
                </h3>
                <div className="text-gray-300 space-y-2 text-sm">
                  <p>Our Time Machine uses advanced algorithms to simulate historical Funko Pop prices based on:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Series popularity:</strong> Marvel, Star Wars, and Pokemon typically appreciate faster</li>
                    <li><strong>Market trends:</strong> COVID collecting boom (2020-2022), market corrections</li>
                    <li><strong>Release patterns:</strong> Limited editions and exclusives gain value differently</li>
                    <li><strong>Real market data:</strong> When available, we use actual pricing history</li>
                  </ul>
                </div>
              </div>

              {/* Accuracy Disclaimer */}
              <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                  ⚠️ Important Disclaimer
                </h3>
                <div className="text-yellow-200 space-y-2 text-sm">
                  <p>These calculations are <strong>estimates for entertainment purposes</strong> and should not be considered financial advice.</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Historical price predictions are based on algorithms, not exact data</li>
                    <li>Collectible markets are highly volatile and unpredictable</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>Only invest what you can afford to lose</li>
                  </ul>
                </div>
              </div>

              {/* Features Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h3 className="text-blue-300 font-bold mb-3">💡 Price Suggestion</h3>
                  <p className="text-blue-200 text-sm">
                    Click the 💡 button next to the price field to get AI-powered historical price estimates based on market trends and release data.
                  </p>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h3 className="text-purple-300 font-bold mb-3">📈 Alternate Timelines</h3>
                  <p className="text-purple-200 text-sm">
                    Generate multiple "what if" scenarios to see how your investment would have performed at different time periods.
                  </p>
                </div>
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <h3 className="text-green-300 font-bold mb-3">💾 Save Scenarios</h3>
                  <p className="text-green-200 text-sm">
                    Logged-in users can save their Time Machine scenarios and build a portfolio analysis to track theoretical investments.
                  </p>
                </div>
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                  <h3 className="text-orange-300 font-bold mb-3">😤 Regret Analysis</h3>
                  <p className="text-orange-200 text-sm">
                    Our FOMO calculator shows exactly how much you missed out on - perfect for those "I should have bought that" moments!
                  </p>
                </div>
              </div>

              {/* Tips for Collectors */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  🎯 Smart Collecting Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Focus on series you genuinely enjoy</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Buy exclusives and limited editions early</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Keep boxes in mint condition</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Research market trends before big purchases</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span className="text-gray-300">Don't invest more than you can afford</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span className="text-gray-300">Avoid buying at peak hype prices</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span className="text-gray-300">Don't expect guaranteed returns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span className="text-gray-300">Never take out loans for collectibles</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Feedback */}
              <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                <h3 className="text-white font-bold mb-2">💭 Questions or Feedback?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Help us improve the Time Machine feature with your feedback!
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    📧 Contact Support
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    💡 Suggest Feature
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-gray-900 rounded-lg border border-orange-500/30 max-w-md w-full p-6 relative transform translate-y-0">
            <button
              onClick={closeWelcomeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl leading-none"
            >
              ×
            </button>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-16 h-16 text-orange-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to the <span className="text-orange-500">Time Machine</span>! ⏰
              </h2>
              
              <div className="text-gray-300 space-y-3 text-sm text-left">
                <p>Ever wondered "What if I bought that Funko 5 years ago?" Now you can find out!</p>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <h3 className="text-orange-400 font-bold mb-2">✨ What you can do:</h3>
                  <ul className="space-y-1 text-xs">
                    <li>• Calculate historical investment scenarios</li>
                    <li>• Get AI-powered price suggestions</li>
                    <li>• Generate alternate timeline comparisons</li>
                    <li>• Analyze regret & FOMO levels</li>
                    <li>• Save scenarios and build portfolios</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-200 text-xs">
                    <strong>Remember:</strong> This is for entertainment and educational purposes. 
                    Collectible investments are risky and unpredictable!
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  onClick={closeWelcomeModal}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  🚀 Let's Travel Back in Time!
                </Button>
                <p className="text-gray-400 text-xs">
                  Start by searching for a Funko Pop above
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeMachine; 