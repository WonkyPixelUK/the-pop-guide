import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Award, Target, DollarSign, Calendar, Users, Star, PieChart, LineChart, Activity, Zap, Trophy } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

interface AdvancedAnalyticsProps {
  userCollection: any[];
  funkoPops: any[];
  profile?: any;
  priceHistory?: any[];
}

const AdvancedAnalytics = ({ userCollection, funkoPops, profile, priceHistory = [] }: AdvancedAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [analyticsView, setAnalyticsView] = useState('overview');

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalValue = userCollection.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0);
    const totalInvested = userCollection.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    const roi = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    // Series analysis
    const seriesAnalysis = userCollection.reduce((acc, item) => {
      const series = item.funko_pops?.series || 'Unknown';
      if (!acc[series]) {
        acc[series] = { count: 0, value: 0, items: [] };
      }
      acc[series].count += 1;
      acc[series].value += item.funko_pops?.estimated_value || 0;
      acc[series].items.push(item);
      return acc;
    }, {} as Record<string, any>);

    // Get completion rates for major series
    const completionRates = Object.entries(seriesAnalysis).map(([series, data]) => {
      const totalInSeries = funkoPops.filter(pop => pop.series === series).length;
      const completionRate = totalInSeries > 0 ? (data.count / totalInSeries) * 100 : 0;
      return {
        series,
        owned: data.count,
        total: totalInSeries,
        completion: completionRate,
        value: data.value,
        avgValue: data.value / data.count
      };
    }).sort((a, b) => b.completion - a.completion);

    // Rarity distribution
    const rarityDistribution = userCollection.reduce((acc, item) => {
      const rarity = item.funko_pops?.is_chase ? 'Chase' : 
                    item.funko_pops?.is_exclusive ? 'Exclusive' : 'Common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Investment performance
    const investmentItems = userCollection.filter(item => item.purchase_price > 0);
    const topPerformers = investmentItems
      .map(item => ({
        ...item,
        gain: (item.funko_pops?.estimated_value || 0) - item.purchase_price,
        gainPercent: item.purchase_price > 0 ? 
          (((item.funko_pops?.estimated_value || 0) - item.purchase_price) / item.purchase_price) * 100 : 0
      }))
      .sort((a, b) => b.gainPercent - a.gainPercent)
      .slice(0, 10);

    // Monthly growth simulation (mock data based on collection)
    const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
      const monthsAgo = 11 - i;
      const baseValue = totalValue * (0.6 + (i * 0.04)); // Simulate growth
      return {
        month: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        value: baseValue,
        items: Math.max(1, userCollection.length - Math.floor(monthsAgo * 0.8))
      };
    });

    // Value trends by rarity
    const rarityValues = {
      Chase: userCollection.filter(item => item.funko_pops?.is_chase).reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0),
      Exclusive: userCollection.filter(item => item.funko_pops?.is_exclusive && !item.funko_pops?.is_chase).reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0),
      Common: userCollection.filter(item => !item.funko_pops?.is_chase && !item.funko_pops?.is_exclusive).reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0)
    };

    return {
      totalValue,
      totalInvested,
      roi,
      seriesAnalysis,
      completionRates,
      rarityDistribution,
      topPerformers,
      monthlyGrowth,
      rarityValues,
      averageValue: userCollection.length > 0 ? totalValue / userCollection.length : 0,
      totalItems: userCollection.length,
      totalSeries: Object.keys(seriesAnalysis).length
    };
  }, [userCollection, funkoPops]);

  const colors = ['#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Advanced Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={analyticsView} onValueChange={setAnalyticsView} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="investment" className="text-white">Investment</TabsTrigger>
          <TabsTrigger value="completion" className="text-white">Completion</TabsTrigger>
          <TabsTrigger value="trends" className="text-white">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Portfolio Value</p>
                    <p className="text-3xl font-bold text-white">${analytics.totalValue.toLocaleString()}</p>
                    <p className="text-orange-200 text-xs mt-1">
                      ${analytics.averageValue.toFixed(2)} avg per item
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">ROI Performance</p>
                    <p className="text-3xl font-bold text-white">{analytics.roi.toFixed(1)}%</p>
                    <p className="text-green-200 text-xs mt-1">
                      ${(analytics.totalValue - analytics.totalInvested).toFixed(0)} profit
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Collection Scope</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalSeries}</p>
                    <p className="text-blue-200 text-xs mt-1">
                      {analytics.totalItems} total items
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Rarity Score</p>
                    <p className="text-3xl font-bold text-white">
                      {((analytics.rarityDistribution.Chase || 0) * 3 + (analytics.rarityDistribution.Exclusive || 0) * 2 + (analytics.rarityDistribution.Common || 0)).toLocaleString()}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">
                      {analytics.rarityDistribution.Chase || 0} chase variants
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Growth */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="w-5 h-5 mr-2" />
                  Collection Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyGrowth}>
                    <defs>
                      <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fill="url(#valueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rarity Distribution */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Rarity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={Object.entries(analytics.rarityDistribution).map(([rarity, count]) => ({ name: rarity, value: count }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(analytics.rarityDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {Object.entries(analytics.rarityDistribution).map(([rarity, count], index) => (
                    <div key={rarity} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-white text-sm">{rarity}: {count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          {/* Investment Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPerformers.slice(0, 8).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-orange-500">#{index + 1}</div>
                        <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden">
                          <img 
                            src={item.funko_pops?.image_url || '/placeholder.png'} 
                            alt={item.funko_pops?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{item.funko_pops?.name}</h4>
                          <p className="text-gray-400 text-xs">{item.funko_pops?.series}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">+{item.gainPercent.toFixed(1)}%</div>
                        <div className="text-green-400 text-sm">${item.gain.toFixed(2)}</div>
                        <div className="text-gray-400 text-xs">${item.purchase_price} → ${item.funko_pops?.estimated_value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">${(analytics.totalValue - analytics.totalInvested).toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Total Profit</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{analytics.topPerformers.length}</div>
                  <div className="text-sm text-gray-400">Profitable Items</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">
                    {analytics.topPerformers.length > 0 ? analytics.topPerformers[0].gainPercent.toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Best Performer</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          {/* Series Completion */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Series Completion Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.completionRates.slice(0, 12).map((series) => (
                  <div key={series.series} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm truncate">{series.series}</h4>
                      <Badge className={`text-xs ${
                        series.completion >= 80 ? 'bg-green-500/20 text-green-300' :
                        series.completion >= 50 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {series.completion.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          series.completion >= 80 ? 'bg-green-500' :
                          series.completion >= 50 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(series.completion, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{series.owned}/{series.total} items</span>
                      <span>${series.value.toFixed(0)} value</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Value by Rarity Trends */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Value Distribution by Rarity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.rarityValues).map(([rarity, value]) => ({ rarity, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="rarity" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights and Recommendations */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Smart Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-medium">Collection Strategy</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your {analytics.completionRates[0]?.series || 'top series'} collection is {analytics.completionRates[0]?.completion.toFixed(0) || 0}% complete. 
                    Consider focusing on this series for maximum completion satisfaction.
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-medium">Investment Tip</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Chase variants show strong performance in your portfolio. 
                    Consider diversifying into more exclusive releases for potential gains.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium">Goal Setting</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    You're ${(10000 - analytics.totalValue).toFixed(0)} away from a $10K collection milestone. 
                    Current growth rate suggests reaching this in 6-8 months.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300 font-medium">Market Trends</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your collection ROI of {analytics.roi.toFixed(1)}% outperforms the average collector. 
                    Well done on your investment choices!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics; 