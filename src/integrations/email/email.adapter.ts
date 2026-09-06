/**
 * Email Provider Integration Adapter Boundary
 */

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
