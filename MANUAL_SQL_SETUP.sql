-- Manual SQL Setup for Enhanced Funko Collections
-- Copy and paste this entire script into your Supabase SQL Editor

-- Step 1: Add extended fields to funko_pops table
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

-- Add support for multiple images
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]';

-- Step 2: Add database classification fields if they don't exist
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'In Stock';
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Pop!';
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS fandom TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS edition TEXT;
ALTER TABLE funko_pops ADD COLUMN IF NOT EXISTS variant TEXT;

-- Step 3: Add collection tracking fields to user_collections table
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS last_value_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS last_value_change DECIMAL(10,2);
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS acquisition_method TEXT DEFAULT 'manual_entry';

-- Step 4: Create indexes for better query performance
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

-- Step 5: Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_funko_pops_category_status ON funko_pops(category, status);
CREATE INDEX IF NOT EXISTS idx_funko_pops_fandom_category ON funko_pops(fandom, category);
CREATE INDEX IF NOT EXISTS idx_funko_pops_is_exclusive_category ON funko_pops(is_exclusive, category);

-- Step 6: Update existing funko_pops to have default values for new required fields
UPDATE funko_pops SET 
  brand = 'Funko' WHERE brand IS NULL,
  status = 'In Stock' WHERE status IS NULL,
  category = 'Pop!' WHERE category IS NULL,
  last_scanned = NOW() WHERE last_scanned IS NULL;

-- Step 7: Create contributor_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS contributor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_submissions INTEGER DEFAULT 0,
  approved_submissions INTEGER DEFAULT 0,
  rejected_submissions INTEGER DEFAULT 0,
  pending_submissions INTEGER DEFAULT 0,
  first_submission_at TIMESTAMP WITH TIME ZONE,
  last_submission_at TIMESTAMP WITH TIME ZONE,
  contribution_score INTEGER DEFAULT 0,
  rewards_earned TEXT[],
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 8: Create RLS policies for contributor_stats
ALTER TABLE contributor_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributor stats" ON contributor_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributor stats" ON contributor_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert contributor stats" ON contributor_stats
  FOR INSERT WITH CHECK (true);

-- Step 9: Function to check and update contributor stats after manual additions
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger for automatic contributor tracking
DROP TRIGGER IF EXISTS trigger_manual_funko_addition ON funko_pops;
CREATE TRIGGER trigger_manual_funko_addition
  AFTER INSERT ON funko_pops
  FOR EACH ROW
  EXECUTE FUNCTION handle_manual_funko_addition();

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON funko_pops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_collections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contributor_stats TO authenticated;

-- Step 12: Insert some sample data to test (optional)
-- INSERT INTO funko_pops (name, series, number, brand, status, category, upc_a, amazon_asin)
-- VALUES ('Test Pop', 'Test Series', '001', 'Funko', 'In Stock', 'Pop!', '123456789012', 'B08TEST123')
-- ON CONFLICT DO NOTHING;

-- All done! Your database is now ready for enhanced Funko Pop collections with image upload support.

-- TEMPORARY - DISABLE RLS FOR TESTING ONLY
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 