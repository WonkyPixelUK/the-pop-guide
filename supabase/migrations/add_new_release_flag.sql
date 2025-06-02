-- Add is_new_release column to funko_pops table
-- This will track products that are considered "new releases" from sources like Funko Europe

ALTER TABLE funko_pops 
ADD COLUMN IF NOT EXISTS is_new_release BOOLEAN DEFAULT FALSE;

-- Create index for better query performance on new releases filter
CREATE INDEX IF NOT EXISTS idx_funko_pops_is_new_release ON funko_pops(is_new_release);

-- Create a compound index for filtering new releases with other common filters
CREATE INDEX IF NOT EXISTS idx_funko_pops_new_release_series ON funko_pops(is_new_release, series);
CREATE INDEX IF NOT EXISTS idx_funko_pops_new_release_created ON funko_pops(is_new_release, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN funko_pops.is_new_release IS 'Indicates if this Funko Pop is considered a new release (from Funko Europe, latest drops, etc.)';

-- Optional: Update existing products from Funko Europe to be marked as new releases
-- UPDATE funko_pops 
-- SET is_new_release = TRUE 
-- WHERE 'Funko Europe' = ANY(data_sources); 