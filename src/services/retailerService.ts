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
    try {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist, return null
        if (error.message?.includes('relation') || error.code === '42P01') {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting retailer by user ID:', error);
      return null;
    }
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
    try {
      const { data, error } = await supabase
        .from('retailer_listings')
        .select(`
          *,
          retailer:retailers(*)
        `)
        .eq('retailer_id', retailerId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.message?.includes('relation') || error.code === '42P01') {
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error getting retailer listings:', error);
      return [];
    }
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
    try {
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
    } catch (error) {
      console.error('Error getting retailer stats:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        averagePrice: 0,
        totalContacts: 0
      };
    }
  }

  // Retailer User Management
  static async upgradeToRetailer(userId: string, subscriptionData: {
    status: 'pending' | 'active';
    expires_at?: string;
  }): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_retailer: true,
          retailer_subscription_status: subscriptionData.status,
          retailer_subscription_expires_at: subscriptionData.expires_at
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // If columns don't exist, silently fail for now
        if (error.message?.includes('column') || error.code === '42703') {
          console.log('Retailer columns not yet available in database');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error upgrading to retailer:', error);
      // Don't throw error to prevent UI breakage
    }
  }

  static async checkRetailerStatus(userId: string): Promise<{
    is_retailer?: boolean;
    retailer_subscription_status?: string;
    retailer_subscription_expires_at?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_retailer, retailer_subscription_status, retailer_subscription_expires_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If the columns don't exist yet, return default values
        if (error.message?.includes('column') || error.code === '42703') {
          return {
            is_retailer: false,
            retailer_subscription_status: 'none',
            retailer_subscription_expires_at: undefined
          };
        }
        throw error;
      }
      
      // Check if subscription is expired
      if (data.retailer_subscription_expires_at) {
        const now = new Date();
        const expiresAt = new Date(data.retailer_subscription_expires_at);
        if (now > expiresAt && data.retailer_subscription_status === 'active') {
          // Update status to expired
          await supabase
            .from('profiles')
            .update({ retailer_subscription_status: 'expired' })
            .eq('user_id', userId);
          
          return {
            ...data,
            retailer_subscription_status: 'expired'
          };
        }
      }
      
      return data || {
        is_retailer: false,
        retailer_subscription_status: 'none',
        retailer_subscription_expires_at: undefined
      };
    } catch (error) {
      console.error('Error checking retailer status:', error);
      return {
        is_retailer: false,
        retailer_subscription_status: 'none',
        retailer_subscription_expires_at: undefined
      };
    }
  }

  static async updateRetailerSubscription(userId: string, subscriptionData: {
    status: 'pending' | 'active' | 'expired' | 'cancelled';
    expires_at?: string;
  }): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        retailer_subscription_status: subscriptionData.status,
        retailer_subscription_expires_at: subscriptionData.expires_at
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
  }
} 