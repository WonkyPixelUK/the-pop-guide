import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const plans = [
    {
      name: "Pro",
      price: "$3.99",
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
      cta: "Start 3-Day Pro Trial",
      popular: true,
      link: "/auth?plan=pro"
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
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-gray-900/90 border border-orange-500 rounded-lg px-8 py-10 text-center shadow-lg flex flex-col justify-between">
                <div>
                  <div className="text-orange-500 font-bold text-lg mb-1">{plan.name}</div>
                  <div className="text-white text-3xl font-bold mb-1">{plan.price} <span className="text-base font-normal text-gray-400">{plan.period}</span></div>
                  <div className="text-gray-300 mb-4">{plan.description}</div>
                  <ul className="text-gray-400 text-sm mb-6 list-disc list-inside text-left mx-auto max-w-xs">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <a href={plan.link}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg mt-4">{plan.cta}</Button>
                </a>
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
                <AccordionTrigger>What happens after my 3-day Pro trial?</AccordionTrigger>
                <AccordionContent>
                  You'll be automatically billed $3.99/month unless you cancel before the trial ends. You can cancel anytime in your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq2">
                <AccordionTrigger>Can I switch between Free and Pro?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can upgrade or downgrade your plan at any time. Your data and collection will always be safe.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq3">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit/debit cards. For Enterprise or special billing, contact us.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq4">
                <AccordionTrigger>Is there a limit on the number of items in Pro?</AccordionTrigger>
                <AccordionContent>
                  No, Pro users can add unlimited items to their collection.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq5">
                <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
                <AccordionContent>
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
