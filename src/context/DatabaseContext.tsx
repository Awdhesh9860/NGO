import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Program,
  Project,
  Campaign,
  Donation,
  Volunteer,
  Member,
  Event,
  EventRegistration,
  StaffTask,
  AttendanceRecord,
  LeaveRequest,
  Certificate,
  CMSArticle,
  TransparencyReport,
  FAQItem,
  ContactInquiry,
  CSRPartner,
  AuditLog,
  SystemSettings,
  NewsletterSubscriber,
  NewsletterSubscriptionInput
} from '../types';
import {
  INITIAL_PROGRAMS,
  INITIAL_PROJECTS,
  INITIAL_CAMPAIGNS,
  INITIAL_DONATIONS,
  INITIAL_VOLUNTEERS,
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_CERTIFICATES,
  INITIAL_CMS_ARTICLES,
  INITIAL_TRANSPARENCY_REPORTS,
  INITIAL_FAQS,
  INITIAL_CSR_PARTNERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_NEWSLETTER_SUBSCRIBERS
} from '../data/mockDatabase';

interface DatabaseContextType {
  programs: Program[];
  projects: Project[];
  campaigns: Campaign[];
  donations: Donation[];
  volunteers: Volunteer[];
  members: Member[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  tasks: StaffTask[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  certificates: Certificate[];
  articles: CMSArticle[];
  reports: TransparencyReport[];
  faqs: FAQItem[];
  partners: CSRPartner[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Actions
  addDonation: (donationData: Omit<Donation, 'id' | 'receiptNumber' | 'createdAt' | 'status'>) => Donation;
  refundDonation: (donationId: string) => void;
  addVolunteerApplication: (volData: Omit<Volunteer, 'id' | 'status' | 'assignedProjectIds' | 'totalHoursLogged' | 'joinedDate'>) => Volunteer;
  updateVolunteerStatus: (volunteerId: string, status: Volunteer['status']) => void;
  logVolunteerHours: (volunteerId: string, hours: number) => void;
  addMemberRegistration: (memberData: Omit<Member, 'id' | 'memberId' | 'status' | 'startDate' | 'expiryDate' | 'digitalCardQr'>) => Member;
  registerForEvent: (eventId: string, name: string, email: string, phone?: string) => EventRegistration;
  checkInEventAttendee: (registrationId: string) => void;
  createTask: (taskData: Omit<StaffTask, 'id' | 'createdAt' | 'comments'>) => StaffTask;
  updateTaskStatus: (taskId: string, status: StaffTask['status']) => void;
  addTaskComment: (taskId: string, author: string, text: string) => void;
  clockIn: (userId: string, userName: string, location?: string) => AttendanceRecord;
  clockOut: (userId: string) => void;
  submitLeaveRequest: (userId: string, userName: string, leaveType: LeaveRequest['leaveType'], startDate: string, endDate: string, reason: string) => LeaveRequest;
  updateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected') => void;
  issueCertificate: (certData: Omit<Certificate, 'id' | 'certificateNumber' | 'issueDate' | 'verificationCode' | 'qrData' | 'status'>) => Certificate;
  verifyCertificateCode: (codeOrNumber: string) => Certificate | null;
  createArticle: (articleData: Omit<CMSArticle, 'id' | 'publishedAt'>) => CMSArticle;
  updateArticleStatus: (articleId: string, status: CMSArticle['status']) => void;
  submitContactInquiry: (inquiryData: Omit<ContactInquiry, 'id' | 'status' | 'submittedAt'>) => ContactInquiry;
  updateInquiryStatus: (inquiryId: string, status: ContactInquiry['status']) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  createProject: (projectData: Omit<Project, 'id' | 'amountRaised' | 'milestones'>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'raisedAmount' | 'donorCount' | 'updates'>) => Campaign;
  addCampaignUpdate: (
    campaignId: string,
    titleOrUpdate: string | { title: string; content: string; author?: string },
    content?: string,
    author?: string
  ) => void;
  recordAuditLog: (actorId: string, actorName: string, actorRole: string, action: string, resource: string, details: string, resourceId?: string) => void;

  // Newsletter Subscriptions & Lead Capturing
  subscribers: NewsletterSubscriber[];
  subscribeNewsletter: (subscriberData: NewsletterSubscriptionInput) => {
    success: boolean;
    message: string;
    subscriber: NewsletterSubscriber;
    isUpdate?: boolean;
  };
  unsubscribeNewsletter: (email: string) => void;

  // Compatibility aliases
  volunteerApplications: Volunteer[];
  addProject: (projectData: any) => Project;
  addCampaign: (campaignData: any) => Campaign;
  addReport: (reportData: any) => any;
  addAuditLog: (logData: any) => void;
  memberships: Member[];
  addMembership: (memberData: any) => Member;
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: any) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Keys paired with their setters, used both to hydrate from localStorage on
// mount and (below) to persist changes back to it.
type StorageKey =
  | 'hh_db_programs'
  | 'hh_db_projects'
  | 'hh_db_campaigns'
  | 'hh_db_donations'
  | 'hh_db_volunteers'
  | 'hh_db_members'
  | 'hh_db_events'
  | 'hh_db_event_registrations'
  | 'hh_db_tasks'
  | 'hh_db_attendance'
  | 'hh_db_leave_requests'
  | 'hh_db_certificates'
  | 'hh_db_articles'
  | 'hh_db_inquiries'
  | 'hh_db_audit_logs'
  | 'hh_db_subscribers'
  | 'hh_db_settings';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State always starts from the deterministic mock dataset so server-rendered
  // HTML matches the client's first render; persisted overrides are applied
  // in a mount-only effect below (localStorage is unavailable during SSR).
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [tasks, setTasks] = useState<StaffTask[]>(INITIAL_TASKS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [articles, setArticles] = useState<CMSArticle[]>(INITIAL_CMS_ARTICLES);

  const [reports] = useState<TransparencyReport[]>(INITIAL_TRANSPARENCY_REPORTS);
  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [partners] = useState<CSRPartner[]>(INITIAL_CSR_PARTNERS);

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(INITIAL_NEWSLETTER_SUBSCRIBERS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  // One-time hydration from localStorage after mount (client only).
  useEffect(() => {
    const read = <T,>(key: StorageKey): T | null => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch (e) {
        console.error(`Error hydrating ${key} from localStorage`, e);
        return null;
      }
    };

    const apply = <T,>(key: StorageKey, setter: (v: T) => void) => {
      const value = read<T>(key);
      if (value !== null) setter(value);
    };

    apply<Program[]>('hh_db_programs', setPrograms);
    apply<Project[]>('hh_db_projects', setProjects);
    apply<Campaign[]>('hh_db_campaigns', setCampaigns);
    apply<Donation[]>('hh_db_donations', setDonations);
    apply<Volunteer[]>('hh_db_volunteers', setVolunteers);
    apply<Member[]>('hh_db_members', setMembers);
    apply<Event[]>('hh_db_events', setEvents);
    apply<EventRegistration[]>('hh_db_event_registrations', setEventRegistrations);
    apply<StaffTask[]>('hh_db_tasks', setTasks);
    apply<AttendanceRecord[]>('hh_db_attendance', setAttendance);
    apply<LeaveRequest[]>('hh_db_leave_requests', setLeaveRequests);
    apply<Certificate[]>('hh_db_certificates', setCertificates);
    apply<CMSArticle[]>('hh_db_articles', setArticles);
    apply<ContactInquiry[]>('hh_db_inquiries', setInquiries);
    apply<AuditLog[]>('hh_db_audit_logs', setAuditLogs);
    apply<NewsletterSubscriber[]>('hh_db_subscribers', setSubscribers);
    apply<SystemSettings>('hh_db_settings', setSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('hh_db_programs', JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem('hh_db_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('hh_db_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('hh_db_donations', JSON.stringify(donations)); }, [donations]);
  useEffect(() => { localStorage.setItem('hh_db_volunteers', JSON.stringify(volunteers)); }, [volunteers]);
  useEffect(() => { localStorage.setItem('hh_db_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('hh_db_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('hh_db_event_registrations', JSON.stringify(eventRegistrations)); }, [eventRegistrations]);
  useEffect(() => { localStorage.setItem('hh_db_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('hh_db_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('hh_db_leave_requests', JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem('hh_db_certificates', JSON.stringify(certificates)); }, [certificates]);
  useEffect(() => { localStorage.setItem('hh_db_articles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('hh_db_inquiries', JSON.stringify(inquiries)); }, [inquiries]);
  useEffect(() => { localStorage.setItem('hh_db_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('hh_db_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('hh_db_subscribers', JSON.stringify(subscribers)); }, [subscribers]);

  const recordAuditLog = (
    actorId: string,
    actorName: string,
    actorRole: string,
    action: string,
    resource: string,
    details: string,
    resourceId?: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId,
      actorName,
      actorRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress: '103.21.144.' + Math.floor(Math.random() * 200 + 10),
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addDonation = (donationData: Omit<Donation, 'id' | 'receiptNumber' | 'createdAt' | 'status'>): Donation => {
    const receiptNum = `HH-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDonation: Donation = {
      ...donationData,
      id: `don-${Date.now()}`,
      receiptNumber: receiptNum,
      status: 'successful',
      createdAt: new Date().toISOString()
    };

    setDonations((prev) => [newDonation, ...prev]);

    // If campaign linked, update campaign raised amount & donor count
    if (newDonation.campaignId) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === newDonation.campaignId
            ? {
                ...c,
                raisedAmount: c.raisedAmount + newDonation.amount,
                donorCount: c.donorCount + 1
              }
            : c
        )
      );
    }

    recordAuditLog(
      'system',
      newDonation.isAnonymous ? 'Anonymous Donor' : newDonation.donorName,
      'DONOR',
      'DONATION_RECEIVED',
      'Donation',
      `Processed ${newDonation.currency} ${newDonation.amount.toLocaleString('en-US')} via ${newDonation.paymentGateway}. Receipt #${receiptNum}`,
      newDonation.id
    );

    return newDonation;
  };

  const refundDonation = (donationId: string) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === donationId ? { ...d, status: 'refunded' } : d))
    );
    recordAuditLog(
      'admin',
      'Authorized Officer',
      'ADMIN',
      'DONATION_REFUNDED',
      'Donation',
      `Processed financial refund for donation #${donationId}`,
      donationId
    );
  };

  const addVolunteerApplication = (
    volData: Omit<Volunteer, 'id' | 'status' | 'assignedProjectIds' | 'totalHoursLogged' | 'joinedDate'>
  ): Volunteer => {
    const newVol: Volunteer = {
      ...volData,
      id: `vol-${Date.now()}`,
      status: 'applied',
      assignedProjectIds: [],
      totalHoursLogged: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setVolunteers((prev) => [newVol, ...prev]);
    recordAuditLog(
      'applicant',
      newVol.name,
      'VOLUNTEER',
      'VOLUNTEER_APPLIED',
      'Volunteer',
      `Volunteer application submitted with skills: ${newVol.skills.join(', ')}`,
      newVol.id
    );
    return newVol;
  };

  const updateVolunteerStatus = (volunteerId: string, status: Volunteer['status']) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === volunteerId ? { ...v, status } : v))
    );
    recordAuditLog(
      'admin',
      'Volunteer Coordinator',
      'ADMIN',
      'VOLUNTEER_STATUS_UPDATED',
      'Volunteer',
      `Updated volunteer ${volunteerId} status to ${status}`,
      volunteerId
    );
  };

  const logVolunteerHours = (volunteerId: string, hours: number) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, totalHoursLogged: (v.totalHoursLogged || 0) + hours }
          : v
      )
    );
  };

  const addMemberRegistration = (
    memberData: Omit<Member, 'id' | 'memberId' | 'status' | 'startDate' | 'expiryDate' | 'digitalCardQr'>
  ): Member => {
    const memberId = `HH-MEM-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
      memberId,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-12-31',
      digitalCardQr: `HH-VERIFIED-${memberId}`
    };
    setMembers((prev) => [newMember, ...prev]);
    recordAuditLog(
      'member',
      newMember.name,
      'MEMBER',
      'MEMBERSHIP_ENROLLED',
      'Member',
      `Enrolled under tier ${newMember.tier} with ID ${memberId}`,
      newMember.id
    );
    return newMember;
  };

  const registerForEvent = (
    eventId: string,
    name: string,
    email: string,
    phone?: string
  ): EventRegistration => {
    const targetEvent = events.find((e) => e.id === eventId);
    const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newReg: EventRegistration = {
      id: `ereg-${Date.now()}`,
      eventId,
      eventTitle: targetEvent?.title || 'NGO Event',
      attendeeName: name,
      attendeeEmail: email,
      attendeePhone: phone || '',
      ticketCode,
      qrCode: `EVENT-PASS-${ticketCode}`,
      isCheckedIn: false,
      registeredAt: new Date().toISOString()
    };
    setEventRegistrations((prev) => [newReg, ...prev]);
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
      )
    );
    return newReg;
  };

  const checkInEventAttendee = (registrationId: string) => {
    setEventRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId ? { ...r, isCheckedIn: true } : r
      )
    );
  };

  const createTask = (taskData: Omit<StaffTask, 'id' | 'createdAt' | 'comments'>): StaffTask => {
    const newTask: StaffTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: []
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = (taskId: string, status: StaffTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const addTaskComment = (taskId: string, author: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), newComment] }
          : t
      )
    );
  };

  const clockIn = (userId: string, userName: string, location?: string): AttendanceRecord => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId,
      userName,
      date: today,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'present',
      location: location || 'Field Project Base',
      hoursWorked: 0
    };
    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const clockOut = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance((prev) =>
      prev.map((a) =>
        a.userId === userId && a.date === today && !a.checkOutTime
          ? {
              ...a,
              checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              hoursWorked: 8.5
            }
          : a
      )
    );
  };

  const submitLeaveRequest = (
    userId: string,
    userName: string,
    leaveType: LeaveRequest['leaveType'],
    startDate: string,
    endDate: string,
    reason: string
  ): LeaveRequest => {
    const newReq: LeaveRequest = {
      id: `lvr-${Date.now()}`,
      userId,
      userName,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const updateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
    );
  };

  const issueCertificate = (
    certData: Omit<Certificate, 'id' | 'certificateNumber' | 'issueDate' | 'verificationCode' | 'qrData' | 'status'>
  ): Certificate => {
    const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certNum = `HH-CERT-${certData.certificateType.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationCode = `VERIFY-${certNum}-${randCode}`;
    const newCert: Certificate = {
      ...certData,
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      issueDate: new Date().toISOString().split('T')[0],
      verificationCode,
      qrData: `https://hopehorizon.org/verify-certificate/${certNum}`,
      status: 'valid'
    };
    setCertificates((prev) => [newCert, ...prev]);
    recordAuditLog(
      'admin',
      certData.issuedBy,
      'ADMIN',
      'CERTIFICATE_ISSUED',
      'Certificate',
      `Issued ${certData.certificateType} Certificate #${certNum} to ${certData.recipientName}`,
      newCert.id
    );
    return newCert;
  };

  const verifyCertificateCode = (codeOrNumber: string): Certificate | null => {
    const query = codeOrNumber.trim().toUpperCase();
    const found = certificates.find(
      (c) =>
        c.certificateNumber.toUpperCase() === query ||
        c.verificationCode.toUpperCase() === query ||
        c.id.toUpperCase() === query
    );
    return found || null;
  };

  const createArticle = (articleData: Omit<CMSArticle, 'id' | 'publishedAt'>): CMSArticle => {
    const newArticle: CMSArticle = {
      ...articleData,
      id: `art-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0]
    };
    setArticles((prev) => [newArticle, ...prev]);
    recordAuditLog(
      'editor',
      articleData.author,
      'CONTENT_EDITOR',
      'CMS_ARTICLE_CREATED',
      'CMSArticle',
      `Authored article "${articleData.title}" under ${articleData.category}`,
      newArticle.id
    );
    return newArticle;
  };

  const updateArticleStatus = (articleId: string, status: CMSArticle['status']) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, status } : a))
    );
  };

  const submitContactInquiry = (
    inquiryData: Omit<ContactInquiry, 'id' | 'status' | 'submittedAt'>
  ): ContactInquiry => {
    const newInquiry: ContactInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      status: 'new',
      submittedAt: new Date().toISOString()
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  };

  const updateInquiryStatus = (inquiryId: string, status: ContactInquiry['status']) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const createProject = (projectData: Omit<Project, 'id' | 'amountRaised' | 'milestones'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      amountRaised: 0,
      milestones: []
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
  };

  const createCampaign = (
    campaignData: Omit<Campaign, 'id' | 'raisedAmount' | 'donorCount' | 'updates'>
  ): Campaign => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      raisedAmount: 0,
      donorCount: 0,
      updates: []
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  };

  const addCampaignUpdate = (
    campaignId: string,
    titleOrUpdate: string | { title: string; content: string; author?: string },
    content?: string,
    author?: string
  ) => {
    let updateTitle = '';
    let updateContent = '';
    let updateAuthor = '';

    if (typeof titleOrUpdate === 'string') {
      updateTitle = titleOrUpdate;
      updateContent = content || '';
      updateAuthor = author || 'Staff Member';
    } else if (titleOrUpdate && typeof titleOrUpdate === 'object') {
      updateTitle = titleOrUpdate.title;
      updateContent = titleOrUpdate.content;
      updateAuthor = titleOrUpdate.author || 'Field Coordinator';
    }

    const newUpdate = {
      id: `cu-${Date.now()}`,
      campaignId,
      title: updateTitle,
      content: updateContent,
      date: new Date().toISOString().split('T')[0],
      author: updateAuthor
    };
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, updates: [newUpdate, ...(c.updates || [])] }
          : c
      )
    );
  };

  const subscribeNewsletter = (data: NewsletterSubscriptionInput) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingIndex = subscribers.findIndex(
      (s) => s.email.toLowerCase() === normalizedEmail
    );

    const leadTags = [...(data.leadTags || [])];
    if (data.interest === 'donor') {
      if (!leadTags.includes('Donor Lead')) leadTags.push('Donor Lead');
      if (!leadTags.includes('80G Tax Exemption')) leadTags.push('80G Tax Exemption');
    } else if (data.interest === 'volunteer') {
      if (!leadTags.includes('Volunteer Lead')) leadTags.push('Volunteer Lead');
      if (!leadTags.includes('Fieldwork Updates')) leadTags.push('Fieldwork Updates');
    } else if (data.interest === 'both') {
      if (!leadTags.includes('Donor Lead')) leadTags.push('Donor Lead');
      if (!leadTags.includes('Volunteer Lead')) leadTags.push('Volunteer Lead');
      if (!leadTags.includes('All Dispatches')) leadTags.push('All Dispatches');
    }

    if (existingIndex >= 0) {
      const existing = subscribers[existingIndex];
      const updatedSubscriber: NewsletterSubscriber = {
        ...existing,
        fullName: data.fullName?.trim() || existing.fullName,
        phone: data.phone?.trim() || existing.phone,
        interest: data.interest,
        frequency: data.frequency,
        status: 'active',
        consentGiven: true,
        source: data.source || existing.source || 'footer',
        leadTags: Array.from(new Set([...(existing.leadTags || []), ...leadTags])),
        notes: data.notes || existing.notes
      };

      setSubscribers((prev) =>
        prev.map((s, idx) => (idx === existingIndex ? updatedSubscriber : s))
      );

      recordAuditLog(
        'system',
        data.fullName || normalizedEmail,
        'SUBSCRIBER',
        'NEWSLETTER_PREFERENCES_UPDATED',
        'Newsletter',
        `Updated subscription preferences for ${normalizedEmail} (${data.interest.toUpperCase()} lead).`,
        updatedSubscriber.id
      );

      return {
        success: true,
        message: `Welcome back! Your preferences have been updated for ${data.interest === 'both' ? 'donor and volunteer' : data.interest} dispatches.`,
        subscriber: updatedSubscriber,
        isUpdate: true
      };
    } else {
      const newSubscriber: NewsletterSubscriber = {
        id: `sub-${Date.now()}`,
        email: normalizedEmail,
        fullName: data.fullName?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        interest: data.interest,
        frequency: data.frequency,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: data.source || 'footer',
        leadTags,
        consentGiven: true,
        notes: data.notes
      };

      setSubscribers((prev) => [newSubscriber, ...prev]);

      recordAuditLog(
        'system',
        data.fullName || normalizedEmail,
        'SUBSCRIBER',
        'NEWSLETTER_SUBSCRIBED',
        'Newsletter',
        `New ${data.interest.toUpperCase()} lead captured: ${normalizedEmail} via ${newSubscriber.source}.`,
        newSubscriber.id
      );

      return {
        success: true,
        message: `Thank you for subscribing! You will receive verified ${data.interest === 'both' ? 'donor & volunteer' : data.interest} dispatches.`,
        subscriber: newSubscriber,
        isUpdate: false
      };
    }
  };

  const unsubscribeNewsletter = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setSubscribers((prev) =>
      prev.map((s) =>
        s.email.toLowerCase() === normalizedEmail ? { ...s, status: 'unsubscribed' } : s
      )
    );
  };

  // Compatibility methods
  const addProject = (projectData: any) => createProject(projectData);
  const addCampaign = (campaignData: any) => createCampaign(campaignData);
  const addReport = (reportData: any) => reportData;
  const addAuditLog = (logData: any) => {
    recordAuditLog(
      logData.actorId || 'system',
      logData.actorName || logData.userName || 'Anonymous',
      logData.actorRole || 'VOLUNTEER',
      logData.action || 'ACTIVITY',
      logData.resource || 'General',
      logData.details || '',
      logData.resourceId
    );
  };
  const addMembership = (memberData: any) => addMemberRegistration(memberData);
  const updateMilestoneStatus = (projectId: string, milestoneId: string, status: any) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          milestones: proj.milestones.map((m) =>
            m.id === milestoneId ? { ...m, status, completed: status === 'completed' } : m
          )
        };
      })
    );
  };

  return (
    <DatabaseContext.Provider
      value={{
        programs,
        projects,
        campaigns,
        donations,
        volunteers,
        members,
        events,
        eventRegistrations,
        tasks,
        attendance,
        leaveRequests,
        certificates,
        articles,
        reports,
        faqs,
        partners,
        auditLogs,
        settings,
        subscribers,
        subscribeNewsletter,
        unsubscribeNewsletter,
        volunteerApplications: volunteers,
        addProject,
        addCampaign,
        addReport,
        addAuditLog,
        memberships: members,
        addMembership,
        updateMilestoneStatus,
        addDonation,
        refundDonation,
        addVolunteerApplication,
        updateVolunteerStatus,
        logVolunteerHours,
        addMemberRegistration,
        registerForEvent,
        checkInEventAttendee,
        createTask,
        updateTaskStatus,
        addTaskComment,
        clockIn,
        clockOut,
        submitLeaveRequest,
        updateLeaveStatus,
        issueCertificate,
        verifyCertificateCode,
        createArticle,
        updateArticleStatus,
        submitContactInquiry,
        updateInquiryStatus,
        updateSettings,
        createProject,
        updateProject,
        createCampaign,
        addCampaignUpdate,
        recordAuditLog
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
