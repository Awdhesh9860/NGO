import mongoose, { Schema, Document, Model } from 'mongoose';

export type BeneficiaryStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type BeneficiaryEligibilityStatus =
  | 'PENDING'
  | 'ELIGIBLE'
  | 'INELIGIBLE'
  | 'REASSESSMENT_REQUIRED';

export type BeneficiaryVerificationStatus = 'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface IBeneficiaryDocumentRef {
  label: string;
  category: 'ELIGIBILITY_PROOF' | 'REFERRAL' | 'GUARDIAN_AUTHORIZATION' | 'OTHER';
  storageRef: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

/**
 * Beneficiary Model
 * PRIVACY & SAFEGUARDING DESIGN:
 * - Does NOT collect Aadhaar numbers, bank credentials, or clinical hospital data by default.
 * - `sensitiveProfile` and `guardianDetails` are stripped unless actor holds `beneficiaries.sensitive.view`
 *   (and `safeguarding.view`/`safeguarding.manage` for minor/vulnerable safeguarding records).
 * - `documentRefs` are stripped unless actor holds `beneficiaries.documents.view`.
 */
export interface IBeneficiaryDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  beneficiaryCode: string;
  fullName: string;
  contactPhone?: string;
  contactEmail?: string;
  ageOrRange?: string;
  gender?: string;
  address?: string;
  district: string;
  village?: string;
  state?: string;
  householdId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  assistanceCategory: string;
  registrationSource: 'FIELD_STAFF' | 'PROJECT_REFERRAL' | 'COMMUNITY_INTAKE';
  referralSource?: string;
  registrationDate: Date;
  status: BeneficiaryStatus;
  eligibilityStatus: BeneficiaryEligibilityStatus;
  verificationStatus: BeneficiaryVerificationStatus;
  assignedCaseWorkerId?: mongoose.Types.ObjectId;
  /** Child Safeguarding & Vulnerable Person Protection flags */
  isMinorOrVulnerable: boolean;
  requiresSafeguarding: boolean;
  safeguardingEscalationRef?: string;
  guardianDetails?: {
    name?: string;
    relation?: string;
    contactPhone?: string;
    authorizationDocumented: boolean;
  };
  /** Purpose-limited sensitive fields gated behind `beneficiaries.sensitive.view` */
  sensitiveProfile?: {
    vulnerabilityNotes?: string;
    socioEconomicContext?: string;
    accessibilityOrSupportNeeds?: string;
  };
  /** Supporting documents gated behind `beneficiaries.documents.view` */
  documentRefs: IBeneficiaryDocumentRef[];
  communicationPreferences: {
    allowOperationalSmsOrEmail: boolean;
  };
  isAnonymized: boolean;
  anonymizedAt?: Date | null;
  retentionUntil?: Date | null;
  statusHistory: Array<{
    status: BeneficiaryStatus;
    actorId: mongoose.Types.ObjectId;
    actorName: string;
    reason?: string;
    timestamp: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiarySchema = new Schema<IBeneficiaryDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    beneficiaryCode: { type: String, required: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, lowercase: true, trim: true },
    ageOrRange: { type: String, trim: true },
    gender: { type: String, trim: true },
    address: { type: String, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    village: { type: String, trim: true },
    state: { type: String, trim: true },
    householdId: { type: Schema.Types.ObjectId, ref: 'BeneficiaryHousehold', index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    assistanceCategory: { type: String, required: true, trim: true, index: true },
    registrationSource: {
      type: String,
      enum: ['FIELD_STAFF', 'PROJECT_REFERRAL', 'COMMUNITY_INTAKE'],
      default: 'FIELD_STAFF',
    },
    referralSource: { type: String, trim: true },
    registrationDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'ACTIVE',
        'ON_HOLD',
        'COMPLETED',
        'REJECTED',
        'WITHDRAWN',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    eligibilityStatus: {
      type: String,
      enum: ['PENDING', 'ELIGIBLE', 'INELIGIBLE', 'REASSESSMENT_REQUIRED'],
      default: 'PENDING',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'IN_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
      index: true,
    },
    assignedCaseWorkerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isMinorOrVulnerable: { type: Boolean, default: false, index: true },
    requiresSafeguarding: { type: Boolean, default: false, index: true },
    safeguardingEscalationRef: { type: String, trim: true },
    guardianDetails: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      contactPhone: { type: String, trim: true },
      authorizationDocumented: { type: Boolean, default: false },
    },
    sensitiveProfile: {
      vulnerabilityNotes: { type: String, trim: true },
      socioEconomicContext: { type: String, trim: true },
      accessibilityOrSupportNeeds: { type: String, trim: true },
    },
    documentRefs: [
      {
        label: { type: String, required: true, trim: true },
        category: {
          type: String,
          enum: ['ELIGIBILITY_PROOF', 'REFERRAL', 'GUARDIAN_AUTHORIZATION', 'OTHER'],
          required: true,
        },
        storageRef: { type: String, required: true, trim: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    communicationPreferences: {
      allowOperationalSmsOrEmail: { type: Boolean, default: true },
    },
    isAnonymized: { type: Boolean, default: false, index: true },
    anonymizedAt: { type: Date, default: null },
    retentionUntil: { type: Date, default: null },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'ACTIVE',
            'ON_HOLD',
            'COMPLETED',
            'REJECTED',
            'WITHDRAWN',
          ],
          required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        actorName: { type: String, required: true, trim: true },
        reason: { type: String, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BeneficiarySchema.index({ organizationId: 1, beneficiaryCode: 1 }, { unique: true });
BeneficiarySchema.index({ organizationId: 1, status: 1, verificationStatus: 1 });
BeneficiarySchema.index({ organizationId: 1, projectId: 1, status: 1 });

export const Beneficiary: Model<IBeneficiaryDocument> =
  mongoose.models.Beneficiary ||
  mongoose.model<IBeneficiaryDocument>('Beneficiary', BeneficiarySchema);

export default Beneficiary;
