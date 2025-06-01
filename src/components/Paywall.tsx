import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const Paywall = () => {
  const { user, loading } = useAuth();
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [show, setShow] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    // Show the paywall with a swoosh effect after mount
    setTimeout(() => setShow(true), 100);
  }, []);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription status:', error);
          setSubscriptionStatus('free');
        } else {
          setSubscriptionStatus(data?.subscription_status || 'free');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus('free');
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  // Wait for auth to load and subscription check
  if (loading || checkingSubscription) return null;
  
  // Hide paywall for premium users
  if (subscriptionStatus === 'premium') {
    return null;
  }

  const handleUpgrade = async () => {
    setLoadingUpgrade(true);
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
      setLoadingUpgrade(false);
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
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg mt-4" onClick={handleUpgrade} disabled={loadingUpgrade}>
          {loadingUpgrade ? 'Redirecting…' : 'Start 3-Day Trial'}
        </Button>
      </div>
    </div>
  );
};

export default Paywall; 