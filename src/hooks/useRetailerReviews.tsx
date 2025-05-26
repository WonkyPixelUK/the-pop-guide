import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerReviews = (retailerId: string) => {
  return useQuery({
    queryKey: ['retailer-reviews', retailerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailer_reviews')
        .select('*')
        .eq('retailer_id', retailerId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!retailerId,
  });
}; 