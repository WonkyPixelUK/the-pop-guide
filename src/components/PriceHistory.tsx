import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceHistoryData {
  id: string;
  title: string;
  price: number;
  condition: string;
  location: string;
  sold_date: string;
  created_at: string;
  marketplace_source: string;
}

interface PriceHistoryProps {
  funkoPopId: string;
  funkoPopName: string;
}

export default function PriceHistory({ funkoPopId, funkoPopName }: PriceHistoryProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<{
    overall: number;
    oneYear: number;
    threeYear: number;
    mintCondition: number;
    usedCondition: number;
  } | null>(null);

  useEffect(() => {
    if (funkoPopId) {
      loadPriceHistory();
    }
  }, [funkoPopId]);

  const loadPriceHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_prices')
        .select(`
          id,
          title,
          price,
          condition,
          location,
          sold_date,
          created_at,
          marketplace_sources(name)
        `)
        .eq('funko_pop_id', funkoPopId)
        .order('sold_date', { ascending: false, nullsLast: true })
        .limit(50);

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        marketplace_source: item.marketplace_sources?.name || 'Unknown'
      }));

      setPriceHistory(formattedData);
      calculateAverages(formattedData);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = (data: any[]) => {
    if (data.length === 0) return;

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());

    const allPrices = data.map(item => item.price);
    const oneYearPrices = data.filter(item => 
      item.sold_date && new Date(item.sold_date) >= oneYearAgo
    ).map(item => item.price);
    const threeYearPrices = data.filter(item => 
      item.sold_date && new Date(item.sold_date) >= threeYearsAgo
    ).map(item => item.price);
    const mintPrices = data.filter(item => 
      item.condition?.toLowerCase().includes('mint')
    ).map(item => item.price);
    const usedPrices = data.filter(item => 
      item.condition?.toLowerCase().includes('used')
    ).map(item => item.price);

    setAverages({
      overall: allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0,
      oneYear: oneYearPrices.length > 0 ? oneYearPrices.reduce((a, b) => a + b, 0) / oneYearPrices.length : 0,
      threeYear: threeYearPrices.length > 0 ? threeYearPrices.reduce((a, b) => a + b, 0) / threeYearPrices.length : 0,
      mintCondition: mintPrices.length > 0 ? mintPrices.reduce((a, b) => a + b, 0) / mintPrices.length : 0,
      usedCondition: usedPrices.length > 0 ? usedPrices.reduce((a, b) => a + b, 0) / usedPrices.length : 0,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConditionColor = (condition: string) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('mint')) return 'text-green-600 bg-green-50';
    if (cond.includes('near')) return 'text-blue-600 bg-blue-50';
    if (cond.includes('good')) return 'text-yellow-600 bg-yellow-50';
    if (cond.includes('used')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMarketplaceBrandColor = (source: string) => {
    const normalizedSource = source.toLowerCase();
    if (normalizedSource.includes('ebay')) {
      return 'bg-[#0064d2] text-white border-[#0064d2] hover:bg-[#0053b7]';
    }
    if (normalizedSource.includes('amazon')) {
      return 'bg-[#ff9900] text-black border-[#ff9900] hover:bg-[#e68900]';
    }
    if (normalizedSource.includes('mercari')) {
      return 'bg-[#ff4757] text-white border-[#ff4757] hover:bg-[#ff3742]';
    }
    if (normalizedSource.includes('whatnot')) {
      return 'bg-[#8b5cf6] text-white border-[#8b5cf6] hover:bg-[#7c3aed]';
    }
    if (normalizedSource.includes('funko')) {
      return 'bg-[#f59e0b] text-white border-[#f59e0b] hover:bg-[#d97706]';
    }
    // Default gray for unknown sources
    return 'border-gray-600 text-gray-400 hover:bg-gray-600';
  };

  const getPriceTrend = (currentPrice: number, averagePrice: number) => {
    if (currentPrice > averagePrice * 1.1) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (currentPrice < averagePrice * 0.9) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Value History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            Loading price history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Value History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priceHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No value history available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Historical Averages */}
            {averages && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {averages.overall > 0 && (
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Overall Average</div>
                    <div className="text-lg font-bold text-white">
                      {formatPrice(averages.overall)}
                    </div>
                  </div>
                )}
                {averages.oneYear > 0 && (
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Past Year</div>
                    <div className="text-lg font-bold text-blue-400">
                      {formatPrice(averages.oneYear)}
                    </div>
                  </div>
                )}
                {averages.mintCondition > 0 && (
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Mint Condition</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatPrice(averages.mintCondition)}
                    </div>
                  </div>
                )}
                {averages.usedCondition > 0 && (
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Used Condition</div>
                    <div className="text-lg font-bold text-orange-400">
                      {formatPrice(averages.usedCondition)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Individual Price History */}
            <div className="space-y-3">
              <h4 className="text-white font-medium mb-3">Recent Sales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priceHistory.slice(0, 12).map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-white">
                          {formatPrice(item.price)}
                        </div>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition || 'Unknown'}
                        </Badge>
                        {averages && getPriceTrend(item.price, averages.overall)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {item.location || 'UK'} • {formatDate(item.sold_date || item.created_at)}
                      </div>
                      {item.title && item.title !== funkoPopName && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {item.title}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <Badge variant="outline" className={getMarketplaceBrandColor(item.marketplace_source)}>
                        {item.marketplace_source}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {priceHistory.length > 12 && (
              <div className="text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View more price history ({priceHistory.length - 12} more sales)
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 