import { z } from 'zod';

export const DEFAULT_ASSISTANCE_CATEGORIES = [
  'Education Support',
  'Healthcare Support',
  'Skill Development',
  'Livelihood Assistance',
  'Food and Nutrition',
  'Emergency Relief',
  'Women Empowerment',
  'Child Welfare',
  'Community Support',
] as const;

export const createHouseholdSchema = z.object({
  headOfHouseholdName: z.string().trim().min(2).max(140),
  contactPhone: z.string().trim().max(24).optional(),
  memberCount: z.number().int().min(1).max(50).default(1),
  district: z.string().trim().min(2).max(100),
  village: z.string().trim().max(100).optional(),
  state: z.string().trim().max(80).optional(),
  addressSummary: z.string().trim().max(300).optional(),
  primaryProgramId: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * Purpose-limited beneficiary registration schema.
 * Deliberately excludes Aadhaar, bank credentials, or clinical hospital data by default.
 */
export const createBeneficiarySchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(140),
  contactPhone: z.string().trim().max(24).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal('')),
  ageOrRange: z.string().trim().max(30).optional(),
  gender: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  district: z.string().trim().min(2, 'District is required').max(100),
  village: z.string().trim().max(100).optional(),
  state: z.string().trim().max(80).optional(),
  householdId: z.string().trim().optional(),
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  assistanceCategory: z.string().trim().min(2).max(100),
  registrationSource: z
    .enum(['FIELD_STAFF', 'PROJECT_REFERRAL', 'COMMUNITY_INTAKE'])
    .optional()
    .default('FIELD_STAFF'),
  referralSource: z.string().trim().max(200).optional(),
  assignedCaseWorkerId: z.string().trim().optional(),
  isMinorOrVulnerable: z.boolean().optional().default(false),
  requiresSafeguarding: z.boolean().optional().default(false),
  guardianDetails: z
    .object({
      name: z.string().trim().min(2).max(140),
      relation: z.string().trim().min(2).max(60),
      contactPhone: z.string().trim().max(24).optional(),
      authorizationDocumented: z.boolean().default(false),
    })
    .optional(),
  sensitiveProfile: z
    .object({
      vulnerabilityNotes: z.string().trim().max(1500).optional(),
      socioEconomicContext: z.string().trim().max(1500).optional(),
      accessibilityOrSupportNeeds: z.string().trim().max(1500).optional(),
    })
    .optional(),
  initialConsentGranted: z.boolean().optional().default(false),
  consentVersion: z.string().trim().max(20).optional().default('1.0'),
});

export const updateBeneficiaryStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'REJECTED',
    'WITHDRAWN',
  ]),
  reason: z.string().trim().max(1000).optional(),
  assignedCaseWorkerId: z.string().trim().optional(),
  safeguardingEscalationRef: z.string().trim().max(120).optional(),
});

export const verifyBeneficiarySchema = z.object({
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  checklist: z
    .array(
      z.object({
        criterion: z.string().trim().min(2).max(200),
        met: z.boolean(),
        notes: z.string().trim().max(500).optional(),
      })
    )
    .min(1, 'At least one eligibility criterion must be evaluated'),
  supportingDocumentRefsReviewed: z.array(z.string().trim()).max(10).optional().default([]),
  decision: z.enum(['VERIFIED', 'REJECTED', 'REASSESSMENT_REQUIRED']),
  decisionReason: z.string().trim().min(5, 'Documented reason is mandatory for eligibility decisions').max(1500),
  reassessmentDueDate: z.string().optional(),
});

export const enrollBeneficiarySchema = z.object({
  programId: z.string().trim().optional(),
  projectId: z.string().trim().min(12, 'Valid projectId is required'),
  assistanceCategory: z.string().trim().min(2).max(100),
  caseWorkerId: z.string().trim().optional(),
  expectedCompletionDate: z.string().optional(),
});

export const recordAssistanceSchema = z.object({
  enrollmentId: z.string().trim().optional(),
  programId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  assistanceCategory: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5, 'Describe the actual assistance delivered or scheduled').max(1500),
  quantityOrUnit: z.string().trim().max(100).optional(),
  deliveryStatus: z
    .enum(['APPROVED', 'SCHEDULED', 'DELIVERED', 'FOLLOW_UP_DUE', 'COMPLETED', 'CANCELLED'])
    .optional()
    .default('APPROVED'),
  scheduledDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  followUpDate: z.string().optional(),
  outcomeNotes: z.string().trim().max(1500).optional(),
});

export const createBeneficiaryCaseSchema = z.object({
  projectId: z.string().trim().optional(),
  assignedCaseWorkerId: z.string().trim().optional(),
  title: z.string().trim().min(4).max(160),
  category: z.string().trim().min(2).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  isSafeguardingCase: z.boolean().optional().default(false),
  escalationReference: z.string().trim().max(120).optional(),
  nextFollowUpDate: z.string().optional(),
  initialNote: z.string().trim().max(2500).optional(),
});

export const updateBeneficiaryCaseSchema = z.object({
  caseId: z.string().trim().min(12),
  action: z.enum(['UPDATE_STATUS', 'ADD_NOTE', 'REFER', 'CLOSE', 'REOPEN']),
  status: z
    .enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'REFERRED', 'RESOLVED', 'CLOSED'])
    .optional(),
  noteContent: z.string().trim().max(2500).optional(),
  noteType: z.enum(['PROGRESS', 'FOLLOW_UP', 'REFERRAL', 'SAFEGUARDING', 'CLOSURE']).optional(),
  isRestrictedSafeguardingNote: z.boolean().optional().default(false),
  referredTo: z.string().trim().max(160).optional(),
  referralReason: z.string().trim().max(1000).optional(),
  closureSummary: z.string().trim().max(1500).optional(),
  nextFollowUpDate: z.string().optional(),
});

export const recordConsentSchema = z.object({
  action: z.enum(['GRANT', 'WITHDRAW', 'ANONYMIZE_RECORD']),
  purpose: z
    .enum([
      'PROGRAM_PARTICIPATION',
      'DATA_PROCESSING',
      'COMMUNICATION',
      'PHOTOGRAPHY_MEDIA',
      'PUBLIC_STORYTELLING',
      'RESEARCH_EVALUATION',
    ])
    .optional(),
  consentVersion: z.string().trim().max(20).optional().default('1.0'),
  consentId: z.string().trim().optional(),
  withdrawalReason: z.string().trim().max(500).optional(),
  grantedByGuardian: z.boolean().optional().default(false),
  guardianName: z.string().trim().max(140).optional(),
  guardianRelation: z.string().trim().max(60).optional(),
  evidenceRef: z.string().trim().max(300).optional(),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;
export type UpdateBeneficiaryStatusInput = z.infer<typeof updateBeneficiaryStatusSchema>;
export type VerifyBeneficiaryInput = z.infer<typeof verifyBeneficiarySchema>;
export type EnrollBeneficiaryInput = z.infer<typeof enrollBeneficiarySchema>;
export type RecordAssistanceInput = z.infer<typeof recordAssistanceSchema>;
export type CreateBeneficiaryCaseInput = z.infer<typeof createBeneficiaryCaseSchema>;
export type UpdateBeneficiaryCaseInput = z.infer<typeof updateBeneficiaryCaseSchema>;
export type RecordConsentInput = z.infer<typeof recordConsentSchema>;
