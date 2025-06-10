import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Search,
  DollarSign,
  Clock,
  Star,
  Zap,
  BarChart3,
  Globe,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Target,
  Timer,
  Database
} from 'lucide-react';

const LivePricing = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-orange-400" />,
      title: "Real-Time Price Tracking",
      description: "Monitor live marketplace prices across multiple platforms including eBay, Mercari, and more.",
      benefit: "Never miss a deal or overpay again"
    },
    {
      icon: <Bell className="w-6 h-6 text-orange-400" />,
      title: "Smart Price Alerts",
      description: "Set custom price alerts for any Funko Pop and get notified instantly when prices drop to your target.",
      benefit: "Get alerts via email and dashboard notifications"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-orange-400" />,
      title: "Historical Price Analytics",
      description: "View detailed price history charts, trends, and market analytics to make informed buying decisions.",
      benefit: "Understand market patterns and timing"
    },
    {
      icon: <Globe className="w-6 h-6 text-orange-400" />,
      title: "Multi-Platform Coverage",
      description: "We scrape prices from all major marketplaces to give you the most comprehensive view.",
      benefit: "Find the best deals across all platforms"
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-orange-400" />,
      title: "Live Updates",
      description: "Prices are updated in real-time throughout the day to ensure you have the latest information.",
      benefit: "Always current, never outdated data"
    },
    {
      icon: <Target className="w-6 h-6 text-orange-400" />,
      title: "Condition Filtering",
      description: "Filter prices by condition (Mint, Near Mint, Good) to find exactly what you're looking for.",
      benefit: "Match your quality preferences with pricing"
    }
  ];

  const pricingStats = [
    { label: "Funko Pops Tracked", value: "50,000+", icon: <Database className="w-5 h-5" /> },
    { label: "Price Updates Daily", value: "1M+", icon: <RefreshCw className="w-5 h-5" /> },
    { label: "Marketplaces Monitored", value: "15+", icon: <Globe className="w-5 h-5" /> },
    { label: "Active Price Alerts", value: "25,000+", icon: <Bell className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <DollarSign className="w-12 h-12 text-orange-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Live Pricing Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Track real-time Funko Pop prices across all major marketplaces, set intelligent price alerts, 
            and make informed buying decisions with comprehensive market analytics.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/get-started">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold">
                Start Tracking Prices Free
              </Button>
            </Link>
            <Link to="/auth?signin=true">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg font-semibold">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {pricingStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-orange-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Powerful Pricing Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-3">{feature.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">{feature.benefit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How Live Pricing Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Search & Select</h3>
              <p className="text-gray-300">
                Search our database of 50,000+ Funko Pops and select the ones you want to track
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Set Price Alerts</h3>
              <p className="text-gray-300">
                Configure custom price alerts with your target prices and preferred conditions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Get Notified</h3>
              <p className="text-gray-300">
                Receive instant notifications when prices hit your targets or interesting deals appear
              </p>
            </div>
          </div>
        </div>

        {/* Sample Dashboard Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Preview: Live Pricing Dashboard
          </h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Search Results</h3>
              <Badge className="bg-green-500 text-white">Live Data</Badge>
            </div>
            
            {/* Mock search results */}
            <div className="space-y-4">
              {[
                { name: "Naruto - Naruto Uzumaki", series: "Animation", number: "71", price: "$12.99", trend: "down" },
                { name: "Marvel - Spider-Man", series: "Marvel", number: "03", price: "$25.50", trend: "up" },
                { name: "Star Wars - Baby Yoda", series: "The Mandalorian", number: "368", price: "$18.75", trend: "stable" }
              ].map((pop, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600 rounded"></div>
                    <div>
                      <h4 className="text-white font-medium">{pop.name}</h4>
                      <p className="text-gray-400 text-sm">{pop.series} #{pop.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{pop.price}</span>
                    {pop.trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {pop.trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {pop.trend === "stable" && <div className="w-4 h-0.5 bg-gray-400"></div>}
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Track Price
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-4">Sign up to access the full pricing dashboard with unlimited tracking</p>
              <Link to="/get-started">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Get Full Access
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center bg-gray-800 rounded-lg p-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Tracking Prices?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of collectors who are already saving money with our live pricing alerts
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold">
                <Users className="w-5 h-5 mr-2" />
                Join Free Today
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-3 text-lg font-semibold">
                <Star className="w-5 h-5 mr-2" />
                View All Features
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LivePricing; 