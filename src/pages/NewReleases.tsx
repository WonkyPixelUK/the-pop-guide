import { useState } from 'react';
import { useNewReleases, useNewReleasesBySource, useRecentReleases } from '@/hooks/useNewReleases';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Filter, Star, TrendingUp, Package } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const NewReleases = () => {
  const [filter, setFilter] = useState<'all' | 'funko-europe' | 'recent-30' | 'recent-7'>('all');
  
  const { data: allNewReleases, isLoading: loadingAll } = useNewReleases();
  const { data: funkoEuropeReleases, isLoading: loadingFE } = useNewReleasesBySource('Funko Europe');
  const { data: recent30, isLoading: loading30 } = useRecentReleases(30);
  const { data: recent7, isLoading: loading7 } = useRecentReleases(7);

  // Determine which data to show based on filter
  const getCurrentData = () => {
    switch (filter) {
      case 'funko-europe': return funkoEuropeReleases || [];
      case 'recent-30': return recent30 || [];
      case 'recent-7': return recent7 || [];
      default: return allNewReleases || [];
    }
  };

  const isLoading = loadingAll || loadingFE || loading30 || loading7;
  const currentData = getCurrentData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Sparkles className="w-6 h-6 animate-pulse text-orange-400" />
          Loading new releases...
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="New Releases | PopGuide" description="Discover the latest Funko Pop releases from Funko Europe and other sources." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />
        
        {/* Header */}
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-orange-400" />
              <h1 className="text-4xl font-bold text-white">New Releases</h1>
              <Sparkles className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover the latest Funko Pop releases from Funko Europe and other trusted sources
            </p>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 ${
                  filter === 'all' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                All New Releases ({allNewReleases?.length || 0})
              </Button>
              <Button
                variant={filter === 'funko-europe' ? 'default' : 'outline'}
                onClick={() => setFilter('funko-europe')}
                className={`flex items-center gap-2 ${
                  filter === 'funko-europe' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                Funko Europe ({funkoEuropeReleases?.length || 0})
              </Button>
              <Button
                variant={filter === 'recent-30' ? 'default' : 'outline'}
                onClick={() => setFilter('recent-30')}
                className={`flex items-center gap-2 ${
                  filter === 'recent-30' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Last 30 Days ({recent30?.length || 0})
              </Button>
              <Button
                variant={filter === 'recent-7' ? 'default' : 'outline'}
                onClick={() => setFilter('recent-7')}
                className={`flex items-center gap-2 ${
                  filter === 'recent-7' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Last 7 Days ({recent7?.length || 0})
              </Button>
            </div>

            {/* Current Filter Info */}
            <div className="text-lg text-gray-300 font-medium">
              Showing <span className="text-orange-400 font-bold">{currentData.length}</span> new releases
              {filter === 'funko-europe' && ' from Funko Europe'}
              {filter === 'recent-30' && ' from the last 30 days'}
              {filter === 'recent-7' && ' from the last 7 days'}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 pb-12">
          {currentData.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-800/50 rounded-xl p-8 max-w-md mx-auto">
                <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">No new releases found</h3>
                <p className="text-gray-400">Check back soon for the latest Funko Pop releases!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {currentData.map((pop) => (
                <Card key={pop.id} className="bg-gray-800/70 border-gray-700 hover:bg-gray-700/70 transition-all duration-200 hover:shadow-lg hover:border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="aspect-square mb-3 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={pop.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                        alt={pop.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm leading-tight text-white line-clamp-2">{pop.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">{pop.series}</p>
                      {pop.number && (
                        <p className="text-xs text-gray-500">#{pop.number}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-green-400 font-bold text-sm">
                          £{pop.estimated_value || 0}
                        </div>
                        {pop.is_exclusive && (
                          <Badge className="bg-purple-600 hover:bg-purple-700 text-purple-100 text-xs border-0">
                            Exclusive
                          </Badge>
                        )}
                      </div>
                      
                      {/* Single New Release Badge */}
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs border-0 w-full justify-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New Release
                      </Badge>
                      
                      {/* Data Sources - Only show Funko Europe if present */}
                      {pop.data_sources?.includes('Funko Europe') && (
                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400 hover:bg-blue-400/10 w-full justify-center">
                          <Package className="w-3 h-3 mr-1" />
                          Funko Europe
                        </Badge>
                      )}
                      
                      {/* Release Date */}
                      <p className="text-xs text-gray-500 text-center">
                        Added {new Date(pop.created_at).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default NewReleases; 