import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Castle, Star, Crown, Gem, ArrowRight, User, CheckCircle, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

const GrailGalaxyFeature = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Crown,
      title: "Holy Grail Discovery",
      description: "Identify the most valuable and rare Funko Pops in your collection that qualify as true 'grails'."
    },
    {
      icon: Star,
      title: "Rarity Analysis", 
      description: "Advanced algorithms analyze rarity factors including production numbers, exclusivity, and market availability."
    },
    {
      icon: Gem,
      title: "Value Scoring",
      description: "Get detailed scoring based on current market value, rarity, and potential for future appreciation."
    },
    {
      icon: Trophy,
      title: "Collection Prestige",
      description: "Showcase your most impressive grails and compare your collection's prestige with other collectors."
    }
  ];

  const benefits = [
    "Discover hidden gems in your current collection",
    "Identify which Pops qualify as true 'grails'",
    "Get detailed rarity and value analysis",
    "Track your collection's prestige level",
    "Find grails you're missing from specific series",
    "Prioritize which expensive Pops to hunt for next"
  ];

  return (
    <>
      <SEO title="Grail-Galaxy Feature | The Pop Guide" description="Discover and analyze the holy grails in your Funko Pop collection with The Pop Guide's Grail-Galaxy tool." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 md:pb-0">
        <Navigation />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Castle className="w-16 h-16 text-orange-500" />
              <h1 className="text-5xl font-bold text-white">
                Grail-Galaxy
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Enter the universe of holy grails. Discover the most valuable and rare Funko Pops in your collection, analyze their true worth, and identify the ultimate grails you're still missing.
            </p>
            
            {user ? (
              <Link to="/grail-galaxy">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 text-lg">
                  Explore Grail-Galaxy <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-orange-400 font-medium">Sign in to access Grail-Galaxy</p>
                <Link to="/auth?signin=true">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 text-lg">
                    Sign In to Continue <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">What Grail-Galaxy Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-8">
                    <feature.icon className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* What Qualifies as a Grail */}
            <div className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 rounded-xl p-8 mb-16 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">What Makes a Pop a "Grail"?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Gem className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">High Value</h4>
                  <p className="text-gray-400 text-sm">Typically worth £100+ or significant to your collection's value</p>
                </div>
                <div className="text-center">
                  <Star className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Extreme Rarity</h4>
                  <p className="text-gray-400 text-sm">Limited production, conventions exclusives, or discontinued items</p>
                </div>
                <div className="text-center">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Collector Status</h4>
                  <p className="text-gray-400 text-sm">Highly sought after by the community or culturally significant</p>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gray-800/30 rounded-xl p-8 mb-16">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Use Grail-Galaxy?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Discover Your Grails?</h3>
              <p className="text-gray-400 mb-6">
                {user 
                  ? "Launch Grail-Galaxy from your dashboard and uncover the holy grails in your collection."
                  : "Create an account to unlock Grail-Galaxy and start discovering your most valuable Pops."
                }
              </p>
              
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/grail-galaxy">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3">
                      Explore Grail-Galaxy <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3">
                      Go to Dashboard <User className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/get-started">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3">
                      Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/auth?signin=true">
                    <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3">
                      Sign In <User className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default GrailGalaxyFeature; 