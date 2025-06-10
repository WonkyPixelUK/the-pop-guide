-- Create retailer system for PopGuide

-- Create enums for retailer system
CREATE TYPE retailer_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'reserved', 'inactive');
CREATE TYPE business_type AS ENUM ('online_only', 'physical_store', 'both');

-- Create retailers table
CREATE TABLE retailers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type business_type NOT NULL DEFAULT 'online_only',
  description TEXT,
  website_url TEXT,
  phone_number TEXT,
  email TEXT,
  physical_address TEXT,
  city TEXT,
  state_region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'UK',
  logo_url TEXT,
  banner_url TEXT,
  social_media JSONB DEFAULT '{}', -- Store social media links
  business_hours JSONB DEFAULT '{}', -- Store opening hours
  status retailer_status DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0, -- Average rating
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retailer_listings table
CREATE TABLE retailer_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  funko_pop_id TEXT NOT NULL, -- Reference to funko_pops.id
  price DECIMAL(10,2) NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Mint',
  quantity_available INTEGER DEFAULT 1,
  status listing_status DEFAULT 'active',
  description TEXT,
  custom_images TEXT[], -- Retailer's own photos
  how_to_buy TEXT, -- Instructions for purchasing
  shipping_info TEXT,
  is_in_store_only BOOLEAN DEFAULT FALSE,
  is_negotiable BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  
  -- Ensure unique active listing per retailer per funko
  UNIQUE(retailer_id, funko_pop_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create retailer_reviews table
CREATE TABLE retailer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  purchase_verified BOOLEAN DEFAULT FALSE,
  listing_id UUID REFERENCES retailer_listings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent multiple reviews from same user for same retailer
  UNIQUE(retailer_id, reviewer_id)
);

-- Create retailer_contacts table for inquiries
CREATE TABLE retailer_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES retailer_listings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  phone_number TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either user_id or guest contact info
  CONSTRAINT valid_contact CHECK (
    (user_id IS NOT NULL) OR 
    (guest_email IS NOT NULL AND guest_name IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_retailers_user_id ON retailers(user_id);
CREATE INDEX idx_retailers_status ON retailers(status);
CREATE INDEX idx_retailers_verified ON retailers(verified);
CREATE INDEX idx_retailers_city ON retailers(city);
CREATE INDEX idx_retailers_country ON retailers(country);
CREATE INDEX idx_retailers_business_type ON retailers(business_type);
CREATE INDEX idx_retailers_rating ON retailers(rating DESC);

CREATE INDEX idx_retailer_listings_retailer_id ON retailer_listings(retailer_id);
CREATE INDEX idx_retailer_listings_funko_pop_id ON retailer_listings(funko_pop_id);
CREATE INDEX idx_retailer_listings_status ON retailer_listings(status);
CREATE INDEX idx_retailer_listings_price ON retailer_listings(price);
CREATE INDEX idx_retailer_listings_condition ON retailer_listings(condition);
CREATE INDEX idx_retailer_listings_created_at ON retailer_listings(created_at DESC);
CREATE INDEX idx_retailer_listings_active_funko ON retailer_listings(funko_pop_id, status) WHERE status = 'active';

CREATE INDEX idx_retailer_reviews_retailer_id ON retailer_reviews(retailer_id);
CREATE INDEX idx_retailer_reviews_reviewer_id ON retailer_reviews(reviewer_id);
CREATE INDEX idx_retailer_reviews_rating ON retailer_reviews(rating);
CREATE INDEX idx_retailer_reviews_created_at ON retailer_reviews(created_at DESC);

CREATE INDEX idx_retailer_contacts_retailer_id ON retailer_contacts(retailer_id);
CREATE INDEX idx_retailer_contacts_status ON retailer_contacts(status);
CREATE INDEX idx_retailer_contacts_created_at ON retailer_contacts(created_at DESC);

-- Enable RLS
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailers table
CREATE POLICY "Anyone can view approved retailers" ON retailers
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own retailer profile" ON retailers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retailer profile" ON retailers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retailer profile" ON retailers
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for retailer_listings table
CREATE POLICY "Anyone can view active listings from approved retailers" ON retailer_listings
  FOR SELECT USING (
    status = 'active' AND 
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND status = 'approved'
    )
  );

CREATE POLICY "Retailers can view their own listings" ON retailer_listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can create their own listings" ON retailer_listings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Retailers can update their own listings" ON retailer_listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can delete their own listings" ON retailer_listings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for retailer_reviews table
CREATE POLICY "Anyone can view reviews for approved retailers" ON retailer_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND status = 'approved'
    )
  );

CREATE POLICY "Users can create reviews" ON retailer_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON retailer_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON retailer_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- RLS Policies for retailer_contacts table
CREATE POLICY "Retailers can view messages sent to them" ON retailer_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE id = retailer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own sent messages" ON retailer_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create contact messages" ON retailer_contacts
  FOR INSERT WITH CHECK (true);

-- Functions to update retailer statistics
CREATE OR REPLACE FUNCTION update_retailer_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update retailer rating and review count
  UPDATE retailers SET
    rating = (
      SELECT COALESCE(AVG(rating), 5.0)
      FROM retailer_reviews 
      WHERE retailer_id = COALESCE(NEW.retailer_id, OLD.retailer_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM retailer_reviews 
      WHERE retailer_id = COALESCE(NEW.retailer_id, OLD.retailer_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.retailer_id, OLD.retailer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update retailer rating when reviews change
CREATE TRIGGER trigger_update_retailer_rating
  AFTER INSERT OR UPDATE OR DELETE ON retailer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_retailer_rating();

-- Function to update last_active for retailers
CREATE OR REPLACE FUNCTION update_retailer_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE retailers SET
    last_active = NOW(),
    updated_at = NOW()
  WHERE id = NEW.retailer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active when listings are modified
CREATE TRIGGER trigger_update_retailer_last_active
  AFTER INSERT OR UPDATE ON retailer_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_retailer_last_active();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON retailers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON retailer_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON retailer_reviews TO authenticated;
GRANT SELECT, INSERT ON retailer_contacts TO authenticated; 