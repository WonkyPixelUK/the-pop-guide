import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailers = () => {
  return useQuery({
    queryKey: ['retailers'],
    queryFn: async () => {
      // Featured first, then others
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('featured_until', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}; 