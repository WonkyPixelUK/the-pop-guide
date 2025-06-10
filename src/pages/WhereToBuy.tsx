import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Store, 
  Package,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  Clock,
  Truck,
  Shield,
  Heart
} from 'lucide-react';
import { RetailerService } from '@/services/retailerService';
import { useToast } from '@/hooks/use-toast';
import type { RetailerListing } from '@/types/retailer';

const WhereToBuy = () => {
  const { popId } = useParams<{ popId: string }>();
  const [listings, setListings] = useState<RetailerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pop, setPop] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (popId) {
      loadListings();
      loadPopDetails();
    }
  }, [popId]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await RetailerService.getListingsForPop(popId!);
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast({
        title: "Error",
        description: "Failed to load retailer listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPopDetails = async () => {
    // Load Pop details - you'll need to implement this based on your funko_pops API
    // For now, just placeholder
    setPop({ id: popId, name: 'Loading...', series: '', number: '' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const getBusinessTypeIcon = (businessType: string) => {
    switch (businessType) {
      case 'physical_store':
        return <Store className="w-4 h-4" />;
      case 'online_only':
        return <Globe className="w-4 h-4" />;
      case 'both':
        return <Package className="w-4 h-4" />;
      default:
        return <Store className="w-4 h-4" />;
    }
  };

  const getBusinessTypeLabel = (businessType: string) => {
    switch (businessType) {
      case 'physical_store':
        return 'Physical Store';
      case 'online_only':
        return 'Online Only';
      case 'both':
        return 'Online & Store';
      default:
        return 'Store';
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 text-gray-400 hover:text-white">
            <Link to={`/pop/${popId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pop Details
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Where to Buy: {pop?.name}
          </h1>
          <p className="text-gray-400">
            {pop?.series} {pop?.number && `#${pop.number}`}
          </p>
          
          {listings.length > 0 && (
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                {listings.length} retailer{listings.length !== 1 ? 's' : ''} available
              </Badge>
              <span className="text-gray-400">
                Prices from {formatPrice(Math.min(...listings.map(l => l.price)))}
              </span>
            </div>
          )}
        </div>

        {/* No Listings Message */}
        {listings.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Retailers Available
              </h3>
              <p className="text-gray-400 mb-6">
                This Pop is not currently listed by any retailers in our marketplace.
              </p>
              <div className="space-y-2">
                <Button asChild>
                  <Link to="/retailers">
                    Browse All Retailers
                  </Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Are you a retailer? <Link to="/become-retailer" className="text-orange-400 hover:text-orange-300">Join our marketplace</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listings Grid */}
        <div className="grid gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Retailer Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {listing.retailer?.business_name}
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          {renderStarRating(listing.retailer?.rating || 5.0)}
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center text-gray-400">
                            {getBusinessTypeIcon(listing.retailer?.business_type || 'online_only')}
                            <span className="ml-1 text-sm">
                              {getBusinessTypeLabel(listing.retailer?.business_type || 'online_only')}
                            </span>
                          </div>
                        </div>
                        {listing.retailer?.city && (
                          <div className="flex items-center text-gray-400 mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {listing.retailer.city}, {listing.retailer.country}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {formatPrice(listing.price)}
                        </div>
                        {listing.is_negotiable && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                            Negotiable
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <p className="text-gray-300 mb-4">{listing.description}</p>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-gray-400 text-sm">Condition</span>
                        <p className="text-white font-medium">{listing.condition}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Quantity</span>
                        <p className="text-white font-medium">{listing.quantity_available}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Availability</span>
                        <p className="text-white font-medium">
                          {listing.is_in_store_only ? 'In-Store Only' : 'Available'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Listed</span>
                        <p className="text-white font-medium">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* How to Buy */}
                    {listing.how_to_buy && (
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          How to Buy
                        </h4>
                        <p className="text-gray-300 text-sm">{listing.how_to_buy}</p>
                      </div>
                    )}

                    {/* Shipping Info */}
                    {listing.shipping_info && (
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Shipping Information
                        </h4>
                        <p className="text-gray-300 text-sm">{listing.shipping_info}</p>
                      </div>
                    )}
                  </div>

                  {/* Custom Images */}
                  {listing.custom_images && listing.custom_images.length > 0 && (
                    <div className="lg:w-48">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {listing.custom_images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${listing.retailer?.business_name} photo ${index + 1}`}
                            className="w-full h-24 lg:h-32 object-cover rounded-lg border border-gray-600"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4 bg-gray-700" />

                {/* Contact Options */}
                <div className="flex flex-wrap gap-3">
                  {listing.retailer?.website_url && (
                    <Button asChild className="bg-orange-500 hover:bg-orange-600">
                      <a 
                        href={listing.retailer.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  
                  {listing.retailer?.phone_number && (
                    <Button asChild variant="outline" className="border-gray-600 hover:bg-gray-700">
                      <a href={`tel:${listing.retailer.phone_number}`} className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                  
                  {listing.retailer?.email && (
                    <Button asChild variant="outline" className="border-gray-600 hover:bg-gray-700">
                      <a href={`mailto:${listing.retailer.email}`} className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Retailer
                  </Button>

                  <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Heart className="w-4 h-4 mr-2" />
                    Save Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Message */}
        {listings.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 mt-8">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto text-green-400 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">
                Safe Shopping Guarantee
              </h4>
              <p className="text-gray-400 mb-4">
                All retailers are verified before joining our marketplace. Always verify seller credentials before making a purchase.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/retailer-safety">Safety Guidelines</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/report-issue">Report an Issue</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhereToBuy; 