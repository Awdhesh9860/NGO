/**
 * Object Storage Integration Adapter Boundary
 * Supports local storage, AWS S3, and Google Cloud Storage.
 */

export interface UploadFileOptions {
  fileName: string;
  folder: string;
  mimeType: string;
  buffer: Buffer;
  isPublic?: boolean;
}

export interface IStorageProvider {
  uploadFile(options: UploadFileOptions): Promise<{ fileUrl: string; key: string; size: number }>;
  deleteFile(key: string): Promise<boolean>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
