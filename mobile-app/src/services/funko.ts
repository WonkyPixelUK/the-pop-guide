import { supabase, handleSupabaseError } from './supabase';

export interface FunkoPop {
  id: string;
  name: string;
  series: string;
  number: string;
  image_url: string;
  estimated_value: number;
  category: string;
  fandom: string;
  genre: string;
  is_vaulted: boolean;
  is_exclusive: boolean;
  created_at: string;
}

export interface UserCollection {
  id: string;
  user_id: string;
  funko_pop_id: string;
  purchase_price?: number;
  condition: string;
  created_at: string;
  funko_pop: FunkoPop;
}

// Get all Funko Pops with pagination
export const getFunkoPops = async (limit = 50, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('funko_pops')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching Funko Pops:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: count ? offset + limit < count : false
    };
  } catch (error) {
    console.error('Error fetching Funko Pops:', error);
    throw error;
  }
};

// Search Funko Pops
export const searchFunkoPops = async (searchTerm: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('funko_pops')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,series.ilike.%${searchTerm}%,number.ilike.%${searchTerm}%`)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Error searching Funko Pops:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Error searching Funko Pops:', error);
    throw error;
  }
};

// Get user's collection
export const getUserCollection = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_collection')
      .select(`
        *,
        funko_pop:funko_pops(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user collection:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user collection:', error);
    throw error;
  }
};

// Add to collection
export const addToCollection = async (userId: string, funkoPopId: string, purchasePrice?: number, condition = 'mint') => {
  try {
    const { data, error } = await supabase
      .from('user_collection')
      .insert({
        user_id: userId,
        funko_pop_id: funkoPopId,
        purchase_price: purchasePrice,
        condition: condition
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to collection:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Error adding to collection:', error);
    throw error;
  }
};

// Get user's wishlist
export const getUserWishlist = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_wishlist')
      .select(`
        *,
        funko_pop:funko_pops(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Add to wishlist
export const addToWishlist = async (userId: string, funkoPopId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_wishlist')
      .insert({
        user_id: userId,
        funko_pop_id: funkoPopId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Search by barcode/EAN
export const searchByBarcode = async (barcode: string) => {
  try {
    const { data, error } = await supabase
      .from('funko_pops')
      .select('*')
      .or(`upc.eq.${barcode},upc_a.eq.${barcode},ean_13.eq.${barcode}`)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      console.error('Error searching by barcode:', error.message);
      throw new Error(handleSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Error searching by barcode:', error);
    throw error;
  }
}; 