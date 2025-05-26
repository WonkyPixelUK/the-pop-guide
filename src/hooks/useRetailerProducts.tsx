import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerProducts = (retailerId: string) => {
  return useQuery({
    queryKey: ['retailer-products', retailerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailer_products')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!retailerId,
  });
}; 