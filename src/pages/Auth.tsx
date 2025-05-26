import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useWelcomeEmail } from '@/hooks/useWelcomeEmail';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-open";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (plan === 'pro') {
          // Pro: trigger Stripe checkout, do not create user yet
          const res = await fetch(SUPABASE_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          } else {
            toast({ title: 'Error', description: data.error || 'Could not start checkout', variant: 'destructive' });
          }
        } else {
          // Free: create user immediately
          const result = await signUp(email, password, fullName);
          if (result.error) {
            toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
          } else {
            toast({ title: 'Success', description: 'Check your email to confirm your account.' });
          }
        }
      } else {
        // Sign in as normal
        const result = await signIn(email, password);
        if (result.error) {
          toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'Welcome back!' });
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Card className="bg-gray-800/60 border border-gray-700 p-8 max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-500 mb-2">Your account is now verified!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white mb-6">Proceed to login and happy collecting!</p>
            <Link to="/auth">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">Proceed to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
            <p className="text-gray-400 mt-2">
              {isSignUp ? (plan === 'pro' ? 'Sign up for PopGuide Pro (payment required)' : 'Create your free account to start collecting') : 'Welcome back to your collection'}
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
                  <div className="text-orange-400 text-sm text-center mb-2">You must pay for Pro before your account is created. You'll be redirected to Stripe checkout.</div>
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
