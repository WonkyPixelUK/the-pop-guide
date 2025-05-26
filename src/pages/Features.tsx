import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, Star, Shield, TrendingUp, Camera, Search, Bell, Smartphone } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-8">
                    <feature.icon className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center">
                          <Star className="w-4 h-4 text-orange-500 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
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
              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardContent className="p-8">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Web App</h3>
                  <p className="text-gray-400 mb-4">Full-featured web application</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Chrome • Edge • Firefox</div>
                    <div>Safari • Opera • Brave</div>
                    <div>Vivaldi • Arc</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardContent className="p-8">
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
              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardContent className="p-8">
                  <Smartphone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
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
