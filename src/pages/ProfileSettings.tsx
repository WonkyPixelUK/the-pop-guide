import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProfileEditor from '@/components/ProfileEditor';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const ProfileSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Fetch subscription status and customer_id
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      {/* Subscription Status Section */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">Subscription</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${subStatus === 'active' ? 'bg-[#e46c1b] text-white' : 'bg-gray-700 text-gray-300'}`}>{subStatus === 'active' ? 'Pro' : 'Free'}</span>
              <span className="text-gray-400 text-sm">{subStatus === 'active' ? 'You are a Pro member.' : 'You are on the Free plan.'}</span>
            </div>
            <Button
              className="bg-[#e46c1b] hover:bg-orange-600 text-white rounded-lg w-full max-w-xs font-semibold py-2 transition-colors"
              onClick={async () => {
                setPortalLoading(true);
                try {
                  if (customerId) {
                    const res = await fetch('/functions/v1/stripe-portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ customer_id: customerId }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    }
                  } else {
                    // No customerId: trigger upgrade/subscribe flow
                    const res = await fetch(SUPABASE_FUNCTION_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: user.email }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Unable to start subscription. Please try again.');
                    }
                  }
                } finally {
                  setPortalLoading(false);
                }
              }}
              disabled={portalLoading}
            >
              {portalLoading ? 'Loading...' : (customerId ? 'Manage Subscription' : 'Upgrade to Pro')}
            </Button>
          </div>
        </div>
      </section>
      {/* Profile Editor Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Profile Settings</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create and customize your public profile to share your collection and connect with other collectors.
            </p>
          </div>
          <ProfileEditor />
        </div>
      </section>
    </div>
  );
};

export default ProfileSettings;
