
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, TrendingUp, Info } from 'lucide-react';

const StickerEducation = () => {
  const stickerTypes = [
    {
      type: 'SDCC',
      name: 'San Diego Comic-Con',
      multiplier: '3.5x',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Highly coveted convention exclusive with limited availability'
    },
    {
      type: 'NYCC',
      name: 'New York Comic-Con',
      multiplier: '3.0x',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Popular East Coast convention exclusive'
    },
    {
      type: 'CHASE',
      name: 'Chase Variant',
      multiplier: '4.0x',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Rare 1-in-6 variants with special features'
    },
    {
      type: 'FUNKO SHOP',
      name: 'Funko Shop Exclusive',
      multiplier: '2.5x',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Limited releases from the official Funko store'
    },
    {
      type: 'HOT TOPIC',
      name: 'Hot Topic Exclusive',
      multiplier: '1.8x',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      description: 'Retailer exclusive with wider availability'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Understanding Funko Pop Stickers & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Why Stickers Matter
              </h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• <strong>Exclusivity:</strong> Limited production runs at specific events or stores</li>
                <li>• <strong>Authenticity:</strong> Proves the Pop is genuine and from the exclusive release</li>
                <li>• <strong>Collectibility:</strong> Stickers significantly increase desirability and value</li>
                <li>• <strong>Condition:</strong> Sticker condition affects pricing (mint > good > damaged)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Our Pricing Algorithm
              </h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• <strong>Base Price:</strong> Calculated from common/unstickered versions</li>
                <li>• <strong>Sticker Multiplier:</strong> Applied based on exclusivity level</li>
                <li>• <strong>Market Data:</strong> Real eBay sold listings with sticker detection</li>
                <li>• <strong>Condition Factors:</strong> Sticker condition affects final valuation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sticker Value Multipliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stickerTypes.map((sticker) => (
              <div key={sticker.type} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={sticker.color}>
                    <Star className="w-3 h-3 mr-1" />
                    {sticker.type}
                  </Badge>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {sticker.multiplier}
                  </Badge>
                </div>
                <h5 className="font-medium">{sticker.name}</h5>
                <p className="text-sm text-gray-600">{sticker.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example: Batman #01 Price Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Badge variant="outline" className="mb-2">Common</Badge>
              <div className="text-2xl font-bold text-gray-600">£15</div>
              <p className="text-sm text-gray-500">Regular retail release</p>
            </div>
            <div className="p-4 border rounded-lg text-center bg-blue-50">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">
                <Star className="w-3 h-3 mr-1" />
                NYCC
              </Badge>
              <div className="text-2xl font-bold text-blue-600">£45</div>
              <p className="text-sm text-blue-500">3.0x multiplier applied</p>
            </div>
            <div className="p-4 border rounded-lg text-center bg-red-50">
              <Badge className="bg-red-100 text-red-800 border-red-200 mb-2">
                <Star className="w-3 h-3 mr-1" />
                SDCC
              </Badge>
              <div className="text-2xl font-bold text-red-600">£52.50</div>
              <p className="text-sm text-red-500">3.5x multiplier applied</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StickerEducation;
