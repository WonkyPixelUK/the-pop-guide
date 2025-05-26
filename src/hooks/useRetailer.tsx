import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailer = (slug: string) => {
  return useQuery({
    queryKey: ['retailer', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('slug', slug)
        .eq('is_approved', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}; 