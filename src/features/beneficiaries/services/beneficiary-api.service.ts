import { ApiResponse } from '@/lib/api-response';
import {
  CreateBeneficiaryCaseInput,
  CreateBeneficiaryInput,
  EnrollBeneficiaryInput,
  RecordAssistanceInput,
  RecordConsentInput,
  UpdateBeneficiaryCaseInput,
  UpdateBeneficiaryStatusInput,
  VerifyBeneficiaryInput,
} from '../schemas/beneficiary.schema';

export interface BeneficiaryListItem {
  id: string;
  beneficiaryCode: string;
  displayName: string;
  district: string;
  village?: string;
  state?: string;
  assistanceCategory: string;
  status: string;
  eligibilityStatus: string;
  verificationStatus: string;
  requiresSafeguarding: boolean;
  isAnonymized: boolean;
  registrationDate: string;
}

export interface BeneficiaryDetailItem {
  id: string;
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
  assistanceCategory: string;
  registrationSource: string;
  registrationDate: string;
  status: string;
  eligibilityStatus: string;
  verificationStatus: string;
  isMinorOrVulnerable: boolean;
  requiresSafeguarding: boolean;
  safeguardingEscalationRef?: string;
  guardianDetails?: {
    name?: string;
    relation?: string;
    contactPhone?: string;
    authorizationDocumented: boolean;
  };
  sensitiveProfile?: {
    vulnerabilityNotes?: string;
    socioEconomicContext?: string;
    accessibilityOrSupportNeeds?: string;
  };
  documentRefs: Array<{ label: string; category: string; storageRef: string; uploadedAt: string }>;
  documentCount: number;
  sensitiveFieldsRedacted: boolean;
  documentsRestricted: boolean;
  isAnonymized: boolean;
}

export interface BeneficiaryDetailResponse {
  beneficiary: BeneficiaryDetailItem;
  verifications: Array<{
    id: string;
    checklist: Array<{ criterion: string; met: boolean; notes?: string }>;
    decision: string;
    decisionReason: string;
    humanReviewed: boolean;
    reviewedAt: string;
  }>;
  enrollments: Array<{
    _id: string;
    projectId?: { _id: string; name: string; code: string } | string;
    assistanceCategory: string;
    status: string;
    enrollmentDate: string;
  }>;
  assistance: Array<{
    _id: string;
    assistanceCategory: string;
    description: string;
    quantityOrUnit?: string;
    deliveryStatus: string;
    scheduledDate?: string;
    deliveryDate?: string;
    followUpDate?: string;
    outcomeNotes?: string;
    createdAt: string;
  }>;
  cases: Array<{
    _id: string;
    caseNumber: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    isSafeguardingCase: boolean;
    escalationReference?: string;
    nextFollowUpDate?: string;
    createdAt: string;
  }>;
  caseNotes: Array<{
    _id: string;
    caseId: string;
    noteType: string;
    content: string;
    isRestrictedSafeguardingNote: boolean;
    authorName: string;
    authorRole: string;
    createdAt: string;
  }>;
  consents: Array<{
    _id: string;
    purpose: string;
    status: 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';
    consentVersion: string;
    grantedAt: string;
    withdrawnAt?: string | null;
    grantedByGuardian: boolean;
    guardianName?: string;
  }>;
  clearance: {
    canViewSensitive: boolean;
    canViewDocuments: boolean;
    canViewSafeguarding: boolean;
    canManageSafeguarding: boolean;
    canManageCases: boolean;
  };
}

export interface StakeholderAnalyticsResponse {
  volunteers: {
    totalVolunteers: number;
    activeVolunteers: number;
    verifiedVolunteers: number;
    pendingApplications: number;
    activeAssignments: number;
    verifiedMinutesTotal: number;
    verifiedHoursTotal: number;
    approvedAttendanceSessions: number;
  } | null;
  membership: {
    totalMembers: number;
    activeMembers: number;
    expiredMembers: number;
    suspendedMembers: number;
    expiringSoon: number;
    pendingApplications: number;
    completedRenewals: number;
    categoryDistribution: Array<{ category: string; count: number }>;
  } | null;
  beneficiaries: {
    totalBeneficiaries: number;
    activeBeneficiaries: number;
    pendingVerification: number;
    safeguardedCount: number;
    anonymizedCount: number;
    assistanceDeliveredCount: number;
    followUpsDueCount: number;
    projectEnrollments: Array<{ projectId: string; enrolledCount: number }>;
    casesByStatus: Array<{ status: string; count: number }>;
    consentsSummary: Array<{ purpose: string; status: string; count: number }>;
  } | null;
}

export class BeneficiaryApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    return await res.json();
  }

  async list(params: { status?: string; verificationStatus?: string; search?: string; requiresSafeguarding?: boolean } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.verificationStatus) q.set('verificationStatus', params.verificationStatus);
    if (params.search) q.set('search', params.search);
    if (typeof params.requiresSafeguarding === 'boolean') {
      q.set('requiresSafeguarding', String(params.requiresSafeguarding));
    }
    return this.fetchJson<BeneficiaryListItem[]>(`/api/v1/beneficiaries?${q.toString()}`);
  }

  async register(data: CreateBeneficiaryInput) {
    return this.fetchJson<BeneficiaryDetailItem>('/api/v1/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDetail(id: string) {
    return this.fetchJson<BeneficiaryDetailResponse>(`/api/v1/beneficiaries/${id}`);
  }

  async updateStatus(id: string, data: UpdateBeneficiaryStatusInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async verify(id: string, data: VerifyBeneficiaryInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/verification`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async enroll(id: string, data: EnrollBeneficiaryInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/enrollments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordAssistance(id: string, data: RecordAssistanceInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/assistance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCase(id: string, data: CreateBeneficiaryCaseInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/cases`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: UpdateBeneficiaryCaseInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/cases`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async manageConsent(id: string, data: RecordConsentInput) {
    return this.fetchJson(`/api/v1/beneficiaries/${id}/consent`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStakeholderAnalytics() {
    return this.fetchJson<StakeholderAnalyticsResponse>('/api/v1/stakeholders/analytics');
  }
}

export const beneficiaryApiService = new BeneficiaryApiService();
