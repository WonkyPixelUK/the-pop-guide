import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp, Smartphone, Globe, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
                alt="PopGuide Logo" 
                className="h-8 w-auto"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/features" className="text-gray-300 hover:text-orange-500 transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-300 hover:text-orange-500 transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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
            <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-700 hover:text-white px-8 py-3">
              Watch Demo
            </Button>
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
                <p className="text-gray-400 mb-4">Progressive Web App</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>iPhone • iPad</div>
                  <div>Native-like experience</div>
                  <div>Offline capability</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Android</h3>
                <p className="text-gray-400 mb-4">Progressive Web App</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>All Android devices</div>
                  <div>Install from browser</div>
                  <div>Push notifications</div>
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
                className="h-8 w-auto mb-4"
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
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PopGuide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
