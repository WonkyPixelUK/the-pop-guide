import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, BarChart3, Calendar, ArrowRight, User, CheckCircle, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

const TimeMachineFeature = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: TrendingUp,
      title: "Historical Price Tracking",
      description: "View detailed price history for any Funko Pop, showing how values have changed over months and years."
    },
    {
      icon: BarChart3,
      title: "Value Trend Analysis", 
      description: "Identify patterns and trends in Pop values to make informed collecting and investment decisions."
    },
    {
      icon: Calendar,
      title: "Date Range Selection",
      description: "Choose specific time periods to analyze, from weekly trends to multi-year market movements."
    },
    {
      icon: Target,
      title: "Investment Insights",
      description: "Discover which Pops have appreciated most over time and spot potential future growth opportunities."
    }
  ];

  const benefits = [
    "Track how your collection's value has changed over time",
    "Identify the best times to buy or sell specific Pops",
    "Understand market cycles and seasonal trends",
    "Make data-driven collecting decisions",
    "Spot undervalued Pops before they appreciate",
    "Historical context for current market prices"
  ];

  return (
    <>
      <SEO title="Time Machine Feature | The Pop Guide" description="Travel back in time to see historical Funko Pop prices and value trends with The Pop Guide's Time Machine tool." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 md:pb-0">
        <Navigation />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Clock className="w-16 h-16 text-orange-500" />
              <h1 className="text-5xl font-bold text-white">
                Time Machine
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Travel back in time to see how Funko Pop prices have evolved. Track historical trends, identify patterns, and make smarter collecting decisions with our powerful time-based analytics.
            </p>
            
            {user ? (
              <Link to="/time-machine">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 text-lg">
                  Launch Time Machine <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-orange-400 font-medium">Sign in to access Time Machine</p>
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
            <h2 className="text-3xl font-bold text-white text-center mb-12">What Time Machine Offers</h2>
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

            {/* Benefits Section */}
            <div className="bg-gray-800/30 rounded-xl p-8 mb-16">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Use Time Machine?</h3>
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
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Explore Pop History?</h3>
              <p className="text-gray-400 mb-6">
                {user 
                  ? "Access Time Machine from your dashboard and start analyzing historical price data."
                  : "Create an account to unlock Time Machine and start tracking Pop value trends over time."
                }
              </p>
              
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/time-machine">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3">
                      Launch Time Machine <ArrowRight className="ml-2 w-5 h-5" />
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

export default TimeMachineFeature; 