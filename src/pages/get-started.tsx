import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Bitcoin, ArrowRight } from 'lucide-react';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

const STRIPE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";
const CRYPTO_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/crypto-checkout";

const GetStarted = () => {
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartTrial = () => {
    if (!user) {
      navigate('/auth?plan=pro');
      return;
    }
    setShowPaymentSelector(true);
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
        <div className="py-20 px-4">
          <div className="container mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white mb-8"
              onClick={() => setShowPaymentSelector(false)}
            >
              ← Back
            </Button>

            <PaymentMethodSelector 
              onPaymentMethodSelect={handlePaymentMethodSelect}
              loading={loading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      <img 
        src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
        alt="PopGuide Logo" 
        className="mb-8 w-48 h-48 mx-auto"
      />
      
      <h1 className="text-3xl font-bold mb-4 text-center">Get started with your 3-day free trial</h1>
      
      {/* Payment Options Preview */}
      <div className="flex items-center justify-center gap-6 mb-8">
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

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        {/* Credit Card Option */}
        <Card className="bg-gray-900/90 border border-gray-700 hover:border-orange-500 transition-all duration-300">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <div className="text-orange-500 font-bold text-lg mb-1">Pro Membership</div>
            <div className="text-white text-2xl font-bold mb-1">$3.99/mo</div>
            <div className="text-gray-400 text-sm">Credit/Debit Cards</div>
          </CardContent>
        </Card>

        {/* Crypto Option */}
        <Card className="bg-gray-900/90 border border-orange-500 hover:border-orange-400 transition-all duration-300 relative">
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 text-xs">
            5% OFF
          </Badge>
          <CardContent className="p-6 text-center">
            <Bitcoin className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-orange-500 font-bold text-lg mb-1">Pro Membership</div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-gray-500 line-through text-lg">$3.99</span>
              <span className="text-white text-2xl font-bold">$3.49/mo</span>
            </div>
            <div className="text-green-400 text-sm">Cryptocurrency</div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-8 w-full max-w-2xl">
        <div className="text-gray-300 text-sm text-center">
          ✅ 3-day free trial • ✅ Cancel anytime • ✅ Unlimited items • ✅ Advanced analytics • ✅ AI price predictions
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
          onClick={handleStartTrial}
        >
          Choose Payment Method
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <div className="text-center">
          <Link to="/auth" className="text-gray-400 hover:text-white text-sm underline">
            Sign in to existing account
          </Link>
        </div>
      </div>

      {/* Crypto Payment Note */}
      <p className="text-gray-400 text-xs text-center mt-6 max-w-md">
        💰 Save $6/year by paying with cryptocurrency! Supports Bitcoin, Ethereum, Litecoin, and more.
      </p>
    </div>
  );
};

export default GetStarted; 