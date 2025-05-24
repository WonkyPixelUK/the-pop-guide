
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Star, Target } from 'lucide-react';

interface CollectionItem {
  id: string;
  name: string;
  series: string;
  number: string;
  image: string;
  value: number;
  rarity: string;
  owned: boolean;
  condition?: string;
  purchase_price?: number;
}

interface CollectionInsightsProps {
  items: CollectionItem[];
  displayName: string;
}

const CollectionInsights = ({ items, displayName }: CollectionInsightsProps) => {
  // Calculate insights
  const mostValuableItem = items.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current, items[0]
  );

  const seriesCount = items.reduce((acc, item) => {
    acc[item.series] = (acc[item.series] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteSeries = Object.entries(seriesCount).reduce((prev, current) => 
    prev[1] > current[1] ? prev : current, ['', 0]
  );

  const chaseItems = items.filter(item => item.rarity === 'Chase');
  const exclusiveItems = items.filter(item => item.rarity === 'Exclusive');

  const averageValue = items.reduce((sum, item) => sum + item.value, 0) / items.length;

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'chase':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'exclusive':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Collection Highlights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Valuable Item */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Crown Jewel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={mostValuableItem.image} 
                  alt={mostValuableItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm truncate">
                  {mostValuableItem.name}
                </h4>
                <p className="text-gray-400 text-xs">
                  {mostValuableItem.series} #{mostValuableItem.number}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={`text-xs ${getRarityColor(mostValuableItem.rarity)}`}>
                    {mostValuableItem.rarity}
                  </Badge>
                  <span className="text-orange-500 font-bold">
                    ${mostValuableItem.value.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Series */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" />
              Favorite Series
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h4 className="text-white font-semibold text-lg mb-2">
                {favoriteSeries[0]}
              </h4>
              <p className="text-gray-400 text-sm mb-3">
                {favoriteSeries[1]} item{favoriteSeries[1] !== 1 ? 's' : ''} collected
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((favoriteSeries[1] / items.length) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((favoriteSeries[1] / items.length) * 100).toFixed(1)}% of collection
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Collection Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Collection Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Average Value</span>
                <span className="text-white font-semibold">
                  ${averageValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Chase Variants</span>
                <span className="text-yellow-400 font-semibold">
                  {chaseItems.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Exclusives</span>
                <span className="text-purple-400 font-semibold">
                  {exclusiveItems.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Series Count</span>
                <span className="text-orange-400 font-semibold">
                  {Object.keys(seriesCount).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rarity Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Rarity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chaseItems.length > 0 && (
                <div className="flex justify-between items-center">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                    Chase
                  </Badge>
                  <span className="text-white font-semibold">
                    {chaseItems.length} ({((chaseItems.length / items.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              {exclusiveItems.length > 0 && (
                <div className="flex justify-between items-center">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    Exclusive
                  </Badge>
                  <span className="text-white font-semibold">
                    {exclusiveItems.length} ({((exclusiveItems.length / items.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                  Common
                </Badge>
                <span className="text-white font-semibold">
                  {items.length - chaseItems.length - exclusiveItems.length} ({(((items.length - chaseItems.length - exclusiveItems.length) / items.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      {items.length >= 3 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Recent Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="text-center">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden mx-auto mb-2">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h5 className="text-white text-xs font-medium truncate">
                    {item.name}
                  </h5>
                  <p className="text-gray-400 text-xs truncate">
                    {item.series}
                  </p>
                  <p className="text-orange-500 text-xs font-semibold">
                    ${item.value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollectionInsights;
