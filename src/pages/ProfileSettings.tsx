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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  
  // Add cancellation states
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [goodwillOffers, setGoodwillOffers] = useState<any[]>([]);
  const [showGoodwillOffers, setShowGoodwillOffers] = useState(false);
  const [cancelStep, setCancelStep] = useState<'initial' | 'goodwill' | 'confirm'>('initial');
  
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
      console.log('🔍 Fetching user subscription data for:', user.id);
      supabase
        .from('profiles')
        .select('subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            console.error('❌ Error fetching user data:', error);
            return;
          }
          
          console.log('✅ User data:', data);
          setSubStatus(data?.subscription_status || 'free');
          setCustomerId(data?.stripe_customer_id || null);
          
          if (data?.stripe_customer_id) {
            console.log('💳 Found customer ID, fetching Stripe data...');
            try {
              // Fetch billing and card details from Stripe
              const { data: sessionData } = await supabase.auth.getSession();
              console.log('🔑 Session data available:', !!sessionData.session?.access_token);
              
              const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-customer-details`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.session?.access_token}`
                },
                body: JSON.stringify({ customer_id: data.stripe_customer_id }),
              });
              
              console.log('📡 Customer details response status:', res.status);
              
              if (res.ok) {
                const customerData = await res.json();
                console.log('✅ Customer data received:', customerData);
                setBilling(customerData.billing || null);
                setCard(customerData.card || null);
              } else {
                const errorData = await res.text();
                console.error('❌ Customer details error:', res.status, errorData);
              }

              // Fetch invoices
              console.log('📄 Fetching invoices...');
              const invoiceRes = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-invoices`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.session?.access_token}`
                },
                body: JSON.stringify({ customer_id: data.stripe_customer_id }),
              });
              
              console.log('📡 Invoices response status:', invoiceRes.status);
              
              if (invoiceRes.ok) {
                const invoiceData = await invoiceRes.json();
                console.log('✅ Invoice data received:', invoiceData);
                setInvoices(invoiceData.invoices || []);
              } else {
                const errorData = await invoiceRes.text();
                console.error('❌ Invoices error:', invoiceRes.status, errorData);
              }
            } catch (error) {
              console.error('❌ Error fetching Stripe data:', error);
            }
          } else {
            console.log('🚫 No customer ID found');
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
      
      supabase.auth.getSession().then(async ({ data }) => {
        const token = data?.session?.access_token;
        try {
          const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/api-key-manager`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            setApiKey(data.api_key);
          } else {
            const errorData = await res.json();
            setApiKeyError(errorData.error || 'Failed to load API key');
          }
        } catch (error) {
          setApiKeyError('Failed to load API key');
        } finally {
          setApiKeyLoading(false);
        }
      });
    }
  }, [activeTab, user]);

  const handleGenerateApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/api-key-manager`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        toast({
          title: "API Key Generated",
          description: "New API key created successfully",
        });
      } else {
        const errorData = await res.json();
        setApiKeyError(errorData.error || 'Failed to generate API key');
      }
    } catch (error) {
      setApiKeyError('Failed to generate API key');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const handleRevokeApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/api-key-manager`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        setApiKey(null);
        toast({
          title: "API Key Revoked",
          description: "API key has been revoked successfully",
        });
      } else {
        const errorData = await res.json();
        setApiKeyError(errorData.error || 'Failed to revoke API key');
      }
    } catch (error) {
      setApiKeyError('Failed to revoke API key');
    } finally {
      setApiKeyLoading(false);
    }
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

  // Cancellation handlers
  const handleCheckGoodwillOffers = async () => {
    if (!customerId || !user) return;
    
    setCancelLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/cancel-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        },
        body: JSON.stringify({ 
          action: 'check_goodwill',
          customer_id: customerId,
          subscription_id: billing?.subscriptions?.[0]?.id
        }),
      });
      
      const data = await res.json();
      if (data.eligible && data.offers?.length > 0) {
        setGoodwillOffers(data.offers);
        setCancelStep('goodwill');
        setShowGoodwillOffers(true);
      } else {
        setCancelStep('confirm');
      }
    } catch (error) {
      console.error('Error checking goodwill offers:', error);
      setCancelStep('confirm');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleAcceptGoodwillOffer = async (offerAction: string) => {
    if (!customerId || !user) return;
    
    setCancelLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/cancel-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        },
        body: JSON.stringify({ 
          action: offerAction,
          customer_id: customerId,
          subscription_id: billing?.subscriptions?.[0]?.id
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Offer Applied! 🎉",
          description: data.message,
        });
        setShowCancelDialog(false);
        setCancelStep('initial');
        setShowGoodwillOffers(false);
        // Refresh billing data
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to apply offer');
      }
    } catch (error) {
      console.error('Error applying goodwill offer:', error);
      toast({
        title: "Error",
        description: "Failed to apply offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelType: 'immediately' | 'at_period_end') => {
    if (!customerId || !user) return;
    
    setCancelLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const action = cancelType === 'immediately' ? 'cancel_immediately' : 'cancel_at_period_end';
      
      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/cancel-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        },
        body: JSON.stringify({ 
          action,
          customer_id: customerId,
          subscription_id: billing?.subscriptions?.[0]?.id
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Subscription Canceled",
          description: data.message,
        });
        setShowCancelDialog(false);
        setCancelStep('initial');
        // Refresh page to update subscription status
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
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
                  className="border-gray-600 text-white hover:bg-gray-700 bg-gray-800"
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
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (subStatus === 'active' || subStatus === 'premium') ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {(subStatus === 'active' || subStatus === 'premium') ? 'Pro' : 'Free'}
                        </span>
                        <span className="text-gray-300">
                          {(subStatus === 'active' || subStatus === 'premium') ? 'You are a Pro member.' : 'You are on the Free plan.'}
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
                              <div className="space-y-2">
                                <div className="text-gray-400 text-sm">Loading card details...</div>
                                <button 
                                  onClick={async () => {
                                    console.log('🔄 Manual refresh of card details...');
                                    try {
                                      const { data: sessionData } = await supabase.auth.getSession();
                                      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-customer-details`, {
                                        method: 'POST',
                                        headers: { 
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${sessionData.session?.access_token}`
                                        },
                                        body: JSON.stringify({ customer_id: customerId }),
                                      });
                                      if (res.ok) {
                                        const customerData = await res.json();
                                        setCard(customerData.card || null);
                                        setBilling(customerData.billing || null);
                                      } else {
                                        console.error('Failed to refresh card details:', await res.text());
                                      }
                                    } catch (error) {
                                      console.error('Error refreshing card details:', error);
                                    }
                                  }}
                                  className="text-orange-500 hover:text-orange-400 text-xs underline bg-transparent border-none cursor-pointer"
                                >
                                  Retry Loading
                                </button>
                              </div>
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
                              <div className="space-y-2">
                                <div className="text-gray-400 text-sm">Loading billing details...</div>
                                <button 
                                  onClick={async () => {
                                    console.log('🔄 Manual refresh of billing details...');
                                    try {
                                      const { data: sessionData } = await supabase.auth.getSession();
                                      const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/get-customer-details`, {
                                        method: 'POST',
                                        headers: { 
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${sessionData.session?.access_token}`
                                        },
                                        body: JSON.stringify({ customer_id: customerId }),
                                      });
                                      if (res.ok) {
                                        const customerData = await res.json();
                                        setBilling(customerData.billing || null);
                                        setCard(customerData.card || null);
                                      } else {
                                        console.error('Failed to refresh billing details:', await res.text());
                                      }
                                    } catch (error) {
                                      console.error('Error refreshing billing details:', error);
                                    }
                                  }}
                                  className="text-orange-500 hover:text-orange-400 text-xs underline bg-transparent border-none cursor-pointer"
                                >
                                  Retry Loading
                                </button>
                              </div>
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
                            className="text-white border-gray-600 hover:bg-gray-700 bg-gray-800"
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

                    {/* Cancel Subscription Section */}
                    {(subStatus === 'active' || subStatus === 'premium') && customerId && (
                      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          ⚠️ Cancel Subscription
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500">
                            <p className="text-yellow-300 font-semibold mb-2">⚠️ Important Warning</p>
                            <p className="text-gray-300 text-sm mb-2">
                              Canceling your subscription will result in:
                            </p>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4 list-disc">
                              <li>Loss of access to Pro features immediately (if canceled now)</li>
                              <li>Your collection data will be scheduled for deletion in 30 days</li>
                              <li>All custom lists, analytics, and API access will be lost</li>
                              <li>Price tracking and alerts will stop working</li>
                            </ul>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    setShowCancelDialog(true);
                                    setCancelStep('initial');
                                  }}
                                >
                                  Cancel Subscription
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    {cancelStep === 'initial' && '🤔 Before you go...'}
                                    {cancelStep === 'goodwill' && '🎁 Special Offers Just for You'}
                                    {cancelStep === 'confirm' && '⚠️ Confirm Cancellation'}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* Initial Step */}
                                  {cancelStep === 'initial' && (
                                    <div className="space-y-4">
                                      <p className="text-gray-300">
                                        We'd hate to see you go! Let us check if we have any special offers available for you.
                                      </p>
                                      <div className="flex gap-3">
                                        <Button
                                          onClick={handleCheckGoodwillOffers}
                                          disabled={cancelLoading}
                                          className="bg-orange-500 hover:bg-orange-600"
                                        >
                                          {cancelLoading ? 'Checking...' : 'Check Available Offers'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setCancelStep('confirm')}
                                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                        >
                                          Skip to Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Goodwill Offers Step */}
                                  {cancelStep === 'goodwill' && goodwillOffers.length > 0 && (
                                    <div className="space-y-4">
                                      <p className="text-gray-300">
                                        Great news! We have some exclusive offers available for you:
                                      </p>
                                      {goodwillOffers.map((offer, index) => (
                                        <div key={index} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                          <h4 className="font-semibold text-orange-400 mb-2">{offer.title}</h4>
                                          <p className="text-gray-300 text-sm mb-3">{offer.description}</p>
                                          <Button
                                            onClick={() => handleAcceptGoodwillOffer(offer.action)}
                                            disabled={cancelLoading}
                                            className="bg-orange-500 hover:bg-orange-600 text-white"
                                          >
                                            {cancelLoading ? 'Applying...' : 'Accept This Offer'}
                                          </Button>
                                        </div>
                                      ))}
                                      <div className="pt-4 border-t border-gray-700">
                                        <Button
                                          variant="outline"
                                          onClick={() => setCancelStep('confirm')}
                                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                        >
                                          No Thanks, Continue to Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Confirmation Step */}
                                  {cancelStep === 'confirm' && (
                                    <div className="space-y-4">
                                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-400 font-semibold mb-2">⚠️ Final Warning</p>
                                        <p className="text-gray-300 text-sm mb-2">
                                          This action cannot be easily undone. Your account and data will be:
                                        </p>
                                        <ul className="text-gray-300 text-sm space-y-1 ml-4 list-disc">
                                          <li>Scheduled for deletion in 30 days</li>
                                          <li>All Pro features will be disabled</li>
                                          <li>Collection analytics and insights will be lost</li>
                                        </ul>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <p className="text-gray-300 font-semibold">Choose cancellation type:</p>
                                        <div className="grid grid-cols-1 gap-3">
                                          <Button
                                            onClick={() => handleCancelSubscription('at_period_end')}
                                            disabled={cancelLoading}
                                            variant="outline"
                                            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-gray-800 justify-start p-4 h-auto"
                                          >
                                            <div className="text-left">
                                              <div className="font-semibold">Cancel at End of Billing Period</div>
                                              <div className="text-sm opacity-80">Keep access until your current subscription expires</div>
                                            </div>
                                          </Button>
                                          <Button
                                            onClick={() => handleCancelSubscription('immediately')}
                                            disabled={cancelLoading}
                                            variant="destructive"
                                            className="bg-red-600 hover:bg-red-700 text-white justify-start p-4 h-auto"
                                          >
                                            <div className="text-left">
                                              <div className="font-semibold">Cancel Immediately</div>
                                              <div className="text-sm opacity-80">Lose access right now, data deleted in 30 days</div>
                                            </div>
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-4 border-t border-gray-700">
                                        <Button
                                          variant="ghost"
                                          onClick={() => setShowCancelDialog(false)}
                                          className="text-gray-400 hover:text-white"
                                        >
                                          Never mind, keep my subscription
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <p className="text-gray-400 text-sm flex items-center">
                              Need help? <a href="mailto:support@popguide.co.uk" className="text-orange-500 hover:text-orange-400 ml-1">Contact support</a>
                            </p>
                          </div>
                        </div>
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
                  
                  {/* Pro Requirement Notice */}
                  {(subStatus !== 'active' && subStatus !== 'premium') && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
                      <h3 className="text-orange-400 font-semibold mb-2">🔐 Pro Feature</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        API access is available exclusively for Pro subscribers. Upgrade to access our developer API.
                      </p>
                      <Button
                        onClick={async () => {
                          const { data: sessionData } = await supabase.auth.getSession();
                          const res = await fetch(SUPABASE_FUNCTION_URL, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(sessionData.session?.access_token && {
                                'Authorization': `Bearer ${sessionData.session.access_token}`
                              })
                            },
                            body: JSON.stringify({ email: user.email }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                  
                  {/* API Key Management */}
                  {(subStatus === 'active' || subStatus === 'premium') && (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-700/30 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">Your API Key</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Use this key to authenticate with the PopGuide API. Keep it secure and never share it publicly.
                        </p>
                        
                        {apiKeyLoading ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : apiKeyError ? (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                            {apiKeyError}
                          </div>
                        ) : apiKey ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <code className="flex-1 p-3 bg-gray-800 rounded border text-green-400 font-mono text-sm break-all">
                                {apiKey}
                              </code>
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(apiKey);
                                  toast({
                                    title: "Copied!",
                                    description: "API key copied to clipboard",
                                  });
                                }}
                                size="sm"
                                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                              >
                                Copy
                              </Button>
                            </div>
                            <Button
                              onClick={handleRevokeApiKey}
                              variant="destructive"
                              disabled={apiKeyLoading}
                              className={`bg-red-600 hover:bg-red-700 text-white ${isMobile ? 'w-full' : ''}`}
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
                              className={`bg-orange-500 hover:bg-orange-600 text-white ${isMobile ? 'w-full' : ''}`}
                            >
                              Generate API Key
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* API Documentation */}
                      <div className="p-4 bg-gray-700/30 rounded-lg">
                        <h3 className="font-semibold text-white mb-3">API Endpoints & Usage</h3>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-medium text-orange-400 mb-2">Base URL</h4>
                            <code className="block p-2 bg-gray-800 rounded text-green-400">
                              https://pafgjwmgueerxdxtneyg.functions.supabase.co
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-400 mb-2">Authentication</h4>
                            <p className="text-gray-300 mb-2">Include your API key in the Authorization header:</p>
                            <code className="block p-2 bg-gray-800 rounded text-green-400">
                              Authorization: Bearer {apiKey || 'YOUR_API_KEY'}
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-400 mb-2">Available Endpoints</h4>
                            <div className="space-y-2">
                              <div className="p-2 bg-gray-800 rounded">
                                <code className="text-blue-400">GET /api-v1-collection</code>
                                <span className="text-gray-300 ml-2">- Get your collection with stats</span>
                              </div>
                              <div className="p-2 bg-gray-800 rounded">
                                <code className="text-blue-400">POST /api-v1-collection</code>
                                <span className="text-gray-300 ml-2">- Add item to collection</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-400 mb-2">Example Request</h4>
                            <div className="p-2 bg-gray-800 rounded">
                              <code className="text-green-400 text-xs block">
                                curl -X GET "https://pafgjwmgueerxdxtneyg.functions.supabase.co/api-v1-collection" \<br/>
                                &nbsp;&nbsp;-H "Authorization: Bearer {apiKey || 'YOUR_API_KEY'}" \<br/>
                                &nbsp;&nbsp;-H "Content-Type: application/json"
                              </code>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-400 mb-2">Rate Limits & Features</h4>
                            <p className="text-gray-300">
                              • Pro users: 1000 requests/hour<br/>
                              • CORS enabled for web applications<br/>
                              • Real-time collection value tracking<br/>
                              • Comprehensive Funko Pop database access
                            </p>
                          </div>
                          
                          {apiKey && (
                            <div>
                              <h4 className="font-medium text-orange-400 mb-2">Test Your API Key</h4>
                              <Button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`https://pafgjwmgueerxdxtneyg.functions.supabase.co/api-v1-collection`, {
                                      method: 'GET',
                                      headers: {
                                        'Authorization': `Bearer ${apiKey}`,
                                        'Content-Type': 'application/json'
                                      },
                                    });
                                    
                                    if (res.ok) {
                                      const data = await res.json();
                                      toast({
                                        title: "API Test Successful! ✅",
                                        description: `Found ${data.data?.stats?.total_items || 0} items in your collection`,
                                      });
                                    } else {
                                      const errorData = await res.json();
                                      toast({
                                        title: "API Test Failed",
                                        description: errorData.error || 'Unknown error',
                                        variant: "destructive",
                                      });
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "API Test Failed",
                                      description: "Network error or invalid response",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Test API Connection
                              </Button>
                            </div>
                          )}
                          
                          <div className="pt-3 border-t border-gray-600">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => window.open('https://github.com/popguide/api-examples', '_blank')}
                                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                              >
                                View Code Examples
                              </Button>
                              <Button
                                onClick={() => window.open('https://docs.popguide.co.uk/api', '_blank')}
                                variant="outline"
                                className="border-gray-600 text-white hover:bg-gray-700 bg-gray-800"
                              >
                                Full Documentation
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
