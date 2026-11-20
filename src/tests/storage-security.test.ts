import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { NextRequest } from 'next/server';
import {
  storageProvider,
  resolveSafeStoragePath,
  validateDocumentFile,
  verifySignedDownloadParams,
} from '@/integrations/storage/local.provider';
import { GET as downloadFileHandler } from '@/app/api/v1/storage/files/[...key]/route';

describe('QA Phase 2 — Real File Storage Persistence & Document Security (QA-BUG-002)', () => {
  const originalRoot = process.env.STORAGE_LOCAL_ROOT;
  let tempStorageDir: string;

  beforeEach(async () => {
    tempStorageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hh-ngo-storage-qa-'));
    process.env.STORAGE_LOCAL_ROOT = tempStorageDir;
  });

  afterEach(async () => {
    if (originalRoot === undefined) {
      delete process.env.STORAGE_LOCAL_ROOT;
    } else {
      process.env.STORAGE_LOCAL_ROOT = originalRoot;
    }
    await fs.rm(tempStorageDir, { recursive: true, force: true });
  });

  it('persists a real PDF file to private disk storage, serves it via signed URL, and deletes cleanly', async () => {
    const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n', 'utf8');

    const uploaded = await storageProvider.uploadFile({
      buffer: pdfBytes,
      fileName: 'annual-audit-2026.pdf',
      mimeType: 'application/pdf',
      folder: 'org-alpha/finance',
    });

    expect(uploaded.size).toBe(pdfBytes.byteLength);
    expect(uploaded.key).toContain('org-alpha/finance/');
    expect(uploaded.fileUrl).toContain('/api/v1/storage/files/');

    // Verify bytes actually exist on disk inside tempStorageDir
    const readBack = await storageProvider.readFile(uploaded.key);
    expect(readBack).not.toBeNull();
    expect(readBack!.buffer.equals(pdfBytes)).toBe(true);
    expect(readBack!.metadata.mimeType).toBe('application/pdf');

    // Generate HMAC signed URL and fetch through the real Next.js GET route handler
    const signedUrl = await storageProvider.getSignedDownloadUrl(uploaded.key, 300);
    const req = new NextRequest(`http://localhost:3000${signedUrl}`, { method: 'GET' });
    const res = await downloadFileHandler(req, {
      params: Promise.resolve({ key: uploaded.key.split('/') }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Content-Disposition')).toContain('attachment;');
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    const bodyBuf = Buffer.from(await res.arrayBuffer());
    expect(bodyBuf.equals(pdfBytes)).toBe(true);

    // Delete file and confirm subsequent download returns 404
    const deleted = await storageProvider.deleteFile(uploaded.key);
    expect(deleted).toBe(true);
    const missingRes = await downloadFileHandler(req, {
      params: Promise.resolve({ key: uploaded.key.split('/') }),
    });
    expect(missingRes.status).toBe(404);
  });

  it('rejects magic-byte spoofed uploads (XSS/HTML or executable disguised as PDF/PNG/JPEG/CSV)', () => {
    const htmlPayload = Buffer.from('<html><script>alert(1)</script></html>', 'utf8');

    expect(() => validateDocumentFile('application/pdf', htmlPayload.byteLength, htmlPayload)).toThrow(
      /PDF signature/
    );
    expect(() => validateDocumentFile('image/png', htmlPayload.byteLength, htmlPayload)).toThrow(
      /PNG signature/
    );
    expect(() => validateDocumentFile('image/jpeg', htmlPayload.byteLength, htmlPayload)).toThrow(
      /JPEG signature/
    );
    expect(() => validateDocumentFile('image/webp', htmlPayload.byteLength, htmlPayload)).toThrow(
      /WEBP signature/
    );

    const binaryCsv = Buffer.from([0x61, 0x2c, 0x62, 0x00, 0x63]);
    expect(() => validateDocumentFile('text/csv', binaryCsv.byteLength, binaryCsv)).toThrow(
      /null bytes/
    );

    expect(() => validateDocumentFile('application/x-msdownload', 100)).toThrow(
      /Unsupported file MIME type/
    );
  });

  it('blocks path traversal attacks on storage keys and download route requests', async () => {
    expect(() => resolveSafeStoragePath('../../etc/passwd')).toThrow(/path traversal|Invalid/);
    expect(() => resolveSafeStoragePath('org-a/../../../secret.env')).toThrow(/path traversal/);
    expect(() => resolveSafeStoragePath('/etc/passwd')).toThrow(/Invalid storage object key/);
    expect(() => resolveSafeStoragePath('org-a\\secret.pdf')).toThrow(/Invalid storage object key/);
    expect(() => resolveSafeStoragePath('org-a/file\0.pdf')).toThrow(/Invalid storage object key/);

    const traversalReq = new NextRequest('http://localhost:3000/api/v1/storage/files/..%2F..%2F.env');
    const traversalRes = await downloadFileHandler(traversalReq, {
      params: Promise.resolve({ key: ['..', '..', '.env'] }),
    });
    expect(traversalRes.status).toBe(422);
  });

  it('rejects unsigned, tampered, or expired download URLs with HTTP 401', async () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const uploaded = await storageProvider.uploadFile({
      buffer: pngBytes,
      fileName: 'receipt-scan.png',
      mimeType: 'image/png',
      folder: 'org-alpha/receipts',
    });

    // Tampered signature
    const signed = await storageProvider.getSignedDownloadUrl(uploaded.key, 300);
    const tamperedUrl = signed.replace(/sig=[a-f0-9]+/, 'sig=00000000000000000000000000000000');
    const tamperedReq = new NextRequest(`http://localhost:3000${tamperedUrl}`);
    const tamperedRes = await downloadFileHandler(tamperedReq, {
      params: Promise.resolve({ key: uploaded.key.split('/') }),
    });
    expect(tamperedRes.status).toBe(401);

    // Expired timestamp verification
    const pastExpires = String(Math.floor(Date.now() / 1000) - 60);
    expect(verifySignedDownloadParams(uploaded.key, pastExpires, 'any')).toBe(false);
  });
});
