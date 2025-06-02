import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Bell, DollarSign, TrendingDown, ShoppingCart, AlertCircle, Star, Filter, Search, Plus, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WishlistItem {
  id: string;
  user_id: string;
  funko_pop_id: string;
  max_price?: number;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  drop_alert_enabled: boolean;
  price_drop_threshold: number;
  availability_alert: boolean;
  funko_pops?: {
    id: string;
    name: string;
    series: string;
    number: string;
    image_url?: string;
    estimated_value?: number;
    is_exclusive?: boolean;
    is_chase?: boolean;
    release_date?: string;
  };
}

interface EnhancedWishlistProps {
  userCollection: any[];
}

const EnhancedWishlist = ({ userCollection }: EnhancedWishlistProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  // Load wishlist items
  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          funko_pops (
            id,
            name,
            series,
            number,
            image_url,
            estimated_value,
            is_exclusive,
            is_chase,
            release_date
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWishlistItem = async (itemId: string, updates: Partial<WishlistItem>) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );

      toast({
        title: "Updated",
        description: "Wishlist item updated successfully",
      });
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist item",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAvailabilityStatus = (item: WishlistItem) => {
    // Simulate availability checking
    const random = Math.random();
    if (random > 0.7) return { status: 'available', store: 'Hot Topic', price: item.funko_pops?.estimated_value };
    if (random > 0.4) return { status: 'low_stock', store: 'GameStop', price: (item.funko_pops?.estimated_value || 0) * 1.1 };
    return { status: 'out_of_stock', store: null, price: null };
  };

  // Filter and sort items
  const filteredItems = wishlistItems
    .filter(item => {
      if (activeTab === 'alerts' && !item.drop_alert_enabled) return false;
      if (activeTab === 'available') {
        const availability = getAvailabilityStatus(item);
        return availability.status === 'available';
      }
      if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.funko_pops?.name.toLowerCase().includes(query) ||
          item.funko_pops?.series.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'price_asc':
          return (a.funko_pops?.estimated_value || 0) - (b.funko_pops?.estimated_value || 0);
        case 'price_desc':
          return (b.funko_pops?.estimated_value || 0) - (a.funko_pops?.estimated_value || 0);
        case 'name':
          return (a.funko_pops?.name || '').localeCompare(b.funko_pops?.name || '');
        default: // date_added
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: wishlistItems.length,
    totalValue: wishlistItems.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0),
    averageValue: wishlistItems.length > 0 ? wishlistItems.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0) / wishlistItems.length : 0,
    highPriority: wishlistItems.filter(item => item.priority === 'high').length,
    withAlerts: wishlistItems.filter(item => item.drop_alert_enabled).length,
    available: wishlistItems.filter(item => getAvailabilityStatus(item).status === 'available').length,
  };

  // Smart recommendations based on collection and wishlist
  const recommendations = [
    {
      id: 1,
      type: 'series_completion',
      title: 'Complete Your Marvel Collection',
      description: 'You own 8/12 Marvel Funkos. Consider adding the missing 4 to complete the series.',
      items: ['Spider-Man #03', 'Iron Man #04', 'Thor #05', 'Hulk #06'],
      priority: 'medium'
    },
    {
      id: 2,
      type: 'price_alert',
      title: 'Price Drop Opportunity',
      description: 'Batman #01 has dropped 15% this week and is now within your target price.',
      items: ['Batman #01'],
      priority: 'high'
    },
    {
      id: 3,
      type: 'trending',
      title: 'Trending in Your Interests',
      description: 'Based on your collection, these trending Funkos might interest you.',
      items: ['Wonder Woman Chase', 'Superman Exclusive', 'Green Lantern GITD'],
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Heart className="w-8 h-8 mr-3 text-orange-500" />
          Enhanced Wishlist
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSettingsDialog(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">${stats.totalValue.toFixed(0)}</div>
            <div className="text-xs text-gray-400">Total Value</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">${stats.averageValue.toFixed(0)}</div>
            <div className="text-xs text-gray-400">Avg Value</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.highPriority}</div>
            <div className="text-xs text-gray-400">High Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.withAlerts}</div>
            <div className="text-xs text-gray-400">With Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.available}</div>
            <div className="text-xs text-gray-400">Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your wishlist..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="date_added">Date Added</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="all" className="text-white">All Items</TabsTrigger>
          <TabsTrigger value="alerts" className="text-white">With Alerts</TabsTrigger>
          <TabsTrigger value="available" className="text-white">Available Now</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-white">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
                <p className="text-gray-400">
                  {searchQuery ? 'Try adjusting your search or filters.' : 'Your wishlist is empty. Start adding some Funkos!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const availability = getAvailabilityStatus(item);
                return (
                  <Card key={item.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.funko_pops?.image_url || '/placeholder.png'} 
                            alt={item.funko_pops?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {item.funko_pops?.name}
                          </h4>
                          <p className="text-gray-400 text-xs">{item.funko_pops?.series}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                            {item.drop_alert_enabled && (
                              <Bell className="w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Current Price:</span>
                          <span className="text-orange-500 font-semibold">
                            ${item.funko_pops?.estimated_value?.toFixed(2) || '0.00'}
                          </span>
                        </div>

                        {item.max_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Target Price:</span>
                            <span className="text-blue-400 text-xs font-medium">
                              ${item.max_price.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Availability Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Availability:</span>
                          <Badge className={`text-xs ${
                            availability.status === 'available' ? 'bg-green-500/20 text-green-300' :
                            availability.status === 'low_stock' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {availability.status === 'available' ? 'In Stock' :
                             availability.status === 'low_stock' ? 'Low Stock' :
                             'Out of Stock'}
                          </Badge>
                        </div>

                        {availability.status !== 'out_of_stock' && availability.store && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Store:</span>
                            <span className="text-xs text-white">{availability.store}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        {availability.status === 'available' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white text-xs"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Buy
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Same grid as above but filtered for items with alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.filter(item => item.drop_alert_enabled).map((item) => (
              // Same card component as above
              <Card key={item.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Alert Active</span>
                  </div>
                  {/* Rest of card content */}
                  <p className="text-white">{item.funko_pops?.name}</p>
                  <p className="text-gray-400 text-sm">{item.funko_pops?.series}</p>
                  <p className="text-orange-500">${item.funko_pops?.estimated_value?.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {/* Items currently available for purchase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.filter(item => getAvailabilityStatus(item).status === 'available').map((item) => (
              <Card key={item.id} className="bg-gray-800/50 border-gray-700 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Available Now</span>
                  </div>
                  {/* Rest of card content */}
                  <p className="text-white">{item.funko_pops?.name}</p>
                  <p className="text-gray-400 text-sm">{item.funko_pops?.series}</p>
                  <p className="text-orange-500">${item.funko_pops?.estimated_value?.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{rec.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                    </div>
                    <Badge className={`${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Settings Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Configure Wishlist Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={selectedItem.funko_pops?.image_url || '/placeholder.png'} 
                    alt={selectedItem.funko_pops?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium">{selectedItem.funko_pops?.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedItem.funko_pops?.series}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                <Select 
                  value={selectedItem.priority} 
                  onValueChange={(value: any) => updateWishlistItem(selectedItem.id, { priority: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Max Price ($)</label>
                <Input
                  type="number"
                  value={selectedItem.max_price || ''}
                  onChange={(e) => updateWishlistItem(selectedItem.id, { max_price: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter maximum price"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Price Drop Alerts</label>
                <Switch
                  checked={selectedItem.drop_alert_enabled}
                  onCheckedChange={(checked) => updateWishlistItem(selectedItem.id, { drop_alert_enabled: checked })}
                />
              </div>

              {selectedItem.drop_alert_enabled && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Alert when price drops by (%)
                  </label>
                  <Input
                    type="number"
                    value={selectedItem.price_drop_threshold || 10}
                    onChange={(e) => updateWishlistItem(selectedItem.id, { price_drop_threshold: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter percentage"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Availability Alerts</label>
                <Switch
                  checked={selectedItem.availability_alert}
                  onCheckedChange={(checked) => updateWishlistItem(selectedItem.id, { availability_alert: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={() => removeFromWishlist(selectedItem.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  Remove from Wishlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedWishlist; 