import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadMetadata,
  UploadTask
} from 'firebase/storage';
import { storage } from '../config/firebase.config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

class StorageService {
  // Upload file with progress tracking
  uploadFileWithProgress(
    file: File,
    path: string,
    metadata?: UploadMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as UploadProgress['state']
          };
          
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Simple file upload
  async uploadFile(
    file: File,
    path: string,
    metadata?: UploadMetadata
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Upload base64 string
  async uploadBase64(
    base64String: string,
    path: string,
    metadata?: UploadMetadata
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, base64String, {
        ...metadata,
        contentType: metadata?.contentType || 'image/jpeg'
      });
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload base64 error:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  // Delete file by URL
  async deleteFileByUrl(url: string): Promise<void> {
    try {
      const path = this.getPathFromUrl(url);
      if (path) {
        await this.deleteFile(path);
      }
    } catch (error) {
      console.error('Delete by URL error:', error);
      throw error;
    }
  }

  // List files in a directory
  async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const urls = await Promise.all(
        result.items.map(itemRef => getDownloadURL(itemRef))
      );
      
      return urls;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  // Upload user profile image
  async uploadProfileImage(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/profile/avatar_${timestamp}.${extension}`;
    
    return this.uploadFileWithProgress(
      file,
      path,
      {
        contentType: file.type,
        customMetadata: {
          userId,
          type: 'profile_image',
          uploadedAt: new Date().toISOString()
        }
      },
      onProgress
    );
  }

  // Upload journal attachment
  async uploadJournalAttachment(
    userId: string,
    entryId: string,
    file: File,
    type: 'image' | 'voice'
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/journal/${entryId}/${type}_${timestamp}.${extension}`;
    
    return this.uploadFile(file, path, {
      contentType: file.type,
      customMetadata: {
        userId,
        entryId,
        type,
        uploadedAt: new Date().toISOString()
      }
    });
  }

  // Upload analysis PDF
  async uploadAnalysisPDF(
    userId: string,
    analysisId: string,
    pdfBlob: Blob
  ): Promise<string> {
    const timestamp = Date.now();
    const path = `users/${userId}/analyses/${analysisId}/report_${timestamp}.pdf`;
    
    const file = new File([pdfBlob], `analysis_${analysisId}.pdf`, {
      type: 'application/pdf'
    });
    
    return this.uploadFile(file, path, {
      contentType: 'application/pdf',
      customMetadata: {
        userId,
        analysisId,
        type: 'analysis_report',
        uploadedAt: new Date().toISOString()
      }
    });
  }

  // Upload screenshot for text decoder
  async uploadScreenshot(
    userId: string,
    conversationId: string,
    file: File
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/conversations/${conversationId}/screenshot_${timestamp}.${extension}`;
    
    return this.uploadFile(file, path, {
      contentType: file.type,
      customMetadata: {
        userId,
        conversationId,
        type: 'screenshot',
        uploadedAt: new Date().toISOString()
      }
    });
  }

  // Helper method to extract path from Firebase Storage URL
  private getPathFromUrl(url: string): string | null {
    try {
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      if (url.startsWith(baseUrl)) {
        const pathMatch = url.match(/o\/(.*?)\?/);
        if (pathMatch && pathMatch[1]) {
          return decodeURIComponent(pathMatch[1]);
        }
      }
      return null;
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }

  // Generate a thumbnail-friendly filename
  generateThumbnailPath(originalPath: string): string {
    const pathParts = originalPath.split('/');
    const filename = pathParts.pop();
    if (!filename) return originalPath;
    
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    const extension = filename.split('.').pop();
    
    pathParts.push(`thumb_${nameWithoutExt}.${extension}`);
    return pathParts.join('/');
  }

  // Validate file before upload
  validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true };
  }
}

export default new StorageService();