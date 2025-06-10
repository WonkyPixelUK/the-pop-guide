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
import { supabase } from '@/integrations/supabase/client';

const STRIPE_FUNCTION_URL = "https://db.popguide.co.uk/functions/v1/stripe-checkout-public";
const CRYPTO_FUNCTION_URL = "https://db.popguide.co.uk/functions/v1/crypto-checkout";
const SEND_EMAIL_ENDPOINT = "https://db.popguide.co.uk/functions/v1/send-email";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'traditional' | 'crypto'>('traditional');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicCode, setMagicCode] = useState('');
  const [magicCodeSent, setMagicCodeSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const { user, signUp, signIn, resetPassword } = useAuth();
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
    const signinParam = params.get('signin');
    
    // If signin parameter is present, default to login mode
    if (signinParam === 'true') {
      setIsSignUp(false);
    }
    // If coming from get started or direct, default to sign up
    else if (planParam === 'pro' || planParam === 'free' || location.pathname === '/auth' && !params.get('signin')) {
      setIsSignUp(true);
    }
    if (planParam === 'pro' || planParam === 'free') {
      setPlan(planParam);
    } else {
      setPlan(null);
    }
  }, [location.search, location.pathname]);

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
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
      } else {
        // Handle sign in based on selected method
        if (useMagicLink) {
          if (!magicCodeSent) {
            // Send magic code
            const sent = await sendMagicCode(email);
            if (sent) {
              setLoading(false);
              return; // Wait for user to enter code
            }
          } else {
            // Verify magic code
            const verified = await verifyMagicCode(email, magicCode);
            if (verified) {
              // Reset form state
              setEmail('');
              setMagicCode('');
              setMagicCodeSent(false);
              setUseMagicLink(false);
            }
            setLoading(false);
            return;
          }
        } else {
          // Traditional password sign in
          result = await signIn(email, password);
        }
      }
      
      if (result && result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (result) {
        toast({
          title: "Success",
          description: isSignUp ? "Account created! Please check your email to confirm." : "Welcome back!",
        });
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      // Send custom branded email first (always send for security - don't reveal if email exists)
      const resetUrl = `${window.location.origin}/auth?reset=true`;
      const requestTime = new Date().toLocaleString();

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'reset',
          to: resetEmail.toLowerCase().trim(),
          data: {
            fullName: 'Collector', // Generic name for security
            resetUrl,
            requestTime,
            ipAddress: 'Hidden for privacy'
          }
        }
      });

      // Always also trigger Supabase's built-in reset for the actual functionality
      const { error: supabaseError } = await resetPassword(resetEmail);

      if (emailError && supabaseError) {
        // Both failed
        toast({ title: 'Error', description: 'Failed to send reset email. Please try again.', variant: 'destructive' });
      } else {
        // At least one succeeded (preferably our custom email, but Supabase reset provides the actual functionality)
        toast({ 
          title: 'Success', 
          description: 'Password reset email sent. Check your inbox for instructions.',
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({ title: 'Error', description: 'Failed to send reset email. Please try again.', variant: 'destructive' });
    } finally {
      setResetLoading(false);
    }
  };

  const sendMagicCode = async (emailToSend: string) => {
    setMagicLoading(true);
    
    try {
      // Generate a 6-digit magic code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Temporarily store in session storage (will be replaced with database)
      sessionStorage.setItem(`magic_code_${emailToSend}`, JSON.stringify({
        code,
        expires_at: expiresAt.toISOString(),
        email: emailToSend.toLowerCase().trim()
      }));

      // Send magic code email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'magic_login',
          to: emailToSend.toLowerCase().trim(),
          data: {
            fullName: 'Collector',
            magicCode: code,
            expiresIn: '10 minutes',
            requestTime: new Date().toLocaleString()
          }
        }
      });

      if (emailError) {
        console.error('Failed to send magic code email:', emailError);
        sessionStorage.removeItem(`magic_code_${emailToSend}`);
        toast({ 
          title: 'Error', 
          description: 'Failed to send magic code. Please try again.',
          variant: 'destructive' 
        });
        return false;
      }

      toast({ 
        title: 'Magic code sent!', 
        description: 'Check your email for a 6-digit login code.',
      });
      
      setMagicCodeSent(true);
      return true;
    } catch (error) {
      console.error('Magic code error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to send magic code. Please try again.',
        variant: 'destructive' 
      });
      return false;
    } finally {
      setMagicLoading(false);
    }
  };

  const verifyMagicCode = async (email: string, code: string) => {
    try {
      // Get stored code from session storage (temporary approach)
      const storedData = sessionStorage.getItem(`magic_code_${email}`);
      
      if (!storedData) {
        toast({ 
          title: 'Invalid code', 
          description: 'No magic code found. Please request a new one.',
          variant: 'destructive' 
        });
        return false;
      }

      const { code: storedCode, expires_at } = JSON.parse(storedData);

      if (storedCode !== code) {
        toast({ 
          title: 'Invalid code', 
          description: 'The code you entered is incorrect.',
          variant: 'destructive' 
        });
        return false;
      }

      // Check if code has expired
      if (new Date(expires_at) < new Date()) {
        sessionStorage.removeItem(`magic_code_${email}`);
        toast({ 
          title: 'Code expired', 
          description: 'The magic code has expired. Please request a new one.',
          variant: 'destructive' 
        });
        return false;
      }

      // Remove used code
      sessionStorage.removeItem(`magic_code_${email}`);

      // Create a magic login session by calling our backend function
      // This will verify the user exists and create a proper session
      const { data: authData, error: authError } = await supabase.functions.invoke('magic-auth', {
        body: {
          email: email.toLowerCase().trim(),
          code: code
        }
      });

      if (authError || !authData?.success) {
        console.error('Magic auth error:', authError);
        toast({ 
          title: 'Sign in failed', 
          description: authError?.message || 'Authentication failed. Please try password login.',
          variant: 'destructive' 
        });
        return false;
      }

      // If we have a session token, set it
      if (authData.session) {
        await supabase.auth.setSession(authData.session);
      }

      toast({ 
        title: 'Success!', 
        description: 'You have been signed in successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Magic code verification error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to verify code. Please try again.',
        variant: 'destructive' 
      });
      return false;
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

                {/* Magic Email Toggle for Sign In */}
                {!isSignUp && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setUseMagicLink(!useMagicLink);
                          setMagicCodeSent(false);
                          setMagicCode('');
                        }}
                        className="flex items-center text-sm text-gray-300 hover:text-orange-400 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                          useMagicLink ? 'bg-orange-500 border-orange-500' : 'border-gray-500'
                        }`}>
                          {useMagicLink && <span className="text-white text-xs">✓</span>}
                        </div>
                        Use magic email login (no password needed)
                      </button>
                    </div>
                  </div>
                )}

                {/* Password field or Magic Code field */}
                {!isSignUp && useMagicLink ? (
                  // Magic Code Section
                  <div className="space-y-4">
                    {!magicCodeSent ? (
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-2">
                          Click "Send Magic Code" to receive a 6-digit code via email
                        </p>
                        <p className="text-gray-400 text-xs">
                          No password required - just enter the code we send you
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="magicCode" className="text-gray-300">Enter 6-digit code</Label>
                        <Input
                          id="magicCode"
                          type="text"
                          value={magicCode}
                          onChange={(e) => setMagicCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400">Check your email for the code</p>
                          <button
                            type="button"
                            onClick={() => {
                              setMagicCodeSent(false);
                              setMagicCode('');
                              sendMagicCode(email);
                            }}
                            className="text-xs text-orange-400 hover:text-orange-300"
                            disabled={magicLoading}
                          >
                            Resend code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Password field (for signup or traditional login)
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required={isSignUp || !useMagicLink}
                      minLength={6}
                    />
                    {!isSignUp && !useMagicLink && (
                      <div className="text-right mt-2">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {isSignUp && plan === 'pro' && (
                  <div className="text-orange-400 text-sm text-center mb-2">
                    You'll be redirected to {selectedPaymentMethod === 'traditional' ? 'Stripe' : 'Coinbase Commerce'} checkout after account creation.
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  disabled={loading || magicLoading}
                >
                  {loading || magicLoading ? (
                    'Loading...'
                  ) : isSignUp ? (
                    plan === 'pro' ? 'Create Account & Go Pro' : 'Create Account'
                  ) : useMagicLink ? (
                    magicCodeSent ? 'Verify Code & Sign In' : 'Send Magic Code'
                  ) : (
                    'Sign In'
                  )}
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

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-white text-center">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail" className="text-gray-300">Email Address</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      We'll send you a link to reset your password.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
                        disabled={resetLoading}
                      >
                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmail('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
