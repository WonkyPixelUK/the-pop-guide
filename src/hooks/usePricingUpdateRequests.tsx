import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PricingUpdateRequest {
  id: string;
  user_id: string;
  funko_pop_id: string | null;
  requested_at: string;
  status: 'pending' | 'completed' | 'failed';
  request_type: 'price_update' | 'data_correction' | 'image_update';
  notes: string | null;
  created_at: string;
  updated_at: string;
  funko_pops?: {
    name: string;
    series: string;
    number: string;
    image_url: string;
  } | null;
}

export const usePricingUpdateRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pricing-update-requests', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user available for pricing requests query');
        return [];
      }

      console.log('Fetching pricing update requests for user:', user.id);

      const { data, error } = await supabase
        .from('pricing_update_requests')
        .select(`
          id,
          user_id,
          funko_pop_id,
          requested_at,
          status,
          request_type,
          notes,
          created_at,
          updated_at,
          funko_pops:funko_pop_id (
            name,
            series,
            number,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pricing update requests:', error);
        throw new Error(`Failed to fetch pricing update requests: ${error.message}`);
      }

      console.log('Fetched pricing update requests:', data);
      return data as PricingUpdateRequest[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}; 