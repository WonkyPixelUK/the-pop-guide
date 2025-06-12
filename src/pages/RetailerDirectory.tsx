import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Globe, Phone, Mail, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RetailerProfile {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  website_url: string;
  city: string;
  state_province: string;
  country: string;
  logo_url: string;
  cover_image_url: string;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_featured: boolean;
  specialties: string[];
  opening_hours: any;
}

const RetailerDirectory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retailers, setRetailers] = useState<RetailerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredRetailers, setFilteredRetailers] = useState<RetailerProfile[]>([]);

  // Fetch retailers from the API
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        
        const res = await fetch(`https://db.popguide.co.uk/functions/v1/retailer-manager?action=directory`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setRetailers(data.retailers || []);
          setFilteredRetailers(data.retailers || []);
        } else {
          console.error('Failed to fetch retailers');
        }
      } catch (error) {
        console.error('Error fetching retailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  // Filter retailers based on search and filters
  useEffect(() => {
    let filtered = retailers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(retailer =>
        retailer.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.specialties?.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(retailer => retailer.country === selectedCountry);
    }

    // Apply business type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(retailer => retailer.business_type === selectedType);
    }

    setFilteredRetailers(filtered);
  }, [retailers, searchQuery, selectedCountry, selectedType]);

  const handleContactRetailer = (retailer: RetailerProfile) => {
    if (retailer.website_url) {
      window.open(retailer.website_url, '_blank');
    } else {
      toast({
        title: "No website available",
        description: "This retailer hasn't provided a website URL",
        variant: "destructive",
      });
    }
  };

  const getBusinessTypeDisplay = (type: string) => {
    switch (type) {
      case 'retail_store': return 'Retail Store';
      case 'online_store': return 'Online Store';
      case 'marketplace': return 'Marketplace';
      case 'distributor': return 'Distributor';
      default: return type;
    }
  };

  const uniqueCountries = [...new Set(retailers.map(r => r.country))].sort();
  const uniqueTypes = [...new Set(retailers.map(r => r.business_type))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading retailers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      
      {/* Header */}
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">🏪 Retailer Directory</h1>
              <p className="text-gray-400">
                Find trusted Funko Pop retailers in your area and around the world
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.location.href = '/retailers/signup'} 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Are you a retailer? Join us!
              </Button>
                             <Button 
                 variant="outline" 
                 onClick={() => window.location.href = '/retailers/signup'}
                 className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
               >
                Become a Retailer
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search retailers, locations, or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{getBusinessTypeDisplay(type)}</option>
              ))}
            </select>
          </div>
          
          {/* Results count */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">
              {filteredRetailers.length} retailer{filteredRetailers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Retailers Grid */}
      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {filteredRetailers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No retailers found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRetailers.map((retailer) => (
                <div
                  key={retailer.id}
                  className={`bg-gray-800/30 backdrop-blur-sm border rounded-xl p-6 hover:bg-gray-700/30 transition-all ${
                    retailer.is_featured 
                      ? 'border-purple-500 bg-purple-500/5' 
                      : 'border-gray-700'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {retailer.business_name}
                        </h3>
                        {retailer.is_verified && (
                          <span className="text-blue-400 text-sm">✓</span>
                        )}
                        {retailer.is_featured && (
                          <span className="text-purple-400 text-sm">⭐</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {getBusinessTypeDisplay(retailer.business_type)}
                      </div>
                    </div>
                    {retailer.logo_url && (
                      <img
                        src={retailer.logo_url}
                        alt={retailer.business_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {/* Description */}
                  {retailer.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {retailer.description}
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {retailer.city && retailer.country 
                        ? `${retailer.city}, ${retailer.country}`
                        : retailer.country || 'Location not specified'
                      }
                    </span>
                  </div>

                  {/* Rating */}
                  {retailer.total_reviews > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300 text-sm">
                        {retailer.average_rating.toFixed(1)} ({retailer.total_reviews} review{retailer.total_reviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}

                  {/* Specialties */}
                  {retailer.specialties && retailer.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {retailer.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                        {retailer.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                            +{retailer.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleContactRetailer(retailer)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm"
                      size="sm"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Visit Store
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default RetailerDirectory; 