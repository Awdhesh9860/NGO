import { renderEmailLayout } from './base.layout';
import { UserRole } from '@/types';

export interface WelcomeEmailProps {
  name: string;
  role: UserRole;
  portalUrl: string;
}

export function renderWelcomeEmail({ name, role, portalUrl }: WelcomeEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const roleDisplay =
    role === 'DONOR'
      ? 'Supporter & Donor'
      : role === 'VOLUNTEER'
      ? 'Community Volunteer'
      : role === 'MEMBER'
      ? 'Distinguished Member'
      : 'Team Member';

  const subject = `Welcome to HopeHorizon NGO, ${name}!`;
  const previewText = `Your account is active. Welcome as a ${roleDisplay}.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Welcome to the HopeHorizon Family!</h2>
    <p>Dear ${name},</p>
    <p>We are delighted to welcome you as a <strong>${roleDisplay}</strong> with HopeHorizon Foundation. Together, we are building a more inclusive and compassionate world.</p>
    <p>Through your portal, you can track campaign updates, view transparent impact metrics, manage your contributions, and access your 80G tax certificates.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${portalUrl}" class="button" target="_blank" rel="noopener noreferrer">Access Your Portal</a>
    </p>
    <p style="font-size: 14px; color: #475569;">
      If you have questions or need assistance, our support team is always here for you at <a href="mailto:support@hopehorizon.org" style="color: #087F5B;">support@hopehorizon.org</a>.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `Welcome to HopeHorizon NGO, ${name}!\n\nYour account has been activated as a ${roleDisplay}. Access your dashboard here:\n${portalUrl}`;

  return { subject, html, text };
}
