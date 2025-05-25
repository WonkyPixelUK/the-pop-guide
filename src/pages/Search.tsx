import { useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Plus, Heart, List as ListIcon, Check } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery().get('q') || '';
  const { user } = useAuth();
  const { data: funkoPops = [], isLoading } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);
  const addToCollection = useAddToCollection();
  const [addedId, setAddedId] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return funkoPops.filter(pop =>
      pop.name.toLowerCase().includes(q) ||
      (pop.series && pop.series.toLowerCase().includes(q)) ||
      (pop.number && pop.number.toLowerCase().includes(q))
    );
  }, [funkoPops, query]);

  const isOwned = (id: string) => userCollection.some((item: any) => item.funko_pop_id === id);

  const handleQuickAdd = async (pop: any) => {
    if (!user) return;
    await addToCollection.mutateAsync({ funkoPopId: pop.id, userId: user.id });
    setAddedId(pop.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Search Results for "{query}"</h1>
        {isLoading ? (
          <div className="text-gray-300">Loading...</div>
        ) : filteredResults.length === 0 ? (
          <div className="text-gray-400 text-lg">No results found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map(pop => (
              <div key={pop.id} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 flex flex-col items-center">
                <img
                  src={pop.image_url || '/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png'}
                  alt={pop.name}
                  className="w-24 h-24 object-cover rounded mb-3"
                />
                <div className="font-semibold text-white text-center mb-1">{pop.name}</div>
                <div className="text-xs text-gray-400 mb-2">{pop.series} #{pop.number}</div>
                <div className="flex gap-2 mt-2">
                  {isOwned(pop.id) ? (
                    <span className="flex items-center text-green-500 text-xs font-semibold"><Check className="w-4 h-4 mr-1" />Owned</span>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={addToCollection.isPending}
                      onClick={() => handleQuickAdd(pop)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-gray-600 text-pink-500"><Heart className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-blue-500"><ListIcon className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 