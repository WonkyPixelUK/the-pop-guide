import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import SEO from '@/components/SEO';
import { 
  Gamepad2, 
  MapPin, 
  Users, 
  Calendar, 
  Coins, 
  Trophy, 
  Sparkles, 
  Globe, 
  Building, 
  Zap,
  ArrowRight,
  Play
} from 'lucide-react';

const GrailGalaxyLanding = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Virtual Land Ownership",
      description: "Purchase and customize your own plots in the Funko metaverse. Build your dream collection space."
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "3D World Exploration",
      description: "Navigate through an immersive 3D environment where your Funko collection comes to life."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Community Events",
      description: "Host treasure hunts, trading events, and collector meetups in your virtual space."
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Pop Coins Economy",
      description: "Earn and spend Pop Coins through activities, events, and trading with other collectors."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Collecting",
      description: "Connect with fellow collectors, showcase your grails, and discover new favorites."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Achievements & Rewards",
      description: "Unlock special achievements and earn exclusive rewards for your collecting milestones."
    }
  ];

  const stats = [
    { label: "Virtual Lands", value: "400+", icon: <Globe className="w-4 h-4" /> },
    { label: "Active Collectors", value: "1,200+", icon: <Users className="w-4 h-4" /> },
    { label: "Events Hosted", value: "50+", icon: <Calendar className="w-4 h-4" /> },
    { label: "Pop Coins Earned", value: "10K+", icon: <Coins className="w-4 h-4" /> }
  ];

  return (
    <>
      <SEO title="Grail-Galaxy | The Ultimate Virtual Funko Universe" description="Enter the ultimate virtual Funko universe where collecting meets the metaverse. Own virtual land, host events, and connect with collectors from around the world." />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                The Future of Funko Collecting
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-orange-500">Grail</span>-Galaxy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Enter the ultimate virtual Funko universe where collecting meets the metaverse. 
              Own virtual land, host events, and connect with collectors from around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/grail-galaxy/world">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Enter Grail-Galaxy
                </Button>
              </Link>
              
              {!user && (
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-4 text-lg">
                    Sign Up to Start Collecting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-2 text-orange-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                What Makes Grail-Galaxy Special?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover the features that make our virtual Funko world the ultimate destination for collectors
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/60 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-orange-400">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Get started in Grail-Galaxy in just a few simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Sign Up & Explore</h3>
                <p className="text-gray-400">Create your account and take a tour of the virtual world to find the perfect spot.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Purchase Land</h3>
                <p className="text-gray-400">Use Pop Coins to buy your virtual plot and start customizing your collector space.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Build & Connect</h3>
                <p className="text-gray-400">Create events, showcase your collection, and connect with the global Funko community.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center bg-gradient-to-r from-orange-500/10 to-gray-800/50 rounded-2xl p-12 border border-orange-500/30">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of collectors already building their dream spaces in Grail-Galaxy
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/grail-galaxy/world">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Enter the 3D World
                  </Button>
                </Link>
                
                {!user && (
                  <Link to="/get-started">
                    <Button size="lg" variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-4 text-lg">
                      Get Started Free
                      <Zap className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      <MobileBottomNav />
    </>
  );
};

export default GrailGalaxyLanding; 