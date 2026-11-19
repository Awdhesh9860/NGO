import { renderEmailLayout } from './base.layout';

export interface StakeholderRenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// ======================== VOLUNTEER NOTIFICATIONS ========================

export function renderVolunteerApplicationReceivedEmail({
  applicantName,
  applicationCode,
  organizationName = 'HopeHorizon Foundation',
}: {
  applicantName: string;
  applicationCode: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const subject = `Volunteer Application Received (${applicationCode})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Volunteer Application Submitted</h2>
    <p>Hello ${applicantName},</p>
    <p>Thank you for applying to volunteer with <strong>${organizationName}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Application Code:</strong> ${applicationCode}<br />
      <strong>Status:</strong> SUBMITTED (Pending Review)
    </p>
    <p>Our volunteer coordination team will review your application and notify you of the next steps.</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${applicantName},\n\nYour volunteer application ${applicationCode} has been received by ${organizationName} and is pending review.`,
  };
}

export function renderVolunteerInterviewScheduledEmail({
  applicantName,
  applicationCode,
  scheduledAt,
  mode,
  locationOrLink,
  organizationName = 'HopeHorizon Foundation',
}: {
  applicantName: string;
  applicationCode: string;
  scheduledAt: string;
  mode: string;
  locationOrLink?: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const subject = `Volunteer Interview Scheduled (${applicationCode})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Volunteer Orientation / Interview Scheduled</h2>
    <p>Hello ${applicantName},</p>
    <p>${organizationName} has scheduled an interview for your volunteer application <strong>${applicationCode}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Date & Time:</strong> ${scheduledAt}<br />
      <strong>Mode:</strong> ${mode}<br />
      ${locationOrLink ? `<strong>Location / Link:</strong> ${locationOrLink}` : ''}
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${applicantName},\n\nYour volunteer interview for ${applicationCode} is scheduled for ${scheduledAt} (${mode}).`,
  };
}

export function renderVolunteerDecisionEmail({
  applicantName,
  applicationCode,
  decision,
  reason,
  volunteerCode,
  organizationName = 'HopeHorizon Foundation',
}: {
  applicantName: string;
  applicationCode: string;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
  volunteerCode?: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const subject = `Volunteer Application ${decision} (${applicationCode})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: ${decision === 'APPROVED' ? '#087F5B' : '#be123c'}; font-size: 20px;">
      Volunteer Application ${decision}
    </h2>
    <p>Hello ${applicantName},</p>
    ${
      decision === 'APPROVED'
        ? `<p>Welcome aboard! Your volunteer application with <strong>${organizationName}</strong> has been approved.${
            volunteerCode ? ` Your Volunteer Code is <strong>${volunteerCode}</strong>.` : ''
          }</p>`
        : `<p>Thank you for your interest in volunteering with ${organizationName}. At this time, your application (${applicationCode}) was not approved.</p>${
            reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''
          }`
    }
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${applicantName},\n\nYour volunteer application ${applicationCode} was ${decision}.${
      volunteerCode ? ` Volunteer Code: ${volunteerCode}` : ''
    }${reason ? ` Reason: ${reason}` : ''}`,
  };
}

export function renderVolunteerAssignmentEmail({
  volunteerName,
  roleTitle,
  status,
  startDate,
  projectName,
}: {
  volunteerName: string;
  roleTitle: string;
  status: string;
  startDate: string;
  projectName?: string;
}): StakeholderRenderedEmail {
  const subject = `Volunteer Assignment ${status}: ${roleTitle}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Volunteer Assignment Update</h2>
    <p>Hello ${volunteerName},</p>
    <p>Your volunteer assignment has been updated:</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Role:</strong> ${roleTitle}<br />
      ${projectName ? `<strong>Project:</strong> ${projectName}<br />` : ''}
      <strong>Start Date:</strong> ${startDate}<br />
      <strong>Status:</strong> ${status}
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${volunteerName},\n\nVolunteer assignment "${roleTitle}"${
      projectName ? ` (${projectName})` : ''
    } is now ${status} starting ${startDate}.`,
  };
}

export function renderAttendanceCorrectionEmail({
  recipientName,
  volunteerName,
  attendanceDate,
  reason,
}: {
  recipientName: string;
  volunteerName: string;
  attendanceDate: string;
  reason: string;
}): StakeholderRenderedEmail {
  const subject = `Volunteer Attendance Correction Request (${attendanceDate})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #b45309; font-size: 20px;">Attendance Correction Submitted</h2>
    <p>Hello ${recipientName},</p>
    <p>An attendance correction request has been logged for <strong>${volunteerName}</strong> on <strong>${attendanceDate}</strong>.</p>
    <p><strong>Reason:</strong> ${reason}</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\nAttendance correction submitted for ${volunteerName} on ${attendanceDate}. Reason: ${reason}`,
  };
}

export function renderVolunteerCertificateIssuedEmail({
  volunteerName,
  certificateNumber,
  certificateType,
  verifiedHours,
  verifyUrl,
  organizationName = 'HopeHorizon Foundation',
}: {
  volunteerName: string;
  certificateNumber: string;
  certificateType: string;
  verifiedHours: number;
  verifyUrl: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const subject = `Official Volunteer Certificate Issued (${certificateNumber})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Volunteer ${certificateType} Certificate Issued</h2>
    <p>Dear ${volunteerName},</p>
    <p>Thank you for your dedicated service to <strong>${organizationName}</strong>. Your official certificate has been issued based on your approved attendance records.</p>
    <p style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px;">
      <strong>Certificate Number:</strong> ${certificateNumber}<br />
      <strong>Verified Service Hours:</strong> ${verifiedHours} hrs
    </p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${verifyUrl}" class="button" target="_blank" rel="noopener noreferrer">Verify Certificate Online</a>
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${volunteerName},\n\nYour volunteer certificate ${certificateNumber} (${verifiedHours} verified hours) has been issued by ${organizationName}.\nVerify: ${verifyUrl}`,
  };
}

// ======================== MEMBERSHIP NOTIFICATIONS ========================

export function renderMembershipApplicationReceivedEmail({
  applicantName,
  applicationCode,
  category,
  organizationName = 'HopeHorizon Foundation',
}: {
  applicantName: string;
  applicationCode: string;
  category: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const subject = `Membership Application Received (${applicationCode})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Membership Application Submitted</h2>
    <p>Hello ${applicantName},</p>
    <p>We have received your <strong>${category}</strong> membership application for <strong>${organizationName}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Application Code:</strong> ${applicationCode}<br />
      <strong>Status:</strong> SUBMITTED (Awaiting Governance Review)
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${applicantName},\n\nYour ${category} membership application (${applicationCode}) has been received by ${organizationName} and is awaiting review.`,
  };
}

export function renderMembershipStatusEmail({
  memberName,
  membershipNumber,
  status,
  reason,
  expiryDate,
  organizationName = 'HopeHorizon Foundation',
}: {
  memberName: string;
  membershipNumber?: string;
  status: 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'RENEWAL_REMINDER';
  reason?: string;
  expiryDate?: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const labelMap: Record<typeof status, string> = {
    APPROVED: 'Membership Approved',
    REJECTED: 'Membership Application Not Approved',
    ACTIVE: 'Membership Activated',
    EXPIRED: 'Membership Expired',
    SUSPENDED: 'Membership Suspended',
    CANCELLED: 'Membership Cancelled',
    RENEWAL_REMINDER: 'Membership Renewal Reminder',
  };
  const title = labelMap[status];
  const subject = `${title}${membershipNumber ? ` (${membershipNumber})` : ''} — ${organizationName}`;
  const accent = ['APPROVED', 'ACTIVE'].includes(status)
    ? '#087F5B'
    : status === 'RENEWAL_REMINDER'
    ? '#b45309'
    : '#be123c';

  const bodyHtml = `
    <h2 style="margin-top: 0; color: ${accent}; font-size: 20px;">${title}</h2>
    <p>Dear ${memberName},</p>
    <p>This is an official membership update from <strong>${organizationName}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      ${membershipNumber ? `<strong>Membership Number:</strong> ${membershipNumber}<br />` : ''}
      <strong>Status:</strong> ${status.replace(/_/g, ' ')}<br />
      ${expiryDate ? `<strong>Validity / Expiry Date:</strong> ${expiryDate}` : ''}
    </p>
    ${reason ? `<p><strong>Details:</strong> ${reason}</p>` : ''}
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${memberName},\n\n${title} (${membershipNumber || 'N/A'}) at ${organizationName}.${
      expiryDate ? ` Expiry: ${expiryDate}.` : ''
    }${reason ? ` Details: ${reason}` : ''}`,
  };
}

// ======================== BENEFICIARY NOTIFICATIONS (ZERO SENSITIVE CASE DATA) ========================

/**
 * Privacy-safe operational beneficiary notice.
 * STRICT RULE: Never include sensitive demographic details, vulnerability flags,
 * safeguarding notes, or restricted case notes in ordinary email notifications.
 */
export function renderBeneficiaryOperationalEmail({
  recipientName,
  beneficiaryCode,
  eventType,
  scheduledDate,
  organizationName = 'HopeHorizon Foundation',
}: {
  recipientName: string;
  beneficiaryCode: string;
  eventType:
    | 'REGISTRATION_RECEIVED'
    | 'STATUS_UPDATED'
    | 'ENROLLMENT_CONFIRMED'
    | 'ASSISTANCE_SCHEDULED'
    | 'FOLLOW_UP_REMINDER';
  scheduledDate?: string;
  organizationName?: string;
}): StakeholderRenderedEmail {
  const titles: Record<typeof eventType, string> = {
    REGISTRATION_RECEIVED: 'Program Registration Recorded',
    STATUS_UPDATED: 'Program Registration Status Updated',
    ENROLLMENT_CONFIRMED: 'Program Enrollment Confirmed',
    ASSISTANCE_SCHEDULED: 'Scheduled Support Appointment',
    FOLLOW_UP_REMINDER: 'Upcoming Follow-up Reminder',
  };
  const title = titles[eventType];
  const subject = `${title} (${beneficiaryCode}) — ${organizationName}`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">${title}</h2>
    <p>Hello ${recipientName},</p>
    <p>This is a routine operational update from <strong>${organizationName}</strong> regarding reference <strong>${beneficiaryCode}</strong>.</p>
    ${
      scheduledDate
        ? `<p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
             <strong>Scheduled Date:</strong> ${scheduledDate}
           </p>`
        : ''
    }
    <p>For privacy protection, detailed program information is never sent over standard email. Please contact your assigned coordinator directly if you have questions.</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\n${title} for reference ${beneficiaryCode} at ${organizationName}.${
      scheduledDate ? ` Scheduled date: ${scheduledDate}.` : ''
    } Detailed records are kept private and never sent via email.`,
  };
}
