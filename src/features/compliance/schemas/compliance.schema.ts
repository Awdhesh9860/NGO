import { z } from 'zod';

const optionalObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier')
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))
  .optional();

const optionalDateStr = z
  .string()
  .min(8)
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))
  .optional();

export const createComplianceRecordSchema = z.object({
  complianceType: z.enum([
    '12A',
    '80G',
    'PAN',
    'TAN',
    'NGO_DARPAN',
    'CSR_1',
    'FCRA',
    'ANNUAL_AUDIT',
    'FINANCIAL_STATEMENTS',
    'BOARD_RESOLUTION',
    'ANNUAL_RETURN',
    'STATUTORY_FILING',
    'CUSTOM',
  ]),
  customTypeName: z.string().trim().max(100).optional(),
  title: z.string().trim().min(3).max(160),
  jurisdiction: z.string().trim().min(2).max(80).optional().default('India'),
  isRequiredForOrg: z.boolean().optional().default(true),
  registrationNumber: z.string().trim().max(80).optional(),
  issuingAuthority: z.string().trim().max(160).optional(),
  issueDate: optionalDateStr,
  expiryDate: optionalDateStr,
  filingDeadline: optionalDateStr,
  reviewDate: optionalDateStr,
  responsibleUserId: optionalObjectId,
  documentRef: z
    .object({
      label: z.string().trim().min(1).max(120),
      storageKey: z.string().trim().min(1).max(300),
      mimeType: z.string().trim().min(3).max(100),
    })
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateComplianceRecordSchema = z.object({
  action: z.enum(['UPDATE', 'VERIFY', 'RENEW', 'MARK_NOT_APPLICABLE']).default('UPDATE'),
  title: z.string().trim().min(3).max(160).optional(),
  registrationNumber: z.string().trim().max(80).optional(),
  issuingAuthority: z.string().trim().max(160).optional(),
  expiryDate: optionalDateStr,
  filingDeadline: optionalDateStr,
  reviewDate: optionalDateStr,
  responsibleUserId: optionalObjectId,
  verificationNotes: z.string().trim().max(600).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateComplianceRecordInput = z.infer<typeof createComplianceRecordSchema>;
export type UpdateComplianceRecordInput = z.infer<typeof updateComplianceRecordSchema>;
