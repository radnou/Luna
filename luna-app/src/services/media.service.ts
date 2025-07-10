import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from '@config/firebase';
import * as ImageManipulator from 'expo-image-manipulator';
import { v4 as uuidv4 } from 'uuid';

interface UploadProgress {
  progress: number;
  snapshot: UploadTaskSnapshot;
}

interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
}

class MediaService {
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly THUMBNAIL_SIZE = 200;
  private readonly IMAGE_QUALITY = 0.8;

  /**
   * Compress and optimize image before upload
   */
  async compressImage(
    uri: string, 
    options: ImageOptions = {}
  ): Promise<{ uri: string; thumbnailUri?: string }> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = this.IMAGE_QUALITY,
      generateThumbnail = true
    } = options;

    try {
      // Compress main image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      let thumbnailUri: string | undefined;

      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnail = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: this.THUMBNAIL_SIZE, height: this.THUMBNAIL_SIZE } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        thumbnailUri = thumbnail.uri;
      }

      return { uri: compressedImage.uri, thumbnailUri };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Upload image to Firebase Storage with progress tracking
   */
  async uploadImage(
    uri: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; path: string }> {
    try {
      const filename = `${uuidv4()}.jpg`;
      const storagePath = `users/${userId}/journal/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Check file size
      if (blob.size > this.MAX_IMAGE_SIZE) {
        throw new Error('Image size exceeds 5MB limit');
      }

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error('Failed to upload image'));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url: downloadURL, path: storagePath });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images in batch
   */
  async uploadBatch(
    uris: string[],
    userId: string,
    onProgress?: (totalProgress: number, individualProgress: number[]) => void
  ): Promise<Array<{ url: string; path: string; thumbnailUrl?: string }>> {
    const individualProgress = new Array(uris.length).fill(0);
    const results: Array<{ url: string; path: string; thumbnailUrl?: string }> = [];

    try {
      const uploadPromises = uris.map(async (uri, index) => {
        // Compress image with thumbnail
        const { uri: compressedUri, thumbnailUri } = await this.compressImage(uri);

        // Upload main image
        const mainImageResult = await this.uploadImage(
          compressedUri,
          userId,
          (progress) => {
            individualProgress[index] = progress;
            const totalProgress = individualProgress.reduce((a, b) => a + b, 0) / uris.length;
            onProgress?.(Math.round(totalProgress), [...individualProgress]);
          }
        );

        // Upload thumbnail if generated
        let thumbnailUrl: string | undefined;
        if (thumbnailUri) {
          const thumbnailResult = await this.uploadImage(thumbnailUri, userId);
          thumbnailUrl = thumbnailResult.url;
        }

        return {
          ...mainImageResult,
          thumbnailUrl
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      results.push(...uploadResults);

      return results;
    } catch (error) {
      console.error('Error in batch upload:', error);
      // Clean up any successfully uploaded images if batch fails
      await this.deleteBatch(results.map(r => r.path));
      throw error;
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Delete multiple images
   */
  async deleteBatch(storagePaths: string[]): Promise<void> {
    try {
      await Promise.all(storagePaths.map(path => this.deleteImage(path)));
    } catch (error) {
      console.error('Error deleting batch:', error);
      // Continue even if some deletions fail
    }
  }

  /**
   * Generate signed URL with expiration
   */
  async getSignedUrl(storagePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw new Error('Failed to get image URL');
    }
  }
}

export const mediaService = new MediaService();