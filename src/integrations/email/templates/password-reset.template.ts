import { renderEmailLayout } from './base.layout';

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function renderPasswordResetEmail({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Reset your HopeHorizon password';
  const previewText = 'A password reset request was received for your HopeHorizon account.';

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your HopeHorizon account. Click the button below to choose a new password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">Reset My Password</a>
    </p>
    <p style="font-size: 13px; color: #64748b;">
      If the button above does not work, copy and paste this URL into your browser:
      <br>
      <a href="${resetUrl}" style="color: #087F5B; word-break: break-all;">${resetUrl}</a>
    </p>
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      This link is valid for <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `Hello ${name},\n\nWe received a request to reset your password. Please visit this link within ${expiresInMinutes} minutes:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;

  return { subject, html, text };
}
