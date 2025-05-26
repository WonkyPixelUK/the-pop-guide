import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerPayments = (retailerId: string) => {
  return useQuery({
    queryKey: ['retailer-payments', retailerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailer_payments')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!retailerId,
  });
}; 