import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerAnalytics = (retailerId: string) => {
  return useQuery({
    queryKey: ['retailer-analytics', retailerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailer_analytics')
        .select('*')
        .eq('retailer_id', retailerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!retailerId,
  });
}; 