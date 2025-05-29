import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          funko_pops (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async ({ funkoPopId, maxPrice }: { funkoPopId: string; maxPrice?: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          funko_pop_id: funkoPopId,
          max_price: maxPrice,
        });
      
      if (error) throw error;
      await supabase.from('activity_log').insert({
        user_id: user.id,
        type: 'add_to_wishlist',
        data: { funkoPopId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (funkoPopId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('funko_pop_id', funkoPopId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
  });

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
  };
};
