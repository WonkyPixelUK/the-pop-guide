import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type FunkoPop = Tables<'funko_pops'>;
type UserCollection = Tables<'user_collections'>;

export const useFunkoPops = () => {
  return useQuery({
    queryKey: ['funko-pops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes  
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if we have data
    retry: 1, // Only retry once on failure
  });
};

export const useFunkoPopWithPricing = (funkoPopId: string) => {
  return useQuery({
    queryKey: ['funko-pop-pricing', funkoPopId],
    queryFn: async () => {
      // Get the Funko Pop with latest pricing data
      const { data: funkoData, error: funkoError } = await supabase
        .from('funko_pops')
        .select('*')
        .eq('id', funkoPopId)
        .single();
      
      if (funkoError) throw funkoError;
      
      // Get recent price history
      const { data: recentPrices, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('funko_pop_id', funkoPopId)
        .gte('date_scraped', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('date_scraped', { ascending: false });
      
      if (priceError) throw priceError;
      
      return {
        ...funkoData,
        recentPrices: recentPrices || []
      };
    },
    enabled: !!funkoPopId,
  });
};

export const useUserCollection = (userId?: string) => {
  return useQuery({
    queryKey: ['user-collection', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_collections')
        .select(`
          *,
          funko_pops (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useAddToCollection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (funkoPopId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Adding to collection:', { funkoPopId, userId: user.id });
      
      const { data, error } = await supabase
        .from('user_collections')
        .insert({
          funko_pop_id: funkoPopId,
          user_id: user.id,
          condition: 'mint'
        })
        .select();
        
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to add to collection: ${error.message}`);
      }
      
      console.log('Successfully added to collection:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user-collection'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    }
  });
};

export const useRemoveFromCollection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ funkoPopId, userId }: {
      funkoPopId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('funko_pop_id', funkoPopId)
        .eq('user_id', userId);
      if (error) throw error;
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'remove_from_collection',
        details: { funkoPopId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collection'] });
    },
  });
};
