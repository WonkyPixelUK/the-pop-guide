import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Brain, AlertCircle, Star, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricePredictionProps {
  funkoPopId: string;
  funkoName?: string;
  currentPrice?: number;
}

interface PredictionData {
  funko_pop_id: string;
  funko_name: string;
  series: string;
  predicted_price: number;
  confidence_score: number;
  price_range: {
    min: number;
    max: number;
  };
  factors: {
    is_chase: number;
    is_exclusive: number;
    is_vaulted: number;
    condition: string;
    marketplace: string;
    days_since_release: number;
  };
  prediction_date: string;
  model_version: string;
}

interface PriceHistory {
  date: string;
  price: number;
  marketplace: string;
  condition: string;
}

const PricePrediction: React.FC<PricePredictionProps> = ({ 
  funkoPopId, 
  funkoName = "Unknown Funko", 
  currentPrice = 0 
}) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [condition, setCondition] = useState('mint');
  const [marketplace, setMarketplace] = useState('ebay');
  const [futureDays, setFutureDays] = useState(30);

  const API_BASE_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8000';

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funko_pop_id: funkoPopId,
          condition,
          marketplace,
          future_days: futureDays
        })
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${funkoPopId}?days=90`);
      
      if (response.ok) {
        const data = await response.json();
        setPriceHistory(data.historical_prices || []);
      }
    } catch (err) {
      console.error('Price history error:', err);
    }
  };

  useEffect(() => {
    if (funkoPopId) {
      fetchPriceHistory();
    }
  }, [funkoPopId]);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const getPriceTrend = () => {
    if (!prediction || !currentPrice) return null;
    
    const diff = prediction.predicted_price - currentPrice;
    const percentage = ((diff / currentPrice) * 100);
    
    return {
      direction: diff > 0 ? 'up' : 'down',
      amount: Math.abs(diff),
      percentage: Math.abs(percentage)
    };
  };

  const formatChartData = () => {
    if (!priceHistory.length) return [];
    
    const chartData = priceHistory.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      price: item.price
    }));

    // Add prediction point if available
    if (prediction) {
      const predictionDate = new Date();
      predictionDate.setDate(predictionDate.getDate() + futureDays);
      
      chartData.push({
        date: predictionDate.toLocaleDateString(),
        price: prediction.predicted_price
      });
    }

    return chartData;
  };

  const trend = getPriceTrend();

  return (
    <div className="space-y-6">
      {/* Prediction Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-500" />
            AI Price Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Condition
              </label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="near_mint">Near Mint</SelectItem>
                  <SelectItem value="very_fine">Very Fine</SelectItem>
                  <SelectItem value="fine">Fine</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Marketplace
              </label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="mercari">Mercari</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="funko_shop">Funko Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Future Days
              </label>
              <Select value={futureDays.toString()} onValueChange={(value) => setFutureDays(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={fetchPrediction} 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Price Prediction
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Prediction */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Price Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  ${prediction.predicted_price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  Predicted price in {futureDays} days
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Confidence:</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getConfidenceColor(prediction.confidence_score)} border-current`}
                    >
                      {getConfidenceLabel(prediction.confidence_score)}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {(prediction.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Price Range:</span>
                  <span className="text-white">
                    ${prediction.price_range.min.toFixed(2)} - ${prediction.price_range.max.toFixed(2)}
                  </span>
                </div>

                {trend && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Trend:</span>
                    <div className="flex items-center gap-1">
                      {trend.direction === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {trend.direction === 'up' ? '+' : '-'}${trend.amount.toFixed(2)} ({trend.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Factors</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {prediction.factors.is_chase === 1 && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      <Star className="w-3 h-3 mr-1" />
                      Chase
                    </Badge>
                  )}
                  {prediction.factors.is_exclusive === 1 && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      Exclusive
                    </Badge>
                  )}
                  {prediction.factors.is_vaulted === 1 && (
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      Vaulted
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-gray-400 border-gray-400 capitalize">
                    {prediction.factors.condition}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price History Chart */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Price History & Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              {priceHistory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#F3F4F6'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        dot={{ fill: '#F97316', r: 4 }}
                        activeDot={{ r: 6, fill: '#F97316' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No price history available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model Info */}
      {prediction && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Model Version: {prediction.model_version}</span>
              <span>Generated: {new Date(prediction.prediction_date).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricePrediction; 