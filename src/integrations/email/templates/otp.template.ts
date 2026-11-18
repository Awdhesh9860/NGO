import { renderEmailLayout } from './base.layout';

export interface OTPEmailProps {
  name: string;
  otp: string;
  purpose: 'VERIFY_EMAIL' | 'PASSWORD_RESET' | 'LOGIN_2FA';
  expiresInMinutes?: number;
}

export function renderOTPEmail({
  name,
  otp,
  purpose,
  expiresInMinutes = 10,
}: OTPEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  let purposeTitle = 'Security Verification';
  let purposeDesc = 'complete your security verification';

  if (purpose === 'VERIFY_EMAIL') {
    purposeTitle = 'Email Verification Code';
    purposeDesc = 'verify your email address';
  } else if (purpose === 'PASSWORD_RESET') {
    purposeTitle = 'Password Reset Code';
    purposeDesc = 'reset your HopeHorizon account password';
  } else if (purpose === 'LOGIN_2FA') {
    purposeTitle = 'Two-Factor Authentication Code';
    purposeDesc = 'sign in to your HopeHorizon account';
  }

  const subject = `${otp} is your HopeHorizon ${purposeTitle}`;
  const previewText = `Your one-time verification code is ${otp}. Valid for ${expiresInMinutes} minutes.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Hello, ${name}</h2>
    <p>Please use the following One-Time Password (OTP) to ${purposeDesc}:</p>
    <div style="text-align: center; margin: 24px 0;">
      <span class="otp-code">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #475569; text-align: center;">
      This code will expire in <strong>${expiresInMinutes} minutes</strong>.
    </p>
    <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 500;">
        Security Notice: Never share this OTP with anyone, including HopeHorizon staff. Our team will never ask for your verification code.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText,
    bodyHtml,
  });

  const text = `Hello ${name},\n\nYour HopeHorizon ${purposeTitle} is: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes. Do not share this code with anyone.`;

  return { subject, html, text };
}
