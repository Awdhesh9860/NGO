import { renderEmailLayout } from './base.layout';

export function renderProjectAssignmentEmail({
  recipientName,
  projectName,
  responsibility,
  assignedBy,
  projectUrl,
  organizationName = 'HopeHorizon Foundation',
}: {
  recipientName: string;
  projectName: string;
  responsibility: string;
  assignedBy: string;
  projectUrl: string;
  organizationName?: string;
}) {
  const subject = `Assigned to Project: ${projectName}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Project Team Assignment</h2>
    <p>Hello ${recipientName},</p>
    <p><strong>${assignedBy}</strong> has assigned you to project <strong>${projectName}</strong> at ${organizationName}.</p>
    <p><strong>Responsibility:</strong> ${responsibility}</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${projectUrl}" class="button" target="_blank" rel="noopener noreferrer">Open Project Workspace</a>
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\n${assignedBy} assigned you to project "${projectName}" (${responsibility}).\nOpen: ${projectUrl}`,
  };
}

export function renderTaskAssignmentEmail({
  recipientName,
  taskTitle,
  projectName,
  priority,
  dueDate,
  assignedBy,
}: {
  recipientName: string;
  taskTitle: string;
  projectName: string;
  priority: string;
  dueDate?: string;
  assignedBy: string;
}) {
  const subject = `New Task Assigned: ${taskTitle}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Task Assignment</h2>
    <p>Hello ${recipientName},</p>
    <p><strong>${assignedBy}</strong> assigned you a task in project <strong>${projectName}</strong>:</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Task:</strong> ${taskTitle}<br />
      <strong>Priority:</strong> ${priority}<br />
      ${dueDate ? `<strong>Due Date:</strong> ${dueDate}` : ''}
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\nNew task assigned in ${projectName}: ${taskTitle} (${priority})${dueDate ? ` due ${dueDate}` : ''}.`,
  };
}

export function renderApprovalRequestEmail({
  approverName,
  entityType,
  entityTitle,
  submittedBy,
  notes,
  reviewUrl,
}: {
  approverName: string;
  entityType: 'PROGRAM' | 'PROJECT';
  entityTitle: string;
  submittedBy: string;
  notes?: string;
  reviewUrl: string;
}) {
  const label = entityType === 'PROGRAM' ? 'Program' : 'Project';
  const subject = `Approval Requested: ${label} "${entityTitle}"`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">${label} Approval Request</h2>
    <p>Hello ${approverName},</p>
    <p><strong>${submittedBy}</strong> has submitted ${label.toLowerCase()} <strong>${entityTitle}</strong> for your review and approval.</p>
    ${notes ? `<p><strong>Submission Notes:</strong> ${notes}</p>` : ''}
    <p style="text-align: center; margin: 24px 0;">
      <a href="${reviewUrl}" class="button" target="_blank" rel="noopener noreferrer">Review & Decide</a>
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${approverName},\n\n${submittedBy} submitted ${label} "${entityTitle}" for approval.\nReview: ${reviewUrl}`,
  };
}

export function renderApprovalDecisionEmail({
  submitterName,
  entityType,
  entityTitle,
  decision,
  decidedBy,
  comments,
}: {
  submitterName: string;
  entityType: 'PROGRAM' | 'PROJECT';
  entityTitle: string;
  decision: 'APPROVED' | 'REJECTED';
  decidedBy: string;
  comments?: string;
}) {
  const label = entityType === 'PROGRAM' ? 'Program' : 'Project';
  const subject = `${label} ${decision}: ${entityTitle}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: ${decision === 'APPROVED' ? '#087F5B' : '#be123c'}; font-size: 20px;">
      ${label} ${decision}
    </h2>
    <p>Hello ${submitterName},</p>
    <p>Your submission for <strong>${entityTitle}</strong> was <strong>${decision}</strong> by ${decidedBy}.</p>
    ${comments ? `<p><strong>Reviewer Comments:</strong> ${comments}</p>` : ''}
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${submitterName},\n\nYour ${label.toLowerCase()} "${entityTitle}" was ${decision} by ${decidedBy}.${comments ? `\nComments: ${comments}` : ''}`,
  };
}
