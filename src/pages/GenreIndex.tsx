import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Database, Package, Star, Calendar, Crown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/formatCurrency';

interface GenreStats {
  genre: string;
  count: number;
  totalValue: number;
  averageValue: number;
  mostExpensivePop: {
    name: string;
    estimated_value: number;
  } | null;
}

export default function GenreIndex() {
  const [genres, setGenres] = useState<GenreStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGenres() {
      try {
        const { data: pops, error } = await supabase
          .from('funko_pops')
          .select('genre, name, estimated_value');

        if (error) throw error;

        // Group by genre and calculate stats
        const genreMap = new Map<string, GenreStats>();
        
        pops.forEach(pop => {
          if (!pop.genre) return;
          
          if (!genreMap.has(pop.genre)) {
            genreMap.set(pop.genre, {
              genre: pop.genre,
              count: 0,
              totalValue: 0,
              averageValue: 0,
              mostExpensivePop: null
            });
          }
          
          const stats = genreMap.get(pop.genre)!;
          stats.count++;
          if (typeof pop.estimated_value === 'number') {
            stats.totalValue += pop.estimated_value;
            if (!stats.mostExpensivePop || pop.estimated_value > stats.mostExpensivePop.estimated_value) {
              stats.mostExpensivePop = {
                name: pop.name,
                estimated_value: pop.estimated_value
              };
            }
          }
        });

        // Calculate averages and convert to array
        const genreStats = Array.from(genreMap.values()).map(stats => ({
          ...stats,
          averageValue: stats.count > 0 ? stats.totalValue / stats.count : 0
        }));

        // Sort by count descending
        genreStats.sort((a, b) => b.count - a.count);
        
        setGenres(genreStats);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
          <div className="container mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
        <div className="container mx-auto px-4 pt-8 pb-4">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-orange-400" />
            <span className="text-orange-400 font-bold tracking-wide uppercase">Genres</span>
          </nav>

          {/* Title & Description */}
          <h1 className="text-4xl font-extrabold mb-2 text-white">Funko Pop Genres</h1>
          <div className="mb-6 text-lg text-gray-200 max-w-2xl">
            Explore our collection of Funko Pops by genre. Each genre card shows the total number of pops, average value, and most valuable item.
          </div>

          {/* Genre Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre) => (
              <Link 
                key={genre.genre} 
                to={`/database/genres/${genre.genre}`}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <Card className="bg-gray-800 border border-gray-700 shadow-lg hover:border-orange-500 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">{genre.genre}</h2>
                      <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                        {genre.count}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Database className="w-5 h-5 mr-2 text-blue-400" />
                        <span>Total Value: {formatCurrency(genre.totalValue, currency)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Star className="w-5 h-5 mr-2 text-yellow-400" />
                        <span>Avg Value: {formatCurrency(genre.averageValue, currency)}</span>
                      </div>
                      
                      {genre.mostExpensivePop && (
                        <div className="flex items-center text-gray-300">
                          <Crown className="w-5 h-5 mr-2 text-purple-400" />
                          <span className="truncate">
                            Most Valuable: {genre.mostExpensivePop.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 