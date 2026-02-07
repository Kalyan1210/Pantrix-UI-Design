// Camera utility functions with Capacitor support
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Maximum image size in KB for API calls
const MAX_IMAGE_SIZE_KB = 1024; // 1MB max
const TARGET_WIDTH = 1200; // Target width for resized images

/**
 * Request camera permission
 * Uses Capacitor on native, falls back to browser API on web
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (isNative) {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }
  
  // Web fallback
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

/**
 * Compress base64 image to target size
 */
async function compressBase64Image(base64: string, maxSizeKB: number = MAX_IMAGE_SIZE_KB): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Scale down if image is too large
      if (width > TARGET_WIDTH) {
        const ratio = TARGET_WIDTH / width;
        width = TARGET_WIDTH;
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with quality 0.7 and reduce if needed
      let quality = 0.7;
      let result = canvas.toDataURL('image/jpeg', quality);
      let sizeKB = (result.length * 0.75) / 1024;
      
      // Reduce quality until size is acceptable
      while (sizeKB > maxSizeKB && quality > 0.3) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
        sizeKB = (result.length * 0.75) / 1024;
      }
      
      // Extract base64 without data URL prefix
      const compressed = result.split(',')[1];
      console.log(`Image compressed: ${Math.round(sizeKB)}KB at quality ${quality.toFixed(1)}`);
      resolve(compressed);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

/**
 * Take a photo using Capacitor Camera plugin
 * Returns base64 encoded image (compressed)
 */
export async function takePhoto(source: 'camera' | 'gallery' = 'camera'): Promise<string | null> {
  if (isNative) {
    try {
      const image = await Camera.getPhoto({
        quality: 70, // Reduced from 90 for smaller file size
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        direction: CameraDirection.Rear,
        correctOrientation: true,
        width: 1200, // Limit width
        height: 1600, // Limit height
      });
      
      if (!image.base64String) return null;
      
      // Check size and compress if needed
      const sizeKB = (image.base64String.length * 0.75) / 1024;
      console.log(`Original image size: ${Math.round(sizeKB)}KB`);
      
      if (sizeKB > MAX_IMAGE_SIZE_KB) {
        console.log('Compressing image...');
        return await compressBase64Image(image.base64String);
      }
      
      return image.base64String;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }
  
  // On web, return null to use the existing camera view implementation
  return null;
}

/**
 * Pick image from gallery
 */
export async function pickFromGallery(): Promise<string | null> {
  return takePhoto('gallery');
}

/**
 * Capture image from video element (web only)
 */
export function captureImageFromVideo(video: HTMLVideoElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    ctx.drawImage(video, 0, 0);
    
    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = imageData.split(',')[1];
      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert image file to base64
 */
export function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return isNative;
}