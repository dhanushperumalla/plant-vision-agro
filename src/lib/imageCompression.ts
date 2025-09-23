/**
 * Image compression utility to reduce file sizes before upload
 * Compresses images to under 1MB while maintaining reasonable quality
 */

export interface CompressionOptions {
  maxSizeKB?: number; // Maximum file size in KB (default: 1024 = 1MB)
  maxWidth?: number;   // Maximum width in pixels (default: 1920)
  maxHeight?: number;  // Maximum height in pixels (default: 1080)
  quality?: number;    // JPEG quality 0-1 (default: 0.8)
}

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSizeKB = 1024, // 1MB
    maxWidth = 1920,
    maxHeight = 1080, 
    quality = 0.8
  } = options;

  // If file is already small enough, return as-is
  if (file.size <= maxSizeKB * 1024) {
    console.log(`Image already optimized: ${(file.size / 1024).toFixed(1)}KB`);
    return file;
  }

  console.log(`Compressing image from ${(file.size / 1024).toFixed(1)}KB to under ${maxSizeKB}KB`);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      // Start with the specified quality and reduce if needed
      let currentQuality = quality;
      
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If still too large and we can reduce quality further, try again
            if (blob.size > maxSizeKB * 1024 && currentQuality > 0.1) {
              currentQuality -= 0.1;
              console.log(`Image still ${(blob.size / 1024).toFixed(1)}KB, reducing quality to ${currentQuality.toFixed(1)}`);
              tryCompress();
              return;
            }

            // Create a new File from the blob
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: 'image/jpeg',
                lastModified: Date.now() 
              }
            );

            console.log(`Image compressed successfully: ${(blob.size / 1024).toFixed(1)}KB (${((1 - blob.size / file.size) * 100).toFixed(1)}% reduction)`);
            resolve(compressedFile);
          },
          'image/jpeg',
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Convert file to data URL for the image element
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file for compression'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Get human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};