import { ApiResponse } from '@/lib/api-response';

export interface ComplianceDeadlineEval {
  id: string;
  complianceType: string;
  title: string;
  jurisdiction: string;
  validityStatus: string;
  effectiveDeadline?: string;
  daysUntilDeadline: number | null;
  urgency: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'NO_DEADLINE' | 'NOT_APPLICABLE';
  isIndependentlyVerified: boolean;
}

export interface ComplianceRecordItem {
  id: string;
  complianceType: string;
  customTypeName?: string;
  title: string;
  jurisdiction: string;
  isRequiredForOrg: boolean;
  registrationNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  filingDeadline?: string;
  reviewDate?: string;
  validityStatus:
    | 'DRAFT'
    | 'DOCUMENT_RECORDED'
    | 'INDEPENDENTLY_VERIFIED'
    | 'EXPIRING_SOON'
    | 'EXPIRED'
    | 'NOT_APPLICABLE';
  notes?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  deadlineEvaluation: ComplianceDeadlineEval;
}

export interface ComplianceDeadlinesSummary {
  overdue: ComplianceDeadlineEval[];
  dueSoon: ComplianceDeadlineEval[];
  upcoming: ComplianceDeadlineEval[];
  totalTracked: number;
  independentlyVerifiedCount: number;
  recordedOnlyCount: number;
  legalDisclaimer: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  return res.json();
}

export const complianceApiService = {
  listRecords: (params?: { complianceType?: string; validityStatus?: string }) => {
    const qs = new URLSearchParams();
    if (params?.complianceType) qs.set('complianceType', params.complianceType);
    if (params?.validityStatus) qs.set('validityStatus', params.validityStatus);
    return request<ComplianceRecordItem[]>(`/api/v1/compliance/records?${qs.toString()}`);
  },
  createRecord: (payload: Record<string, unknown>) =>
    request<ComplianceRecordItem>('/api/v1/compliance/records', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRecord: (id: string, payload: Record<string, unknown>) =>
    request<ComplianceRecordItem>(`/api/v1/compliance/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getDeadlines: () => request<ComplianceDeadlinesSummary>('/api/v1/compliance/deadlines'),
};
