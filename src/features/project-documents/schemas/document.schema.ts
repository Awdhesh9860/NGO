import { z } from 'zod';

export const DOCUMENT_CATEGORIES = [
  'PROPOSAL',
  'APPROVAL',
  'AGREEMENT',
  'REPORT',
  'PROGRESS_PHOTO',
  'COMPLETION_REPORT',
  'SUPPORTING',
] as const;

export const DOCUMENT_VISIBILITIES = ['INTERNAL', 'RESTRICTED', 'PUBLIC_APPROVED'] as const;

export const createProjectDocumentSchema = z.object({
  title: z.string().min(2).max(180),
  category: z.enum(DOCUMENT_CATEGORIES),
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(3).max(120),
  fileSizeBytes: z.number().int().min(1).max(15 * 1024 * 1024),
  fileUrl: z.string().optional(),
  visibility: z.enum(DOCUMENT_VISIBILITIES).default('INTERNAL'),
  description: z.string().max(1000).optional(),
});

export type CreateProjectDocumentInput = z.infer<typeof createProjectDocumentSchema>;
