import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useRetailerShowMutations = (retailerId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createShow = useMutation({
    mutationFn: async (show: any) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('retailer_shows')
        .insert({ ...show, retailer_id: retailerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-shows', retailerId] });
      toast({ title: 'Show added', description: 'Show added successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add show', variant: 'destructive' });
    },
  });

  const updateShow = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('retailer_shows')
        .update(updates)
        .eq('id', id)
        .eq('retailer_id', retailerId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-shows', retailerId] });
      toast({ title: 'Show updated', description: 'Show updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update show', variant: 'destructive' });
    },
  });

  const deleteShow = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('retailer_shows')
        .delete()
        .eq('id', id)
        .eq('retailer_id', retailerId);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-shows', retailerId] });
      toast({ title: 'Show deleted', description: 'Show deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete show', variant: 'destructive' });
    },
  });

  return { createShow, updateShow, deleteShow };
}; 