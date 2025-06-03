-- Create coming_soon_releases table
CREATE TABLE coming_soon_releases (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  price TEXT,
  type TEXT,
  category TEXT,
  description TEXT,
  release_date DATE,
  is_exclusive BOOLEAN DEFAULT false,
  image_url TEXT,
  notify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for Funko images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('funko-images', 'funko-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE coming_soon_releases ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read coming soon releases
CREATE POLICY "Anyone can view coming soon releases" ON coming_soon_releases
FOR SELECT USING (true);

-- Policy to allow authenticated users to insert releases
CREATE POLICY "Authenticated users can add releases" ON coming_soon_releases
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow users to update their own releases
CREATE POLICY "Users can update their own releases" ON coming_soon_releases
FOR UPDATE USING (auth.uid() = created_by);

-- Policy to allow users to delete their own releases
CREATE POLICY "Users can delete their own releases" ON coming_soon_releases
FOR DELETE USING (auth.uid() = created_by);

-- Storage policies for funko-images bucket
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'funko-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'funko-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coming_soon_releases_updated_at 
    BEFORE UPDATE ON coming_soon_releases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 