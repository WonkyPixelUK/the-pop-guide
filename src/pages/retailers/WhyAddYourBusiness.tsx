import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Package, 
  TrendingUp, 
  Users, 
  Shield, 
  Crown, 
  MessageSquare, 
  BarChart3, 
  Globe,
  Target,
  Zap,
  Store,
  Mail,
  ArrowRight,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';

const WhyAddYourBusiness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: TrendingUp,
      title: "Massive Growth Potential",
      description: "Join the fastest-growing Funko Pop marketplace with 50,000+ active collectors",
      stats: "500% average sales increase in first 6 months"
    },
    {
      icon: Users,
      title: "Direct Customer Connection",
      description: "Connect directly with passionate collectors actively searching for specific items",
      stats: "10,000+ daily searches for rare items"
    },
    {
      icon: Shield,
      title: "Verified Business Status",
      description: "Get official verification badge to build instant trust and credibility",
      stats: "3x higher conversion rates for verified retailers"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Reach collectors worldwide with our international platform and shipping tools",
      stats: "Retailers in 25+ countries and growing"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track performance, customer behavior, and optimize your listings for maximum sales",
      stats: "Real-time insights and reporting dashboard"
    },
    {
      icon: MessageSquare,
      title: "Integrated Communication",
      description: "Built-in messaging system for seamless customer communication and support",
      stats: "Average 2-hour response time from retailers"
    }
  ];

  const features = [
    {
      category: "Inventory Management",
      items: [
        "Unlimited Funko Pop listings with high-quality photos",
        "Detailed condition grading and custom descriptions", 
        "Bulk upload tools for large inventories",
        "Automatic stock level tracking and updates",
        "Reserved/sold status management with notifications",
        "Instant wishlist alerts when you add new stock"
      ]
    },
    {
      category: "Marketing & Visibility", 
      items: [
        "Featured placement in search results",
        "Premium business profile customization",
        "Social media integration tools",
        "Email marketing to your customer base",
        "Promotional campaign management"
      ]
    },
    {
      category: "Customer Relations",
      items: [
        "Advanced wishlist notification system",
        "Automatic alerts to customers when items they want are in stock",
        "Customer review and rating system",
        "Direct messaging with potential buyers",
        "Customer contact and inquiry management",
        "Order tracking and status notifications"
      ]
    },
    {
      category: "Business Intelligence",
      items: [
        "Detailed sales analytics and reports",
        "Customer behavior insights",
        "Market trend analysis",
        "Pricing optimization suggestions",
        "Performance benchmarking"
      ]
    }
  ];

  const successStories = [
    {
      name: "FunkoFinder UK",
      type: "Online Store", 
      growth: "800% sales increase",
      story: "Went from £500/month to £4,500/month in sales within 8 months of joining"
    },
    {
      name: "Collectors Corner",
      type: "Physical Store",
      growth: "300+ new customers",
      story: "Expanded customer base from local to nationwide, now shipping across the UK daily"
    },
    {
      name: "Pop Paradise",
      type: "Hobby Seller",
      growth: "Turned passion into business",
      story: "Started as a collector, now generates £2,000+ monthly income through the platform"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "Free",
      period: "forever",
      description: "Perfect for testing the waters",
      features: [
        "List up to 10 items",
        "Basic business profile",
        "Customer messaging",
        "Email support"
      ],
      cta: "Start Free",
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
      cta: "Upgrade Now",
      popular: true
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/retailers/signup');
    } else {
      navigate('/auth?redirect=/retailers/signup');
    }
  };

  return (
    <>
      <SEO 
        title="Why Add Your Business to PopGuide | Retailer Benefits" 
        description="Discover why thousands of retailers choose PopGuide to grow their Funko Pop business. Verified status, global reach, and powerful tools to boost sales." 
      />
      <div className="min-h-screen bg-[#232837] text-white">
        <Navigation />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="container mx-auto px-4 pt-16 pb-20">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TrendingUp className="w-12 h-12 text-orange-400" />
                <h1 className="text-5xl font-bold text-white">Why Add Your Business?</h1>
              </div>
              <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Join the UK's largest Funko Pop marketplace and unlock unprecedented growth for your business. 
                From small collectors to major retailers, everyone is thriving on PopGuide.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 text-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  50,000+ Active Collectors
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 text-lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  500% Average Growth
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-6 py-3 text-lg">
                  <Crown className="w-5 h-5 mr-2" />
                  Verified Business Status
                </Badge>
              </div>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold shadow-lg"
              >
                Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="bg-gray-800/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Transform Your Business with PopGuide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-gray-800/70 border border-gray-700 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="p-4 bg-orange-500/20 rounded-full mr-4">
                        <benefit.icon className="w-8 h-8 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">{benefit.description}</p>
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-orange-400 font-semibold text-sm">{benefit.stats}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-[#232837] py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Powerful Tools for Every Business Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-800/70 border border-gray-700 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                      <Target className="w-6 h-6 text-orange-400 mr-3" />
                      {feature.category}
                    </h3>
                    <ul className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="bg-gray-800/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Real Success Stories from Real Retailers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <Card key={index} className="bg-gray-800/70 border border-gray-700 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Star className="w-6 h-6 text-yellow-400 mr-2" />
                      <h3 className="text-xl font-semibold text-white">{story.name}</h3>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">{story.type}</Badge>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-green-400 font-bold text-lg">{story.growth}</p>
                    </div>
                    <p className="text-gray-300 italic">"{story.story}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-[#232837] py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Choose Your Growth Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`bg-gray-800/70 border-2 relative ${plan.popular ? 'border-orange-500 shadow-xl scale-105' : 'border-gray-700'} hover:shadow-lg transition-all`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white px-4 py-2 shadow-lg">
                        <Crown className="w-4 h-4 mr-2" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-orange-400 mb-1">{plan.price}</div>
                      <p className="text-gray-400 text-sm">{plan.period}</p>
                      <p className="text-gray-300 mt-2">{plan.description}</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={handleGetStarted}
                      className={`w-full ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-500'} text-white shadow-md`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

                {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Join thousands of successful retailers who have grown their Funko Pop business with PopGuide. 
                Start today and see the difference for yourself.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/retailers')}
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg"
                >
                  Browse Existing Retailers
                </Button>
              </div>
              <p className="text-orange-100 mt-4 text-sm">
                Free plan available • Upgrade anytime • Full support included
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default WhyAddYourBusiness; 