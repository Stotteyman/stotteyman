// Media handling utilities for the portfolio

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  description?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface OptimizedMediaOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

/**
 * Optimize image for web display
 */
export function optimizeImage(
  file: File,
  options: OptimizedMediaOptions = {}
): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create optimized image'));
            return;
          }

          const url = URL.createObjectURL(blob);
          
          resolve({
            id: generateId(),
            name: file.name,
            type: 'image',
            url,
            alt: file.name,
            size: blob.size,
            dimensions: { width, height }
          });
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create thumbnail for video
 */
export function createVideoThumbnail(file: File): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      // Seek to 10% of video duration for thumbnail
      video.currentTime = video.duration * 0.1;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create video thumbnail'));
          return;
        }

        const url = URL.createObjectURL(blob);
        
        resolve({
          id: generateId(),
          name: file.name,
          type: 'video',
          url: URL.createObjectURL(file),
          thumbnail: url,
          alt: file.name,
          size: file.size,
          dimensions: {
            width: video.videoWidth,
            height: video.videoHeight
          }
        });
      }, 'image/jpeg', 0.7);
    };

    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
    video.load();
  });
}

/**
 * Handle file upload and optimization
 */
export async function processMediaFile(file: File): Promise<MediaFile> {
  const maxSize = 50 * 1024 * 1024; // 50MB limit
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

  if (validImageTypes.includes(file.type)) {
    return optimizeImage(file);
  } else if (validVideoTypes.includes(file.type)) {
    return createVideoThumbnail(file);
  } else {
    throw new Error('Unsupported file type');
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isSupportedMediaType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  
  return validTypes.includes(file.type);
}

/**
 * Get media type category
 */
export function getMediaCategory(type: string): 'image' | 'video' | 'other' {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'other';
}
