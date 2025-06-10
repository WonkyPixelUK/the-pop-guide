import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Package, 
  Star, 
  TrendingUp, 
  Users, 
  Camera, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  BarChart3,
  MessageSquare,
  MapPin,
  Globe,
  DollarSign
} from 'lucide-react';

interface InventoryItem {
  id: string;
  funko_pop_id: string;
  stock_quantity: number;
  price: number;
  condition: string;
  funko_pops?: {
    name: string;
    image_url: string;
    series: string;
    number: string;
  };
}

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer_name: string;
}

const RetailerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [retailerProfile, setRetailerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Check if user is a retailer
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkRetailerStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        
        const res = await fetch(`https://db.popguide.co.uk/functions/v1/retailer-manager?action=get`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (!data.has_profile) {
            toast({
              title: "Access Denied",
              description: "You need a retailer profile to access this dashboard.",
              variant: "destructive",
            });
            navigate('/profile-settings?tab=subscription');
            return;
          }
          setRetailerProfile(data.retailer_profile);
          await fetchInventory();
          await fetchReviews();
        } else {
          navigate('/profile-settings?tab=subscription');
        }
      } catch (error) {
        console.error('Error checking retailer status:', error);
        navigate('/profile-settings?tab=subscription');
      } finally {
        setLoading(false);
      }
    };

    checkRetailerStatus();
  }, [user]);

  const fetchInventory = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch(`https://db.popguide.co.uk/functions/v1/retailer-manager?action=get_inventory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch(`https://db.popguide.co.uk/functions/v1/retailer-manager?action=get_reviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleUpdateInventory = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch(`https://db.popguide.co.uk/functions/v1/retailer-manager?action=update_inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item_id: itemId, updates })
      });
      
      if (res.ok) {
        await fetchInventory();
        setEditingItem(null);
        toast({
          title: "Updated! ✅",
          description: "Inventory item updated successfully",
        });
      } else {
        throw new Error('Failed to update inventory');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  const calculateAnalytics = () => {
    const totalItems = inventory.reduce((sum, item) => sum + item.stock_quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock_quantity), 0);
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    return {
      totalItems,
      totalValue,
      avgRating,
      totalReviews: reviews.length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🏪 Retailer Dashboard</h1>
              <p className="text-gray-400">
                {retailerProfile?.business_name} • {retailerProfile?.retailer_tier} Plan
              </p>
            </div>
            <Button
              onClick={() => navigate('/retailers')}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Inventory</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Inventory Value</p>
                    <p className="text-2xl font-bold text-white">${analytics.totalValue.toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                    <p className="text-2xl font-bold text-white">{analytics.avgRating.toFixed(1)}</p>
            </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                  </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Reviews</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalReviews}</p>
            </div>
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Store },
              { key: 'inventory', label: 'Inventory', icon: Package },
              { key: 'reviews', label: 'Reviews', icon: Star },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'photos', label: 'Gallery', icon: Camera },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  variant={activeTab === tab.key ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.key 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Business Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{retailerProfile?.business_name}</p>
                        <p className="text-gray-400 text-sm">{retailerProfile?.business_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <p className="text-gray-300">{retailerProfile?.city}, {retailerProfile?.country}</p>
                    </div>
                    <p className="text-gray-300">{retailerProfile?.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-lg font-bold text-purple-400">
                          {retailerProfile?.is_verified ? '✓' : '⏳'}
                        </div>
                        <div className="text-xs text-gray-400">Verified</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-lg font-bold text-purple-400">
                          {retailerProfile?.is_featured ? '⭐' : '📍'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {retailerProfile?.is_featured ? 'Featured' : 'Listed'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Profile created</span>
                      </div>
                      {inventory.length > 0 && (
                        <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-300 text-sm">Added {inventory.length} inventory items</span>
                        </div>
                      )}
                      {reviews.length > 0 && (
                        <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-300 text-sm">Received {reviews.length} reviews</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Inventory Management</CardTitle>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {inventory.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Inventory Yet</h3>
                      <p className="text-gray-400 mb-4">Start adding Funko Pops to your inventory</p>
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                        Add Your First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inventory.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                          <img
                            src={item.funko_pops?.image_url || '/placeholder-funko.png'}
                            alt={item.funko_pops?.name}
                            className="w-16 h-16 object-contain rounded"
                          />
                        <div className="flex-1">
                            <h4 className="text-white font-medium">{item.funko_pops?.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {item.funko_pops?.series} #{item.funko_pops?.number}
                            </p>
                            <p className="text-gray-300 text-sm">Condition: {item.condition}</p>
                          </div>
                          
                          {editingItem === item.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue={item.stock_quantity}
                                className="w-20 bg-gray-700 border-gray-600 text-white"
                                placeholder="Qty"
                              />
                              <Input
                                type="number"
                                defaultValue={item.price}
                                className="w-24 bg-gray-700 border-gray-600 text-white"
                                placeholder="Price"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateInventory(item.id, { 
                                  stock_quantity: 5, // TODO: Get from form
                                  price: 15.99 // TODO: Get from form
                                })}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-white font-medium">Qty: {item.stock_quantity}</p>
                                <p className="text-green-400">${item.price}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(item.id)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
                      <p className="text-gray-400">Reviews from customers will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-white font-medium">{review.reviewer_name}</span>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Inventory Items</span>
                        <span className="text-white font-bold">{analytics.totalItems}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Inventory Value</span>
                        <span className="text-white font-bold">${analytics.totalValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Customer Rating</span>
                        <span className="text-white font-bold">{analytics.avgRating.toFixed(1)}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Reviews</span>
                        <span className="text-white font-bold">{analytics.totalReviews}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Growth Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-300">Analytics features coming soon for Premium & Enterprise retailers!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Photo Gallery Tab */}
            {activeTab === 'photos' && (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Photo Gallery</CardTitle>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Photos Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Upload photos of your store, events, and special collections
                    </p>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      Upload Your First Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default RetailerDashboard; 