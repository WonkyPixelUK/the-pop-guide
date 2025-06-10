import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Bell, 
  ExternalLink, 
  Search,
  Filter,
  AlertCircle,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Zap,
  Loader2,
  RefreshCw,
  Shield,
  Play,
  Pause,
  BarChart3,
  Calendar,
  Globe,
  FileSearch,
  Settings
} from 'lucide-react';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface MarketplacePrice {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  listing_url: string;
  source_name: string;
  last_updated: string;
  is_auction: boolean;
  is_buy_now: boolean;
  shipping_cost: number;
  location: string;
  seller_info: any;
  expires_at?: string;
}

interface FunkoPop {
  id: string;
  name: string;
  series: string;
  number: string;
  image_url: string;
  estimated_value: number;
  average_price_30d: number;
  price_trend: string;
}

interface PriceAlert {
  id: string;
  target_price: number;
  condition_filter: string;
  is_active: boolean;
  created_at: string;
}

interface BulkProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  startedAt?: string;
  estimatedCompletion?: string;
  lastError?: string;
  currentItem?: string;
  pricesCollected: number;
  averageTimePerItem: number;
}

interface CategoryPrice {
  id: string;
  name: string;
  price: number;
  condition: string;
  image_url: string;
  listing_url: string;
  source_name: string;
  last_updated: string;
  is_auction: boolean;
  is_buy_now: boolean;
  shipping_cost: number;
  location: string;
  seller_info: any;
  expires_at?: string;
}

const PricingDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const [selectedPop, setSelectedPop] = useState<FunkoPop | null>(null);
  const [marketplacePrices, setMarketplacePrices] = useState<MarketplacePrice[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FunkoPop[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('any');
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState<MarketplacePrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    targetPrice: "",
    condition: "mint"
  });
  const [adminEmail, setAdminEmail] = useState("brains@popguide.co.uk");
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrapingStats, setScrapingStats] = useState<any>(null);

  // Bulk scraping state
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [bulkStats, setBulkStats] = useState<BulkProgress | null>(null);
  const [isBulkScraping, setIsBulkScraping] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    batchSize: 50,
    maxItems: 2000
  });

  const { data: funkoPops } = useFunkoPops();
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Check if user is admin (you can customize this logic)
      if (session?.user?.email === adminEmail) {
        setIsAdmin(true);
      }
      return session;
    }
  });

  const queryClient = useQueryClient();

  // Computed property for filtered pops
  const filteredPops = funkoPops?.filter(pop => 
    pop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pop.series.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Search for Funko Pops
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,series.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      
      // Update searchResults state if it exists
      // setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Get marketplace prices for selected Pop
  const loadMarketplacePrices = async (popId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_prices')
        .select(`
          *,
          marketplace_sources(name)
        `)
        .eq('funko_pop_id', popId)
        .order('price', { ascending: true });

      if (error) throw error;
      
      const prices = data?.map(price => ({
        ...price,
        source_name: price.marketplace_sources?.name || 'Unknown'
      })) || [];
      
      setMarketplacePrices(prices);
    } catch (error) {
      console.error('Error loading prices:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace prices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user's price alerts for selected Pop
  const loadPriceAlerts = async (popId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('funko_pop_id', popId)
        .eq('user_id', user.id);

      if (error) throw error;
      setPriceAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Set a price alert
  const setPriceAlert = async () => {
    if (!user || !selectedPop || !alertPrice) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .upsert({
          user_id: user.id,
          funko_pop_id: selectedPop.id,
          target_price: parseFloat(alertPrice),
          condition_filter: alertCondition,
          is_active: true
        });

      if (error) throw error;

      // Send price alert confirmation email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'price_alert_created',
            to: user.email,
            data: {
              popName: selectedPop.name,
              targetPrice: `£${alertPrice}`,
              condition: alertCondition === 'any' ? 'Any Condition' : alertCondition,
              currentPrice: selectedPop.estimated_value ? `£${selectedPop.estimated_value.toFixed(2)}` : 'Unknown',
              popImage: selectedPop.image_url
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send price alert email:', emailError);
      }

      toast({
        title: "Price Alert Set!",
        description: `You'll be notified when ${selectedPop.name} drops to £${alertPrice}`,
        variant: "default"
      });

      setAlertPrice('');
      loadPriceAlerts(selectedPop.id);
    } catch (error) {
      console.error('Error setting alert:', error);
      toast({
        title: "Error",
        description: "Failed to set price alert",
        variant: "destructive"
      });
    }
  };

  // Trigger scraper for selected Pop
  const triggerScraper = async () => {
    if (!selectedPop || !user) return;

    console.log(`Triggering bulk eBay scraper for Funko Pop: ${selectedPop.id}`);
    console.log('User from useAuth:', user);

    setLoading(true);
    let requestId: string | null = null;

    try {
      // Log the pricing update request FIRST
      console.log('Attempting to log pricing update request...');
      const { data: insertData, error: insertError } = await supabase
        .from('pricing_update_requests')
        .insert({
          user_id: user.id,
          funko_pop_id: selectedPop.id,
          request_type: 'price_update',
          status: 'pending',
          notes: `eBay scraping requested for ${selectedPop.name} ${selectedPop.series}`
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error logging pricing update request:', insertError);
        throw insertError;
      }

      requestId = insertData.id;
      console.log('Pricing update request logged with ID:', requestId);

      // Start bulk scraper for this specific Funko Pop
      console.log('Calling bulk-ebay-scraper Edge Function...');
      const { data: scraperData, error: scraperError } = await supabase.functions.invoke('bulk-ebay-scraper', {
        body: {
          action: 'start',
          batchSize: 1, // Single item
          maxItems: 1   // Just this pop
        }
      });

      if (scraperError) {
        console.error('Scraper invoke error:', scraperError);
        throw scraperError;
      }

      console.log('Scraper response:', scraperData);

      // Update the request status to completed
      await supabase
        .from('pricing_update_requests')
        .update({
          status: 'completed',
          response_data: scraperData,
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      toast({
        title: "Live pricing update started!",
        description: `Price scraping initiated for ${selectedPop.name}. Check back in a few minutes for updated prices.`,
      });

      // Refresh the data after a short delay
      setTimeout(() => {
        mutate(); // Refresh pricing data
      }, 5000);

    } catch (error) {
      console.error('Error in triggerScraper:', error);
      
      // Update request status to failed if we have a request ID
      if (requestId) {
        await supabase
          .from('pricing_update_requests')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', requestId);
      }

      toast({
        title: "Error",
        description: `Failed to trigger price update: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectPop = (pop: FunkoPop) => {
    setSelectedPop(pop);
    setActiveTab('prices');
    loadMarketplacePrices(pop.id);
    loadPriceAlerts(pop.id);
  };

  const getPriceTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatETA = (isoString: string) => {
    const eta = new Date(isoString);
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Almost done';
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Smart scraper with auto-discovery
  const handleSmartScraping = async () => {
    if (!selectedPop) {
      toast.error("Please select a Funko Pop first");
      return;
    }

    setIsLoading(true);
    try {
      // Get marketplace sources
      const { data: sources } = await supabase
        .from('marketplace_sources')
        .select('*')
        .eq('is_active', true);

      if (!sources || sources.length === 0) {
        throw new Error('No active marketplace sources found');
      }

      const allResults = [];
      const totalStats = {
        new_pops_created: 0,
        existing_pops_updated: 0,
        total_prices_added: 0,
        price_trends_updated: 0,
        sources_scraped: 0,
        total_listings_found: 0
      };

      for (const source of sources) {
        try {
          console.log(`🚀 Starting smart scraping for ${source.name}...`);
          
          const response = await supabase.functions.invoke('smart-scraper', {
            body: {
              source_id: source.id,
              search_query: `${selectedPop.name} ${selectedPop.series}`,
              admin_email: isAdmin ? adminEmail : null
            }
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          const result = response.data;
          allResults.push(result);
          
          // Aggregate stats
          if (result.stats) {
            totalStats.new_pops_created += result.stats.new_pops_created || 0;
            totalStats.existing_pops_updated += result.stats.existing_pops_updated || 0;
            totalStats.total_prices_added += result.stats.total_prices_added || 0;
            totalStats.price_trends_updated += result.stats.price_trends_updated || 0;
            totalStats.sources_scraped += 1;
            totalStats.total_listings_found += result.stats.total_listings_found || 0;
          }

          console.log(`✅ Completed scraping ${source.name}`);
        } catch (error) {
          console.error(`❌ Error scraping ${source.name}:`, error);
          toast.error(`Failed to scrape ${source.name}: ${error.message}`);
        }
      }

      setScrapingStats(totalStats);

      // Send admin notification if user is admin
      if (isAdmin && adminEmail) {
        try {
          await supabase.functions.invoke('admin-mailer', {
            body: {
              type: 'scraping_success',
              admin_email: adminEmail,
              data: {
                source_name: 'All Sources',
                search_query: `${selectedPop.name} ${selectedPop.series}`,
                stats: totalStats,
                sample_items: allResults.flatMap(r => r.sample_items || []).slice(0, 5)
              },
              priority: 'normal'
            }
          });
          console.log('📧 Admin notification sent');
        } catch (error) {
          console.error('Failed to send admin notification:', error);
        }
      }

      // Refresh prices after scraping
      await handleSearch();
      
      toast.success(
        `🎉 Smart scraping completed! 
        📦 ${totalStats.new_pops_created} new Pops discovered, 
        💰 ${totalStats.total_prices_added} prices added, 
        🔄 ${totalStats.existing_pops_updated} Pops updated`
      );

    } catch (error) {
      console.error('Smart scraping error:', error);
      toast.error(`Smart scraping failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for bulk scraping progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBulkScraping) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
            body: { action: 'status' }
          });

          if (error) throw error;

          setBulkProgress(data);
          
          // Stop polling if completed or error
          if (data.status === 'completed' || data.status === 'error') {
            setIsBulkScraping(false);
            setBulkStats(data); // Store final stats
            clearInterval(interval);
            
            if (data.status === 'completed') {
              toast({
                title: "Bulk Scraping Completed!",
                description: `Successfully processed ${data.successfulItems}/${data.totalItems} items. Collected ${data.pricesCollected} prices.`
              });
            } else if (data.status === 'error') {
              toast({
                title: "Bulk Scraping Failed",
                description: data.lastError || "Unknown error occurred",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Error checking bulk progress:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBulkScraping, toast]);

  const startBulkScraping = async () => {
    if (isBulkScraping) {
      toast({
        title: "Warning",
        description: "Bulk scraping is already in progress",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsBulkScraping(true);
      setBulkProgress(null);

      const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
        body: {
          action: 'start',
          batchSize: bulkConfig.batchSize,
          maxItems: bulkConfig.maxItems
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Bulk Scraping Started",
        description: `Processing ${bulkConfig.maxItems} Funko Pops in batches of ${bulkConfig.batchSize}`
      });

      setBulkProgress(data.progress);
    } catch (error: any) {
      console.error('Error starting bulk scraping:', error);
      setIsBulkScraping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to start bulk scraping",
        variant: "destructive"
      });
    }
  };

  const stopBulkScraping = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
        body: { action: 'stop' }
      });

      if (error) throw error;

      setIsBulkScraping(false);
      setBulkProgress(data.progress);
      
      toast({
        title: "Bulk Scraping Stopped",
        description: "The scraping process has been paused"
      });
    } catch (error: any) {
      console.error('Error stopping bulk scraping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop bulk scraping",
        variant: "destructive"
      });
    }
  };

  // Add new function for category scraping with actual data insertion
  const handleCategoryScraping = async (category: 'Bitty Pop!' | 'Vinyl Soda' | 'Loungefly') => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can run category scraping",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🚀 Starting ${category} real marketplace scraping...`);
      
      toast({
        title: `🔍 ${category} Scraper Started`,
        description: `Scraping real marketplace data for ${category}. This may take a few minutes...`,
        duration: 8000
      });

      // Call the enhanced category scraper Edge Function
      const { data: scraperData, error: scraperError } = await supabase.functions.invoke('category-scraper', {
        body: {
          category: category,
          maxItems: 20
        }
      });

      if (scraperError) {
        throw new Error(`Scraper error: ${scraperError.message}`);
      }

      const results = scraperData;
      console.log(`✅ ${category} scraping completed:`, results);

      const resultMessage = `✅ ${category} Real Scraping Complete! 
      📦 Found: ${results.totalFound} marketplace listings
      🆕 Created: ${results.totalCreated} new items
      ✅ Existing: ${results.totalExisting} items found
      💰 Prices: ${results.totalPricesCollected} price entries added`;

      toast({
        title: `🎉 ${category} Success!`,
        description: `Created ${results.totalCreated} new ${category} items with ${results.totalPricesCollected} real prices from eBay!`,
        duration: 10000
      });

      // Send email notification (already handled by the Edge Function)
      console.log(`📧 Email notification sent to ${adminEmail}`);

    } catch (error) {
      console.error(`❌ ${category} scraping failed:`, error);
      
      toast({
        title: `❌ ${category} Scraping Failed`,
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
        duration: 8000
      });

      // Send failure email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'scraper_failure',
            to: adminEmail,
            data: {
              scraper_type: `${category} Category Scraper`,
              completion_time: new Date().toISOString(),
              total_processed: 0,
              successful_items: 0,
              failed_items: 1,
              prices_collected: 0,
              success_rate: 0,
              duration: 'Unknown',
              error_message: error.message,
              dashboard_url: 'https://popguide.co.uk/pricing-dashboard'
            }
          }
        });

        if (emailError) {
          console.error('Failed to send failure notification email:', emailError);
        } else {
          console.log(`✅ Failure notification email sent to ${adminEmail}`);
        }
      } catch (emailError) {
        console.error('Error sending failure notification email:', emailError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Coming Soon functionality
  const loadComingSoonReleases = async () => {
    setIsLoadingComingSoon(true);
    try {
      const { data, error } = await supabase
        .from('coming_soon_releases')
        .select('*')
        .eq('is_active', true)
        .order('expected_release_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setComingSoonReleases(data || []);
    } catch (error) {
      console.error('Error loading coming soon releases:', error);
      toast({
        title: "Error",
        description: "Failed to load upcoming releases",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComingSoon(false);
    }
  };

  const handleOcioStockScraping = async () => {
    if (!ocioStockCredentials.username || !ocioStockCredentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password for OcioStock",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingOcioStock(true);
    try {
      console.log('🔍 Starting OcioStock scraper test...');
      
      const { data, error } = await supabase.functions.invoke('ociostock-scraper', {
        body: {
          action: 'scrape',
          credentials: ocioStockCredentials,
          maxItems: 50
        }
      });

      console.log('📡 Scraper response:', { data, error });

      if (error) {
        console.error('❌ Scraper error details:', error);
        throw new Error(`Scraper error: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('No response data received from scraper');
      }

      if (!data.success) {
        console.error('❌ Scraper returned failure:', data);
        throw new Error(data.error || 'Unknown scraper error occurred');
      }

      toast({
        title: "🎉 OcioStock Scraping Complete!",
        description: `Successfully scraped ${data.itemsScraped} upcoming releases`,
        duration: 10000
      });

      // Reload the coming soon data
      loadComingSoonReleases();

    } catch (error) {
      console.error('❌ OcioStock scraping error:', error);
      
      let errorMessage = 'Authentication or scraping error occurred';
      let errorDetails = '';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Try to extract more details from the error
      if (error.message?.includes('non-2xx status code')) {
        errorDetails = 'The Edge Function returned an error. This could be due to authentication issues, missing API keys, or website changes.';
      } else if (error.message?.includes('Authentication')) {
        errorDetails = 'Login credentials may be incorrect or expired. Please verify your OcioStock username and password.';
      } else if (error.message?.includes('Firecrawl')) {
        errorDetails = 'Issue with the web scraping service. This may be temporary.';
      }
      
      toast({
        title: "❌ OcioStock Scraping Failed", 
        description: (
          <div className="space-y-2">
            <p>{errorMessage}</p>
            {errorDetails && <p className="text-sm text-gray-600">{errorDetails}</p>}
          </div>
        ),
        variant: "destructive",
        duration: 12000
      });
    } finally {
      setIsScrapingOcioStock(false);
    }
  };

  // Add a test function to check scraper status
  const testOcioStockScraper = async () => {
    try {
      console.log('🧪 Testing OcioStock scraper status...');
      
      const { data, error } = await supabase.functions.invoke('ociostock-scraper', {
        body: { action: 'status' }
      });

      console.log('📊 Status response:', { data, error });

      if (error) {
        throw new Error(`Status check failed: ${error.message || JSON.stringify(error)}`);
      }

      toast({
        title: "✅ OcioStock Scraper Status",
        description: (
          <div className="space-y-1">
            <p>Function is responsive</p>
            <p>Recent scrapes: {data?.recentScrapes || 0}</p>
            <p>Last update: {data?.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : 'Never'}</p>
          </div>
        ),
        duration: 8000
      });

    } catch (error) {
      console.error('❌ Status test failed:', error);
      toast({
        title: "❌ Scraper Status Test Failed",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
        duration: 8000
      });
    }
  };

  const handleTestOcioStockEnvironment = async () => {
    try {
      console.log('🧪 Testing OcioStock environment...');
      
      const { data, error } = await supabase.functions.invoke('ociostock-scraper', {
        body: { action: 'test_environment' }
      });

      console.log('📡 Environment test response:', { data, error });

      if (data?.success) {
        toast({
          title: "Environment Test Passed",
          description: `Environment is configured correctly. Firecrawl credits: ${data.credits || 'Unknown'}`,
        });
      } else {
        toast({
          title: "Environment Issue Detected",
          description: data?.error || error?.message || 'Unknown error',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Environment test error:', error);
      toast({
        title: "Environment Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load coming soon releases when tab is opened
  useEffect(() => {
    if (activeTab === 'coming-soon') {
      loadComingSoonReleases();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💰 Live Pricing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Compare marketplace prices and set up price alerts for your favorite Funko Pops
          </p>
          
          {(isAdmin || user?.email === adminEmail) && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">Admin Controls</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className="ml-auto"
                >
                  {isAdmin ? '🔓 Admin Mode' : '🔒 Enable Admin'}
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-sm text-blue-700 dark:text-blue-300">
                  Notification Email:
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="ml-2 px-2 py-1 border rounded text-gray-900"
                    placeholder="admin@popguide.co.uk"
                  />
                </label>
                
                {/* Category Scraper Controls */}
                <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    🆕 Category Scraper
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Test scraping for new categories: Bitty Pops!, Vinyl Soda, and Loungefly
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCategoryScraping('Bitty Pop!')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : '🧸'} 
                      Scrape Bitty Pops!
                    </button>
                    <button
                      onClick={() => handleCategoryScraping('Vinyl Soda')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : '🥤'} 
                      Scrape Vinyl Soda
                    </button>
                    <button
                      onClick={() => handleCategoryScraping('Loungefly')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 text-sm"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : '🎒'} 
                      Scrape Loungefly
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scrapingStats && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                🎯 Last Scraping Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">🆕 New Pops:</span>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    {scrapingStats.new_pops_created}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">🔄 Updated:</span>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    {scrapingStats.existing_pops_updated}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">💰 Prices:</span>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    {scrapingStats.total_prices_added}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">📊 Sources:</span>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    {scrapingStats.sources_scraped}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">📦 Listings:</span>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    {scrapingStats.total_listings_found}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "search"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🔍 Search Pops
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "prices"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            💰 Live Prices
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "alerts"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🔔 Price Alerts
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "coming-soon"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🔮 Coming Soon
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === "bulk"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              ⚡ Bulk Scraping
            </button>
          )}
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Find Funko Pops to Track
            </h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for Funko Pops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>

            {/* Funko Pop Selection */}
            {funkoPops && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                  Select a Funko Pop:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredPops.map((pop) => (
                    <div
                      key={pop.id}
                      onClick={() => setSelectedPop(pop)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPop?.id === pop.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {pop.image_url && (
                          <img
                            src={pop.image_url}
                            alt={pop.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {pop.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {pop.series} #{pop.number}
                          </p>
                          {pop.estimated_value && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Est. £{pop.estimated_value}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPop && (
              <div className="flex gap-4">
                <button
                  onClick={handleSmartScraping}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  🧠 Smart Discovery Scrape
                </button>
                <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  Auto-discovers new Pops & updates database
                </span>
              </div>
            )}
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && selectedPop && (
          <div className="space-y-6">
            {/* Selected Pop Header */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedPop.image_url || '/placeholder-pop.png'}
                      alt={selectedPop.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedPop.name}</h2>
                      <p className="text-gray-400">{selectedPop.series} #{selectedPop.number}</p>
                      <div className="flex items-center mt-2">
                        {getPriceTrendIcon(selectedPop.price_trend)}
                        <span className="ml-2 text-lg font-semibold">
                          {formatPrice(selectedPop.estimated_value || 0)}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">estimated value</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={triggerScraper} disabled={loading}>
                    <Zap className="w-4 h-4 mr-2" />
                    Refresh Prices
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Prices */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Live Marketplace Prices ({marketplacePrices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketplacePrices.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No current listings found</p>
                    <p className="text-sm text-gray-500">Try refreshing prices to get latest data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {marketplacePrices.map((price, index) => (
                      <div
                        key={price.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-white line-clamp-2">
                                {price.title}
                              </h3>
                              {index === 0 && (
                                <Badge className="bg-green-500 text-white">
                                  Best Price
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className="font-semibold text-lg text-white">
                                {formatPrice(price.price)}
                              </span>
                              
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {price.condition}
                              </Badge>
                              
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {price.source_name}
                              </Badge>
                              
                              {price.shipping_cost > 0 && (
                                <span>+ {formatPrice(price.shipping_cost)} shipping</span>
                              )}
                              
                              {price.location && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {price.location}
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {getTimeAgo(price.last_updated)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {price.images && price.images.length > 0 && (
                              <img
                                src={price.images[0]}
                                alt="Listing"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(price.listing_url, '_blank')}
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && selectedPop && user && (
          <div className="space-y-6">
            {/* Set New Alert */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Set Price Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Alert when price drops to:
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Condition:
                    </label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="any">Any Condition</option>
                      <option value="mint">Mint</option>
                      <option value="good">Good</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <Button onClick={setPriceAlert} disabled={!alertPrice}>
                    Set Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Price Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {priceAlerts.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No active price alerts for this Pop
                  </p>
                ) : (
                  <div className="space-y-3">
                    {priceAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-medium">
                            Alert at {formatPrice(alert.target_price)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Condition: {alert.condition_filter} • 
                            Created {getTimeAgo(alert.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={alert.is_active ? "default" : "secondary"}
                          className={alert.is_active ? "bg-green-500" : ""}
                        >
                          {alert.is_active ? "Active" : "Triggered"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bulk Scraping Tab - Admin Only */}
        {activeTab === 'bulk' && isAdmin && (
          <div className="space-y-6">
            {/* Bulk Scraping Configuration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Bulk eBay UK Scraper Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Batch Size (items per batch)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={bulkConfig.batchSize}
                      onChange={(e) => setBulkConfig(prev => ({
                        ...prev,
                        batchSize: parseInt(e.target.value) || 50
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={isBulkScraping}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 50 (lower for stability, higher for speed)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Maximum Items to Process
                    </label>
                    <Input
                      type="number"
                      min="100"
                      max="5000"
                      value={bulkConfig.maxItems}
                      onChange={(e) => setBulkConfig(prev => ({
                        ...prev,
                        maxItems: parseInt(e.target.value) || 2000
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={isBulkScraping}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total Funko Pops to scrape from database
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={startBulkScraping}
                    disabled={isBulkScraping}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isBulkScraping ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scraping in Progress...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Start Bulk Scraping
                      </>
                    )}
                  </Button>
                  
                  {isBulkScraping && (
                    <Button
                      onClick={stopBulkScraping}
                      variant="destructive"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Stop Scraping
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        ⚠️ Important Information
                      </p>
                      <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• This will scrape real eBay UK data using Firecrawl API</li>
                        <li>• Rate limited to 2-3 seconds between requests</li>
                        <li>• Progress is tracked in real-time</li>
                        <li>• Can be stopped and resumed at any time</li>
                        <li>• Estimated time: ~{Math.ceil(bulkConfig.maxItems * 3 / 60)} minutes for {bulkConfig.maxItems} items</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Display */}
            {(bulkProgress || bulkStats) && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Scraping Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bulkProgress && (
                    <div className="space-y-4">
                      {/* Current Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              bulkProgress.status === 'running' ? 'bg-green-500' :
                              bulkProgress.status === 'completed' ? 'bg-blue-500' :
                              bulkProgress.status === 'error' ? 'bg-red-500' :
                              'bg-gray-500'
                            }
                          >
                            {bulkProgress.status === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {bulkProgress.status.charAt(0).toUpperCase() + bulkProgress.status.slice(1)}
                          </Badge>
                          {bulkProgress.currentItem && (
                            <span className="text-sm text-gray-400">
                              Currently: {bulkProgress.currentItem}
                            </span>
                          )}
                        </div>
                        {bulkProgress.estimatedCompletion && bulkProgress.status === 'running' && (
                          <span className="text-sm text-gray-400">
                            ETA: {formatETA(bulkProgress.estimatedCompletion)}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Progress: {bulkProgress.processedItems} / {bulkProgress.totalItems}
                          </span>
                          <span className="text-gray-400">
                            {bulkProgress.totalItems > 0 
                              ? Math.round((bulkProgress.processedItems / bulkProgress.totalItems) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${bulkProgress.totalItems > 0 
                                ? (bulkProgress.processedItems / bulkProgress.totalItems) * 100 
                                : 0}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Batch Progress */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-gray-400">Current Batch</div>
                          <div className="text-white font-semibold">
                            {bulkProgress.currentBatch} / {bulkProgress.totalBatches}
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-gray-400">Successful</div>
                          <div className="text-green-400 font-semibold">
                            {bulkProgress.successfulItems}
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-gray-400">Failed</div>
                          <div className="text-red-400 font-semibold">
                            {bulkProgress.failedItems}
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="text-gray-400">Prices Collected</div>
                          <div className="text-blue-400 font-semibold">
                            {bulkProgress.pricesCollected}
                          </div>
                        </div>
                      </div>

                      {/* Average Time & Error */}
                      {bulkProgress.averageTimePerItem > 0 && (
                        <div className="text-sm text-gray-400">
                          Average time per item: {formatDuration(bulkProgress.averageTimePerItem)}
                        </div>
                      )}

                      {bulkProgress.lastError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <div className="text-red-700 dark:text-red-300 text-sm">
                            <strong>Last Error:</strong> {bulkProgress.lastError}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Stats */}
                  {bulkStats && bulkStats.status === 'completed' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          🎉 Bulk Scraping Completed Successfully!
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-green-700 dark:text-green-300">Total Processed</div>
                            <div className="font-bold text-green-900 dark:text-green-100">
                              {bulkStats.processedItems}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-700 dark:text-green-300">Successful</div>
                            <div className="font-bold text-green-900 dark:text-green-100">
                              {bulkStats.successfulItems}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-700 dark:text-green-300">Failed</div>
                            <div className="font-bold text-green-900 dark:text-green-100">
                              {bulkStats.failedItems}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-700 dark:text-green-300">Prices Collected</div>
                            <div className="font-bold text-green-900 dark:text-green-100">
                              {bulkStats.pricesCollected}
                            </div>
                          </div>
                        </div>
                        {bulkStats.startedAt && (
                          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            Started: {new Date(bulkStats.startedAt).toLocaleString()}
                            {bulkStats.processedItems > 0 && bulkStats.averageTimePerItem > 0 && (
                              <> • Total time: {formatDuration(bulkStats.processedItems * bulkStats.averageTimePerItem)}</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Coming Soon Tab */}
        {activeTab === "coming-soon" && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  🔮 Coming Soon Releases
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Upcoming Funko releases discovered from wholesale distributors
                </p>
              </CardHeader>
              <CardContent>
                {/* OcioStock Scraper Controls */}
                {isAdmin && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      🇪🇸 OcioStock B2B Scraper
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Scrape upcoming releases from Spanish wholesale distributor OcioStock
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={ocioStockCredentials.username}
                          onChange={(e) => setOcioStockCredentials(prev => ({...prev, username: e.target.value}))}
                          className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                          placeholder="OcioStock username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={ocioStockCredentials.password}
                          onChange={(e) => setOcioStockCredentials(prev => ({...prev, password: e.target.value}))}
                          className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                          placeholder="OcioStock password"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleOcioStockScraping}
                      disabled={isScrapingOcioStock || !ocioStockCredentials.username || !ocioStockCredentials.password}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isScrapingOcioStock ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scraping OcioStock...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Scrape OcioStock
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={testOcioStockScraper}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <FileSearch className="w-4 h-4 mr-2" />
                      Test Status
                    </Button>
                    
                    <Button
                      onClick={handleTestOcioStockEnvironment}
                      variant="outline"
                      className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Test Environment
                    </Button>
                  </div>
                )}

                {/* Coming Soon Releases Display */}
                {isLoadingComingSoon ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Loading upcoming releases...</span>
                  </div>
                ) : comingSoonReleases.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No upcoming releases found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isAdmin ? 'Use the scraper above to discover new releases' : 'Check back later for new announcements'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {comingSoonReleases.length} Upcoming Releases
                      </h3>
                      <Button
                        onClick={loadComingSoonReleases}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {comingSoonReleases.map((release) => (
                        <Card key={release.id} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {release.product_image_url && (
                                <img
                                  src={release.product_image_url}
                                  alt={release.product_name}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight mb-1">
                                  {release.product_name}
                                </h4>
                                {release.product_series && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {release.product_series} {release.product_number && `#${release.product_number}`}
                                  </p>
                                )}
                                
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Category:</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {release.product_category}
                                    </Badge>
                                  </div>
                                  
                                  {release.wholesale_price && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Wholesale:</span>
                                      <span className="font-medium text-green-600 dark:text-green-400">
                                        €{release.wholesale_price}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {release.suggested_retail_price && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Est. Retail:</span>
                                      <span className="font-medium">
                                        €{release.suggested_retail_price}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {release.expected_release_date && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500">Release:</span>
                                      <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {new Date(release.expected_release_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Source:</span>
                                    <span className="font-medium text-orange-600 dark:text-orange-400">
                                      {release.source_name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Status:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        release.release_status === 'announced' ? 'border-blue-300 text-blue-700' :
                                        release.release_status === 'confirmed' ? 'border-green-300 text-green-700' :
                                        release.release_status === 'shipping' ? 'border-orange-300 text-orange-700' :
                                        'border-gray-300 text-gray-700'
                                      }`}
                                    >
                                      {release.release_status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PricingDashboard; 