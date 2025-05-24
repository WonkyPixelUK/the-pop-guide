
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collection'] });
    },
  });
};

export const useRemoveFromCollection = () => {
  const queryClient = useQueryClient();
  
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collection'] });
    },
  });
};
