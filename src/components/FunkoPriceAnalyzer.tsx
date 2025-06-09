import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Search, ExternalLink, AlertCircle } from 'lucide-react';

interface PriceData {
  min: number;
  max: number;
  average: number;
  median: number;
}

interface PriceAnalysis {
  sold?: {
    count: number;
    prices: PriceData;
    conditions: Record<string, number>;
  };
  current?: {
    count: number;
    prices: PriceData;
    conditions: Record<string, number>;
    items: Array<{
      title: string;
      price: number;
      condition: string;
      seller: string;
      url?: string;
    }>;
  };
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    insight: string;
  };
}

interface FunkoPop {
  name: string;
  series: string;
  number: string;
  searchQuery: string;
}

const FunkoPriceAnalyzer: React.FC<{ funkoPop?: FunkoPop }> = ({ funkoPop }) => {
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(funkoPop?.searchQuery || '');

  // Mock data for demonstration (will be replaced with real API calls)
  const getMockAnalysis = (): PriceAnalysis => ({
    sold: {
      count: 8,
      prices: { min: 16.50, max: 30.00, average: 23.25, median: 24.99 },
      conditions: { 'New': 5, 'Used': 3 }
    },
    current: {
      count: 12,
      prices: { min: 18.99, max: 35.00, average: 26.45, median: 25.50 },
      conditions: { 'New': 8, 'Used': 3, 'Open Box': 1 },
      items: [
        { title: 'Funko Pop! Naruto #71 Shippuden - Mint Condition', price: 18.99, condition: 'New', seller: 'funkocollector123' },
        { title: 'Naruto Funko Pop 71 Original Box', price: 22.50, condition: 'New', seller: 'popstore_uk' },
        { title: 'Naruto Shippuden Funko #71 Used Good Condition', price: 19.99, condition: 'Used', seller: 'bargain_pops' }
      ]
    },
    trend: {
      direction: 'up',
      percentage: 13.8,
      insight: 'Current asking prices are premium - strong demand or limited supply'
    }
  });

  const analyzePrice = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with real API calls once eBay production is approved
      // const response = await fetch('/api/analyze-funko-price', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ searchQuery })
      // });
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = getMockAnalysis();
      setAnalysis(mockAnalysis);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (funkoPop) {
      analyzePrice();
    }
  }, [funkoPop]);

  const formatPrice = (price: number) => `£${price.toFixed(2)}`;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Funko Pop Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for Funko Pop (e.g., 'naruto funko pop 71')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzePrice()}
            />
            <Button onClick={analyzePrice} disabled={loading || !searchQuery.trim()}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          
          {funkoPop && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{funkoPop.name}</strong> from {funkoPop.series} #{funkoPop.number}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Market Trend Overview */}
          {analysis.trend && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analysis.trend.direction)}
                    <span className={`font-medium ${getTrendColor(analysis.trend.direction)}`}>
                      Market Trend: {analysis.trend.direction === 'up' ? 'Bullish' : analysis.trend.direction === 'down' ? 'Bearish' : 'Stable'}
                    </span>
                  </div>
                  <Badge variant={analysis.trend.direction === 'up' ? 'default' : analysis.trend.direction === 'down' ? 'destructive' : 'secondary'}>
                    {analysis.trend.direction === 'up' ? '+' : analysis.trend.direction === 'down' ? '-' : ''}{analysis.trend.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.trend.insight}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Sold Data */}
            {analysis.sold && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📈 Sold Listings
                    <Badge variant="outline">{analysis.sold.count} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Average Sold</p>
                        <p className="font-medium text-lg">{formatPrice(analysis.sold.prices.average)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Median</p>
                        <p className="font-medium text-lg">{formatPrice(analysis.sold.prices.median)}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-600">Range: {formatPrice(analysis.sold.prices.min)} - {formatPrice(analysis.sold.prices.max)}</p>
                    </div>

                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Condition Breakdown</p>
                      <div className="space-y-1">
                        {Object.entries(analysis.sold.conditions).map(([condition, count]) => (
                          <div key={condition} className="flex justify-between text-sm">
                            <span>{condition}</span>
                            <span className="text-gray-600">{count} sold</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Listings */}
            {analysis.current && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🏪 Current Listings
                    <Badge variant="outline">{analysis.current.count} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Average Ask</p>
                        <p className="font-medium text-lg">{formatPrice(analysis.current.prices.average)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Median</p>
                        <p className="font-medium text-lg">{formatPrice(analysis.current.prices.median)}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-600">Range: {formatPrice(analysis.current.prices.min)} - {formatPrice(analysis.current.prices.max)}</p>
                    </div>

                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Best Deals Right Now</p>
                      <div className="space-y-2">
                        {analysis.current.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{formatPrice(item.price)}</span>
                              <Badge variant="secondary" className="text-xs">{item.condition}</Badge>
                            </div>
                            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.title}</p>
                            <p className="text-gray-500 text-xs">Seller: {item.seller}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Price History Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Price History & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>📊 Price Chart Coming Soon</p>
                  <p className="text-sm mt-1">Historical price trends and predictions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Integration Status</span>
              </div>
              <div className="mt-2 text-sm text-orange-600 space-y-1">
                <p>✅ Component ready for production</p>
                <p>🔄 eBay production credentials pending approval</p>
                <p>💳 Firecrawl credits needed for sold data</p>
                <p>📊 Real data will replace mock data once APIs are active</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FunkoPriceAnalyzer; 