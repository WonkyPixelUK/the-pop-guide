import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, LineChart, Calendar, DollarSign, Percent, Clock } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, Legend } from 'recharts';

interface PricePoint {
  date: string;
  price: number;
  source: string;
  condition?: string;
  volume?: number;
}

interface PriceHistoryData {
  funko_pop_id: string;
  history: PricePoint[];
  current_price: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  highest_price: number;
  lowest_price: number;
  average_price: number;
  volatility: number;
}

interface PriceHistoryProps {
  funkoPopId?: string;
  funkoPop?: {
    id: string;
    name: string;
    series: string;
    number: string;
    image_url?: string;
    estimated_value?: number;
  };
  className?: string;
}

const PriceHistory = ({ funkoPopId, funkoPop, className }: PriceHistoryProps) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('line');
  const [dataSource, setDataSource] = useState('all');
  const [priceData, setPriceData] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');

  // Generate mock price history data
  useEffect(() => {
    if (funkoPopId || funkoPop?.id) {
      generateMockData();
    }
  }, [funkoPopId, funkoPop?.id, timeRange]);

  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const basePrice = funkoPop?.estimated_value || 15;
    
    const history: PricePoint[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      // Simulate price volatility
      const volatility = 0.1; // 10% volatility
      const trend = Math.sin(i / days * Math.PI * 2) * 0.2; // Seasonal trend
      const randomFactor = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + trend + randomFactor);
      
      const sources = ['eBay', 'Mercari', 'WhatNot', 'PopPriceGuide', 'Funko Europe'];
      const conditions = ['mint', 'near-mint', 'good', 'damaged'];
      
      return {
        date: date.toISOString().split('T')[0],
        price: Math.max(5, Math.round(price * 100) / 100),
        source: sources[i % sources.length],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        volume: Math.floor(Math.random() * 50) + 10
      };
    });

    // Calculate analytics
    const prices = history.map(h => h.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2] || currentPrice;
    const weekAgoPrice = prices[Math.max(0, prices.length - 7)] || currentPrice;
    const monthAgoPrice = prices[Math.max(0, prices.length - 30)] || currentPrice;
    
    const priceData: PriceHistoryData = {
      funko_pop_id: funkoPopId || funkoPop?.id || '',
      history,
      current_price: currentPrice,
      price_change_24h: ((currentPrice - previousPrice) / previousPrice) * 100,
      price_change_7d: ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100,
      price_change_30d: ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100,
      highest_price: Math.max(...prices),
      lowest_price: Math.min(...prices),
      average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      volatility: Math.sqrt(prices.reduce((sum, price, _, arr) => {
        const mean = arr.reduce((s, p) => s + p, 0) / arr.length;
        return sum + Math.pow(price - mean, 2);
      }, 0) / prices.length) / prices.reduce((sum, price) => sum + price, 0) * prices.length * 100
    };

    setPriceData(priceData);
    setLoading(false);
  };

  const chartData = useMemo(() => {
    if (!priceData) return [];
    
    return priceData.history
      .filter(point => dataSource === 'all' || point.source === dataSource)
      .map(point => ({
        ...point,
        formattedDate: new Date(point.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        ma7: 0, // Moving average placeholder
        ma30: 0
      }));
  }, [priceData, dataSource]);

  // Calculate moving averages
  const enhancedChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    return chartData.map((point, index) => {
      // 7-day moving average
      const start7 = Math.max(0, index - 6);
      const ma7 = chartData.slice(start7, index + 1)
        .reduce((sum, p) => sum + p.price, 0) / (index - start7 + 1);
      
      // 30-day moving average  
      const start30 = Math.max(0, index - 29);
      const ma30 = chartData.slice(start30, index + 1)
        .reduce((sum, p) => sum + p.price, 0) / (index - start30 + 1);
      
      return {
        ...point,
        ma7: Number(ma7.toFixed(2)),
        ma30: Number(ma30.toFixed(2))
      };
    });
  }, [chartData]);

  const priceStats = useMemo(() => {
    if (!priceData) return [];
    
    return [
      {
        label: '24h Change',
        value: `${priceData.price_change_24h >= 0 ? '+' : ''}${priceData.price_change_24h.toFixed(2)}%`,
        trend: priceData.price_change_24h >= 0 ? 'up' : 'down',
        icon: priceData.price_change_24h >= 0 ? TrendingUp : TrendingDown
      },
      {
        label: '7d Change',
        value: `${priceData.price_change_7d >= 0 ? '+' : ''}${priceData.price_change_7d.toFixed(2)}%`,
        trend: priceData.price_change_7d >= 0 ? 'up' : 'down',
        icon: priceData.price_change_7d >= 0 ? TrendingUp : TrendingDown
      },
      {
        label: '30d Change',
        value: `${priceData.price_change_30d >= 0 ? '+' : ''}${priceData.price_change_30d.toFixed(2)}%`,
        trend: priceData.price_change_30d >= 0 ? 'up' : 'down',
        icon: priceData.price_change_30d >= 0 ? TrendingUp : TrendingDown
      },
      {
        label: 'Volatility',
        value: `${priceData.volatility.toFixed(1)}%`,
        trend: priceData.volatility > 20 ? 'down' : priceData.volatility > 10 ? 'neutral' : 'up',
        icon: BarChart3
      }
    ];
  }, [priceData]);

  if (loading) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Price Data Available</h3>
          <p className="text-gray-400 text-sm">Price history is not available for this item yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Price History
            {funkoPop && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                - {funkoPop.name}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
                <SelectItem value="1y">1y</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="eBay">eBay</SelectItem>
                <SelectItem value="Mercari">Mercari</SelectItem>
                <SelectItem value="WhatNot">WhatNot</SelectItem>
                <SelectItem value="PopPriceGuide">PPG</SelectItem>
                <SelectItem value="Funko Europe">Funko Europe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700 mb-6">
            <TabsTrigger value="chart" className="text-white">Price Chart</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
            <TabsTrigger value="data" className="text-white">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            {/* Current Price and Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    ${priceData.current_price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Current Price</div>
                </CardContent>
              </Card>
              {priceStats.slice(0, 3).map((stat, index) => (
                <Card key={index} className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <div className={`text-lg font-bold ${
                      stat.trend === 'up' ? 'text-green-400' : 
                      stat.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Price Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'line' ? (
                  <LineChart data={enhancedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
                        if (name === 'ma7') return [`$${value.toFixed(2)}`, '7d MA'];
                        if (name === 'ma30') return [`$${value.toFixed(2)}`, '30d MA'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                    />
                    {enhancedChartData.length > 7 && (
                      <Line 
                        type="monotone" 
                        dataKey="ma7" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                    {enhancedChartData.length > 30 && (
                      <Line 
                        type="monotone" 
                        dataKey="ma30" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        strokeDasharray="10 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                ) : (
                  <AreaChart data={enhancedChartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Chart Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewType === 'line' ? 'default' : 'outline'}
                  onClick={() => setViewType('line')}
                  className={viewType === 'line' ? 'bg-orange-500' : 'border-gray-600 text-gray-300'}
                >
                  <LineChart className="w-4 h-4 mr-1" />
                  Line
                </Button>
                <Button
                  size="sm"
                  variant={viewType === 'area' ? 'default' : 'outline'}
                  onClick={() => setViewType('area')}
                  className={viewType === 'area' ? 'bg-orange-500' : 'border-gray-600 text-gray-300'}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Area
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        ${priceData.highest_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">All-Time High</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-red-400">
                        ${priceData.lowest_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">All-Time Low</div>
                    </div>
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        ${priceData.average_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Average Price</div>
                    </div>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-bold ${
                        priceData.volatility > 20 ? 'text-red-400' : 
                        priceData.volatility > 10 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {priceData.volatility.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Volatility</div>
                    </div>
                    <Percent className="w-5 h-5 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Distribution by Source */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Price by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['eBay', 'Mercari', 'WhatNot', 'PopPriceGuide', 'Funko Europe'].map(source => {
                    const sourceData = priceData.history.filter(h => h.source === source);
                    const avgPrice = sourceData.length > 0 ? 
                      sourceData.reduce((sum, h) => sum + h.price, 0) / sourceData.length : 0;
                    const count = sourceData.length;
                    
                    return (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-600/50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {source}
                          </Badge>
                          <span className="text-gray-300">{count} data points</span>
                        </div>
                        <div className="text-orange-400 font-medium">
                          ${avgPrice.toFixed(2)} avg
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2">Price Trend Analysis</h4>
                    <p className="text-gray-300 text-sm">
                      {priceData.price_change_30d > 10 ? 
                        'Strong upward trend over the past month. Consider holding or selling.' :
                        priceData.price_change_30d > 0 ?
                        'Gradual price appreciation. Good long-term investment potential.' :
                        priceData.price_change_30d > -10 ?
                        'Price has been relatively stable with minor fluctuations.' :
                        'Significant price decline. May present a buying opportunity.'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="text-green-300 font-medium mb-2">Volatility Assessment</h4>
                    <p className="text-gray-300 text-sm">
                      {priceData.volatility > 20 ?
                        'High volatility detected. Price swings are significant - exercise caution.' :
                        priceData.volatility > 10 ?
                        'Moderate volatility. Normal price fluctuations for collectibles.' :
                        'Low volatility. Price has been relatively stable.'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="text-purple-300 font-medium mb-2">Value Assessment</h4>
                    <p className="text-gray-300 text-sm">
                      Current price is {priceData.current_price > priceData.average_price ? 'above' : 'below'} the historical average of ${priceData.average_price.toFixed(2)}. 
                      {priceData.current_price > priceData.average_price * 1.2 ? 
                        ' Consider waiting for a dip before buying.' :
                        priceData.current_price < priceData.average_price * 0.8 ?
                        ' Potentially undervalued - good buying opportunity.' :
                        ' Fair value range based on historical data.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Raw Price Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left text-gray-300 p-2">Date</th>
                        <th className="text-left text-gray-300 p-2">Price</th>
                        <th className="text-left text-gray-300 p-2">Source</th>
                        <th className="text-left text-gray-300 p-2">Condition</th>
                        <th className="text-left text-gray-300 p-2">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enhancedChartData.slice(-20).reverse().map((point, index) => (
                        <tr key={index} className="border-b border-gray-700/50">
                          <td className="text-gray-300 p-2 text-sm">{point.date}</td>
                          <td className="text-orange-400 p-2 font-medium">${point.price.toFixed(2)}</td>
                          <td className="text-gray-300 p-2 text-sm">{point.source}</td>
                          <td className="text-gray-300 p-2 text-sm">
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                              {point.condition}
                            </Badge>
                          </td>
                          <td className="text-gray-400 p-2 text-sm">{point.volume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-xs text-gray-400 mt-4">
                  Showing last 20 data points • {priceData.history.length} total points available
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceHistory; 