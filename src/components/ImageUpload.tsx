import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  bucket: 'funko-images' | 'profile-images';
  onUploadComplete?: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  width?: string;
  height?: string;
  preview?: boolean;
}

const ImageUpload = ({
  bucket,
  onUploadComplete,
  currentImageUrl,
  label = 'Upload Image',
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  width = 'w-full',
  height = 'h-40',
  preview = true
}: ImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return false;
    }

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      toast({
        title: 'File too large',
        description: `Image must be smaller than ${sizeMB}MB`,
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload images',
        variant: 'destructive'
      });
      return null;
    }

    if (!validateFile(file)) return null;

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);
      onUploadComplete?.(publicUrl);

      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded successfully',
        variant: 'default'
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const clearImage = () => {
    setPreviewUrl('');
    onUploadComplete?.('');
  };

  return (
    <div className={className}>
      {label && <Label className="text-white mb-2 block">{label}</Label>}
      
      <div
        className={`relative ${width} ${height} border-2 border-dashed rounded-lg transition-all
          ${dragActive ? 'border-orange-400 bg-orange-400/10' : 'border-gray-700 hover:border-orange-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${bucket}`}
          disabled={uploading}
        />
        
        <label
          htmlFor={`image-upload-${bucket}`}
          className="flex items-center justify-center w-full h-full cursor-pointer"
        >
          {preview && previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearImage();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 animate-pulse mb-2" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept.replace('image/', '').toUpperCase()} up to {Math.round(maxSize / (1024 * 1024))}MB
                  </p>
                </div>
              )}
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default ImageUpload; 