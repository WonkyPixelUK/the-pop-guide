import { useAuth } from '@/hooks/useAuth';
import { useRetailer } from '@/hooks/useRetailer';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const PRODUCT_ID = 'prod_SNsIp44U71FGP5';
const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const BecomeRetailer = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Check if user is already a retailer
  const { data: retailer, isLoading: retailerLoading } = useRetailer(user?.id || '');

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center">
        <Navigation />
        <div className="text-center mt-24">
          <h1 className="text-3xl font-bold mb-4">Become a Retailer</h1>
          <p className="mb-6">You must be logged in to become a retailer.</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <a href="/auth">Log In</a>
          </Button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (retailer && retailer.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center">
        <Navigation />
        <div className="text-center mt-24">
          <h1 className="text-3xl font-bold mb-4">Already a Retailer</h1>
          <p className="mb-6">You already have an active retailer listing.</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <a href="/retailers/dashboard">Go to Retailer Dashboard</a>
          </Button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-red-500">Error: {error.message}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-8 mt-12 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Become a Retailer</h1>
          <p className="text-lg text-gray-300 mb-6 text-center">Get listed in the public directory, add unlimited products, deals, and Whatnot shows. $25/year. No hidden fees.</p>
          <ul className="list-disc text-gray-300 mb-6 ml-6 text-sm">
            <li>Priority placement in directory</li>
            <li>Retailer badge</li>
            <li>Analytics dashboard</li>
            <li>Deal alerts to followers</li>
            <li>Unlimited product listings</li>
            <li>Whatnot show promotion</li>
          </ul>
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Redirecting...' : 'Proceed to Payment ($25/year)'}
          </Button>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default BecomeRetailer; 