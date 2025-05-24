
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePriceHistory = (funkoPopId: string) => {
  return useQuery({
    queryKey: ['price-history', funkoPopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('funko_pop_id', funkoPopId)
        .order('date_scraped', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!funkoPopId,
  });
};

export const useScrapingJobs = () => {
  return useQuery({
    queryKey: ['scraping-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          funko_pops(name, series, number)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
};

export const useStartScraping = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      console.log('Starting scraping process...');
      
      const { data, error } = await supabase.functions.invoke('scrape-scheduler', {
        body: {}
      });
      
      if (error) {
        console.error('Scraping error:', error);
        throw error;
      }
      
      console.log('Scraping response:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Started",
        description: `Started scraping for ${data.funkoPopCount} Funko Pops. Created ${data.jobsCreated} new jobs.`,
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
    },
    onError: (error: any) => {
      console.error('Scraping mutation error:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to start scraping process",
        variant: "destructive",
      });
    },
  });
};

export const usePriceAnalytics = (funkoPopId: string) => {
  return useQuery({
    queryKey: ['price-analytics', funkoPopId],
    queryFn: async () => {
      // Get price history for analytics
      const { data: priceHistory, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('funko_pop_id', funkoPopId)
        .order('date_scraped', { ascending: true });
      
      if (priceError) throw priceError;
      
      // Calculate analytics
      const analytics = {
        totalDataPoints: priceHistory.length,
        sources: [...new Set(priceHistory.map(p => p.source))],
        priceRange: {
          min: Math.min(...priceHistory.map(p => p.price)),
          max: Math.max(...priceHistory.map(p => p.price)),
        },
        averageBySource: {} as Record<string, number>,
        priceTimeline: priceHistory.map(p => ({
          date: p.date_scraped,
          price: p.price,
          source: p.source,
          condition: p.condition
        }))
      };
      
      // Calculate average by source
      const sourceGroups = priceHistory.reduce((acc, item) => {
        if (!acc[item.source]) acc[item.source] = [];
        acc[item.source].push(item.price);
        return acc;
      }, {} as Record<string, number[]>);
      
      Object.keys(sourceGroups).forEach(source => {
        const prices = sourceGroups[source];
        analytics.averageBySource[source] = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      });
      
      return analytics;
    },
    enabled: !!funkoPopId,
  });
};
