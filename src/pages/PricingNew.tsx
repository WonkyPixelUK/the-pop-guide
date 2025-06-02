import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Bitcoin, CreditCard, ArrowRight, Shield, Globe, Percent } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import { Badge } from '@/components/ui/badge';

const STRIPE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";
const CRYPTO_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/crypto-checkout";

const PricingNew = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Track up to 50 items",
        "Basic search",
        "Collection overview",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false,
      link: "/auth"
    },
    {
      name: "Pro",
      price: "$3.99",
      cryptoPrice: "$3.49",
      period: "per month",
      description: "For serious collectors",
      features: [
        "Unlimited items",
        "Advanced analytics & insights",
        "Price history tracking & alerts", 
        "Custom categories & lists",
        "List ownership transfer",
        "Bulk actions (add/edit/remove)",
        "CSV import & export",
        "New releases tracking",
        "Currency support (£/$/€)",
        "Social features & friends",
        "Collection sharing",
        "Advanced search & filtering",
        "Priority support",
        "API access",
        "AI price predictions",
        "Wish tracker & drop alerts",
        "Gamification & achievements",
        "Personalized recommendations",
        "Virtual shelf showcase",
        "Email notifications",
        "Premium badge system",
        "Barcode scanning",
        "Mobile app access",
        "Dark mode support"
      ],
      cta: "Start 3-Day Pro Trial",
      popular: true,
      requiresAuth: true
    },
    {
      name: "Retailer",
      price: "$25",
      period: "per year",
      description: "For shops and sellers",
      features: [
        "Directory listing",
        "Retailer badge",
        "Analytics dashboard",
        "Deal alerts",
        "Unlimited product listings",
        "Whatnot show promotion"
      ],
      cta: "Become a Retailer",
      popular: false,
      link: "/retailers/become"
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.name === "Pro") {
      if (!user) {
        navigate('/auth?plan=pro');
        return;
      }
      setShowPaymentSelector(true);
    } else if (plan.link) {
      navigate(plan.link);
    }
  };

  const handlePaymentMethodSelect = async (method: any) => {
    if (!user) {
      navigate('/auth?plan=pro');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.access_token) {
        headers['Authorization'] = `Bearer ${user.access_token}`;
      }

      let functionUrl: string;
      let requestBody: any;

      if (method.type === 'traditional') {
        functionUrl = STRIPE_FUNCTION_URL;
        requestBody = { email: user.email };
      } else {
        functionUrl = CRYPTO_FUNCTION_URL;
        requestBody = { 
          user_id: user.id, 
          email: user.email,
          plan_type: 'pro'
        };
      }

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      
      if (data.url || data.checkout_url) {
        window.location.href = data.url || data.checkout_url;
      } else {
        toast({ 
          title: 'Error', 
          description: data.error || 'Could not start checkout', 
          variant: 'destructive' 
        });
      }
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'Something went wrong', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPaymentSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation className="hidden md:block" />
        
        <div className="py-20 px-4">
          <div className="container mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white mb-8"
              onClick={() => setShowPaymentSelector(false)}
            >
              ← Back to Plans
            </Button>

            <PaymentMethodSelector 
              onPaymentMethodSelect={handlePaymentMethodSelect}
              loading={loading}
            />
          </div>
        </div>

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation className="hidden md:block" />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Simple, Transparent <span className="text-orange-500">Pricing</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Start free and upgrade as your collection grows. No hidden fees, cancel anytime.
          </p>
          
          {/* Payment Options Banner */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center text-gray-400">
              <CreditCard className="w-5 h-5 mr-2" />
              Credit/Debit Cards
            </div>
            <div className="text-gray-600">•</div>
            <div className="flex items-center text-orange-400">
              <Bitcoin className="w-5 h-5 mr-2" />
              Crypto (5% discount)
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative bg-gray-900/90 border rounded-lg shadow-lg flex flex-col h-full ${
                  plan.popular 
                    ? 'border-orange-500 ring-2 ring-orange-500/50' 
                    : 'border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-orange-500 font-bold text-xl mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="space-y-2">
                    <div className="text-white text-4xl font-bold">
                      {plan.price}
                      {plan.cryptoPrice && (
                        <div className="text-lg text-green-400 font-normal">
                          or {plan.cryptoPrice} with crypto
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{plan.period}</div>
                  </div>
                  
                  <p className="text-gray-300 mt-3">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full text-lg py-3 ${
                      plan.popular 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  {plan.cryptoPrice && (
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Save $0.50/month paying with crypto
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Crypto Payment Benefits */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Why Choose <span className="text-orange-500">Crypto Payments</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">5% Discount</h3>
              <p className="text-gray-400 text-sm">Save money on every subscription payment</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">No Chargebacks</h3>
              <p className="text-gray-400 text-sm">Secure, irreversible payments</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Global Access</h3>
              <p className="text-gray-400 text-sm">Pay from anywhere in the world</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="faq-accordion">
              <AccordionItem value="faq1">
                <AccordionTrigger className="text-orange-500">What happens after my 3-day Pro trial?</AccordionTrigger>
                <AccordionContent className="text-white">
                  You'll be automatically billed $3.99/month (or $3.49 with crypto) unless you cancel before the trial ends. You can cancel anytime in your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq2">
                <AccordionTrigger className="text-orange-500">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-white">
                  We accept all major credit/debit cards through Stripe, and cryptocurrencies (Bitcoin, Ethereum, Litecoin, etc.) through Coinbase Commerce. Crypto payments get a 5% discount!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq3">
                <AccordionTrigger className="text-orange-500">Which cryptocurrencies do you support?</AccordionTrigger>
                <AccordionContent className="text-white">
                  We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Bitcoin Cash (BCH), USD Coin (USDC), and many other popular cryptocurrencies through Coinbase Commerce.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq4">
                <AccordionTrigger className="text-orange-500">How does the crypto discount work?</AccordionTrigger>
                <AccordionContent className="text-white">
                  When you pay with cryptocurrency, you get a 5% discount on your subscription. So instead of $3.99/month, you only pay $3.49/month - saving you $6 per year!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq5">
                <AccordionTrigger className="text-orange-500">Is crypto payment secure?</AccordionTrigger>
                <AccordionContent className="text-white">
                  Yes! We use Coinbase Commerce, a trusted and secure crypto payment processor. Your payments are processed on the blockchain, making them transparent and irreversible.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PricingNew; 