
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useForceScraping = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      console.log('Force starting scraping for all Funko Pops...');
      
      // First, reset the last_price_update for all Funko Pops to force scraping
      const { error: resetError } = await supabase
        .from('funko_pops')
        .update({ last_price_update: null })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records
      
      if (resetError) {
        console.error('Error resetting update timestamps:', resetError);
        throw resetError;
      }
      
      // Now call the scraping scheduler
      const { data, error } = await supabase.functions.invoke('scrape-scheduler', {
        body: { force: true }
      });
      
      if (error) {
        console.error('Force scraping error:', error);
        throw error;
      }
      
      console.log('Force scraping response:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Force Scraping Started",
        description: `Forced scraping for ${data.funkoPopCount} Funko Pops. Created ${data.jobsCreated} jobs. Est. completion: ${Math.ceil((data.jobsCreated * 15) / 60)} minutes.`,
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
    },
    onError: (error: any) => {
      console.error('Force scraping mutation error:', error);
      toast({
        title: "Force Scraping Failed",
        description: error.message || "Failed to force start scraping process",
        variant: "destructive",
      });
    },
  });
};
