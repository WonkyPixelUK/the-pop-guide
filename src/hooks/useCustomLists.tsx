
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
    },
  });

  return {
    lists,
    isLoading,
    createList,
    addItemToList,
  };
};
