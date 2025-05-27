import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRetailer = (slugOrUserId: string) => {
  // If the input looks like a UUID (user id), query by user_id, else by slug
  const isUserId = slugOrUserId && slugOrUserId.length === 36 && slugOrUserId.includes('-');
  return useQuery({
    queryKey: ['retailer', slugOrUserId],
    queryFn: async () => {
      let query = supabase.from('retailers').select('*').eq('is_approved', true);
      if (isUserId) {
        query = query.eq('user_id', slugOrUserId);
      } else {
        query = query.eq('slug', slugOrUserId);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slugOrUserId,
  });
}; 