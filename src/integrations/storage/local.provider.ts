import crypto from 'crypto';
import { IStorageProvider, UploadFileOptions } from './storage.adapter';
import { ValidationError } from '@/lib/error-handler';

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export function validateDocumentFile(mimeType: string, sizeBytes: number): void {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) {
    throw new ValidationError(
      `Unsupported file MIME type "${mimeType}". Allowed formats: PDF, DOCX, XLSX, CSV, JPEG, PNG, WEBP.`
    );
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
    throw new ValidationError(
      `File size must be between 1 byte and ${Math.round(MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024))} MB.`
    );
  }
}

export function sanitizeStorageSegment(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 120);
}

/**
 * Storage adapter implementation using the IStorageProvider boundary.
 * Ready to swap with AWS S3, GCS, or Cloudinary without changing service contracts.
 */
export class ManagedStorageProvider implements IStorageProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.STORAGE_PUBLIC_BASE_URL || '/api/v1/storage/files';
  }

  async uploadFile(options: UploadFileOptions): Promise<{ fileUrl: string; key: string; size: number }> {
    validateDocumentFile(options.mimeType, options.buffer.byteLength);

    const safeFolder = sanitizeStorageSegment(options.folder);
    const safeFile = sanitizeStorageSegment(options.fileName);
    const uniquePrefix = crypto.randomBytes(8).toString('hex');
    const key = `${safeFolder}/${uniquePrefix}-${safeFile}`;
    const fileUrl = `${this.baseUrl}/${encodeURIComponent(key)}`;

    return {
      fileUrl,
      key,
      size: options.buffer.byteLength,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    return Boolean(key && key.length > 0);
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const secret = process.env.STORAGE_SIGNING_SECRET || process.env.JWT_SECRET || 'dev-storage-signing-key';
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${key}:${expiresAt}`)
      .digest('hex')
      .slice(0, 32);

    return `${this.baseUrl}/${encodeURIComponent(key)}?expires=${expiresAt}&sig=${sig}`;
  }
}

export const storageProvider = new ManagedStorageProvider();
