import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRetailerAdImpression = (retailerId: string | undefined) => {
  useEffect(() => {
    if (!retailerId) return;
    const trackImpression = async () => {
      await supabase.from('retailer_analytics').upsert({
        retailer_id: retailerId,
        last_impression: new Date().toISOString(),
        impressions: 1,
      }, { onConflict: ['retailer_id'] });
      await supabase.rpc('increment_retailer_impressions', { retailer_id: retailerId });
    };
    trackImpression();
    // Only once per mount
     
  }, [retailerId]);
}; 