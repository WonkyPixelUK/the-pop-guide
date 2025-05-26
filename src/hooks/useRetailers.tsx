import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailers = () => {
  return useQuery({
    queryKey: ['retailers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}; 