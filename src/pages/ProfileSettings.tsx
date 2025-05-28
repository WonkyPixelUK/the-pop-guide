import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileEditor from '@/components/ProfileEditor';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'social', label: 'Social Integrations' },
  { key: 'gaming', label: 'Gaming Platforms' },
  { key: 'lists', label: 'Add Lists' },
  { key: 'subscription', label: 'Subscription & Billing' },
  { key: 'api', label: 'API' },
];

const ProfileSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Fetch subscription status, customer_id, billing, card, invoices
  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single()
        .then(async ({ data }) => {
          setSubStatus(data?.subscription_status || 'free');
          setCustomerId(data?.stripe_customer_id || null);
          if (data?.stripe_customer_id) {
            // Fetch real billing, card, invoices from Stripe
            const res = await fetch('/api/stripeCustomer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customer_id: data.stripe_customer_id }),
            });
            const stripeData = await res.json();
            setBilling(stripeData.billing || null);
            setCard(stripeData.card || null);
            setInvoices(stripeData.invoices || []);
          } else {
            setBilling(null);
            setCard(null);
            setInvoices([]);
          }
        });
    }
  }, [user]);

  // API Key logic
  useEffect(() => {
    if (activeTab === 'api' && user) {
      setApiKeyLoading(true);
      setApiKeyError(null);
      supabase.auth.getSession().then(({ data }) => {
        const token = data?.session?.access_token;
        fetch(`/api/userApiKey?userId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then(res => res.json())
          .then(data => setApiKey(data.api_key || null))
          .catch(() => setApiKeyError('Failed to load API key'))
          .finally(() => setApiKeyLoading(false));
      });
    }
  }, [activeTab, user]);

  const handleGenerateApiKey = () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      fetch(`/api/userApiKey?userId=${user.id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(res => res.json())
        .then(data => setApiKey(data.api_key || null))
        .catch(() => setApiKeyError('Failed to generate API key'))
        .finally(() => setApiKeyLoading(false));
    });
  };

  const handleRevokeApiKey = () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      fetch(`/api/userApiKey?userId=${user.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(() => setApiKey(null))
        .catch(() => setApiKeyError('Failed to revoke API key'))
        .finally(() => setApiKeyLoading(false));
    });
  };

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
      <div className="flex max-w-5xl mx-auto py-8 px-4 gap-8">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <nav className="flex flex-col gap-2 bg-gray-900/80 border border-gray-800 rounded-lg p-4">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-left px-4 py-2 rounded font-semibold transition-colors ${activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileEditor section="profile" />}
          {activeTab === 'social' && <ProfileEditor section="social" />}
          {activeTab === 'gaming' && <ProfileEditor section="gaming" />}
          {activeTab === 'lists' && <ProfileEditor section="lists" />}
          {activeTab === 'subscription' && (
            <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Subscription & Billing</h2>
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
                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                      if (user && user.access_token) {
                        headers['Authorization'] = `Bearer ${user.access_token}`;
                      }
                      const res = await fetch(SUPABASE_FUNCTION_URL, {
                        method: 'POST',
                        headers,
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
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">Billing Address</h3>
                <div className="text-gray-300 mb-2">{billing ? JSON.stringify(billing) : 'No billing address on file.'}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">Card Details</h3>
                <div className="text-gray-300 mb-2">{card ? `${card.brand} •••• ${card.last4}` : 'No card on file.'}</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">Previous Invoices</h3>
                {invoices.length === 0 ? (
                  <div className="text-gray-300">No invoices found.</div>
                ) : (
                  <ul className="text-gray-300">
                    {invoices.map((inv, i) => (
                      <li key={i}>{inv.date} - {inv.amount} <a href={inv.url} target="_blank" rel="noopener noreferrer">Download</a></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {activeTab === 'api' && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-8 max-w-lg mx-auto mt-12 shadow-lg">
              <h2 className="text-3xl font-bold text-orange-400 mb-6">API Key Management</h2>
              {apiKeyLoading ? (
                <div className="text-gray-300">Loading...</div>
              ) : apiKey ? (
                <div className="space-y-4">
                  <div className="text-gray-200 font-semibold">Your API Key:</div>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-4 py-2 select-all">
                    <span className="text-white break-all flex-1">{apiKey}</span>
                    <button
                      aria-label="Copy API key"
                      className="p-1 rounded hover:bg-orange-500 transition-colors"
                      onClick={() => { navigator.clipboard.writeText(apiKey); }}
                    >
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-orange-200 transition-colors"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M15 3H5a2 2 0 0 0-2 2v10"/></svg>
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600" onClick={handleRevokeApiKey}>Revoke Key</Button>
                    <Button variant="primary" className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleGenerateApiKey}>Regenerate Key</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-gray-300">No API key found.</div>
                  <Button variant="primary" className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleGenerateApiKey}>Generate API Key</Button>
                </div>
              )}
              {apiKeyError && <div className="text-red-500 mt-4 font-semibold">{apiKeyError}</div>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
