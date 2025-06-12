import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Package, TrendingUp, Users, Shield, Crown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { RetailerService } from '@/services/retailerService';
import { useToast } from '@/hooks/use-toast';
import { sendRetailerWelcomeEmail } from '@/hooks/useWelcomeEmail';

const BecomeRetailer = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll simulate the payment process
      await RetailerService.upgradeToRetailer(user.id, {
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      });

      // Send retailer welcome email
      await sendRetailerWelcomeEmail(
        user.email!,
        user.user_metadata?.full_name,
        'Your Business' // This would be collected from a form in a real implementation
      );

      toast({
        title: "Welcome to the Retailer Program!",
        description: "Your account has been upgraded. Check your email for next steps.",
      });

      // Navigate to retailer dashboard
      navigate('/retailer-dashboard');
    } catch (error) {
      console.error('Error upgrading to retailer:', error);
      toast({
        title: "Error",
        description: "Failed to process your upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Package,
      title: "List Your Inventory",
      description: "Showcase your Funko Pop inventory with custom photos, descriptions, and pricing"
    },
    {
      icon: TrendingUp,
      title: "Price Management",
      description: "Set competitive prices and manage special offers for your customers"
    },
    {
      icon: Users,
      title: "Customer Connection",
      description: "Connect directly with collectors looking for specific items"
    },
    {
      icon: Shield,
      title: "Verified Business",
      description: "Get verified status to build trust with potential buyers"
    },
    {
      icon: Star,
      title: "Customer Reviews",
      description: "Build your reputation with customer reviews and ratings"
    },
    {
      icon: Crown,
      title: "Premium Placement",
      description: "Get priority placement in search results and product pages"
    }
  ];

  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      period: "forever",
      description: "Perfect for testing the waters",
      features: [
        "List up to 10 items",
        "Basic business profile",
        "Customer messaging",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "£30",
      period: "per year",
      description: "Everything you need to grow your business",
      features: [
        "Unlimited Funko Pop listings",
        "Enhanced business profile with custom branding",
        "Advanced customer messaging system",
        "Verified retailer badge for trust",
        "Automatic wishlist notifications to customers",
        "New stock alerts to interested buyers",
        "Priority customer support",
        "Detailed sales analytics and insights",
        "Featured placement in search results",
        "Bulk upload and management tools"
      ],
      popular: true
    }
  ];

  return (
    <>
      <SEO title="Become a Retailer | PopGuide" description="Join PopGuide's retailer program and connect with Funko Pop collectors worldwide." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Package className="w-12 h-12 text-orange-400" />
              <h1 className="text-5xl font-bold text-white">Become a Retailer</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of retailers connecting with Funko Pop collectors worldwide. 
              Showcase your inventory, build customer relationships, and grow your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-green-500 text-white px-4 py-2">
                <Check className="w-4 h-4 mr-2" />
                Verified Business Status
              </Badge>
              <Badge className="bg-blue-500 text-white px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Increase Sales
              </Badge>
              <Badge className="bg-purple-500 text-white px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Connect with Collectors
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 pb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/70 border-gray-700 hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-full mr-4">
                      <feature.icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="container mx-auto px-4 pb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`bg-gray-800/70 border-gray-700 relative ${plan.popular ? 'border-orange-500 shadow-xl shadow-orange-500/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-2">
                      <Star className="w-4 h-4 mr-2" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-orange-400">{plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className={`w-full h-12 text-lg font-semibold ${
                      plan.popular 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : `Start ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="container mx-auto px-4 pb-16">
          <Card className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community of successful retailers and start connecting with 
                Funko Pop collectors today. No setup fees, cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/contact')}
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                >
                  Contact Sales Team
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isProcessing ? 'Processing...' : 'Get Started Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default BecomeRetailer; 