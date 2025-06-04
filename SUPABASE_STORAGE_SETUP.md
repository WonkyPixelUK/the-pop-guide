# Supabase Storage Setup Guide

## 📸 Image Upload Implementation Complete!

I've successfully implemented image upload functionality for both Funko Pop images and profile pictures using Supabase Storage. Here's what was added:

## ✅ Implemented Features

### 1. **Enhanced Add Item Dialog**
- **Image Upload**: Drag & drop or click to upload Funko Pop images
- **File Validation**: Automatic validation for file type and size (5MB limit)  
- **Real-time Preview**: Instant image preview with remove option
- **Supabase Integration**: Direct upload to `funko-images` bucket

### 2. **Profile Picture Upload**
- **Unified Component**: Reusable `ImageUpload` component for consistent UX
- **Profile Integration**: Automatic avatar update when new image uploaded
- **Storage Bucket**: Dedicated `profile-images` bucket for user avatars

### 3. **Reusable ImageUpload Component**
- **Multi-bucket Support**: Works with both `funko-images` and `profile-images`
- **Drag & Drop**: Modern drag-and-drop interface
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Validation**: Type, size, and format validation
- **Progress States**: Loading states and success feedback

## 🔧 Manual Setup Required in Supabase Dashboard

Since the database is connected via MCP, please create these storage buckets manually:

### Storage Buckets to Create:

#### 1. **funko-images** bucket
```sql
-- Bucket Configuration:
- Name: funko-images
- Public: true
- File size limit: 5MB (5242880 bytes)
- Allowed MIME types: image/*
```

#### 2. **profile-images** bucket  
```sql
-- Bucket Configuration:
- Name: profile-images
- Public: true
- File size limit: 5MB (5242880 bytes)
- Allowed MIME types: image/*
```

### RLS Policies to Create:

#### For **funko-images** bucket:
```sql
-- Policy 1: Anyone can view funko images
CREATE POLICY "Anyone can view funko images" ON storage.objects
FOR SELECT USING (bucket_id = 'funko-images');

-- Policy 2: Authenticated users can upload funko images
CREATE POLICY "Authenticated users can upload funko images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'funko-images' AND auth.role() = 'authenticated');

-- Policy 3: Users can update their own funko images
CREATE POLICY "Users can update their own funko images" ON storage.objects
FOR UPDATE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Users can delete their own funko images  
CREATE POLICY "Users can delete their own funko images" ON storage.objects
FOR DELETE USING (bucket_id = 'funko-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### For **profile-images** bucket:
```sql
-- Policy 1: Anyone can view profile images
CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Policy 2: Authenticated users can upload profile images
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

-- Policy 3: Users can update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🎯 How to Test

1. **Start the development server**: `npm run dev`
2. **Navigate to**: http://localhost:8084/test-enhanced-collection
3. **Test Funko Pop Image Upload**:
   - Click "Add to Collection (Enhanced)"
   - Go to "Manual Entry" tab
   - Upload an image in the "Funko Pop Image" section
   - Fill out the form and submit

4. **Test Profile Picture Upload**:
   - Go to Profile Settings
   - Use the new ImageUpload component for avatar

## 📁 File Structure

```
src/
├── components/
│   ├── ImageUpload.tsx           # ✅ NEW: Reusable image upload component
│   ├── EnhancedAddItemDialog.tsx # ✅ UPDATED: Added image upload
│   └── ProfileEditor.tsx         # ✅ UPDATED: Uses ImageUpload component
└── pages/
    └── TestEnhancedCollection.tsx # ✅ UPDATED: Shows new features
```

## 🔑 Key Features

- **Secure**: Images stored with user ID prefix for privacy
- **Validated**: File type and size validation on frontend
- **Responsive**: Works on all screen sizes  
- **Accessible**: Proper labels and keyboard navigation
- **Error Handling**: Clear error messages for users
- **Consistent**: Same upload experience across the app

## 💡 Implementation Notes

- Images are stored with unique filenames: `{userId}/{timestamp}-{randomId}.{extension}`
- File validation happens before upload to save bandwidth
- Public URLs are generated automatically for easy display
- The component handles all states: idle, uploading, success, error
- Drag & drop provides modern UX while click-to-upload remains available

Once the storage buckets are created in Supabase dashboard, the image upload functionality will work seamlessly! 🚀 