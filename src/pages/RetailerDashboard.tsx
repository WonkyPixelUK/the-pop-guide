import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  DollarSign, 
  MessageSquare,
  Star,
  TrendingUp,
  Store,
  Settings,
  Upload,
  Search
} from 'lucide-react';
import { RetailerService } from '@/services/retailerService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Retailer, RetailerListing, CreateListingData } from '@/types/retailer';

const RetailerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [listings, setListings] = useState<RetailerListing[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<RetailerListing | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [retailerStatus, setRetailerStatus] = useState<{
    is_retailer?: boolean;
    retailer_subscription_status?: string;
    retailer_subscription_expires_at?: string;
  } | null>(null);

  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [newListing, setNewListing] = useState<Partial<CreateListingData>>({
    funko_pop_id: '',
    price: 0,
    condition: 'Mint',
    quantity_available: 1,
    description: '',
    how_to_buy: '',
    shipping_info: '',
    is_in_store_only: false,
    is_negotiable: false
  });

  useEffect(() => {
    if (user) {
      loadRetailerData();
    }
  }, [user]);

  const loadRetailerData = async () => {
    try {
      setLoading(true);
      
      // First check retailer status
      const status = await RetailerService.checkRetailerStatus(user!.id);
      setRetailerStatus(status);
      
      // If not a retailer or subscription expired/cancelled, show upgrade page
      if (!status.is_retailer || ['expired', 'cancelled', 'none'].includes(status.retailer_subscription_status || 'none')) {
        setLoading(false);
        return; // Don't redirect, show upgrade message
      }
      
      const retailerData = await RetailerService.getRetailerByUserId(user!.id);
      
      if (!retailerData) {
        // User is marked as retailer but no retailer profile exists
        // This is normal when database tables don't exist yet
        setLoading(false);
        return;
      }
      
      setRetailer(retailerData);
      
      // Load listings and stats
      const [listingsData, statsData] = await Promise.all([
        RetailerService.getRetailerListings(retailerData.id),
        RetailerService.getRetailerStats(retailerData.id)
      ]);
      
      setListings(listingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading retailer data:', error);
      // Don't show error toast for database issues, just show default state
      setRetailerStatus({
        is_retailer: false,
        retailer_subscription_status: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!retailer || !newListing.funko_pop_id || !newListing.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const listingData: CreateListingData = {
        retailer_id: retailer.id,
        ...newListing as CreateListingData
      };
      
      await RetailerService.createListing(listingData);
      
      toast({
        title: "Success",
        description: "Listing created successfully",
      });
      
      setIsCreateListingOpen(false);
      setNewListing({
        funko_pop_id: '',
        price: 0,
        condition: 'Mint',
        quantity_available: 1,
        description: '',
        how_to_buy: '',
        shipping_info: '',
        is_in_store_only: false,
        is_negotiable: false
      });
      
      loadRetailerData();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await RetailerService.deleteListing(listingId);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      loadRetailerData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleUpdateListingStatus = async (listingId: string, status: 'active' | 'sold' | 'inactive') => {
    try {
      await RetailerService.updateListing(listingId, { status });
      toast({
        title: "Success",
        description: "Listing status updated",
      });
      loadRetailerData();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'sold':
        return 'bg-blue-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.funko_pop_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user needs to upgrade or renew subscription
  if (!retailerStatus?.is_retailer || ['expired', 'cancelled', 'none'].includes(retailerStatus?.retailer_subscription_status || 'none')) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">
                {!retailerStatus?.is_retailer ? 'Become a Retailer' : 'Renew Your Subscription'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {!retailerStatus?.is_retailer 
                  ? 'Join our retailer program to start selling your Funko Pop collection and connect with collectors worldwide.'
                  : retailerStatus?.retailer_subscription_status === 'expired'
                  ? 'Your retailer subscription has expired. Renew now to continue accessing your retailer dashboard and listings.'
                  : 'Your retailer subscription is not active. Please subscribe to access retailer features.'
                }
              </p>
              
              {/* Development helper */}
              {user?.email === 'brains@popguide.co.uk' && (
                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-sm mb-3">
                    🔧 Development Mode: Run this in browser console to activate retailer features:
                  </p>
                  <code className="bg-gray-900 text-green-400 px-3 py-1 rounded text-xs">
                    setupRetailerAccount()
                  </code>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/retailers/signup'}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                >
                  {!retailerStatus?.is_retailer ? 'Become a Retailer' : 'Renew Subscription'}
                </Button>
                <Button
                  onClick={() => window.location.href = '/contact'}
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg"
                >
                  Contact Support
                </Button>
              </div>
              {retailerStatus?.retailer_subscription_expires_at && (
                <p className="text-sm text-gray-400 mt-6">
                  Subscription expired on: {new Date(retailerStatus.retailer_subscription_expires_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is marked as retailer but no retailer profile exists (development mode)
  if (retailerStatus?.is_retailer && !retailer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">
                🎉 Retailer Access Activated!
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Your account has been marked as a retailer. The full retailer system is being set up.
              </p>
              
              <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
                <h3 className="text-green-300 font-semibold mb-4">✅ What you have access to:</h3>
                <ul className="space-y-2 text-green-200">
                  <li>• Retailer tab in mobile navigation</li>
                  <li>• Access to this retailer dashboard</li>
                  <li>• POPGuide FOC subscription benefits</li>
                  <li>• Verified retailer badge</li>
                </ul>
                
                <h3 className="text-yellow-300 font-semibold mb-4 mt-6">🚧 Coming soon:</h3>
                <ul className="space-y-2 text-yellow-200">
                  <li>• Unlimited product listings</li>
                  <li>• Customer messaging system</li>
                  <li>• Sales analytics dashboard</li>
                  <li>• Direct purchase links</li>
                  <li>• Review and rating system</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/retailers/signup'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
                >
                  Learn More About Retailer Features
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {retailer?.business_name || 'Retailer'} Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Badge 
                variant={retailer?.status === 'approved' ? 'default' : 'secondary'}
                className={retailer?.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}
              >
                {retailer?.status === 'approved' ? 'Approved' : 'Pending Approval'}
              </Badge>
              <div className="flex items-center text-gray-400">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                <span>{retailer?.rating.toFixed(1)} ({retailer?.total_reviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href={`/retailer/${retailer?.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </a>
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Listings</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalListings || 0}</p>
                    </div>
                    <Package className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Listings</p>
                      <p className="text-2xl font-bold text-white">{stats?.activeListings || 0}</p>
                    </div>
                    <Store className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Average Price</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(stats?.averagePrice || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Messages</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalContacts || 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{listing.funko_pop_id}</p>
                        <p className="text-gray-400 text-sm">{listing.condition} • {formatPrice(listing.price)}</p>
                      </div>
                      <Badge className={getStatusColor(listing.status)}>
                        {listing.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {/* Listings Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <Dialog open={isCreateListingOpen} onOpenChange={setIsCreateListingOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="funko_pop_id">Funko Pop ID</Label>
                      <Input
                        id="funko_pop_id"
                        value={newListing.funko_pop_id}
                        onChange={(e) => setNewListing({...newListing, funko_pop_id: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="Enter Funko Pop ID"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (£)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newListing.price}
                          onChange={(e) => setNewListing({...newListing, price: parseFloat(e.target.value)})}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select value={newListing.condition} onValueChange={(value) => setNewListing({...newListing, condition: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mint">Mint</SelectItem>
                            <SelectItem value="Near Mint">Near Mint</SelectItem>
                            <SelectItem value="Very Fine">Very Fine</SelectItem>
                            <SelectItem value="Fine">Fine</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newListing.description}
                        onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="Describe the condition and any special details..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="how_to_buy">How to Buy</Label>
                      <Textarea
                        id="how_to_buy"
                        value={newListing.how_to_buy}
                        onChange={(e) => setNewListing({...newListing, how_to_buy: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="Instructions for customers on how to purchase..."
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateListingOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateListing}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        Create Listing
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Listings Grid */}
            <div className="grid gap-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{listing.funko_pop_id}</h3>
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 mb-2">{listing.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>Condition: {listing.condition}</span>
                          <span>Quantity: {listing.quantity_available}</span>
                          <span>Price: {formatPrice(listing.price)}</span>
                          <span>Listed: {new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        {listing.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateListingStatus(listing.id, 'sold')}
                            className="text-blue-400"
                          >
                            Mark Sold
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Customer Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Message system coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RetailerDashboard; 