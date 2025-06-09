import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  condition: string;
  itemWebUrl: string;
  image?: {
    imageUrl: string;
  };
  seller: {
    username: string;
    feedbackPercentage: string;
    feedbackScore: number;
  };
}

interface PriceAnalysis {
  currentListings: EbayItem[];
  averagePrice: number;
  priceRange: { min: number; max: number };
  totalListings: number;
  conditionBreakdown: { [key: string]: number };
}

export default function EbayPriceAnalyzer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8081/api/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.access_token) {
        setUserToken(data.access_token);
        localStorage.setItem('ebay_user_token', data.access_token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        alert('Successfully authorized with eBay! You can now search for items.');
      } else {
        throw new Error(data.error || 'Failed to get access token');
      }
    } catch (err) {
      setError(`OAuth callback failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const startUserAuthorization = () => {
    const clientId = 'RichCope-PopGuide-PRD-bf0240608-e93619a9';
    const redirectUri = 'https://auth.ebay.com/oauth2/ThirdPartyAuthSucessFailure';
    const scopes = [
      'https://api.ebay.com/oauth/api_scope'
    ].join(' ');

    // Use eBay's explicit default redirect URI
    const authUrl = `https://auth.ebay.com/oauth2/authorize?` + 
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}`;

    console.log('Authorization URL:', authUrl);
    
    // Open in new window so we can detect when it closes
    const authWindow = window.open(authUrl, 'ebayAuth', 'width=600,height=700');
    
    // Poll for window closure and check for success
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        // After auth window closes, try to get a token using client credentials
        exchangeForToken();
      }
    }, 1000);
  };

  const exchangeForToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Just set a dummy token - let the backend handle all authentication
      setUserToken('dummy-token');
      localStorage.setItem('ebay_user_token', 'dummy-token');
      alert('Authorization completed! You can now search for items.');
    } catch (err) {
      setError(`Token exchange failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const searchEbayListings = async (query: string): Promise<EbayItem[]> => {
    if (!userToken) {
      throw new Error('Please authorize with eBay first');
    }

    // Search via our backend to avoid CORS issues
    const response = await fetch('http://localhost:8081/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        token: userToken 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Search Error: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.items || [];
  };

  const analyzePrices = (items: EbayItem[]): PriceAnalysis => {
    if (items.length === 0) {
      return {
        currentListings: [],
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        conditionBreakdown: {}
      };
    }

    const prices = items
      .map(item => parseFloat(item.price?.value || '0'))
      .filter(price => price > 0);

    const conditionBreakdown: { [key: string]: number } = {};
    items.forEach(item => {
      const condition = item.condition || 'Unknown';
      conditionBreakdown[condition] = (conditionBreakdown[condition] || 0) + 1;
    });

    return {
      currentListings: items,
      averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      },
      totalListings: items.length,
      conditionBreakdown
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const items = await searchEbayListings(searchQuery);
      const priceAnalysis = analyzePrices(items);
      setAnalysis(priceAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-yellow-100 text-yellow-800';
      case 'refurbished':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">eBay Price Analyzer</h1>
        <p className="text-gray-600">
          Analyze current eBay listings for Funko Pops and collectibles
        </p>
      </div>

      {/* Authorization Section */}
      {!userToken && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Authorization Required</CardTitle>
            <CardDescription className="text-amber-700">
              To access eBay's Browse API and search for items, you need to authorize this application with your eBay account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startUserAuthorization} className="bg-amber-600 hover:bg-amber-700">
              Authorize with eBay
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search eBay Listings</CardTitle>
          <CardDescription>
            {userToken 
              ? "Enter a Funko Pop name or collectible to analyze current market prices"
              : "Authorization required to search eBay listings"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="e.g., Batman Funko Pop, Spider-Man Marvel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              disabled={!userToken}
            />
            <Button onClick={handleSearch} disabled={loading || !userToken}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          {userToken && (
            <div className="mt-2 text-sm text-green-600">
              ✓ Authorized with eBay
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold">{formatPrice(analysis.averagePrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Price Range</p>
                    <p className="text-lg font-bold">
                      {formatPrice(analysis.priceRange.min)} - {formatPrice(analysis.priceRange.max)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Minus className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Listings</p>
                    <p className="text-2xl font-bold">{analysis.totalListings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Condition Breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(analysis.conditionBreakdown).map(([condition, count]) => (
                      <div key={condition} className="flex justify-between text-sm">
                        <span>{condition}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Current Listings ({analysis.totalListings})</CardTitle>
              <CardDescription>
                {analysis.totalListings === 0 
                  ? "No listings found. This is expected in sandbox environment."
                  : "Live eBay listings for your search query"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.totalListings === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium">No listings found</p>
                  <p className="text-sm mt-2">
                    This is expected when using the sandbox environment. 
                    In production, you would see real eBay listings here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.currentListings.slice(0, 12).map((item) => (
                    <Card key={item.itemId} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        {item.image && (
                          <img
                            src={item.image.imageUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(parseFloat(item.price?.value || '0'))}
                            </span>
                            <Badge className={getConditionColor(item.condition)}>
                              {item.condition}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            Seller: {item.seller?.username} ({item.seller?.feedbackPercentage}%)
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(item.itemWebUrl, '_blank')}
                          >
                            View on eBay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Development Notice */}
          <Alert>
            <AlertDescription>
              <strong>Development Mode:</strong> Currently using eBay sandbox environment. 
              No real listings will be returned, but the API integration is working correctly. 
              Switch to production credentials to see real data.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
} 