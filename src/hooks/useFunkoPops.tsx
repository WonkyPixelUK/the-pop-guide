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
    mutationFn: async ({ funkoPopId, userId, condition, purchasePrice }: {
      funkoPopId: string;
      userId: string;
      condition?: string;
      purchasePrice?: number;
    }) => {
      const { data, error } = await supabase
        .from('user_collections')
        .insert({
          funko_pop_id: funkoPopId,
          user_id: userId,
          condition: condition || 'mint',
          purchase_price: purchasePrice,
        });
      if (error) throw error;
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'add_to_collection',
        details: { funkoPopId },
      });
      // Activity log
      await supabase.from('activity_log').insert({
        user_id: userId,
        type: 'add_to_collection',
        data: { funkoPopId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collection'] });
    },
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
