import { removeBackground } from '@imgly/background-removal';

/**
 * Process an image to remove its background
 * @param {File|Blob|string} imageSource - The image file, blob, or URL
 * @returns {Promise<Blob>} - The processed image as a blob
 */
export async function removeImageBackground(imageSource) {
  try {
    const blob = await removeBackground(imageSource);
    return blob;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw error;
  }
}

/**
 * Convert a blob to a data URL
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} - The data URL
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a file to a data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - The data URL
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image
 * @param {File|Blob} file - The image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<Blob>} - The compressed image
 */
export function compressImage(file, maxWidth = 2000, maxHeight = 2000, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
