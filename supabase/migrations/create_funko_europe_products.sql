-- Create funko_europe_products table
CREATE TABLE IF NOT EXISTS funko_europe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  item_number TEXT,
  category TEXT,
  license TEXT,
  characters TEXT[],
  product_type TEXT,
  price_current DECIMAL(10,2),
  price_original DECIMAL(10,2),
  currency TEXT DEFAULT 'GBP',
  images TEXT[],
  url TEXT UNIQUE NOT NULL,
  availability TEXT,
  description TEXT,
  exclusivity TEXT,
  deal TEXT,
  collection TEXT, -- 'whats-new', 'coming-soon', etc.
  last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scraped_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_item_number ON funko_europe_products(item_number);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_category ON funko_europe_products(category);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_license ON funko_europe_products(license);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_collection ON funko_europe_products(collection);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_availability ON funko_europe_products(availability);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_last_scraped ON funko_europe_products(last_scraped);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_price_current ON funko_europe_products(price_current);
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_created_at ON funko_europe_products(created_at);

-- Create a compound index for filtering by collection and availability
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_collection_availability ON funko_europe_products(collection, availability);

-- Create a GIN index for searching in characters array
CREATE INDEX IF NOT EXISTS idx_funko_europe_products_characters_gin ON funko_europe_products USING GIN(characters);

-- Add RLS policies
ALTER TABLE funko_europe_products ENABLE ROW LEVEL SECURITY;

-- Policy: All users can view Funko Europe products (public read access)
CREATE POLICY "Anyone can view funko europe products" ON funko_europe_products
  FOR SELECT USING (true);

-- Policy: Only service role can insert/update products (for scrapers)
CREATE POLICY "Service role can manage funko europe products" ON funko_europe_products
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_funko_europe_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_funko_europe_products_updated_at
  BEFORE UPDATE ON funko_europe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_funko_europe_products_updated_at();

-- Add comments for documentation
COMMENT ON TABLE funko_europe_products IS 'Stores scraped Funko Europe product data';
COMMENT ON COLUMN funko_europe_products.item_number IS 'Funko item number/SKU';
COMMENT ON COLUMN funko_europe_products.characters IS 'Array of character names associated with the product';
COMMENT ON COLUMN funko_europe_products.collection IS 'Which collection this product was scraped from (whats-new, coming-soon)';
COMMENT ON COLUMN funko_europe_products.scraped_count IS 'Number of times this product has been scraped (for analytics)';
COMMENT ON COLUMN funko_europe_products.last_scraped IS 'Last time this product was successfully scraped'; 