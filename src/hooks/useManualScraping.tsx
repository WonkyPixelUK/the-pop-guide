import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useManualScraping = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ funkoPopId, sources }: {
      funkoPopId: string;
      sources?: string[];
    }) => {
      console.log(`Starting manual scraping for Funko Pop: ${funkoPopId}`);
      console.log('User from useAuth:', user);
      
      let requestId: string | null = null;
      
      // Log the pricing update request FIRST if user is authenticated
      if (user) {
        console.log('Attempting to log pricing update request...');
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('pricing_update_requests')
            .insert({
              user_id: user.id,
              funko_pop_id: funkoPopId,
              request_type: 'price_update',
              status: 'pending',
              notes: `Manual scraping requested for sources: ${sources?.join(', ') || 'all'}`
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Insert error:', insertError);
          } else {
            console.log('Successfully logged pricing request:', insertData);
            requestId = insertData.id;
          }
        } catch (logError) {
          console.error('Failed to log pricing update request:', logError);
          // Continue with scraping even if logging fails
        }
      } else {
        console.warn('No user available - pricing request not logged');
      }
      
      // Now attempt the scraping function call
      try {
        const { data, error } = await supabase.functions.invoke('manual-scraper', {
          body: {
            funkoPopId,
            sources: sources || ['ebay', 'amazon', 'funko_store', 'hobbydb']
          }
        });
        
        if (error) {
          console.error('Manual scraping error:', error);
          
          // Update request status to failed if we logged a request
          if (user && requestId) {
            try {
              await supabase
                .from('pricing_update_requests')
                .update({ 
                  status: 'failed', 
                  notes: `Scraping function error: ${error.message}` 
                })
                .eq('id', requestId);
            } catch (updateError) {
              console.error('Failed to update pricing update request status:', updateError);
            }
          }
          
          throw error;
        }
        
        console.log('Manual scraping response:', data);
        
        // Update request status to completed if we logged a request
        if (user && requestId) {
          try {
            await supabase
              .from('pricing_update_requests')
              .update({ 
                status: 'completed',
                notes: `Scraping completed. Jobs created: ${data?.jobsCreated || 'unknown'}`
              })
              .eq('id', requestId);
          } catch (updateError) {
            console.error('Failed to update pricing update request status:', updateError);
          }
        }
        
        return data;
        
      } catch (scrapingError) {
        // Update request status to failed if we logged a request
        if (user && requestId) {
          try {
            await supabase
              .from('pricing_update_requests')
              .update({ 
                status: 'failed', 
                notes: `Scraping function unavailable: ${scrapingError.message}` 
              })
              .eq('id', requestId);
          } catch (updateError) {
            console.error('Failed to update pricing update request status:', updateError);
          }
        }
        
        // Re-throw the error so the UI still shows the failure
        throw scrapingError;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Started",
        description: `Started scraping for the selected Funko Pop. Created ${data?.jobsCreated || 0} jobs.`,
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
      queryClient.invalidateQueries({ queryKey: ['price-history'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-update-requests'] });
    },
    onError: (error: any) => {
      console.error('Manual scraping mutation error:', error);
      toast({
        title: "Request Logged",
        description: "Your pricing update request has been logged, but the scraping service is currently unavailable.",
        variant: "destructive",
      });
      // Still invalidate pricing requests to show the logged request
      queryClient.invalidateQueries({ queryKey: ['pricing-update-requests'] });
    },
  });
};
