
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Award, Target, DollarSign, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CollectionAnalyticsProps {
  userCollection: any[];
  funkoPops: any[];
}

const CollectionAnalytics = ({ userCollection, funkoPops }: CollectionAnalyticsProps) => {
  // Calculate analytics data with proper type safety
  const totalValue = userCollection.reduce((sum, item) => {
    const value = item.funko_pops?.estimated_value;
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
  
  const totalInvested = userCollection.reduce((sum, item) => {
    const price = item.purchase_price;
    return sum + (typeof price === 'number' ? price : 0);
  }, 0);
  
  const roi = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
  
  const seriesDistribution = userCollection.reduce((acc, item) => {
    const series = item.funko_pops?.series || 'Unknown';
    acc[series] = (acc[series] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(seriesDistribution)
    .map(([series, count]) => ({ name: series, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const colors = ['#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  // Mock value over time data
  const valueOverTime = [
    { month: 'Jan', value: totalValue * 0.7 },
    { month: 'Feb', value: totalValue * 0.8 },
    { month: 'Mar', value: totalValue * 0.85 },
    { month: 'Apr', value: totalValue * 0.9 },
    { month: 'May', value: totalValue * 0.95 },
    { month: 'Jun', value: totalValue },
  ];

  const rareItems = userCollection.filter(item => 
    item.funko_pops?.is_chase || item.funko_pops?.is_exclusive
  ).length;

  const averageValue = userCollection.length > 0 ? totalValue / userCollection.length : 0;

  const topSeriesName = Object.keys(seriesDistribution)[0] || 'N/A';
  const topSeriesCount = Object.values(seriesDistribution)[0] || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Collection Analytics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">ROI</p>
                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {roi.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rare Items</p>
                <p className="text-2xl font-bold text-white">{rareItems}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Value</p>
                <p className="text-2xl font-bold text-white">${averageValue.toFixed(2)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Collection Value Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={valueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Collection by Series</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Investment Insights */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Investment Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Best Performer</h4>
              <p className="text-gray-400">Chase Variants</p>
              <p className="text-green-500 font-bold">+45% avg</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Most Collected Series</h4>
              <p className="text-gray-400">{topSeriesName}</p>
              <p className="text-orange-500 font-bold">{topSeriesCount} items</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Completion Rate</h4>
              <p className="text-gray-400">Marvel Series</p>
              <p className="text-blue-500 font-bold">73%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionAnalytics;
