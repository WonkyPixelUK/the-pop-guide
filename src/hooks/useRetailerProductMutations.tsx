import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useRetailerProductMutations = (retailerId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: any) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('retailer_products')
        .insert({ ...product, retailer_id: retailerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', retailerId] });
      toast({ title: 'Product added', description: 'Product added successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('retailer_products')
        .update(updates)
        .eq('id', id)
        .eq('retailer_id', retailerId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', retailerId] });
      toast({ title: 'Product updated', description: 'Product updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('retailer_products')
        .delete()
        .eq('id', id)
        .eq('retailer_id', retailerId);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', retailerId] });
      toast({ title: 'Product deleted', description: 'Product deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    },
  });

  return { createProduct, updateProduct, deleteProduct };
}; 