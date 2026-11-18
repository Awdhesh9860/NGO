import { renderEmailLayout } from './base.layout';

export interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export function renderVerificationEmail({ name, verificationUrl }: VerificationEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Verify your email address - HopeHorizon NGO';
  const previewText = 'Please verify your email address to activate your HopeHorizon account.';

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Welcome to HopeHorizon, ${name}!</h2>
    <p>Thank you for joining our mission to empower underprivileged communities and create sustainable social change.</p>
    <p>Please click the button below to verify your email address and activate your account:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button" target="_blank" rel="noopener noreferrer">Verify Email Address</a>
    </p>
    <p style="font-size: 13px; color: #64748b;">
      If the button above does not work, copy and paste this link into your web browser:
      <br>
      <a href="${verificationUrl}" style="color: #087F5B; word-break: break-all;">${verificationUrl}</a>
    </p>
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      This verification link is valid for 24 hours. If you did not create this account, you can safely ignore this email.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `Welcome to HopeHorizon, ${name}!\n\nPlease verify your email address by visiting this link:\n${verificationUrl}\n\nThis link is valid for 24 hours. If you did not create this account, please ignore this email.`;

  return { subject, html, text };
}
