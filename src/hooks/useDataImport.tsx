
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  totalFetched: number;
  newRecords: number;
  imported: number;
  errors: number;
  duplicatesSkipped: number;
  message: string;
  error?: string;
}

export const useDataImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (): Promise<ImportResult> => {
      const { data, error } = await supabase.functions.invoke('import-funko-data', {
        method: 'POST',
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Import Successful!",
          description: `${data.imported} new Funko Pops imported. ${data.duplicatesSkipped} duplicates skipped.`,
        });
        
        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['funko-pops'] });
        queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Unknown error occurred during import",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    },
  });
};
