import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRetailer } from '@/hooks/useRetailer';
import { useRetailerPayments } from '@/hooks/useRetailerPayments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const PRODUCT_ID = 'prod_SNsIp44U71FGP5';
const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Directory Listing',
    description: 'Get featured in our public retailer directory with priority placement and increased visibility.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Verified Badge',
    description: 'Display the trusted retailer badge across PopGuide to build customer confidence.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Product Listings',
    description: 'Add unlimited Funko Pop listings with prices, availability, and direct purchase links.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Track views, clicks, sales conversions, and customer engagement with detailed analytics.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.28.6 4.18 1.77 4.18 3.84 0 1.91-1.71 2.95-3.12 3.18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Deal Promotion',
    description: 'Promote special deals and flash sales to targeted collectors who follow your store.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Whatnot Integration',
    description: 'Promote your Whatnot shows and live auctions to drive more viewers and bidders.'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    business: 'Pop Paradise',
    quote: 'PopGuide brought us 40% more customers in the first month. The analytics help us understand what collectors want.',
    rating: 5
  },
  {
    name: 'Mike Rodriguez',
    business: 'Funko Central',
    quote: 'The verified badge instantly built trust with new customers. Sales increased significantly since joining.',
    rating: 5
  },
  {
    name: 'Emma Thompson',
    business: 'Collector\'s Corner',
    quote: 'Best investment we made. The deal promotion feature alone pays for itself every month.',
    rating: 5
  }
];

const BecomeRetailer = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Check if user is already a retailer
  const { data: retailer, isLoading: retailerLoading } = useRetailer(user?.id || '');
  const { data: paymentsRaw = [], isLoading: loadingPayments } = useRetailerPayments(retailer?.id || '');
  const payments = paymentsRaw as { expires_at?: string }[];

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // Always get the JWT from the session
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: user.email }),
      });
      const dataRes = await res.json();
      if (dataRes.url) {
        setSuccess(true);
        window.location.href = dataRes.url;
      } else {
        setError(dataRes.error || 'Could not start checkout');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || retailerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mt-24">
            <h1 className="text-4xl font-bold text-white mb-4">Join PopGuide as a Retailer</h1>
            <p className="text-gray-400 mb-8 text-lg">Connect with thousands of Funko Pop collectors and grow your business</p>
            <p className="text-white mb-6">You must be logged in to become a retailer.</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-colors">
              <a href="/auth">Log In to Continue</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (retailer && retailer.id && payments && payments.some(p => new Date(p.expires_at) > new Date())) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mt-24">
            <div className="mb-8">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">You're Already a Retailer!</h1>
            <p className="text-gray-400 mb-8 text-lg">You have an active retailer listing with PopGuide</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-colors">
              <a href="/retailers/dashboard">Go to Retailer Dashboard</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mt-24">
            <div className="text-red-400 text-xl mb-4">Error: {error}</div>
            <Button onClick={() => setError(null)} className="bg-orange-500 hover:bg-orange-600">
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-5xl font-bold text-white mb-6">Join PopGuide as a Retailer</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Connect with thousands of passionate Funko Pop collectors, increase your visibility, and grow your business with our comprehensive retailer platform.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              10,000+ Active Collectors
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              500+ Retailer Partners
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              £2M+ in Sales Generated
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need to Succeed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-gray-800/70 border border-gray-700 hover:border-orange-400/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
            <Card className="bg-gray-800/70 border-2 border-orange-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 font-bold text-sm">
                MOST POPULAR
              </div>
              <CardContent className="p-8 pt-12">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">£25</div>
                  <div className="text-gray-400">per year</div>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Priority directory placement</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Verified retailer badge</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Unlimited product listings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Deal promotion tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Whatnot show promotion</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-gray-300">Priority customer support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg transition-colors" 
                  onClick={handleCheckout} 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Start Your Retailer Journey - £25/year'
                  )}
                </Button>
                <p className="text-gray-500 text-sm text-center mt-4">
                  No setup fees • No hidden costs • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What Our Retailers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-gray-800/70 border border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-orange-400 text-sm">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-white mb-2">How quickly can I start selling?</h3>
                <p className="text-gray-400">Once payment is processed, you'll have access to your retailer dashboard immediately. Most retailers have their first listings live within 24 hours.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-white mb-2">Do you take a commission on sales?</h3>
                <p className="text-gray-400">No! We only charge the annual £25 fee. We don't take any commission from your sales - you keep 100% of your profits.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400">Yes, you can cancel your retailer account at any time. There are no long-term contracts or cancellation fees.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BecomeRetailer; 