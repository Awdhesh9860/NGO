export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'TEAM_MEMBER'
  | 'VOLUNTEER'
  | 'DONOR'
  | 'MEMBER'
  | 'CONTENT_EDITOR'
  | 'ACCOUNTANT'
  | 'PROJECT_MANAGER'
  | 'COMMUNICATIONS'
  | 'EXECUTIVE_DIRECTOR'
  | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  designation?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  panNumber?: string;
  givingInterests?: string[];
  givingFrequency?: string;
  isAnonymous?: boolean;
}

export type PermissionKey =
  | 'users.view'
  | 'users.manage'
  | 'roles.manage'
  | 'projects.view'
  | 'projects.manage'
  | 'projects.view_assigned'
  | 'tasks.assign_manage'
  | 'tasks.update_assigned'
  | 'donations.view_all'
  | 'donations.refund'
  | 'donations.view_own'
  | 'content.publish'
  | 'certificates.issue'
  | 'reports.export_financial'
  | 'audit_logs.view'
  | 'settings.manage';

export interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  objectives: string[];
  targetBeneficiaries: string;
  iconName: string;
  image: string;
  stats: { label: string; value: string }[];
  budget: number;
  status: 'active' | 'planned' | 'completed';
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progressPercentage: number;
  completed?: boolean;
  completedAt?: string;
}

export interface Project {
  id: string;
  programId: string;
  programTitle: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  location: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';
  budget: number;
  fundingGoal: number;
  amountRaised: number;
  beneficiariesCount: number;
  managerId: string;
  managerName: string;
  teamMemberIds: string[];
  images: string[];
  milestones: Milestone[];
  impactStats: { label: string; value: string }[];
  category: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  date: string;
  author: string;
  image?: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate: string;
  image: string;
  donorCount: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  beneficiaryInfo: string;
  isUrgent?: boolean;
  updates: CampaignUpdate[];
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  panOrTaxId?: string;
  isAnonymous: boolean;
  amount: number;
  currency: string;
  donationType: 'one-time' | 'recurring';
  frequency?: 'monthly' | 'quarterly' | 'annual';
  campaignId?: string;
  campaignTitle?: string;
  paymentGateway: 'razorpay' | 'stripe' | 'cashfree' | 'bank_transfer';
  transactionId: string;
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  receiptNumber: string;
  taxExemptionEligible: boolean;
  createdAt: string;
  notes?: string;
}

export interface Volunteer {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  interests: string[];
  availability: string;
  experience: string;
  status: 'applied' | 'under_review' | 'approved' | 'active' | 'inactive' | 'rejected';
  assignedProjectIds: string[];
  totalHoursLogged: number;
  rating?: number;
  joinedDate: string;
  profilePhoto?: string;
}

export interface Member {
  id: string;
  userId?: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Youth Ambassador' | 'Annual Supporter' | 'Lifetime Patron' | 'Corporate Member';
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  expiryDate: string;
  renewalDate?: string;
  contributionAmount: number;
  digitalCardQr: string;
}

export interface EventSpeaker {
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  capacity: number;
  registeredCount: number;
  image: string;
  speakers: EventSpeaker[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketCode: string;
  qrCode: string;
  isCheckedIn: boolean;
  registeredAt: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectTitle?: string;
  assignedToId: string;
  assignedToName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
  comments: { id: string; author: string; text: string; createdAt: string }[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'half_day' | 'leave' | 'absent';
  location?: string;
  hoursWorked?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'casual' | 'sick' | 'field_duty' | 'earned';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  recipientName: string;
  recipientEmail: string;
  certificateType: 'Volunteer Service' | 'Participation' | 'Appreciation' | 'Training Completion' | 'Honorary Membership';
  type?: string;
  issueDate: string;
  title: string;
  description: string;
  issuedBy: string;
  issuerRole: string;
  organizationName: string;
  verificationCode: string;
  qrData: string;
  status: 'valid' | 'revoked';
}

export interface CMSArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'blog' | 'news' | 'press_release' | 'success_story';
  author: string;
  authorRole: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  readTimeMinutes: number;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'document';
  url: string;
  category: string;
  sizeBytes?: number;
  uploadedAt: string;
  description?: string;
}

export interface TransparencyReport {
  id: string;
  title: string;
  year: string;
  category: 'annual_report' | 'financial_audit' | 'fcra_return' | 'governance' | 'statutory_compliance';
  fileUrl: string;
  fileSize: string;
  publishedDate: string;
  auditedBy?: string;
  summary: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'donations' | 'volunteering' | 'tax_exemption' | 'csr' | 'general';
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  submittedAt: string;
}

export interface CSRPartner {
  id: string;
  companyName: string;
  logo: string;
  tier: 'Platinum Impact Partner' | 'Gold Community Leader' | 'Silver Ally';
  projectsSupported: string[];
  totalContributed: number;
  partnershipYear: string;
  startDate?: string;
  website?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  userName?: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SystemSettings {
  ngoName: string;
  registrationNumber: string;
  taxExemption80GNumber: string;
  fcraRegistrationNumber: string;
  darpanId: string;
  panNumber: string;
  primaryEmail: string;
  primaryPhone: string;
  headquartersAddress: string;
  currencySymbol: string;
  currencyCode: string;
  razorpayEnabled: boolean;
  stripeEnabled: boolean;
  cashfreeEnabled: boolean;
  bankTransferEnabled: boolean;
  autoSendReceipts: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  maintenanceMode: boolean;
}

export type NewsletterInterest = 'donor' | 'volunteer' | 'both';
export type NewsletterFrequency = 'weekly' | 'monthly' | 'quarterly';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  interest: NewsletterInterest;
  frequency: NewsletterFrequency;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
  leadTags?: string[];
  consentGiven: boolean;
  notes?: string;
}

export type NewsletterSubscriptionInput = Omit<NewsletterSubscriber, 'id' | 'subscribedAt' | 'status'>;

