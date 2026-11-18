# Transactional Email System Architecture

## HopeHorizon / Vikas NGO Ecosystem — Phase 4

### 1. Overview
The HopeHorizon Transactional Email System is an enterprise communication infrastructure designed to dispatch security notifications, account verification tokens, password reset links, one-time passwords (OTPs), staff invitations, and official Indian 80G tax receipts.

---

### 2. Provider Abstraction (`IEmailProvider`)
All email dispatching is handled through the abstract `IEmailProvider` interface defined in `src/integrations/email/email.adapter.ts`:

```typescript
export interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface IEmailProvider {
  sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  send80GReceiptEmail(donorEmail: string, donorName: string, receiptNumber: string, pdfBuffer: Buffer): Promise<boolean>;
}
```

---

### 3. Concrete Nodemailer Implementation (`NodemailerProvider`)
Implemented in `src/integrations/email/nodemailer.provider.ts`:
- **Real SMTP Delivery**: When `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` are configured in `.env.local` or production environment variables, emails are dispatched securely using TLS/STARTTLS.
- **Development & Test Resilience**: If SMTP credentials are omitted, the provider automatically falls back to simulated logging. Outgoing emails (including OTP codes and verification links) are logged cleanly to the development console and structured audit trail without throwing unhandled exceptions.

---

### 4. Responsive HTML Templates
Located in `src/integrations/email/templates/`:
- `base.layout.ts`: Common responsive email shell using HopeHorizon branding (Deep Emerald `#087F5B`, Sky Blue `#2787C7`), mobile-first tables, unsubscribe links, and Section 80G/12A statutory disclosures.
- `verification.template.ts`: Email verification link with 24-hour expiration token.
- `otp.template.ts`: Formatted 6-digit verification code with 10-minute expiry and security alert warning against code sharing.
- `password-reset.template.ts`: Secure password reset link with 60-minute expiry.
- `welcome.template.ts`: Warm onboarding message tailored by user role (`DONOR`, `VOLUNTEER`, `MEMBER`).
- `invitation.template.ts`: Administrative staff and team member invitation link.
- `security-alert.template.ts`: Notification triggered on password changes or unverified logins with device metadata and IP address.
