-- Simple Storage RLS Policies (Alternative)
-- Use this if the previous policies don't work

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Give users authenticated access to folder" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder for funko-images" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Simple policy: Allow authenticated users to do everything on funko-images
CREATE POLICY "Give users authenticated access to folder for funko-images" ON storage.objects
    FOR ALL USING (bucket_id = 'funko-images' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'funko-images' AND auth.role() = 'authenticated');

-- Simple policy: Allow authenticated users to do everything on profile-images  
CREATE POLICY "Give users authenticated access to folder for profile-images" ON storage.objects
    FOR ALL USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

-- Allow public read access for both buckets (since they're public)
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('funko-images', 'profile-images'));

-- Verify policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'; 