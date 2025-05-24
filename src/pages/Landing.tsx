
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-500">Pop</span>
                <span className="text-white">Guide</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
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
            <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-900/30">
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
              <div className="text-2xl font-bold mb-4">
                <span className="text-orange-500">Pop</span>
                <span className="text-white">Guide</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for Funko Pop collectors to track, value, and showcase their collections.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500">Features</a></li>
                <li><a href="#" className="hover:text-orange-500">Pricing</a></li>
                <li><a href="#" className="hover:text-orange-500">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-500">About</a></li>
                <li><a href="#" className="hover:text-orange-500">Blog</a></li>
                <li><a href="#" className="hover:text-orange-500">Privacy</a></li>
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
