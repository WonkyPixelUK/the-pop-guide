import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Bitcoin, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';

const SUPABASE_FUNCTION_URL = "https://db.popguide.co.uk/functions/v1/stripe-checkout-public";

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const plans = [
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
      link: "/get-started"
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

  const handleProCheckout = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user && user.access_token) {
        headers['Authorization'] = `Bearer ${user.access_token}`;
      }
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error', description: data.error || 'Could not start checkout', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => (
              <div key={plan.name} className={`bg-gray-900/90 border rounded-lg px-8 py-10 text-center shadow-lg flex flex-col justify-between relative ${plan.popular ? 'border-orange-500' : 'border-gray-700'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <div>
                  <div className="text-orange-500 font-bold text-lg mb-1">{plan.name}</div>
                  
                  <div className="mb-4">
                    <div className="text-white text-3xl font-bold mb-1">
                      {plan.price} 
                      <span className="text-base font-normal text-gray-400"> {plan.period}</span>
                    </div>
                    
                    {plan.cryptoPrice && (
                      <div className="mt-2">
                        <div className="flex items-center justify-center gap-2 text-lg">
                          <span className="text-gray-500">or</span>
                          <span className="text-gray-500 line-through">{plan.price}</span>
                          <span className="text-green-400 font-bold">{plan.cryptoPrice}</span>
                          <span className="text-gray-400 text-sm">with crypto</span>
                        </div>
                        <Badge className="bg-green-500 text-white text-xs mt-1">5% crypto discount</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-300 mb-4">{plan.description}</div>
                  <ul className="text-gray-400 text-sm mb-6 list-disc list-inside text-left mx-auto max-w-xs">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <a href={plan.link}>
                  <Button className={`w-full text-lg mt-4 ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                    {plan.cta}
                  </Button>
                </a>
                
                {plan.cryptoPrice && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    💰 Save money every month with cryptocurrency payments
                  </p>
                )}
              </div>
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
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="faq-accordion">
              <AccordionItem value="faq1">
                <AccordionTrigger className="text-orange-500">What happens after my 3-day Pro trial?</AccordionTrigger>
                <AccordionContent className="text-white">
                  You'll be automatically billed $3.99/month (or $3.49 with crypto) unless you cancel before the trial ends. You can cancel anytime in your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq2">
                <AccordionTrigger className="text-orange-500">Can I switch between Free and Pro?</AccordionTrigger>
                <AccordionContent className="text-white">
                  Yes! You can upgrade or downgrade your plan at any time. Your data and collection will always be safe.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq3">
                <AccordionTrigger className="text-orange-500">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-white">
                  We accept all major credit/debit cards through Stripe, and cryptocurrencies (Bitcoin, Ethereum, Litecoin, etc.) through Coinbase Commerce. Crypto payments get a 5% discount!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq4">
                <AccordionTrigger className="text-orange-500">Which cryptocurrencies do you support?</AccordionTrigger>
                <AccordionContent className="text-white">
                  We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Bitcoin Cash (BCH), USD Coin (USDC), and many other popular cryptocurrencies through Coinbase Commerce.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq5">
                <AccordionTrigger className="text-orange-500">How does the crypto discount work?</AccordionTrigger>
                <AccordionContent className="text-white">
                  When you pay with cryptocurrency, you get a 5% discount on your subscription. So instead of $3.99/month, you only pay $3.49/month - saving you $6 per year!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq6">
                <AccordionTrigger className="text-orange-500">Is there a limit on the number of items in Pro?</AccordionTrigger>
                <AccordionContent className="text-white">
                  No, Pro users can add unlimited items to their collection.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq7">
                <AccordionTrigger className="text-orange-500">How do I cancel my subscription?</AccordionTrigger>
                <AccordionContent className="text-white">
                  You can cancel anytime from your account settings. Your Pro features will remain active until the end of your billing period.
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

export default Pricing;
