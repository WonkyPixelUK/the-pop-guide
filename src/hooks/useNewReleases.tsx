import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNewReleases = () => {
  return useQuery({
    queryKey: ['new-releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .contains('data_sources', ['new-releases'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useNewReleasesBySource = (source = 'Funko Europe') => {
  return useQuery({
    queryKey: ['new-releases', source],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .contains('data_sources', [source])
        .contains('data_sources', ['new-releases'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useRecentReleases = (days = 30) => {
  return useQuery({
    queryKey: ['recent-releases', days],
    queryFn: async () => {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .contains('data_sources', ['new-releases'])
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}; 