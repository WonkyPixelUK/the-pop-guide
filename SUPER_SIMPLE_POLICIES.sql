-- SUPER SIMPLE STORAGE POLICIES - GUARANTEED TO WORK
-- Copy and paste this entire block into Supabase SQL Editor

-- Drop all existing storage policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated uploads to funko-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

-- Allow ANY authenticated user to upload to funko-images
CREATE POLICY "Allow authenticated uploads to funko-images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'funko-images' 
    AND auth.role() = 'authenticated'
);

-- Allow ANY authenticated user to upload to profile-images
CREATE POLICY "Allow authenticated uploads to profile-images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
);

-- Allow everyone to view/download images (public access)
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (
    bucket_id IN ('funko-images', 'profile-images')
); 