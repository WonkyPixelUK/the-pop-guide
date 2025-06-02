import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useForceScraping = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      console.log('Force starting scraping for all Funko Pops...');
      console.log('User from useAuth:', user);
      
      let requestId: string | null = null;
      
      // Log the bulk pricing update request FIRST if user is authenticated
      if (user) {
        console.log('Attempting to log bulk pricing update request...');
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('pricing_update_requests')
            .insert({
              user_id: user.id,
              funko_pop_id: null, // null indicates bulk request
              request_type: 'price_update',
              status: 'pending',
              notes: 'Bulk force scraping requested for all Funko Pops'
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Bulk insert error:', insertError);
          } else {
            console.log('Successfully logged bulk pricing request:', insertData);
            requestId = insertData.id;
          }
        } catch (logError) {
          console.error('Failed to log bulk pricing update request:', logError);
          // Continue with scraping even if logging fails
        }
      } else {
        console.warn('No user available - bulk pricing request not logged');
      }
      
      // Now attempt the scraping operations
      try {
        // First, reset the last_price_update for all Funko Pops to force scraping
        const { error: resetError } = await supabase
          .from('funko_pops')
          .update({ last_price_update: null })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records
        
        if (resetError) {
          console.error('Error resetting update timestamps:', resetError);
          
          // Update request status to failed if we logged a request
          if (user && requestId) {
            try {
              await supabase
                .from('pricing_update_requests')
                .update({ 
                  status: 'failed', 
                  notes: `Error resetting timestamps: ${resetError.message}` 
                })
                .eq('id', requestId);
            } catch (updateError) {
              console.error('Failed to update bulk pricing update request status:', updateError);
            }
          }
          
          throw resetError;
        }
        
        // Now call the scraping scheduler
        const { data, error } = await supabase.functions.invoke('scrape-scheduler', {
          body: { force: true }
        });
        
        if (error) {
          console.error('Force scraping error:', error);
          
          // Update request status to failed if we logged a request
          if (user && requestId) {
            try {
              await supabase
                .from('pricing_update_requests')
                .update({ 
                  status: 'failed', 
                  notes: `Scraping scheduler error: ${error.message}` 
                })
                .eq('id', requestId);
            } catch (updateError) {
              console.error('Failed to update bulk pricing update request status:', updateError);
            }
          }
          
          throw error;
        }
        
        console.log('Force scraping response:', data);
        
        // Update request status to completed if we logged a request
        if (user && requestId) {
          try {
            await supabase
              .from('pricing_update_requests')
              .update({ 
                status: 'completed',
                notes: `Bulk scraping completed. ${data?.funkoPopCount || 'unknown'} Funko Pops processed, ${data?.jobsCreated || 'unknown'} jobs created`
              })
              .eq('id', requestId);
          } catch (updateError) {
            console.error('Failed to update bulk pricing update request status:', updateError);
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
                notes: `Scraping operations failed: ${scrapingError.message}` 
              })
              .eq('id', requestId);
          } catch (updateError) {
            console.error('Failed to update bulk pricing update request status:', updateError);
          }
        }
        
        // Re-throw the error so the UI still shows the failure
        throw scrapingError;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Force Scraping Started",
        description: `Forced scraping for ${data?.funkoPopCount || 0} Funko Pops. Created ${data?.jobsCreated || 0} jobs. Est. completion: ${Math.ceil(((data?.jobsCreated || 0) * 15) / 60)} minutes.`,
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-update-requests'] });
    },
    onError: (error: any) => {
      console.error('Force scraping mutation error:', error);
      toast({
        title: "Request Logged", 
        description: "Your bulk pricing update request has been logged, but the scraping service is currently unavailable.",
        variant: "destructive",
      });
      // Still invalidate pricing requests to show the logged request
      queryClient.invalidateQueries({ queryKey: ['pricing-update-requests'] });
    },
  });
};
