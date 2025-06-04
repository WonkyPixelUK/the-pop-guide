-- Supabase Storage RLS Policies
-- Copy and paste this into your Supabase SQL Editor to fix upload errors

-- Enable RLS on storage.objects table (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload funko images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view funko images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their funko images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their funko images" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their profile images" ON storage.objects;

-- FUNKO IMAGES BUCKET POLICIES
-- Allow authenticated users to upload funko images
CREATE POLICY "Users can upload funko images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'funko-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow everyone to view funko images (public bucket)
CREATE POLICY "Users can view funko images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'funko-images');

-- Allow users to delete their own funko images
CREATE POLICY "Users can delete their funko images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'funko-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own funko images
CREATE POLICY "Users can update their funko images" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'funko-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'funko-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- PROFILE IMAGES BUCKET POLICIES
-- Allow authenticated users to upload profile images
CREATE POLICY "Users can upload profile images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'profile-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow everyone to view profile images (public bucket)
CREATE POLICY "Users can view profile images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'profile-images');

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their profile images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own profile images
CREATE POLICY "Users can update their profile images" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'profile-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 