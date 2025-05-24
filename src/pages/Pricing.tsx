
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for starting your collection",
      features: [
        "Up to 50 items",
        "Basic collection tracking",
        "Community access",
        "Mobile app access",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For serious collectors",
      features: [
        "Unlimited items",
        "Advanced analytics",
        "Price history tracking",
        "Custom categories",
        "Priority support",
        "Export capabilities",
        "API access"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For stores and large collections",
      features: [
        "Everything in Pro",
        "Multi-user accounts",
        "Custom integrations",
        "Dedicated support",
        "Custom reporting",
        "White-label options",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-500">Pop</span>
                <span className="text-white">Guide</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 hover:text-white">
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
          <h1 className="text-5xl font-bold text-white mb-6">
            Simple, Transparent <span className="text-orange-500">Pricing</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Start free and upgrade as your collection grows. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`bg-gray-800/50 border-gray-700 relative ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-2">/ {plan.period}</span>
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-orange-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth">
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">The Free plan is available forever. Pro plan includes a 14-day free trial.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I export my data?</h3>
              <p className="text-gray-400">Yes, you can export your collection data in multiple formats including CSV and JSON.</p>
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
                The ultimate platform for Funko Pop collectors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-orange-500">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-orange-500">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-orange-500">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-orange-500">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500">Contact Us</Link></li>
                <li><Link to="/blog" className="hover:text-orange-500">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-orange-500">About</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-500">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-orange-500">Terms</Link></li>
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

export default Pricing;
