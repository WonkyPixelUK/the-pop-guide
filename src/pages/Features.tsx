import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp, Camera, Search, Bell, Smartphone, List, Monitor, Globe, MessageCircle, UserPlus, Calendar, PoundSterling, Clock, Mail, Scan, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Valuations",
      description: "Track your collection's worth with up-to-date market pricing and value trends. Get instant notifications when your items appreciate in value.",
      benefits: ["Live market data", "Price history tracking", "Value alerts", "Market trend analysis"]
    },
    {
      icon: Zap,
      title: "Smart Organization",
      description: "Organize by series, rarity, value, or create custom lists. Our AI-powered system suggests optimal organization strategies.",
      benefits: ["Custom categories", "Smart filtering", "Bulk operations", "Advanced search"]
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with other collectors, share your finds, and discover rare gems through our vibrant community.",
      benefits: ["Collector network", "Trading platform", "Expert insights", "Community reviews"]
    },
    {
      icon: Camera,
      title: "Visual Collection",
      description: "High-quality images and detailed photos of every item. Upload your own photos or use our extensive image database.",
      benefits: ["HD image gallery", "Custom photo uploads", "360° view support", "Condition tracking"]
    },
    {
      icon: Search,
      title: "Advanced Discovery",
      description: "Discover new items through our comprehensive database and get recommendations based on your collection.",
      benefits: ["Smart recommendations", "New release alerts", "Wishlist management", "Price drop notifications"]
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Never miss an opportunity with intelligent alerts for price changes, new releases, and collection milestones.",
      benefits: ["Price alerts", "Release notifications", "Collection goals", "Achievement tracking"]
    }
  ];

  return (
    <>
      <SEO title="Features | The Pop Guide" description="Explore features of The Pop Guide." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 md:pb-0">
        <Navigation />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Powerful Features for <span className="text-orange-500">Serious Collectors</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Everything you need to manage, track, and grow your Funko Pop collection with professional-grade tools and insights.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Real-Time Valuations</h3>
                  <p className="text-gray-400">Track your collection's worth with up-to-date market pricing and value trends. Get instant notifications when your items appreciate in value.</p>
                </CardContent>
              </Card>
              
              {/* NEW: New Releases Tracking */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">New Releases Tracking <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Stay ahead with real-time tracking of new releases from Funko Europe and other retailers. Never miss a drop again.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Friend Requests & DM System */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <UserPlus className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Friend Requests & DM <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Connect with fellow collectors through friend requests and direct messaging. Build your collector network.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Dashboard 2.0 <span className="text-blue-400 text-xs">ENHANCED</span></h3>
                  <p className="text-gray-400">Enhanced dashboard with accordion-style interface, improved navigation, and streamlined collection management.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Currency Support */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <PoundSterling className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Multi-Currency Support <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">View prices in £, $, or € based on your preference. Perfect for international collectors.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Enhanced Social Features</h3>
                  <p className="text-gray-400">Public profiles, collection sharing, friend networks, and direct messaging. Join a vibrant community of collectors.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Price History */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Price History Tracking <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Detailed price history charts showing how your items have appreciated over time. Perfect for investment tracking.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Email Notifications */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Email Notifications <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Get email alerts for price changes, new releases, friend requests, and important account updates.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">HD Images & Visuals</h3>
                  <p className="text-gray-400">High-quality images, custom uploads, 360° view support, and condition tracking for every item.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <List className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Custom Lists & Transfer</h3>
                  <p className="text-gray-400">Create, manage, and share custom lists. Transfer ownership to other users with full notification system.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Advanced Search</h3>
                  <p className="text-gray-400">Powerful search and filtering across the entire database. Find exactly what you need, fast.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Smart Value Alerts</h3>
                  <p className="text-gray-400">Get notified when a Pop in your collection or wishlist changes in value, or when it hits your target price.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
                  <p className="text-gray-400">See value trends, acquisition stats, and rarest Pops in your collection with beautiful, interactive analytics.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <List className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Bulk Actions</h3>
                  <p className="text-gray-400">Add, edit, or remove multiple Pops at once. Save time with bulk selection, editing, and removal tools.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <List className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">CSV Import & Export</h3>
                  <p className="text-gray-400">Import your collection from a CSV file or export it for backup, insurance, or sharing. Supports all key fields.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Collection Insurance Report</h3>
                  <p className="text-gray-400">Generate a printable or PDF report of your collection for insurance or record-keeping, including images and values.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Wish Tracker & Drop Alerts</h3>
                  <p className="text-gray-400">Track upcoming releases and get notified when a Pop on your wishlist is available or drops in price.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Gamification & Achievements</h3>
                  <p className="text-gray-400">Earn badges and achievements for collecting, trading, and engaging with the community. Track your streaks and milestones.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Monitor className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Personalized Recommendations</h3>
                  <p className="text-gray-400">Get suggestions for new Pops to collect based on your collection, wishlist, and market trends.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Virtual Shelf Showcase</h3>
                  <p className="text-gray-400">Arrange your collection visually on a virtual shelf and share it with friends or the community.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Premium Badge System */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Premium Badge System <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Show off your Pro status with premium badges and exclusive profile features.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Barcode Scanning */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Scan className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Barcode Scanning <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Quickly add items to your collection by scanning barcodes with your mobile device.</p>
                </CardContent>
              </Card>
              
              {/* NEW: Dark Mode Support */}
              <Card className="bg-gray-800/50 border-gray-700 border-green-400/30">
                <CardContent className="p-8 text-center">
                  <Moon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Dark Mode Support <span className="text-green-400 text-xs">NEW</span></h3>
                  <p className="text-gray-400">Enjoy a beautiful dark interface that's easy on your eyes during late-night collecting sessions.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Monitor className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Export & API Access</h3>
                  <p className="text-gray-400">Export your collection, access data via API, and integrate with other tools.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Mobile & Cross-Platform</h3>
                  <p className="text-gray-400">Access your collection anywhere: web, iOS, Android, and PWA support.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Privacy & Security</h3>
                  <p className="text-gray-400">Your data is encrypted and secure. Only you can access your collection unless you choose to share it.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Support */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Available Everywhere You Are
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-gray-800/50 border-gray-700 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 flex flex-col h-full">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
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
              <Card className="bg-gray-800/50 border-gray-700 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 flex flex-col h-full">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">iOS / iPad</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Progressive Web App</p>
                  <div className="text-sm text-gray-300 space-y-1 mb-6">
                    <div>iPhone • iPad</div>
                    <div>Native-like experience</div>
                    <div>Offline capability</div>
                  </div>
                  <Link to="/ios" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 flex flex-col h-full">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Android</h3>
                  <p className="text-gray-400 mb-4 flex-grow">Progressive Web App</p>
                  <div className="text-sm text-gray-300 space-y-1 mb-6">
                    <div>All Android devices</div>
                    <div>Install from browser</div>
                    <div>Push notifications</div>
                  </div>
                  <Link to="/android" className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start?</h2>
            <p className="text-xl text-gray-300 mb-8">Join thousands of collectors already using PopGuide</p>
            <Link to="/get-started">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                Start Your Collection Journey
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Features;
