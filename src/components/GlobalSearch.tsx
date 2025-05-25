import { useState } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { useFunkoPops, useUserCollection, useAddToCollection } from '@/hooks/useFunkoPops';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to normalize strings for search (case-insensitive, ignore punctuation)
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

const GlobalSearch = () => {
  const { user } = useAuth();
  const { data: funkoPops = [], isLoading: funkoLoading } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);
  const addToCollection = useAddToCollection();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  // Only show items in the user's collection
  const normalizedSearch = normalize(searchValue);
  const filteredResults =
    normalizedSearch.length > 1
      ? userCollection
          .map(item => item.funko_pops)
          .filter(Boolean)
          .filter((pop) => {
            return (
              normalize(pop.name).includes(normalizedSearch) ||
              (pop.series && normalize(pop.series).includes(normalizedSearch)) ||
              (pop.number && normalize(pop.number).includes(normalizedSearch))
            );
          })
      : [];

  const isOwned = (id: string) =>
    userCollection.some((item: any) => item.funko_pop_id === id);

  const handleQuickAdd = async (pop: any) => {
    if (!user) return;
    await addToCollection.mutateAsync({ funkoPopId: pop.id, userId: user.id });
    setAddedId(pop.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search the database..."
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-semibold">
        Search
      </Button>
    </form>
  );
};

export default GlobalSearch; 