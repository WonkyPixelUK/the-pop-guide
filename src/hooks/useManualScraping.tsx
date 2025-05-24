
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useManualScraping = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ funkoPopId, sources }: {
      funkoPopId: string;
      sources?: string[];
    }) => {
      console.log(`Starting manual scraping for Funko Pop: ${funkoPopId}`);
      
      const { data, error } = await supabase.functions.invoke('manual-scraper', {
        body: {
          funkoPopId,
          sources: sources || ['ebay', 'amazon', 'funko_store', 'hobbydb']
        }
      });
      
      if (error) {
        console.error('Manual scraping error:', error);
        throw error;
      }
      
      console.log('Manual scraping response:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Started",
        description: `Started scraping for the selected Funko Pop. Created ${data.jobsCreated} jobs.`,
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
      queryClient.invalidateQueries({ queryKey: ['price-history'] });
    },
    onError: (error: any) => {
      console.error('Manual scraping mutation error:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to start manual scraping",
        variant: "destructive",
      });
    },
  });
};
