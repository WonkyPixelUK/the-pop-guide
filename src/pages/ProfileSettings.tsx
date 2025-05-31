import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileEditor from '@/components/ProfileEditor';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { User, Link, Gamepad2, List, CreditCard, Key, ChevronLeft, Plus, LogOut, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EnhancedAddItemDialog from '@/components/EnhancedAddItemDialog';
import { useToast } from '@/hooks/use-toast';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';

const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-public";

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'social', label: 'Social', icon: Link },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { key: 'lists', label: 'Lists', icon: List },
  { key: 'account', label: 'Account', icon: Key },
  { key: 'subscription', label: 'Billing', icon: CreditCard },
  { key: 'api', label: 'API', icon: Key },
];

const ProfileSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Add header navigation state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { data: userCollection = [] } = useUserCollection(user?.id);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            try {
              // Fetch billing and card details from Stripe
              const { data: sessionData } = await supabase.auth.getSession();
              const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-customer-details`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.session?.access_token}`
                },
                body: JSON.stringify({ customer_id: data.stripe_customer_id }),
              });
              
              if (res.ok) {
                const customerData = await res.json();
                setBilling(customerData.billing || null);
                setCard(customerData.card || null);
              }

              // Fetch invoices
              const invoiceRes = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-invoices`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.session?.access_token}`
                },
                body: JSON.stringify({ customer_id: data.stripe_customer_id }),
              });
              
              if (invoiceRes.ok) {
                const invoiceData = await invoiceRes.json();
                setInvoices(invoiceData.invoices || []);
              }
            } catch (error) {
              console.error('Error fetching Stripe data:', error);
            }
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

  // Header navigation handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleExport = () => {
    if (!user || !userCollection.length) {
      toast({
        title: "Export not available",
        description: "No collection data to export",
        variant: "destructive",
      });
      return;
    }
    
    const csvData = userCollection.map(item => ({
      name: item.funko_pops?.name || '',
      series: item.funko_pops?.series || '',
      number: item.funko_pops?.number || '',
      condition: item.condition || '',
      purchase_price: item.purchase_price || '',
      estimated_value: item.funko_pops?.estimated_value || '',
    }));
    
    const csvContent = [
      ['Name', 'Series', 'Number', 'Condition', 'Purchase Price', 'Estimated Value'],
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.email?.split('@')[0] || 'user'}-collection.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Collection exported to CSV file",
    });
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
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
      
      {/* Dashboard-style Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-[116px] z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search the database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </form>
            
            {/* Welcome Message & Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Welcome Message */}
              <div className="hidden md:block text-sm text-gray-300">
                Welcome, <span className="text-orange-400 font-medium">{user?.email}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Add Item</span>
                </Button>
                
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <span className="hidden sm:inline">Export Collection</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                
                <Button 
                  onClick={handleSignOut}
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Back Button */}
      {isMobile && (
        <div className="sticky top-[180px] z-40 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-gray-800 -ml-2"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Button>
        </div>
      )}

      <div className={`${isMobile ? 'pb-20' : 'pb-8'}`}>
        {/* Header */}
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 mb-6">
          <div className="max-w-4xl mx-auto">
            {isMobile ? (
              // Mobile: Horizontal scrolling tabs
              <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-hide">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1 px-2 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                        activeTab === tab.key 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Desktop: Single row layout with smaller tabs
              <div className="flex gap-1 justify-center flex-wrap">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg font-medium transition-all min-w-[70px] text-xs ${
                        activeTab === tab.key 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-xs">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              {activeTab === 'profile' && <ProfileEditor section="profile" />}
              {activeTab === 'social' && <ProfileEditor section="social" />}
              {activeTab === 'gaming' && <ProfileEditor section="gaming" />}
              {activeTab === 'lists' && <ProfileEditor section="lists" />}
              {activeTab === 'account' && <ProfileEditor section="account" />}
              {activeTab === 'subscription' && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-orange-500" />
                    Subscription & Billing
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Current Plan Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          subStatus === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {subStatus === 'active' ? 'Pro' : 'Free'}
                        </span>
                        <span className="text-gray-300">
                          {subStatus === 'active' ? 'You are a Pro member.' : 'You are on the Free plan.'}
                        </span>
                      </div>
                      <Button
                        className={`bg-orange-500 hover:bg-orange-600 text-white font-semibold ${isMobile ? 'w-full' : 'ml-auto'}`}
                        onClick={async () => {
                          setPortalLoading(true);
                          try {
                            if (customerId) {
                              // Use the correct Supabase Edge Function URL for portal
                              const { data: sessionData } = await supabase.auth.getSession();
                              const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-portal`, {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${sessionData.session?.access_token}`
                                },
                                body: JSON.stringify({ customer_id: customerId }),
                              });
                              const data = await res.json();
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                console.error('Portal response:', data);
                                alert('Unable to access billing portal. Please try again.');
                              }
                            } else {
                              // Use the correct checkout URL
                              const { data: sessionData } = await supabase.auth.getSession();
                              const headers: Record<string, string> = { 
                                'Content-Type': 'application/json'
                              };
                              if (sessionData.session?.access_token) {
                                headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
                              }
                              const res = await fetch(SUPABASE_FUNCTION_URL, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({ email: user.email }),
                              });
                              const data = await res.json();
                              console.log('Checkout response:', data);
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                console.error('Checkout error:', data);
                                alert(`Unable to start subscription: ${data.error || 'Please try again.'}`);
                              }
                            }
                          } catch (error) {
                            console.error('Billing error:', error);
                            alert('An error occurred. Please try again.');
                          } finally {
                            setPortalLoading(false);
                          }
                        }}
                        disabled={portalLoading}
                      >
                        {portalLoading ? 'Loading...' : customerId ? 'Manage Billing' : 'Upgrade to Pro'}
                      </Button>
                    </div>
                    
                    {/* Payment Method Management */}
                    {customerId && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Payment Method</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white">Current Card</h4>
                              <Button
                                onClick={async () => {
                                  setPortalLoading(true);
                                  try {
                                    const { data: sessionData } = await supabase.auth.getSession();
                                    const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-portal`, {
                                      method: 'POST',
                                      headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${sessionData.session?.access_token}`
                                      },
                                      body: JSON.stringify({ 
                                        customer_id: customerId,
                                        return_url: window.location.href
                                      }),
                                    });
                                    const data = await res.json();
                                    if (data.url) {
                                      window.location.href = data.url;
                                    }
                                  } catch (error) {
                                    console.error('Portal error:', error);
                                  } finally {
                                    setPortalLoading(false);
                                  }
                                }}
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                                disabled={portalLoading}
                              >
                                Update Card
                              </Button>
                            </div>
                            {card ? (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">
                                    {card.brand?.toUpperCase()}
                                  </div>
                                  <span className="text-gray-300">•••• •••• •••• {card.last4}</span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  Expires {card.exp_month?.toString().padStart(2, '0')}/{card.exp_year}
                                </p>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">Loading card details...</div>
                            )}
                          </div>
                          
                          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                            <h4 className="font-semibold text-white mb-3">Billing Information</h4>
                            {billing ? (
                              <div className="space-y-2">
                                <p className="text-gray-300 text-sm">{billing.email || user.email}</p>
                                {billing.name && (
                                  <p className="text-gray-300 text-sm">{billing.name}</p>
                                )}
                                {billing.address && (
                                  <div className="text-gray-400 text-xs">
                                    {billing.address.line1}<br/>
                                    {billing.address.city}, {billing.address.state} {billing.address.postal_code}<br/>
                                    {billing.address.country}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">Loading billing details...</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice History */}
                    {customerId && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">Invoice History</h3>
                          <Button
                            onClick={async () => {
                              try {
                                const { data: sessionData } = await supabase.auth.getSession();
                                const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-invoices`, {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${sessionData.session?.access_token}`
                                  },
                                  body: JSON.stringify({ customer_id: customerId }),
                                });
                                const data = await res.json();
                                if (data.invoices) {
                                  setInvoices(data.invoices);
                                }
                              } catch (error) {
                                console.error('Error fetching invoices:', error);
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="text-gray-300 border-gray-600 hover:bg-gray-700"
                          >
                            Refresh
                          </Button>
                        </div>
                        
                        <div className="bg-gray-700/30 rounded-lg border border-gray-600 overflow-hidden">
                          {invoices.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-800/50 border-b border-gray-600">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Invoice</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {invoices.slice(0, 10).map((invoice, index) => (
                                    <tr key={invoice.id} className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                      <td className="px-4 py-3 text-sm text-gray-300">
                                        #{invoice.number || invoice.id.slice(-8)}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-300">
                                        {new Date(invoice.created * 1000).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-300">
                                        ${(invoice.amount_paid / 100).toFixed(2)} {invoice.currency?.toUpperCase()}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          invoice.status === 'paid' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : invoice.status === 'open'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {invoice.hosted_invoice_url && (
                                          <a
                                            href={invoice.hosted_invoice_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-500 hover:text-orange-400 text-sm underline"
                                          >
                                            View
                                          </a>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-400">
                              No invoices found. Invoices will appear here after your first payment.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pro Features Overview */}
                    {subStatus !== 'active' && (
                      <div className="p-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg">
                        <h3 className="text-xl font-semibold text-white mb-4">Upgrade to Pro</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Advanced collection analytics
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Price tracking & alerts
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Unlimited custom lists
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            API access for developers
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Priority customer support
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Early access to new features
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                          Get the most out of your Funko Pop collecting experience with Pro features.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'api' && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Key className="w-6 h-6 text-orange-500" />
                    API Access
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Your API Key</h3>
                      {apiKeyLoading ? (
                        <p className="text-gray-400">Loading...</p>
                      ) : apiKeyError ? (
                        <p className="text-red-400">{apiKeyError}</p>
                      ) : apiKey ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <code className="flex-1 p-3 bg-gray-800 rounded border text-green-400 font-mono text-sm break-all">
                              {apiKey}
                            </code>
                          </div>
                          <Button
                            onClick={handleRevokeApiKey}
                            variant="destructive"
                            disabled={apiKeyLoading}
                            className={isMobile ? 'w-full' : ''}
                          >
                            Revoke API Key
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-gray-400">No API key generated yet.</p>
                          <Button
                            onClick={handleGenerateApiKey}
                            disabled={apiKeyLoading}
                            className={`bg-orange-500 hover:bg-orange-600 ${isMobile ? 'w-full' : ''}`}
                          >
                            Generate API Key
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <MobileBottomNav />
      
      {/* Add Item Dialog */}
      <EnhancedAddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};

export default ProfileSettings;
