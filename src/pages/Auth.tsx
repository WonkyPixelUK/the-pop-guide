import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Bitcoin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWelcomeEmail } from '@/hooks/useWelcomeEmail';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const STRIPE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";
const CRYPTO_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/crypto-checkout";
const SEND_EMAIL_ENDPOINT = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/send-email";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'traditional' | 'crypto'>('traditional');
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmed, setConfirmed] = useState(false);
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null);

  // Initialize welcome email hook
  useWelcomeEmail();

  // Detect plan from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    if (planParam === 'pro' || planParam === 'free') {
      setPlan(planParam);
      setIsSignUp(true);
    } else {
      setPlan(null);
    }
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Detect email confirmation in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'signup' || type === 'email_confirm' || params.get('confirmation_token')) {
      setConfirmed(true);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    // If coming from get started or direct, default to sign up
    if (planParam === 'pro' || planParam === 'free' || location.pathname === '/auth' && !params.get('signin')) {
      setIsSignUp(true);
    }
  }, [location.search, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Always create the user first
        const result = await signUp(email, password, fullName);
        if (result.error) {
          toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
          setLoading(false);
          return;
        }
        // Send welcome email
        fetch(SEND_EMAIL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', to: email, data: { fullName: fullName } })
        });

        // Route to appropriate checkout based on selected payment method
        if (plan === 'pro') {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (result.data?.session?.access_token) {
            headers['Authorization'] = `Bearer ${result.data.session.access_token}`;
          }

          let functionUrl: string;
          let requestBody: any;

          if (selectedPaymentMethod === 'traditional') {
            functionUrl = STRIPE_FUNCTION_URL;
            requestBody = { email };
          } else {
            functionUrl = CRYPTO_FUNCTION_URL;
            requestBody = { 
              user_id: result.data?.user?.id, 
              email,
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
        } else {
          // Free plan - go to dashboard
          navigate('/dashboard');
        }
      } else {
        // Sign in as normal
        const result = await signIn(email, password);
        if (result.error) {
          toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'Welcome back!' });
          // After login, if ?checkout=1 in URL, trigger Stripe checkout
          const params = new URLSearchParams(location.search);
          if (params.get('checkout') === '1') {
            // Send JWT to Edge Function
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (result.data?.session?.access_token) {
              headers['Authorization'] = `Bearer ${result.data.session.access_token}`;
            } else if (user && user.access_token) {
              headers['Authorization'] = `Bearer ${user.access_token}`;
            }
            fetch(STRIPE_FUNCTION_URL, {
              method: 'POST',
              headers,
              body: JSON.stringify({ email }),
            })
              .then(res => res.json())
              .then(data => {
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  toast({ title: 'Error', description: data.error || 'Could not start checkout', variant: 'destructive' });
                }
              });
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col relative">
      {/* BETA Corner Label */}
      <div className="absolute top-6 right-6 z-50">
        <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs uppercase tracking-wider animate-pulse">
          BETA: This app is still in development. You may encounter bugs.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img 
                src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
                alt="PopGuide Logo" 
                className="h-28 w-auto mx-auto"
              />
            </Link>
            {/* Info block for price and trial */}
            {isSignUp && plan === 'pro' && (
              <div className="space-y-4 mt-6 mb-4">
                {/* Payment Options Header */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit Cards
                  </div>
                  <div className="text-gray-600">•</div>
                  <div className="flex items-center text-orange-400 text-sm">
                    <Bitcoin className="w-4 h-4 mr-2" />
                    Crypto (5% discount)
                  </div>
                </div>

                {/* Pricing Cards - Now Clickable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credit Card Option */}
                  <div 
                    className={`bg-gray-900/90 border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === 'traditional' 
                        ? 'border-orange-500 ring-2 ring-orange-500/50' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPaymentMethod('traditional')}
                  >
                    <CreditCard className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-orange-500 font-bold text-sm mb-1">Pro Membership</div>
                    <div className="text-white text-lg font-bold mb-1">$3.99/mo</div>
                    <div className="text-gray-400 text-xs">Credit/Debit Cards</div>
                    {selectedPaymentMethod === 'traditional' && (
                      <div className="mt-2">
                        <Badge className="bg-orange-500 text-white text-xs">Selected</Badge>
                      </div>
                    )}
                  </div>

                  {/* Crypto Option */}
                  <div 
                    className={`bg-gray-900/90 border rounded-lg p-4 text-center relative cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === 'crypto' 
                        ? 'border-orange-500 ring-2 ring-orange-500/50' 
                        : 'border-orange-500 hover:border-orange-400'
                    }`}
                    onClick={() => setSelectedPaymentMethod('crypto')}
                  >
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-0.5 text-xs">
                      5% OFF
                    </Badge>
                    <Bitcoin className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-orange-500 font-bold text-sm mb-1">Pro Membership</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-gray-500 line-through text-sm">$3.99</span>
                      <span className="text-white text-lg font-bold">$3.49/mo</span>
                    </div>
                    <div className="text-green-400 text-xs">Cryptocurrency</div>
                    {selectedPaymentMethod === 'crypto' && (
                      <div className="mt-2">
                        <Badge className="bg-orange-500 text-white text-xs">Selected</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-800/50 rounded-lg p-3 mt-4">
                  <div className="text-gray-300 text-xs text-center">
                    ✅ 3-day free trial • ✅ Cancel anytime • ✅ Unlimited items • ✅ Advanced analytics
                  </div>
                </div>

                <p className="text-gray-400 text-xs text-center">
                  💰 Save $6/year by paying with cryptocurrency!
                </p>
              </div>
            )}
            <p className="text-gray-400 mt-2">
              {isSignUp ? 'Create your account to start collecting' : 'Welcome back to your collection'}
            </p>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    minLength={6}
                  />
                </div>
                {isSignUp && plan === 'pro' && (
                  <div className="text-orange-400 text-sm text-center mb-2">
                    You'll be redirected to {selectedPaymentMethod === 'traditional' ? 'Stripe' : 'Coinbase Commerce'} checkout after account creation.
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-gray-400 hover:text-orange-500">
                  ← Back to homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
