import { ApiResponse } from '@/lib/api-response';
import {
  ApproveVolunteerAttendanceInput,
  CreateVolunteerApplicationInput,
  CreateVolunteerAssignmentInput,
  CreateVolunteerAttendanceInput,
  IssueVolunteerCertificateInput,
  ReviewVolunteerApplicationInput,
  UpdateVolunteerAssignmentInput,
  UpdateVolunteerProfileInput,
} from '../schemas/volunteer.schema';

export interface VolunteerItem {
  id: string;
  volunteerCode: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  skills: string[];
  areasOfInterest: string[];
  preferredActivities: string[];
  availability: string;
  preferredWorkingDays: string[];
  preferredWorkingHours?: string;
  languagesKnown: string[];
  status: string;
  verificationStatus: string;
  verificationChecks?: {
    emailVerified: boolean;
    mobileVerified: boolean;
    identityRequired: boolean;
    identityVerified: boolean;
    referenceRequired: boolean;
    referenceVerified: boolean;
    backgroundCheckRequired: boolean;
    backgroundCheckConsented: boolean;
    backgroundVerified: boolean;
  };
  verificationDocuments?: Array<{ label: string; documentType: string; storageRef: string; uploadedAt: string }>;
  verifiedAt?: string;
  verifiedMinutesTotal: number;
  verifiedHoursTotal: number;
  completedAssignmentsCount: number;
  createdAt: string;
}

export interface VolunteerApplicationItem {
  _id: string;
  applicationCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  city?: string;
  district?: string;
  state?: string;
  skills: string[];
  areasOfInterest: string[];
  availability: string;
  status: string;
  interviewScheduledAt?: string;
  interviewMode?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface VolunteerAssignmentItem {
  _id: string;
  roleTitle: string;
  responsibilities: string;
  requiresVerification: boolean;
  startDate: string;
  endDate?: string;
  scheduledDays: string[];
  status: string;
  programId?: { _id: string; title: string; code: string } | string;
  projectId?: { _id: string; name: string; code: string } | string;
  supervisorId?: { _id: string; name: string; role: string } | string;
}

export interface VolunteerAttendanceItem {
  _id: string;
  attendanceDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  minutesLogged: number;
  status: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  activityDescription: string;
  entrySource: string;
  correctionReason?: string;
  projectId?: { _id: string; name: string; code: string } | string;
}

export interface VolunteerCertificateItem {
  _id?: string;
  certificateNumber: string;
  verificationCode: string;
  certificateType: 'PARTICIPATION' | 'EXPERIENCE';
  title: string;
  volunteerNameSnapshot?: string;
  recipientName?: string;
  organizationNameSnapshot?: string;
  organizationName?: string;
  projectNameSnapshot?: string;
  projectName?: string;
  participationStartDate: string;
  participationEndDate: string;
  verifiedHours: number;
  signatoryName: string;
  signatoryRole: string;
  issueDate: string;
  status: 'ISSUED' | 'CANCELLED';
}

export interface VolunteerHoursSummaryData {
  verifiedMinutes: number;
  verifiedHours: number;
  pendingMinutes: number;
  pendingHours: number;
  approvedSessions: number;
  pendingSessions: number;
  monthlyBreakdown: Array<{ month: string; minutes: number; hours: number }>;
}

export class VolunteerApiService {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    return await res.json();
  }

  async listVolunteers(params: { status?: string; verificationStatus?: string; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.verificationStatus) q.set('verificationStatus', params.verificationStatus);
    if (params.search) q.set('search', params.search);
    return this.fetchJson<VolunteerItem[]>(`/api/v1/volunteers?${q.toString()}`);
  }

  async getVolunteerDetail(id: string) {
    return this.fetchJson<{
      volunteer: VolunteerItem;
      assignments: VolunteerAssignmentItem[];
      attendance: VolunteerAttendanceItem[];
      hoursSummary: VolunteerHoursSummaryData;
      certificates: VolunteerCertificateItem[];
    }>(`/api/v1/volunteers/${id}`);
  }

  async updateVolunteer(id: string, data: UpdateVolunteerProfileInput) {
    return this.fetchJson<VolunteerItem>(`/api/v1/volunteers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listApplications(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchJson<VolunteerApplicationItem[]>(`/api/v1/volunteers/applications${q}`);
  }

  async submitApplication(data: CreateVolunteerApplicationInput) {
    return this.fetchJson<{ id: string; applicationCode: string; status: string }>(
      '/api/v1/volunteers/applications',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async reviewApplication(id: string, data: ReviewVolunteerApplicationInput) {
    return this.fetchJson(`/api/v1/volunteers/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createAssignment(volunteerId: string, data: CreateVolunteerAssignmentInput) {
    return this.fetchJson<VolunteerAssignmentItem>(`/api/v1/volunteers/${volunteerId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssignment(volunteerId: string, data: UpdateVolunteerAssignmentInput) {
    return this.fetchJson<VolunteerAssignmentItem>(`/api/v1/volunteers/${volunteerId}/assignments`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async recordAttendance(volunteerId: string, data: CreateVolunteerAttendanceInput) {
    return this.fetchJson<VolunteerAttendanceItem>(`/api/v1/volunteers/${volunteerId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reviewAttendance(volunteerId: string, data: ApproveVolunteerAttendanceInput) {
    return this.fetchJson<VolunteerAttendanceItem>(`/api/v1/volunteers/${volunteerId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async issueCertificate(volunteerId: string, data: IssueVolunteerCertificateInput) {
    return this.fetchJson<VolunteerCertificateItem>(
      `/api/v1/volunteers/${volunteerId}/certificates`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async verifyCertificatePublic(code: string) {
    return this.fetchJson<VolunteerCertificateItem>(
      `/api/v1/public/certificates/${encodeURIComponent(code)}`
    );
  }
}

export const volunteerApiService = new VolunteerApiService();
