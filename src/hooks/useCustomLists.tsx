
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useCustomLists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['custom-lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('custom_lists')
        .select(`
          *,
          list_items (
            id,
            funko_pops (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: publicLists = [], isLoading: isLoadingPublicLists } = useQuery({
    queryKey: ['public-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_lists')
        .select(`
          *,
          list_items (
            id,
            funko_pops (*)
          ),
          profiles!custom_lists_user_id_fkey (
            full_name,
            username
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createList = useMutation({
    mutationFn: async ({ name, description, isPublic }: { 
      name: string; 
      description?: string; 
      isPublic?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('custom_lists')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic || false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "List created",
        description: "Your custom list has been created successfully",
      });
    },
  });

  const updateList = useMutation({
    mutationFn: async ({ 
      listId, 
      name, 
      description, 
      isPublic 
    }: { 
      listId: string; 
      name?: string; 
      description?: string; 
      isPublic?: boolean; 
    }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isPublic !== undefined) updateData.is_public = isPublic;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('custom_lists')
        .update(updateData)
        .eq('id', listId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "List updated",
        description: "Your list has been updated successfully",
      });
    },
  });

  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('custom_lists')
        .delete()
        .eq('id', listId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "List deleted",
        description: "Your list has been deleted successfully",
      });
    },
  });

  const addItemToList = useMutation({
    mutationFn: async ({ listId, funkoPopId }: { listId: string; funkoPopId: string }) => {
      const { data, error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          funko_pop_id: funkoPopId,
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "Item added",
        description: "Item has been added to your list",
      });
    },
  });

  const removeItemFromList = useMutation({
    mutationFn: async ({ listId, funkoPopId }: { listId: string; funkoPopId: string }) => {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', listId)
        .eq('funko_pop_id', funkoPopId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your list",
      });
    },
  });

  return {
    lists,
    publicLists,
    isLoading,
    isLoadingPublicLists,
    createList,
    updateList,
    deleteList,
    addItemToList,
    removeItemFromList,
  };
};

export const useListById = (listId: string) => {
  return useQuery({
    queryKey: ['list', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_lists')
        .select(`
          *,
          list_items (
            id,
            funko_pops (*)
          ),
          profiles!custom_lists_user_id_fkey (
            full_name,
            username
          )
        `)
        .eq('id', listId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
};
