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
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createList = useMutation({
    mutationFn: async ({ name, description, isPublic, slug }: { 
      name: string; 
      description?: string; 
      isPublic?: boolean;
      slug?: string | null;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('custom_lists')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic || false,
          slug: slug || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'create_list',
        details: { listId: data.id, name },
      });
      // Activity log
      await supabase.from('activity_log').insert({
        user_id: user.id,
        type: 'create_list',
        data: { listId: data.id, name },
      });
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
      isPublic, 
      slug 
    }: { 
      listId: string; 
      name?: string; 
      description?: string; 
      isPublic?: boolean; 
      slug?: string | null;
    }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isPublic !== undefined) updateData.is_public = isPublic;
      if (slug !== undefined) updateData.slug = slug;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('custom_lists')
        .update(updateData)
        .eq('id', listId)
        .select()
        .single();
      
      if (error) throw error;
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'update_list',
        details: { listId, name },
      });
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
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'delete_list',
        details: { listId },
      });
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
      // Check if item already exists in the list
      const { data: existingItem, error: checkError } = await supabase
        .from('list_items')
        .select('id')
        .eq('list_id', listId)
        .eq('funko_pop_id', funkoPopId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we expect if item doesn't exist
        throw checkError;
      }
      
      if (existingItem) {
        throw new Error('This item is already in the selected list');
      }
      
      const { data, error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          funko_pop_id: funkoPopId,
        });
      
      if (error) throw error;
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'add_to_list',
        details: { listId, funkoPopId },
      });
      // Activity log
      await supabase.from('activity_log').insert({
        user_id: user.id,
        type: 'add_to_list',
        data: { listId, funkoPopId },
      });
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
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'remove_from_list',
        details: { listId, funkoPopId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your list",
      });
    },
  });

  const updateListItem = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: { is_wishlist?: boolean; is_trade?: boolean } }) => {
      const { data, error } = await supabase
        .from('list_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({
        title: 'Item updated',
        description: 'List item updated successfully',
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
    updateListItem,
  };
};

export const useListById = (listId: string) => {
  return useQuery({
    queryKey: ['list', listId],
    queryFn: async () => {
      console.log('🔍 Fetching public list with ID:', listId);
      
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
        .eq('is_public', true)
        .single();
      
      if (error) {
        console.log('❌ Error fetching public list with profiles:', error);
        // Fallback query without profiles join but still public only
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('custom_lists')
          .select(`
            *,
            list_items (
              id,
              funko_pops (*)
            )
          `)
          .eq('id', listId)
          .eq('is_public', true)
          .single();
        
        if (fallbackError) {
          console.log('❌ Fallback query also failed:', fallbackError);
          throw fallbackError;
        }
        console.log('✅ Fallback query succeeded:', fallbackData);
        return fallbackData;
      }
      console.log('✅ Main query succeeded:', data);
      return data;
    },
    enabled: !!listId,
  });
};

// Debug hook to check if list exists at all (public or private)
export const useListExistsById = (listId: string) => {
  return useQuery({
    queryKey: ['list-exists', listId],
    queryFn: async () => {
      console.log('🔍 Checking if list exists (any visibility):', listId);
      
      const { data, error } = await supabase
        .from('custom_lists')
        .select('id, name, is_public, user_id')
        .eq('id', listId)
        .single();
      
      if (error) {
        console.log('❌ List does not exist:', error);
        return null;
      }
      
      console.log('✅ List exists:', data);
      return data;
    },
    enabled: !!listId,
  });
};

// New hook for viewing any list (useful for dashboard lists section)
export const useAnyListById = (listId: string) => {
  return useQuery({
    queryKey: ['any-list', listId],
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
      
      if (error) {
        console.log('Error fetching list with profiles:', error);
        // Fallback query without profiles join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('custom_lists')
          .select(`
            *,
            list_items (
              id,
              funko_pops (*)
            )
          `)
          .eq('id', listId)
          .single();
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      return data;
    },
    enabled: !!listId,
  });
};
