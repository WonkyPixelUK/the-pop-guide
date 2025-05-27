import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const Paywall = () => {
  const { user } = useAuth();
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setSubStatus(data?.subscription_status || 'free');
          setCustomerId(data?.stripe_customer_id || null);
        });
    }
  }, [user]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      console.log('user', user);
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      console.log('access_token', accessToken);
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      console.log('headers', headers);
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: user.email }),
      });
      const dataRes = await res.json();
      console.log('stripe checkout response', dataRes);
      if (dataRes.url) {
        window.location.href = dataRes.url;
      } else {
        alert(dataRes.error || 'Could not start checkout');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (subStatus === 'active') return null;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg p-8 border border-gray-700">
      <h2 className="text-3xl font-bold text-orange-500 mb-4">Upgrade to Pro</h2>
      <p className="text-gray-300 mb-6 max-w-md">
        Unlock unlimited items, advanced analytics, price history tracking, and more. Start your 3-day free trial and take your collection to the next level!
      </p>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-3" onClick={handleUpgrade} disabled={loading}>
        {loading ? 'Redirecting...' : 'Upgrade to Pro'}
      </Button>
    </div>
  );
};

export default Paywall; 