import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerShows = (retailerId: string) => {
  return useQuery({
    queryKey: ['retailer-shows', retailerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailer_shows')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('show_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!retailerId,
  });
}; 