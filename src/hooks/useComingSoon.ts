import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewReleaseData {
  name: string;
  series: string;
  price: string;
  type: string;
  category: string;
  description: string;
  releaseDate: string;
  exclusive: boolean;
  image: File | null;
}

export const useAddComingSoonRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (releaseData: NewReleaseData) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to add releases");
      }

      let imageUrl = null;

      // Upload image to Supabase storage if provided
      if (releaseData.image) {
        const fileExt = releaseData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('funko-images')
          .upload(fileName, releaseData.image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('funko-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // Insert the new release into the coming_soon_releases table
      const { data, error } = await supabase
        .from('coming_soon_releases')
        .insert({
          name: releaseData.name,
          series: releaseData.series,
          price: releaseData.price,
          type: releaseData.type,
          category: releaseData.category,
          description: releaseData.description,
          release_date: releaseData.releaseDate,
          is_exclusive: releaseData.exclusive,
          image_url: imageUrl,
          notify_url: 'https://funkoeurope.com/collections/coming-soon', // Default notify URL
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add release: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch any related queries
      queryClient.invalidateQueries({ queryKey: ['coming-soon-releases'] });
    },
  });
}; 