import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, X, Upload, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  bucket: 'funko-images' | 'profile-images';
  onUploadComplete?: (urls: string[]) => void;
  currentImageUrls?: string[];
  label?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  width?: string;
  height?: string;
  multiple?: boolean;
  maxImages?: number;
}

const ImageUpload = ({
  bucket,
  onUploadComplete,
  currentImageUrls = [],
  label = 'Upload Images',
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  width = 'w-full',
  height = 'h-40',
  multiple = true,
  maxImages = 5
}: ImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(currentImageUrls);
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

  const uploadFiles = async (files: FileList): Promise<void> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload images',
        variant: 'destructive'
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, maxImages - imageUrls.length);
    
    if (filesToUpload.length === 0) {
      toast({
        title: 'Maximum images reached',
        description: `You can upload up to ${maxImages} images`,
        variant: 'destructive'
      });
      return;
    }

    if (filesToUpload.some(file => !validateFile(file))) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
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

        newUrls.push(urlData.publicUrl);
      }

      const updatedUrls = [...imageUrls, ...newUrls];
      setImageUrls(updatedUrls);
      onUploadComplete?.(updatedUrls);

      toast({
        title: 'Upload successful',
        description: `${newUrls.length} image(s) uploaded successfully`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
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
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(updatedUrls);
    onUploadComplete?.(updatedUrls);
  };

  const clearAllImages = () => {
    setImageUrls([]);
    onUploadComplete?.([]);
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <Label className="text-white">{label}</Label>
          {imageUrls.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllImages}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
      
      {/* Image Gallery */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-600"
              />
              <Button
                type="button"
                size="sm"
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(imageUrls.length < maxImages) && (
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
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${bucket}`}
            disabled={uploading}
          />
          
          <label
            htmlFor={`image-upload-${bucket}`}
            className="flex items-center justify-center w-full h-full cursor-pointer"
          >
            <div className="text-center text-gray-400">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 animate-pulse mb-2" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {imageUrls.length > 0 ? (
                    <Plus className="w-8 h-8 mb-2" />
                  ) : (
                    <Camera className="w-8 h-8 mb-2" />
                  )}
                  <p className="font-medium">
                    {imageUrls.length > 0 ? 'Add More Images' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept.replace('image/', '').toUpperCase()} up to {Math.round(maxSize / (1024 * 1024))}MB
                  </p>
                  <p className="text-xs text-gray-500">
                    {imageUrls.length}/{maxImages} images
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      {imageUrls.length >= maxImages && (
        <p className="text-sm text-gray-400 mt-2 text-center">
          Maximum of {maxImages} images reached
        </p>
      )}
    </div>
  );
};

export default ImageUpload; 