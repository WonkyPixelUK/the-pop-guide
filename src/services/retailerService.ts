import { supabase } from '@/integrations/supabase/client';
import type { 
  Retailer, 
  RetailerListing, 
  RetailerReview,
  RetailerContact,
  CreateRetailerData, 
  CreateListingData,
  CreateContactData 
} from '@/types/retailer';

export class RetailerService {
  // Retailer CRUD operations
  static async createRetailer(data: CreateRetailerData): Promise<Retailer> {
    const { data: result, error } = await supabase
      .from('retailers')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async getRetailerByUserId(userId: string): Promise<Retailer | null> {
    const { data, error } = await supabase
      .from('retailers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateRetailer(id: string, data: Partial<CreateRetailerData>): Promise<Retailer> {
    const { data: result, error } = await supabase
      .from('retailers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async getApprovedRetailers(): Promise<Retailer[]> {
    const { data, error } = await supabase
      .from('retailers')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Listing CRUD operations
  static async createListing(data: CreateListingData): Promise<RetailerListing> {
    const { data: result, error } = await supabase
      .from('retailer_listings')
      .insert(data)
      .select(`
        *,
        retailer:retailers(*)
      `)
      .single();

    if (error) throw error;
    return result;
  }

  static async getRetailerListings(retailerId: string): Promise<RetailerListing[]> {
    const { data, error } = await supabase
      .from('retailer_listings')
      .select(`
        *,
        retailer:retailers(*)
      `)
      .eq('retailer_id', retailerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getListingsForPop(funkoPopId: string): Promise<RetailerListing[]> {
    const { data, error } = await supabase
      .from('retailer_listings')
      .select(`
        *,
        retailer:retailers(*)
      `)
      .eq('funko_pop_id', funkoPopId)
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateListing(id: string, data: Partial<CreateListingData>): Promise<RetailerListing> {
    const { data: result, error } = await supabase
      .from('retailer_listings')
      .update({ ...data, last_updated: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        retailer:retailers(*)
      `)
      .single();

    if (error) throw error;
    return result;
  }

  static async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('retailer_listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Review operations
  static async createReview(data: {
    retailer_id: string;
    rating: number;
    review_text?: string;
    listing_id?: string;
  }): Promise<RetailerReview> {
    const { data: result, error } = await supabase
      .from('retailer_reviews')
      .insert({
        ...data,
        reviewer_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async getRetailerReviews(retailerId: string): Promise<RetailerReview[]> {
    const { data, error } = await supabase
      .from('retailer_reviews')
      .select(`
        *,
        reviewer:profiles(full_name, avatar_url)
      `)
      .eq('retailer_id', retailerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Contact operations
  static async createContact(data: CreateContactData): Promise<RetailerContact> {
    const { data: result, error } = await supabase
      .from('retailer_contacts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async getRetailerContacts(retailerId: string): Promise<RetailerContact[]> {
    const { data, error } = await supabase
      .from('retailer_contacts')
      .select('*')
      .eq('retailer_id', retailerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateContactStatus(id: string, status: 'new' | 'replied' | 'resolved'): Promise<void> {
    const { error } = await supabase
      .from('retailer_contacts')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  // Search and filter operations
  static async searchRetailers(query: string): Promise<Retailer[]> {
    const { data, error } = await supabase
      .from('retailers')
      .select('*')
      .eq('status', 'approved')
      .or(`business_name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getRetailersByLocation(city?: string, country?: string): Promise<Retailer[]> {
    let query = supabase
      .from('retailers')
      .select('*')
      .eq('status', 'approved');

    if (city) {
      query = query.eq('city', city);
    }
    
    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility functions
  static async isUserRetailer(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('retailers')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    return !!data;
  }

  static async getRetailerStats(retailerId: string): Promise<{
    totalListings: number;
    activeListings: number;
    averagePrice: number;
    totalContacts: number;
  }> {
    const [listingsResult, contactsResult] = await Promise.all([
      supabase
        .from('retailer_listings')
        .select('status, price')
        .eq('retailer_id', retailerId),
      supabase
        .from('retailer_contacts')
        .select('id')
        .eq('retailer_id', retailerId)
    ]);

    const listings = listingsResult.data || [];
    const contacts = contactsResult.data || [];

    return {
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'active').length,
      averagePrice: listings.length > 0 
        ? listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length 
        : 0,
      totalContacts: contacts.length
    };
  }
} 