-- Migration: Enhanced Funko Collections Support
-- Add all required fields for comprehensive Funko Pop database and collection tracking

-- First, add extended fields to funko_pops table
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS upc_a TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS ean_13 TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS amazon_asin TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS country_of_registration TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Funko';
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS model_number TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS product_dimensions TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS last_scanned TIMESTAMP WITH TIME ZONE;

-- Add database classification fields if they don't exist
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'In Stock';
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Pop!';
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS fandom TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS edition TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS variant TEXT;

-- Add collection tracking fields to user_collections table
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS last_value_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS last_value_change DECIMAL(10,2);
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS acquisition_method TEXT DEFAULT 'manual_entry';

-- Create indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_funko_pops_upc_a ON funko_pops(upc_a);
CREATE INDEX IF NOT EXISTS idx_funko_pops_ean_13 ON funko_pops(ean_13);
CREATE INDEX IF NOT EXISTS idx_funko_pops_amazon_asin ON funko_pops(amazon_asin);
CREATE INDEX IF NOT EXISTS idx_funko_pops_brand ON funko_pops(brand);
CREATE INDEX IF NOT EXISTS idx_funko_pops_status ON funko_pops(status);
CREATE INDEX IF NOT EXISTS idx_funko_pops_category ON funko_pops(category);
CREATE INDEX IF NOT EXISTS idx_funko_pops_fandom ON funko_pops(fandom);
CREATE INDEX IF NOT EXISTS idx_funko_pops_genre ON funko_pops(genre);
CREATE INDEX IF NOT EXISTS idx_funko_pops_edition ON funko_pops(edition);
CREATE INDEX IF NOT EXISTS idx_funko_pops_last_scanned ON funko_pops(last_scanned);
CREATE INDEX IF NOT EXISTS idx_user_collections_purchase_date ON user_collections(purchase_date);

-- Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_funko_pops_category_status ON funko_pops(category, status);
CREATE INDEX IF NOT EXISTS idx_funko_pops_fandom_category ON funko_pops(fandom, category);
CREATE INDEX IF NOT EXISTS idx_funko_pops_is_exclusive_category ON funko_pops(is_exclusive, category);

-- Create storage buckets for images if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-images', 'profile-images', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Ensure funko-images bucket exists with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('funko-images', 'funko-images', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/*'];

-- Storage policies for profile-images bucket
CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for funko-images bucket (ensure they exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view funko images' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view funko images" ON storage.objects
    FOR SELECT USING (bucket_id = 'funko-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload funko images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload funko images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'funko-images' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own funko images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update their own funko images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own funko images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete their own funko images" ON storage.objects
    FOR DELETE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Update existing funko_pops to have default values for new required fields
UPDATE funko_pops SET 
  brand = 'Funko' WHERE brand IS NULL,
  status = 'In Stock' WHERE status IS NULL,
  category = 'Pop!' WHERE category IS NULL,
  last_scanned = NOW() WHERE last_scanned IS NULL;

-- Function to check and update contributor stats after manual additions
CREATE OR REPLACE FUNCTION handle_manual_funko_addition()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contributor stats when a new funko is added manually
  IF NEW.created_at IS NOT NULL AND (OLD IS NULL OR OLD.created_at IS NULL) THEN
    -- This is a new manual addition, not an update
    INSERT INTO contributor_stats (user_id, total_submissions, approved_submissions, first_submission_at, last_submission_at, contribution_score)
    VALUES (
      auth.uid(),
      1,
      1, -- Manual additions are automatically approved
      NOW(),
      NOW(),
      10 -- Approved submission score
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_submissions = contributor_stats.total_submissions + 1,
      approved_submissions = contributor_stats.approved_submissions + 1,
      last_submission_at = NOW(),
      contribution_score = contributor_stats.contribution_score + 10,
      updated_at = NOW();
      
    -- Check for free month reward (75+ approved submissions)
    PERFORM update_contributor_rewards(auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic contributor tracking
DROP TRIGGER IF EXISTS trigger_manual_funko_addition ON funko_pops;
CREATE TRIGGER trigger_manual_funko_addition
  AFTER INSERT ON funko_pops
  FOR EACH ROW
  EXECUTE FUNCTION handle_manual_funko_addition();

-- Function to track collection value changes
CREATE OR REPLACE FUNCTION update_collection_item_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the collection item's value tracking when estimated_value changes
  IF NEW.estimated_value IS DISTINCT FROM OLD.estimated_value THEN
    UPDATE user_collections SET
      last_value_change = COALESCE(NEW.estimated_value, 0) - COALESCE(OLD.estimated_value, 0),
      last_value_updated = NOW()
    WHERE funko_pop_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for collection value tracking
DROP TRIGGER IF EXISTS trigger_collection_value_update ON funko_pops;
CREATE TRIGGER trigger_collection_value_update
  AFTER UPDATE ON funko_pops
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_item_value();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON funko_pops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_collections TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN funko_pops.upc_a IS 'Universal Product Code (UPC-A format)';
COMMENT ON COLUMN funko_pops.ean_13 IS 'European Article Number (EAN-13 format)';
COMMENT ON COLUMN funko_pops.amazon_asin IS 'Amazon Standard Identification Number';
COMMENT ON COLUMN funko_pops.country_of_registration IS 'Country where the product was registered';
COMMENT ON COLUMN funko_pops.brand IS 'Brand name (default: Funko)';
COMMENT ON COLUMN funko_pops.model_number IS 'Manufacturer model number';
COMMENT ON COLUMN funko_pops.size IS 'Physical size category';
COMMENT ON COLUMN funko_pops.color IS 'Primary color(s) of the figure';
COMMENT ON COLUMN funko_pops.weight IS 'Product weight';
COMMENT ON COLUMN funko_pops.product_dimensions IS 'Physical dimensions of the product';
COMMENT ON COLUMN funko_pops.last_scanned IS 'Last time this item was scanned via barcode';
COMMENT ON COLUMN funko_pops.status IS 'Current availability status';
COMMENT ON COLUMN funko_pops.category IS 'Product category (Pop!, Bitty Pop!, etc.)';
COMMENT ON COLUMN funko_pops.fandom IS 'Franchise or fandom classification';
COMMENT ON COLUMN funko_pops.genre IS 'Genre classification';
COMMENT ON COLUMN funko_pops.edition IS 'Special edition type';
COMMENT ON COLUMN funko_pops.variant IS 'Variant description';

COMMENT ON COLUMN user_collections.purchase_date IS 'Date when the item was purchased';
COMMENT ON COLUMN user_collections.last_value_updated IS 'Last time the estimated value was updated';
COMMENT ON COLUMN user_collections.last_value_change IS 'Change in value since last update';
COMMENT ON COLUMN user_collections.acquisition_method IS 'How the item was added to collection';

COMMENT ON FUNCTION handle_manual_funko_addition IS 'Tracks contributor stats for manually added Funko Pops';
COMMENT ON FUNCTION update_collection_item_value IS 'Updates collection value tracking when Funko Pop values change'; 