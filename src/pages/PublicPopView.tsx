import { useParams } from 'react-router-dom';
import { useFunkoPopWithPricing } from '@/hooks/useFunkoPops';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const PublicPopView = () => {
  const { id } = useParams();
  const { data: pop, isLoading } = useFunkoPopWithPricing(id);

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!pop) return <div className="text-center py-20 text-gray-400">Pop not found.</div>;

  return (
    <>
      <SEO title={`${pop.name} | PopGuide`} description={pop.description || pop.series || ''} />
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col pb-20 md:pb-0">
        <div className="container mx-auto py-12 px-4 max-w-3xl flex-1">
          <Card className="bg-gray-800/70 border border-gray-700 p-6 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-56 h-56 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-4 md:mb-0">
              {pop.image_url ? (
                <img src={pop.image_url} alt={pop.name} className="w-full h-full object-contain" />
              ) : (
                <User className="w-20 h-20 text-orange-400 animate-pulse" />
              )}
            </div>
            <CardContent className="flex-1 flex flex-col min-h-[20rem]">
              <h1 className="text-3xl font-bold text-white mb-2">{pop.name}</h1>
              <div className="text-gray-400 mb-2">{pop.series} {pop.number ? `#${pop.number}` : ''}</div>
              <div className="text-sm text-gray-400 mb-2">Character: {pop.name}</div>
              <div className="text-sm text-gray-400 mb-2">Series: {pop.series}</div>
              <div className="text-sm text-gray-400 mb-2">Fandom: {pop.fandom}</div>
              <div className="text-sm text-gray-400 mb-2">Genre: {pop.genre}</div>
              <div className="text-sm text-gray-400 mb-2">Edition: {pop.edition}</div>
              <div className="text-sm text-gray-400 mb-2">Release Year: {pop.release_year || '—'}</div>
              <div className="text-sm text-gray-400 mb-2">Vaulted: {pop.is_vaulted ? 'Yes' : 'No'}</div>
              <div className="text-lg font-semibold text-orange-400 mb-4">
                {pop.estimated_value !== null && pop.estimated_value !== undefined ? `£${pop.estimated_value.toFixed(2)}` : 'Pending'}
              </div>
              {pop.description && <div className="text-gray-300 mb-2 text-base">{pop.description}</div>}
              {/* Stickers, exclusives, etc. can be added here if available */}
              <div className="flex gap-3 mt-auto">
                {/* Action buttons (add to collection, wishlist, share) can be conditionally rendered here */}
                <Button variant="default">Add to Collection</Button>
                <Button variant="outline">Add to Wishlist</Button>
                <Button variant="ghost">Share</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default PublicPopView; 