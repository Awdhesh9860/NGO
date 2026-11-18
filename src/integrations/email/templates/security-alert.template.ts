import { renderEmailLayout } from './base.layout';

export interface SecurityAlertEmailProps {
  name: string;
  action: string;
  ipAddress?: string;
  device?: string;
  timestamp?: string;
}

export function renderSecurityAlertEmail({
  name,
  action,
  ipAddress = 'Unknown IP',
  device = 'Web Browser',
  timestamp = new Date().toUTCString(),
}: SecurityAlertEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Security Alert: ${action} on your HopeHorizon account`;
  const previewText = `We detected a security event (${action}) on your HopeHorizon account.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #b91c1c; font-size: 20px;">Security Alert</h2>
    <p>Hello ${name},</p>
    <p>This is an automated notification to let you know that the following action was recently performed on your account:</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Action:</strong> ${action}</p>
      <p style="margin: 4px 0;"><strong>Device / Browser:</strong> ${device}</p>
      <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
      <p style="margin: 4px 0;"><strong>Time:</strong> ${timestamp}</p>
    </div>
    <p style="font-size: 14px; color: #475569;">
      If you performed this action, no further steps are required.
    </p>
    <div style="margin-top: 24px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 500;">
        If you DID NOT authorize this activity, please immediately reset your password and contact our security team at security@hopehorizon.org.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `Security Alert for ${name}:\n\nAction: ${action}\nDevice: ${device}\nIP: ${ipAddress}\nTime: ${timestamp}\n\nIf you did not perform this action, please reset your password immediately.`;

  return { subject, html, text };
}
