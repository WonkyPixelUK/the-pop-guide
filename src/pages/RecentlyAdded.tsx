import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, List, Store, User, Calendar, Zap } from "lucide-react";
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';

const placeholderFeed = [
  {
    type: "pop",
    id: "p1",
    name: "Batman #01",
    image: "/lovable-uploads/batman.png",
    series: "DC Comics",
    created_at: "2024-07-10T12:00:00Z",
  },
  {
    type: "list",
    id: "l1",
    name: "Rich's SDCC 2024 Picks",
    user: "richc",
    created_at: "2024-07-09T15:00:00Z",
  },
  {
    type: "retailer",
    id: "r1",
    name: "PopStop EU",
    logo_url: "/lovable-uploads/retailer3.png",
    created_at: "2024-07-08T09:00:00Z",
  },
  {
    type: "pop",
    id: "p2",
    name: "Spider-Man #03",
    image: "/lovable-uploads/spiderman.png",
    series: "Marvel",
    created_at: "2024-07-07T18:00:00Z",
  },
];

const RecentlyAdded = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-2"><Zap className="w-8 h-8 text-orange-500" /> Recently Added</h1>
        <div className="space-y-6">
          {placeholderFeed.map(item => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 flex items-center gap-4">
                {item.type === "pop" && (
                  <>
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded bg-gray-900 border border-gray-700" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-lg flex items-center gap-2">
                        {item.name}
                        <Badge className="bg-blue-900/80 text-blue-200 text-xs font-semibold px-2 py-0.5 ml-2 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> New Pop
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">{item.series}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </>
                )}
                {item.type === "list" && (
                  <>
                    <List className="w-12 h-12 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-lg flex items-center gap-2">
                        {item.name}
                        <Badge className="bg-green-900/80 text-green-200 text-xs font-semibold px-2 py-0.5 ml-2 flex items-center gap-1">
                          <List className="w-3 h-3" /> New List
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-4 h-4" /> {item.user}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </>
                )}
                {item.type === "retailer" && (
                  <>
                    <img src={item.logo_url} alt={item.name} className="w-16 h-16 object-contain rounded bg-gray-900 border border-gray-700" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-lg flex items-center gap-2">
                        {item.name}
                        <Badge className="bg-purple-900/80 text-purple-200 text-xs font-semibold px-2 py-0.5 ml-2 flex items-center gap-1">
                          <Store className="w-3 h-3" /> New Retailer
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default RecentlyAdded; 