import nodemailer from 'nodemailer';
import { IEmailProvider, EmailOptions } from './email.adapter';
import { serverLogger } from '@/server/logging';

export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@hopehorizon.org';
    this.initTransporter();
  }

  private initTransporter(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isConfigured = true;
      serverLogger.info({ host, port, user }, 'Nodemailer SMTP transport initialized');
    } else {
      this.isConfigured = false;
      serverLogger.warn(
        'Nodemailer: SMTP credentials not fully configured. Emails will be logged locally in simulated mode.'
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // Simulated fallback in development or when SMTP is not configured
    if (!this.isConfigured || !this.transporter) {
      const simulatedId = `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      serverLogger.info(
        {
          to: recipients,
          subject: options.subject,
          simulatedId,
        },
        '[SIMULATED EMAIL DISPATCH]'
      );

      // In development, also output a clean debug log for easy testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n================== [OUTGOING EMAIL: ${options.subject}] ==================`);
        console.log(`To: ${recipients}`);
        console.log(`From: ${this.fromAddress}`);
        console.log(`Subject: ${options.subject}`);
        if (options.textContent) {
          console.log(`\nText Content:\n${options.textContent}`);
        }
        console.log(`========================================================================\n`);
      }

      return { success: true, messageId: simulatedId };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown email transport error';
      serverLogger.error({ error: errorMessage, to: recipients }, 'Failed to deliver email');
      return { success: false, error: errorMessage };
    }
  }

  async send80GReceiptEmail(
    donorEmail: string,
    donorName: string,
    receiptNumber: string,
    pdfBuffer: Buffer
  ): Promise<boolean> {
    const res = await this.sendEmail({
      to: donorEmail,
      subject: `Your 80G Tax Exemption Donation Receipt #${receiptNumber} - HopeHorizon`,
      textContent: `Dear ${donorName},\n\nThank you for your generous contribution. Please find attached your official 80G tax receipt #${receiptNumber}.\n\nHopeHorizon Foundation`,
      htmlContent: `<p>Dear ${donorName},</p><p>Thank you for your generous contribution to HopeHorizon NGO. Attached is your official 80G Tax Exemption receipt (#${receiptNumber}).</p>`,
      attachments: [
        {
          filename: `80G_Receipt_${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.success;
  }
}

export const emailProvider = new NodemailerProvider();
export default emailProvider;
