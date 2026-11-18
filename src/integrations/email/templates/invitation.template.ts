import { renderEmailLayout } from './base.layout';
import { UserRole } from '@/types';

export interface InvitationEmailProps {
  inviterName: string;
  role: UserRole;
  invitationUrl: string;
  organizationName?: string;
}

export function renderInvitationEmail({
  inviterName,
  role,
  invitationUrl,
  organizationName = 'HopeHorizon Foundation',
}: InvitationEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `You've been invited to join ${organizationName} on HopeHorizon`;
  const previewText = `${inviterName} has invited you to join ${organizationName} as a ${role}.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Staff & Team Invitation</h2>
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join the team at <strong>${organizationName}</strong> with the role of <strong>${role}</strong>.</p>
    <p>To accept this invitation, set up your password, and access your administrative portal, click the link below:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${invitationUrl}" class="button" target="_blank" rel="noopener noreferrer">Accept Invitation & Set Password</a>
    </p>
    <p style="font-size: 13px; color: #64748b;">
      If you did not expect this invitation, you can ignore this email. This invitation link will expire in 7 days.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `You've been invited by ${inviterName} to join ${organizationName} as a ${role}.\n\nPlease accept your invitation here:\n${invitationUrl}`;

  return { subject, html, text };
}
