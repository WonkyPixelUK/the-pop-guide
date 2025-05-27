import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const Paywall = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show the paywall with a swoosh effect after mount
    setTimeout(() => setShow(true), 100);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
        window.location.href = dataRes.url;
      } else {
        alert(dataRes.error || 'Could not start checkout');
      }
    } catch (e) {
      alert('Could not start checkout');
    } finally {
      setLoading(false);
    }
  };

  // Swoosh panel overlay
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end bg-black/40 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div
        className={`w-full max-w-md bg-gray-900 border-l-4 border-orange-500 shadow-2xl h-full flex flex-col justify-center px-8 py-12 transition-transform duration-500 ${show ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-6 text-orange-500 font-bold text-lg">Pro Membership Required</div>
        <div className="text-white text-2xl font-bold mb-2">Add your card details now to start your 3-day trial</div>
        <div className="text-gray-300 mb-4">Unlock unlimited items, analytics, price history, and more. Cancel anytime during your trial and you won't be charged.</div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg mt-4" onClick={handleUpgrade} disabled={loading}>
          {loading ? 'Redirecting…' : 'Start 3-Day Trial'}
        </Button>
      </div>
    </div>
  );
};

export default Paywall; 