export type RetailerStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type ListingStatus = 'active' | 'sold' | 'reserved' | 'inactive';
export type BusinessType = 'online_only' | 'physical_store' | 'both';

export interface Retailer {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  description?: string;
  website_url?: string;
  phone_number?: string;
  email?: string;
  physical_address?: string;
  city?: string;
  state_region?: string;
  postal_code?: string;
  country: string;
  logo_url?: string;
  banner_url?: string;
  social_media?: Record<string, string>;
  business_hours?: Record<string, any>;
  status: RetailerStatus;
  verified: boolean;
  rating: number;
  total_reviews: number;
  total_sales: number;
  member_since: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface RetailerListing {
  id: string;
  retailer_id: string;
  funko_pop_id: string;
  price: number;
  condition: string;
  quantity_available: number;
  status: ListingStatus;
  description?: string;
  custom_images?: string[];
  how_to_buy?: string;
  shipping_info?: string;
  is_in_store_only: boolean;
  is_negotiable: boolean;
  last_updated: string;
  created_at: string;
  expires_at?: string;
  
  // Joined data
  retailer?: Retailer;
  funko_pop?: any; // Will be typed based on funko_pops structure
}

export interface RetailerReview {
  id: string;
  retailer_id: string;
  reviewer_id: string;
  rating: number;
  review_text?: string;
  purchase_verified: boolean;
  listing_id?: string;
  created_at: string;
  
  // Joined data
  reviewer?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface RetailerContact {
  id: string;
  retailer_id: string;
  listing_id?: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  subject: string;
  message: string;
  phone_number?: string;
  preferred_contact_method: string;
  status: 'new' | 'replied' | 'resolved';
  created_at: string;
}

export interface CreateRetailerData {
  business_name: string;
  business_type: BusinessType;
  description?: string;
  website_url?: string;
  phone_number?: string;
  email?: string;
  physical_address?: string;
  city?: string;
  state_region?: string;
  postal_code?: string;
  country?: string;
  logo_url?: string;
  banner_url?: string;
  social_media?: Record<string, string>;
  business_hours?: Record<string, any>;
}

export interface CreateListingData {
  retailer_id: string;
  funko_pop_id: string;
  price: number;
  condition: string;
  quantity_available?: number;
  description?: string;
  custom_images?: string[];
  how_to_buy?: string;
  shipping_info?: string;
  is_in_store_only?: boolean;
  is_negotiable?: boolean;
  expires_at?: string;
}

export interface CreateContactData {
  retailer_id: string;
  listing_id?: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  subject: string;
  message: string;
  phone_number?: string;
  preferred_contact_method?: string;
} 