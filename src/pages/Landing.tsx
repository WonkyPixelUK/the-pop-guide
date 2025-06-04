import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp, Smartphone, Globe, Monitor, Check, Puzzle, Rocket, CheckCircle, Search, Sparkles, ChevronDown, ChevronUp, Plus, Heart, List as ListIcon, Share2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from '@/components/SEO';
import { useState } from 'react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import Navigation from '@/components/Navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import OnboardingTour from '@/components/OnboardingTour';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddToCollection } from "@/hooks/useFunkoPops";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PriceHistory from '@/components/PriceHistory';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { data: funkoPops = [] } = useFunkoPops();
  const [filter, setFilter] = useState('All');
  const categories = Array.from(new Set(funkoPops.map(pop => pop.series))).filter(Boolean);
  const [expandedPop, setExpandedPop] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [ownedConfirmed, setOwnedConfirmed] = useState(false);
  const { currency } = useCurrency();
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const addToCollection = useAddToCollection();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // TODO: Implement signup logic (e.g., Supabase, API call)
    setSignupSuccess(true);
  };

  const requireLogin = () => {
    if (!user) {
      navigate('/auth');
      return true;
    }
    return false;
  };

  const handleExpandPop = (pop) => {
    setExpandedPop(expandedPop?.id === pop.id ? null : pop);
  };

  const handleWishlist = (pop) => {
    if (requireLogin()) return;
    const isWishlisted = wishlist.some((w) => w.funko_pop_id === pop.id);
    if (isWishlisted) {
      removeFromWishlist.mutate(pop.id);
    } else {
      addToWishlist.mutate({ funkoPopId: pop.id });
    }
  };

  const handleAddToCollection = (pop) => {
    if (requireLogin()) return;
    if (pop.owned || addingToCollection) return;
    
    setAddingToCollection(true);
    addToCollection.mutate(pop.id, {
      onSuccess: () => {
        setOwnedConfirmed(true);
        setAddingToCollection(false);
        toast({ 
          title: '✅ Added to Collection!', 
          description: `${pop.name} has been added to your collection.`
        });
        setTimeout(() => setOwnedConfirmed(false), 5000);
      },
      onError: (error) => {
        setAddingToCollection(false);
        if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          toast({
            title: '✅ Already in Collection',
            description: `${pop.name} is already in your collection.`
          });
          setOwnedConfirmed(true);
          setTimeout(() => setOwnedConfirmed(false), 5000);
        } else {
          toast({
            title: '❌ Failed to Add',
            description: error.message || 'Could not add to collection. Please try again.',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const handleShare = (pop) => {
    const url = `${window.location.origin}/pop/${pop.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this Pop with others.' });
  };

  // Helper function to get the primary image URL (handles both old and new storage methods)
  const getPrimaryImageUrl = (pop) => {
    if (pop.image_urls && Array.isArray(pop.image_urls) && pop.image_urls.length > 0) {
      return pop.image_urls[0];
    }
    if (pop.image_url) {
      return pop.image_url;
    }
    return null;
  };

  // Helper function to render image with CORS handling
  const renderImage = (pop, className = "w-full h-full object-contain") => {
    const imageUrl = getPrimaryImageUrl(pop);
    
    if (!imageUrl) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400 p-4 h-full">
          <Users className="w-16 h-16 text-orange-400 animate-pulse mb-2" />
          <div className="text-xs text-center">No image available</div>
        </div>
      );
    }

    return (
      <img 
        src={imageUrl} 
        alt={pop.name} 
        className={className}
        crossOrigin="anonymous"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector('.image-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'image-fallback flex flex-col items-center justify-center text-gray-400 p-4 h-full';
            fallback.innerHTML = `
              <div class="text-4xl mb-2">📦</div>
              <div class="text-xs text-center">Image unavailable</div>
            `;
            parent.appendChild(fallback);
          }
        }}
      />
    );
  };

  return (
    <>
      <OnboardingTour />
      <SEO />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Use shared Navigation component */}
        <Navigation />
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Your <span className="text-orange-500">Ultimate</span> Funko Pop Collection Manager
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track, value, and showcase your Funko Pop collection with real-time market data, 
              comprehensive management tools, and a community of passionate collectors. 
              <span className="text-orange-400 font-semibold"> Start your free 3-day trial</span> and discover 
              why thousands of collectors trust PopGuide to manage their collections.
            </p>

            {/* Navigation Options - Integrated into Hero */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-8">
              {/* Browse Database */}
              <Link to="/directory-all">
                <Card className="group bg-gradient-to-br from-orange-500 to-orange-600 border-0 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-orange-500/40 cursor-pointer h-full transform hover:-translate-y-3">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <Search className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors duration-300">Browse Database</h3>
                    <p className="text-orange-100 text-sm flex-grow">
                      Explore our massive collection with advanced search
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-yellow-200 text-sm font-semibold">Discover Now →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Live Pricing */}
              <Link to="/pricing">
                <Card className="group bg-gradient-to-br from-blue-500 to-blue-600 border-0 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40 cursor-pointer h-full transform hover:-translate-y-3">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <BarChart3 className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-100 transition-colors duration-300">Live Pricing</h3>
                    <p className="text-blue-100 text-sm flex-grow">
                      Real-time market values and price trends
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-green-200 text-sm font-semibold">Check Values →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* New Releases */}
              <Link to="/new-releases">
                <Card className="group bg-gradient-to-br from-pink-500 to-red-500 border-0 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/40 cursor-pointer h-full transform hover:-translate-y-3">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <Sparkles className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300 animate-pulse" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors duration-300">New Releases</h3>
                    <p className="text-pink-100 text-sm flex-grow">
                      Latest Funko Pop releases and announcements
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-yellow-200 text-sm font-semibold">See Latest →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Coming Soon */}
              <Link to="/coming-soon">
                <Card className="group bg-gradient-to-br from-purple-500 to-indigo-600 border-0 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 cursor-pointer h-full transform hover:-translate-y-3">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <Rocket className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-100 transition-colors duration-300">Coming Soon</h3>
                    <p className="text-purple-100 text-sm flex-grow">
                      Preview upcoming releases and wishlist items
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-orange-200 text-sm font-semibold">Preview Soon →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Funko Exclusives */}
              <Link to="/funko-exclusives">
                <Card className="group bg-gradient-to-br from-yellow-500 to-orange-500 border-0 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/40 cursor-pointer h-full transform hover:-translate-y-3">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <Star className="w-8 h-8 text-white group-hover:scale-125 transition-transform duration-300 animate-pulse" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-100 transition-colors duration-300">Funko Exclusives</h3>
                    <p className="text-yellow-100 text-sm flex-grow">
                      Hunt rare exclusives and limited editions
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-red-200 text-sm font-semibold">Find Exclusives →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                  Start Your Collection Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Modal */}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent className="max-w-2xl w-full bg-gray-900 border border-gray-700">
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                width="100%"
                height="400"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Pop Guide Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>

        {/* Platform Support Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              Available on All Your Devices
            </h2>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Access your collection anywhere with our cross-platform support
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <Monitor className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Web App</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Full-featured web application</p>
                  <div className="text-sm text-gray-300 space-y-1 mb-6">
                    <div>Chrome • Edge • Firefox</div>
                    <div>Safari • Opera • Brave</div>
                    <div>Vivaldi • Arc</div>
                  </div>
                  <Link to="/dashboard" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25">
                      <Globe className="w-4 h-4 mr-2" />
                      Launch App
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Native iOS / iPad App</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Experience the full power of PopGuide with our native iOS and iPad app, featuring optimized mobile features and seamless performance.</p>
                  <Link to="/ios" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Android</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Install as a PWA or download from the Play Store (coming soon).</p>
                  <Link to="/android" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <Puzzle className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-3">Chrome Extension</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Add Pops to your collection from any website. Take a screenshot and the extension fills in the details for you!</p>
                  <Link to="/chrome-extension" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                      <Puzzle className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* New Additions Section */}
        <section className="py-12 px-4 bg-gray-900/30 border-b border-gray-800">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-3xl font-bold text-white">Browse Entire Database</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Filter:</span>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="All">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {funkoPops
                .filter(pop => filter === 'All' || pop.series === filter)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 24)
                .map(pop => {
                  const isExpanded = expandedPop?.id === pop.id;
                  const isWishlisted = wishlist.some((w) => w.funko_pop_id === pop.id);
                  const isOwned = false; // Since this is the home page, we don't track ownership here
                  
                  if (isExpanded) {
                    // Show expanded view for this item
                    return (
                      <div key={pop.id} className="col-span-full">
                        <Card className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Side - Large Image and Buttons */}
                            <div className="lg:w-96 lg:flex-shrink-0">
                              <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden mb-6">
                                {renderImage(pop)}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant={isOwned ? 'default' : 'outline'}
                                  className={
                                    isOwned 
                                      ? 'bg-green-600 text-white hover:bg-green-700 text-sm h-10 font-medium' 
                                      : addingToCollection 
                                      ? 'border-orange-500 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-sm h-10 font-medium' 
                                      : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors text-sm h-10 font-medium'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCollection(pop);
                                  }}
                                  disabled={isOwned || addingToCollection}
                                >
                                  {addingToCollection ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Adding...
                                    </>
                                  ) : isOwned ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Owned
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-1" />
                                      Add
                                    </>
                                  )}
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  className={`text-sm h-10 font-medium transition-colors ${
                                    isWishlisted 
                                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                                      : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(pop);
                                  }}
                                >
                                  <Heart className={`w-4 h-4 mr-1 ${isWishlisted ? 'fill-current' : ''}`} />
                                  {isWishlisted ? 'Remove' : 'Wishlist'}
                                </Button>

                                <Button 
                                  variant="outline" 
                                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors text-sm h-10 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(pop);
                                  }}
                                >
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Share
                                </Button>

                                <Link to={`/pop/${pop.id}`} className="w-full">
                                  <Button 
                                    variant="default" 
                                    className="bg-orange-500 hover:bg-orange-600 text-white transition-colors text-sm h-10 font-medium w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Search className="w-4 h-4 mr-1" />
                                    View Full Details
                                  </Button>
                                </Link>
                              </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-bold text-white mb-6">{pop.name}</h3>
                              <p className="text-gray-400 text-lg mb-6">{pop.series}</p>
                              
                              {/* Basic Info Cards */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Category</div>
                                  <div className="font-semibold text-white text-lg">Pop!</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Number</div>
                                  <div className="font-semibold text-white text-lg">{pop.number || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Estimated Value</div>
                                  <div className="font-semibold text-white text-lg">
                                    {typeof pop.estimated_value === 'number' ? formatCurrency(pop.estimated_value, currency) : 'Pending'}
                                  </div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Series</div>
                                  <div className="font-semibold text-white text-lg">{pop.series || '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Release Year</div>
                                  <div className="font-semibold text-white text-lg">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}</div>
                                </div>
                                
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                  <div className="text-sm text-gray-400 mb-1">Vaulted</div>
                                  <div className="font-semibold text-white text-lg">{pop.is_vaulted ? 'Yes' : 'No'}</div>
                                </div>
                              </div>

                              {/* Collapse Button */}
                              <Button 
                                variant="outline" 
                                onClick={() => handleExpandPop(pop)}
                                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors w-full"
                              >
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Hide Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  }
                  
                  // Regular card view
                  return (
                    <button
                      key={pop.id}
                      className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={() => handleExpandPop(pop)}
                      aria-label={`View details for ${pop.name}`}
                    >
                      <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {renderImage(pop)}
                      </div>
                      <div className="font-semibold text-white text-center text-base mb-1 truncate w-full">{pop.name}</div>
                      <div className="text-xs text-gray-400 mb-1">Character: {pop.name}</div>
                      <div className="text-xs text-gray-400 mb-1">Series: {pop.series}</div>
                      <div className="text-xs text-gray-400 mb-1">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
                      <div className="text-xs text-gray-400 mb-1">{pop.description?.slice(0, 50) || 'No description'}</div>
                      <div className="text-xs text-gray-400 mb-1">{pop.created_at ? new Date(pop.created_at).getFullYear() : '—'}{pop.is_vaulted ? ' • Vaulted' : ''}</div>
                      <div className="text-xs text-orange-400 font-bold mb-2">{typeof pop.estimated_value === 'number' ? formatCurrency(pop.estimated_value, currency) : 'N/A'}</div>
                      
                      <div className="flex items-center text-gray-400 text-xs mt-auto">
                        <ChevronDown className="w-4 h-4" />
                        <span className="ml-1">View Details</span>
                      </div>
                    </button>
                  );
                })}
            </div>
            <div className="flex justify-center mt-8">
              <Link to="/directory-all">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded font-semibold text-lg">
                  See Entire Database
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Everything You Need to Manage Your Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Real-Time Valuations</h3>
                  <p className="text-gray-400">
                    Track your collection's worth with up-to-date market pricing and value trends.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Smart Organization</h3>
                  <p className="text-gray-400">
                    Organize by series, rarity, value, or create custom lists to suit your style.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Community Driven</h3>
                  <p className="text-gray-400">
                    Connect with other collectors, share your finds, and discover rare gems.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Why Choose PopGuide?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
                      <p className="text-gray-400">Your collection data is encrypted and secure. Only you can access your personal collection.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <TrendingUp className="w-6 h-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Market Insights</h3>
                      <p className="text-gray-400">Get detailed analytics on market trends, price history, and investment potential.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Star className="w-6 h-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Database</h3>
                      <p className="text-gray-400">Access thousands of Funko Pops with detailed information, images, and variants.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
                  <p className="text-gray-400 mb-6">Join thousands of collectors who trust PopGuide with their collections.</p>
                  <Link to="/get-started">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Announcement Box: Latest Version & New Features */}
        <section className="py-6 px-4">
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 border border-orange-300 rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <Rocket className="w-10 h-10 text-white animate-bounce" />
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    PopGuide <span className="bg-white/20 text-white px-2 py-1 rounded-lg text-sm animate-pulse">v1.1.2</span>
                  </div>
                  <div className="text-white text-sm mt-1">Latest updates just launched:</div>
                </div>
              </div>
              <ul className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 md:mt-0 text-white text-sm font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-200 animate-pop" /> Enhanced Platform Buttons</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-200 animate-pop" /> Chrome Extension Redesign</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-200 animate-bounce" /> Improved UI/UX Design</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-200 animate-fade-in" /> Mobile App Development</li>
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-200 animate-fade-in" /> Cross-Platform Consistency</li>
                <li className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-orange-200 animate-fade-in" /> Button Styling & Effects</li>
              </ul>
              <div className="flex justify-end mt-4 md:mt-0">
                <Link to="/roadmap#new-features">
                  <Button className="bg-white text-orange-600 font-bold hover:bg-orange-100 transition">
                    See full roadmap & changelog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
      <MobileBottomNav />
    </>
  );
};

export default Landing;
