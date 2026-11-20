import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider, UploadFileOptions } from './storage.adapter';
import { ValidationError } from '@/lib/error-handler';
import { getStorageSigningSecret } from '@/config/environment';

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

export interface StoredFileMetadata {
  key: string;
  mimeType: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

export function getStorageLocalRoot(): string {
  return path.resolve(process.env.STORAGE_LOCAL_ROOT || path.join(process.cwd(), '.storage'));
}

/**
 * Validates binary magic bytes / content structure against declared MIME type
 * to block executable/HTML payloads masquerading as PDFs or images.
 */
export function validateDocumentMagicBytes(mimeType: string, buffer: Buffer): void {
  if (!buffer || buffer.byteLength === 0) {
    throw new ValidationError('Uploaded file buffer cannot be empty.');
  }

  if (mimeType === 'application/pdf') {
    if (buffer.byteLength < 4 || buffer.subarray(0, 4).toString('ascii') !== '%PDF') {
      throw new ValidationError('File content does not match PDF signature (%PDF).');
    }
    return;
  }

  if (mimeType === 'image/png') {
    const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (buffer.byteLength < 8 || !buffer.subarray(0, 8).equals(pngSig)) {
      throw new ValidationError('File content does not match PNG signature.');
    }
    return;
  }

  if (mimeType === 'image/jpeg') {
    if (buffer.byteLength < 3 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
      throw new ValidationError('File content does not match JPEG signature.');
    }
    return;
  }

  if (mimeType === 'image/webp') {
    if (
      buffer.byteLength < 12 ||
      buffer.subarray(0, 4).toString('ascii') !== 'RIFF' ||
      buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
    ) {
      throw new ValidationError('File content does not match WEBP signature.');
    }
    return;
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    // OOXML documents are ZIP archives starting with PK\x03\x04
    if (buffer.byteLength < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      throw new ValidationError('File content does not match Office Open XML archive signature.');
    }
    return;
  }

  if (mimeType === 'application/msword' || mimeType === 'application/vnd.ms-excel') {
    // Legacy OLE2 Compound Document signature D0 CF 11 E0
    const oleSig = Buffer.from([0xd0, 0xcf, 0x11, 0xe0]);
    if (buffer.byteLength < 4 || !buffer.subarray(0, 4).equals(oleSig)) {
      throw new ValidationError('File content does not match legacy Office binary signature.');
    }
    return;
  }

  if (mimeType === 'text/csv') {
    if (buffer.includes(0x00)) {
      throw new ValidationError('CSV file contains binary null bytes and was rejected.');
    }
  }
}

export function validateDocumentFile(mimeType: string, sizeBytes: number, buffer?: Buffer): void {
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
  if (buffer) {
    validateDocumentMagicBytes(mimeType, buffer);
  }
}

export function sanitizeStorageSegment(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .slice(0, 120);
}

/**
 * Resolves a storage key into a canonical filesystem path strictly contained inside the private
 * storage root directory, defending against path traversal (`../`, null bytes, drive jumps).
 */
export function resolveSafeStoragePath(key: string): string {
  if (!key || key.includes('\0') || key.includes('\\') || key.startsWith('/')) {
    throw new ValidationError('Invalid storage object key.');
  }

  const normalizedSegments = key.split('/').filter(Boolean);
  if (
    normalizedSegments.length === 0 ||
    normalizedSegments.some((seg) => seg === '.' || seg === '..' || seg.includes('..'))
  ) {
    throw new ValidationError('Storage key contains disallowed path traversal segments.');
  }

  const root = getStorageLocalRoot();
  const resolved = path.resolve(root, ...normalizedSegments);
  const relative = path.relative(root, resolved);

  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ValidationError('Resolved storage path escapes allowed root directory.');
  }

  return resolved;
}

export function computeDownloadSignature(key: string, expiresAtUnix: number): string {
  const secret = getStorageSigningSecret();
  return crypto
    .createHmac('sha256', secret)
    .update(`${key}:${expiresAtUnix}`)
    .digest('hex')
    .slice(0, 32);
}

export function verifySignedDownloadParams(
  key: string,
  expiresParam: string | null,
  sigParam: string | null,
  nowUnixSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!key || !expiresParam || !sigParam) return false;
  const expiresAt = Number(expiresParam);
  if (!Number.isInteger(expiresAt) || expiresAt < nowUnixSeconds) {
    return false;
  }

  const expected = computeDownloadSignature(key, expiresAt);
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(sigParam.trim(), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Private disk-backed storage adapter implementing `IStorageProvider`.
 * Persists files outside `public/` with magic-byte validation, traversal defense,
 * and HMAC-signed download URLs. Ready to swap with S3 / GCS / Cloudinary.
 */
export class ManagedStorageProvider implements IStorageProvider {
  private getBaseUrl(): string {
    return process.env.STORAGE_PUBLIC_BASE_URL || '/api/v1/storage/files';
  }

  async uploadFile(options: UploadFileOptions): Promise<{ fileUrl: string; key: string; size: number }> {
    validateDocumentFile(options.mimeType, options.buffer.byteLength, options.buffer);

    const folderSegments = options.folder
      .split('/')
      .map((s) => sanitizeStorageSegment(s))
      .filter(Boolean);
    const safeFolder = folderSegments.length > 0 ? folderSegments.join('/') : 'general';
    const safeFile = sanitizeStorageSegment(options.fileName) || 'document';
    const uniquePrefix = crypto.randomBytes(8).toString('hex');
    const key = `${safeFolder}/${uniquePrefix}-${safeFile}`;

    const targetPath = resolveSafeStoragePath(key);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    // Atomic write via temp file + rename
    const tempPath = `${targetPath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fs.writeFile(tempPath, options.buffer);
    await fs.rename(tempPath, targetPath);

    const metadata: StoredFileMetadata = {
      key,
      mimeType: options.mimeType,
      fileName: safeFile,
      size: options.buffer.byteLength,
      uploadedAt: new Date().toISOString(),
    };
    await fs.writeFile(`${targetPath}.meta.json`, JSON.stringify(metadata), 'utf8');

    const encodedPath = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const fileUrl = `${this.getBaseUrl()}/${encodedPath}`;

    return {
      fileUrl,
      key,
      size: options.buffer.byteLength,
    };
  }

  async readFile(key: string): Promise<{ buffer: Buffer; metadata: StoredFileMetadata } | null> {
    const targetPath = resolveSafeStoragePath(key);
    try {
      const [buffer, metaRaw] = await Promise.all([
        fs.readFile(targetPath),
        fs.readFile(`${targetPath}.meta.json`, 'utf8').catch(() => null),
      ]);

      const metadata: StoredFileMetadata = metaRaw
        ? (JSON.parse(metaRaw) as StoredFileMetadata)
        : {
            key,
            mimeType: 'application/octet-stream',
            fileName: path.basename(targetPath),
            size: buffer.byteLength,
            uploadedAt: new Date().toISOString(),
          };

      return { buffer, metadata };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!key) return false;
    const targetPath = resolveSafeStoragePath(key);
    let deleted = false;
    try {
      await fs.unlink(targetPath);
      deleted = true;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        throw error;
      }
    }
    await fs.unlink(`${targetPath}.meta.json`).catch(() => {});
    return deleted;
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    // Validate key structure before signing
    resolveSafeStoragePath(key);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const sig = computeDownloadSignature(key, expiresAt);
    const encodedPath = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${this.getBaseUrl()}/${encodedPath}?expires=${expiresAt}&sig=${sig}`;
  }
}

export const storageProvider = new ManagedStorageProvider();
