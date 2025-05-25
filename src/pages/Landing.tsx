import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp, Smartphone, Globe, Monitor, Check } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from '@/components/SEO';
import { useState } from 'react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import ItemDetailsDialog from '@/components/ItemDetailsDialog';
import Navigation from '@/components/Navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { data: funkoPops = [] } = useFunkoPops();
  const [filter, setFilter] = useState('All');
  const categories = Array.from(new Set(funkoPops.map(pop => pop.series))).filter(Boolean);
  const [selectedPop, setSelectedPop] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    // TODO: Implement signup logic (e.g., Supabase, API call)
    setSignupSuccess(true);
  };

  return (
    <>
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
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                  Start Your Collection Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-600 text-blue-900 hover:bg-gray-700 hover:text-white px-8 py-3" onClick={() => setDemoOpen(true)}>
                Watch Demo
              </Button>
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

        {/* Quick Signup & Pricing Summary */}
        <section className="py-8 px-4 bg-gray-900/60 border-b border-gray-800">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <form onSubmit={handleSignup} className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <input
                type="email"
                required
                placeholder="Enter your email to get started"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 w-full md:w-72"
              />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold">
                Get Started Free
              </button>
            </form>
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <div className="bg-gray-800/80 rounded-xl shadow-lg px-8 py-6 flex flex-col md:flex-row items-center gap-8 max-w-2xl w-full">
                <div className="text-2xl font-extrabold text-white mb-4 w-full text-center">Pricing</div>
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  {/* Free Card */}
                  <div className="flex-1 bg-gray-900/80 rounded-lg px-6 py-6 flex flex-col items-start justify-between min-w-[220px] min-h-[260px]">
                    <div>
                      <div className="text-lg font-bold text-white mb-1">Free</div>
                      <div className="text-orange-400 font-bold text-xl mb-1">$0</div>
                      <div className="text-gray-300 mb-2">Up to 50 items</div>
                    </div>
                    <ul className="text-gray-200 text-sm space-y-2 mt-2 w-full">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Basic collection tracking</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Community access</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Mobile app access</li>
                    </ul>
                  </div>
                  {/* Pro Card */}
                  <div className="flex-1 bg-orange-500/90 rounded-lg px-6 py-6 flex flex-col items-start justify-between min-w-[220px] min-h-[260px] shadow-md">
                    <div>
                      <div className="text-lg font-bold text-white mb-1">Pro</div>
                      <div className="text-white font-bold text-xl mb-1">$3.99 <span className="text-sm font-normal">/mo</span></div>
                      <div className="text-white mb-2">3-day free trial</div>
                    </div>
                    <ul className="text-white text-sm space-y-2 mt-2 w-full">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Unlimited items</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Advanced analytics</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Export & API access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {signupSuccess && (
            <div className="text-green-400 text-center mt-4">Signup successful! Check your email to continue.</div>
          )}
        </section>

        {/* New Additions Section */}
        <section className="py-12 px-4 bg-gray-900/30 border-b border-gray-800">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-3xl font-bold text-white">New Additions</h2>
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
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 12)
                .map(pop => (
                  <button
                    key={pop.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex flex-col items-center hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => setSelectedPop(pop)}
                    aria-label={`View details for ${pop.name}`}
                  >
                    <img src={pop.image_url} alt={pop.name} className="w-20 h-20 object-contain mb-2 rounded" />
                    <div className="font-semibold text-white text-center text-sm mb-1">{pop.name}</div>
                    <div className="text-xs text-gray-400">{pop.series}</div>
                  </button>
                ))}
            </div>
          </div>
        </section>

        {/* Platform Support Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              Available on All Your Devices
            </h2>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Access your collection anywhere with our cross-platform support
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Monitor className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Web App</h3>
                  <p className="text-gray-400 mb-4">Full-featured web application</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Chrome • Edge • Firefox</div>
                    <div>Safari • Opera • Brave</div>
                    <div>Vivaldi • Arc</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">iOS / iPad</h3>
                  <p className="text-gray-400 mb-4">Install as a Progressive Web App (PWA) for a native-like experience.</p>
                  <a href="/ios" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold mb-2">iOS / iPad App Info</a>
                  <div className="text-xs text-gray-300 mt-2">
                    <strong>Install Instructions:</strong><br />
                    1. Open popguide.co.uk in Safari<br />
                    2. Tap the Share icon<br />
                    3. Tap "Add to Home Screen"
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Android</h3>
                  <p className="text-gray-400 mb-4">Install as a PWA or download from the Play Store (coming soon).</p>
                  <a href="/android" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold mb-2">Android App Info</a>
                  <div className="text-xs text-gray-300 mt-2">
                    <strong>Install Instructions:</strong><br />
                    1. Open popguide.co.uk in Chrome<br />
                    2. Tap the menu (⋮) and select "Install App"
                  </div>
                </CardContent>
              </Card>
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
                  <Link to="/auth">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <img 
                  src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
                  alt="PopGuide Logo" 
                  className="h-16 w-auto mb-4"
                />
                <p className="text-gray-400">
                  The ultimate platform for Funko Pop collectors to track, value, and showcase their collections.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/features" className="hover:text-orange-500 transition-colors">Features</Link></li>
                  <li><Link to="/pricing" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
                  <li><a href="#" className="hover:text-orange-500 transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                  <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
                  <li><a href="#" className="hover:text-orange-500 transition-colors">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/about" className="hover:text-orange-500 transition-colors">About</Link></li>
                  <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 PopGuide. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {selectedPop && (
          <ItemDetailsDialog
            item={selectedPop}
            open={!!selectedPop}
            onOpenChange={() => setSelectedPop(null)}
          />
        )}
      </div>
    </>
  );
};

export default Landing;
