import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Tablet, 
  Download, 
  Star, 
  Search, 
  BarChart3, 
  Camera, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  Eye,
  Heart,
  TrendingUp,
  Filter,
  Share2,
  Bell,
  MessageSquare,
  Scan,
  Globe,
  Cloud
} from 'lucide-react';

const Ios = () => {
  const appVersion = "1.0.0";
  const appFeatures = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Comprehensive Directory",
      description: "Browse and search through thousands of Funko Pops with advanced filtering options"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Collection Tracking",
      description: "Track your owned Funkos with detailed analytics and collection insights"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Wishlist Management",
      description: "Save items you want with price tracking and availability alerts"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Barcode Scanner",
      description: "Quickly add Funkos to your collection by scanning barcodes"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Price Tracking",
      description: "Real-time market values and price history for your collection"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Advanced Filtering",
      description: "Filter by exclusives, vaulted, chase variants, series, and more"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Features",
      description: "Connect with friends, share collections, and trade Funkos"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description: "Get alerts for price drops, new releases, and trade offers"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Sync",
      description: "Your collection syncs seamlessly across all your devices"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Easy Sharing",
      description: "Share individual Funkos or entire collections with friends"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Detailed Views",
      description: "Complete specifications, images, and collector information"
    }
  ];

  const compatibilityFeatures = [
    "iPhone 12 and newer",
    "iOS 16.0 or later",
    "iPad (9th generation) or newer", 
    "iPadOS 16.0 or later",
    "Apple Watch companion app",
    "Optimized for all screen sizes",
    "Dark mode support",
    "Accessibility features",
    "Offline functionality",
    "iCloud backup & sync"
  ];

  return (
    <>
      <SEO 
        title="iOS & iPad App | The Pop Guide" 
        description="The ultimate Funko Pop collection manager for iOS and iPad. Track your collection, discover new Pops, and connect with collectors worldwide." 
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center gap-4 mb-8">
              <div className="relative">
                <Smartphone className="w-20 h-20 text-orange-500" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="relative">
                <Tablet className="w-20 h-20 text-orange-500" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              PopGuide for <span className="text-orange-500">iOS & iPad</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate Funko Pop collection manager, now available as a native iOS and iPad app. 
              Experience the full power of PopGuide with optimized mobile features.
            </p>
            
            {/* App Store Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="https://pop-gude.expo.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors border border-gray-600"
              >
                <Download className="w-6 h-6" />
                Get on the App Store
              </a>
              <a 
                href="https://pop-gude.expo.app" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg">
                  <Globe className="w-5 h-5 mr-2" />
                  Try Web Version
                </Button>
              </a>
            </div>

            {/* Version Info */}
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-gray-300">
              <Star className="w-4 h-4 text-orange-500" />
              <span>Version {appVersion} • Available Now</span>
            </div>
          </div>
        </section>

        {/* Compatibility Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Device Compatibility
              </h2>
              <p className="text-gray-300 text-xl">
                Optimized for iPhone and iPad with seamless performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* iPhone Compatibility */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">iPhone</h3>
                      <p className="text-gray-400">Pocket-sized collection management</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* iPad Compatibility */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                      <Tablet className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">iPad</h3>
                      <p className="text-gray-400">Enhanced experience for larger screens</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(5).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-300 text-xl">
                Everything you need to manage your Funko Pop collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                See It In Action
              </h2>
              <p className="text-gray-300 text-xl">
                Beautiful, intuitive design that makes managing your collection a joy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <Search className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Directory & Search</h3>
                  <p className="text-gray-400 text-sm">Browse thousands of Funkos with powerful search and filtering</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Collection Analytics</h3>
                  <p className="text-gray-400 text-sm">Track your collection value and get detailed insights</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <Scan className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Barcode Scanner</h3>
                  <p className="text-gray-400 text-sm">Add Funkos instantly by scanning their barcodes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Manage Your Collection?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Download PopGuide for iOS and iPad today and take control of your Funko Pop collection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://pop-gude.expo.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download for iOS
                  </Button>
                </a>
                <a 
                  href="https://pop-gude.expo.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg">
                    <Globe className="w-5 h-5 mr-2" />
                    Try Web Version
                  </Button>
                </a>
              </div>
        </div>
      </div>
        </section>

      <Footer />
    </div>
  </>
);
};

export default Ios; 