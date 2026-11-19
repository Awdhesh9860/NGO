import { renderEmailLayout } from './base.layout';
import { formatMinorCurrency } from '@/lib/money';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** 1. Donation Initiated / Pending Verification Email */
export function renderDonationInitiatedEmail({
  donorName,
  donationCode,
  amountMinor,
  currency = 'INR',
  paymentProvider,
  purpose,
  organizationName = 'HopeHorizon Foundation',
}: {
  donorName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  paymentProvider: string;
  purpose: string;
  organizationName?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const isManual = paymentProvider === 'UPI' || paymentProvider === 'BANK_TRANSFER';
  const subject = isManual
    ? `Donation Pending Verification (${donationCode}) — ${formatted}`
    : `Donation Initiated (${donationCode}) — ${formatted}`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">${
      isManual ? 'Donation Submitted for Verification' : 'Donation Initiated'
    }</h2>
    <p>Dear ${donorName},</p>
    <p>Thank you for initiating a contribution of <strong>${formatted}</strong> to <strong>${organizationName}</strong> for <strong>${purpose}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
      <strong>Reference Code:</strong> ${donationCode}<br />
      <strong>Payment Method:</strong> ${paymentProvider}<br />
      <strong>Current Status:</strong> ${isManual ? 'PENDING MANUAL VERIFICATION' : 'INITIATED / PENDING'}
    </p>
    <p>${
      isManual
        ? 'Your UPI/Bank Transfer submission is pending verification by our finance team. An official receipt will be issued once settlement is confirmed.'
        : 'Once payment settlement is confirmed by the payment gateway, you will receive your confirmation and official receipt.'
    }</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nYour donation ${donationCode} of ${formatted} for ${purpose} (${paymentProvider}) has been recorded with status ${
      isManual ? 'PENDING VERIFICATION' : 'INITIATED'
    }.`,
  };
}

/** 2. Donation Payment Successful Confirmation Email */
export function renderDonationSuccessEmail({
  donorName,
  donationCode,
  amountMinor,
  currency = 'INR',
  purpose,
  paymentReference,
  organizationName = 'HopeHorizon Foundation',
}: {
  donorName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  purpose: string;
  paymentReference: string;
  organizationName?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Thank You! Donation Confirmed (${donationCode}) — ${formatted}`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Donation Successfully Received</h2>
    <p>Dear ${donorName},</p>
    <p>We gratefully confirm receipt of your verified contribution of <strong>${formatted}</strong> to <strong>${organizationName}</strong>.</p>
    <p style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px;">
      <strong>Donation Code:</strong> ${donationCode}<br />
      <strong>Verified Payment Ref:</strong> ${paymentReference}<br />
      <strong>Purpose:</strong> ${purpose}<br />
      <strong>Amount:</strong> ${formatted}
    </p>
    <p>Thank you for standing with our communities.</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nYour donation ${donationCode} of ${formatted} (Ref: ${paymentReference}) for ${purpose} has been verified and received by ${organizationName}.`,
  };
}

/** 3. Donation Failed / Rejected Email */
export function renderDonationFailedEmail({
  donorName,
  donationCode,
  amountMinor,
  currency = 'INR',
  reason,
  retryUrl,
  organizationName = 'HopeHorizon Foundation',
}: {
  donorName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  reason?: string;
  retryUrl?: string;
  organizationName?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Donation Could Not Be Completed (${donationCode})`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #be123c; font-size: 20px;">Donation Payment Unsuccessful</h2>
    <p>Dear ${donorName},</p>
    <p>Your donation attempt (<strong>${donationCode}</strong>) for <strong>${formatted}</strong> to ${organizationName} could not be completed.</p>
    ${reason ? `<p><strong>Details:</strong> ${reason}</p>` : ''}
    ${
      retryUrl
        ? `<p style="text-align: center; margin: 24px 0;"><a href="${retryUrl}" class="button" target="_blank" rel="noopener noreferrer">Try Donating Again</a></p>`
        : ''
    }
    <p>If any amount was debited by your bank, it is normally auto-reversed within 5–7 business days.</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nYour donation ${donationCode} (${formatted}) could not be completed.${
      reason ? ` Reason: ${reason}` : ''
    }`,
  };
}

/** 4. Official Donation Receipt Email (Strict 80G/12A Eligibility Honesty) */
export function renderDonationReceiptEmail({
  donorName,
  receiptNumber,
  donationCode,
  amountMinor,
  currency = 'INR',
  purpose,
  donationDate,
  paymentReference,
  taxBenefitEligible,
  taxEligibilityReason,
  section80GNumber,
  organizationName = 'HopeHorizon Foundation',
}: {
  donorName: string;
  receiptNumber: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  purpose: string;
  donationDate: string;
  paymentReference: string;
  taxBenefitEligible: boolean;
  taxEligibilityReason: string;
  section80GNumber?: string;
  organizationName?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Official Donation Receipt ${receiptNumber} — ${formatted}`;

  const taxNoticeHtml = taxBenefitEligible
    ? `<p style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 12px; color: #065f46;">
         <strong>Verified Tax Exemption Notice:</strong> ${organizationName} holds verified Section 80G registration${
           section80GNumber ? ` (${section80GNumber})` : ''
         } valid for this donation date. ${taxEligibilityReason}
       </p>`
    : `<p style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; color: #92400e;">
         <strong>Standard Charitable Receipt:</strong> ${taxEligibilityReason}
       </p>`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Official Donation Receipt</h2>
    <p>Dear ${donorName},</p>
    <p>Please retain this official acknowledgment for your verified donation to <strong>${organizationName}</strong>.</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
      <strong>Receipt Number:</strong> ${receiptNumber}<br />
      <strong>Donation Code:</strong> ${donationCode}<br />
      <strong>Date:</strong> ${donationDate}<br />
      <strong>Amount:</strong> ${formatted}<br />
      <strong>Payment Ref:</strong> ${paymentReference}<br />
      <strong>Purpose:</strong> ${purpose}
    </p>
    ${taxNoticeHtml}
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Official Donation Receipt ${receiptNumber}\nDonor: ${donorName}\nAmount: ${formatted}\nDate: ${donationDate}\nRef: ${paymentReference}\nTax Eligibility: ${
      taxBenefitEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'
    } — ${taxEligibilityReason}`,
  };
}

/** 5. Refund Requested Email */
export function renderRefundRequestedEmail({
  recipientName,
  donationCode,
  amountMinor,
  currency = 'INR',
  reason,
}: {
  recipientName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  reason: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Refund Request Submitted (${donationCode}) — ${formatted}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #b45309; font-size: 20px;">Refund Request Pending Approval</h2>
    <p>Hello ${recipientName},</p>
    <p>A refund request of <strong>${formatted}</strong> has been logged for donation <strong>${donationCode}</strong> and is awaiting authorized financial review.</p>
    <p><strong>Reason:</strong> ${reason}</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\nRefund request of ${formatted} for donation ${donationCode} has been submitted for approval. Reason: ${reason}`,
  };
}

/** 6. Refund Approved Email */
export function renderRefundApprovedEmail({
  recipientName,
  donationCode,
  amountMinor,
  currency = 'INR',
  approvedBy,
}: {
  recipientName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  approvedBy: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Refund Approved (${donationCode}) — ${formatted}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Refund Approved</h2>
    <p>Dear ${recipientName},</p>
    <p>Your refund of <strong>${formatted}</strong> for donation <strong>${donationCode}</strong> has been approved by ${approvedBy} and queued for processing via the original payment method.</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${recipientName},\n\nYour refund of ${formatted} for donation ${donationCode} has been approved by ${approvedBy}.`,
  };
}

/** 7. Refund Processed Email */
export function renderRefundProcessedEmail({
  donorName,
  donationCode,
  amountMinor,
  currency = 'INR',
  providerRefundId,
}: {
  donorName: string;
  donationCode: string;
  amountMinor: number;
  currency?: string;
  providerRefundId?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Refund Processed (${donationCode}) — ${formatted}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Refund Completed</h2>
    <p>Dear ${donorName},</p>
    <p>We confirm that a refund of <strong>${formatted}</strong> for donation <strong>${donationCode}</strong> has been processed.</p>
    ${providerRefundId ? `<p><strong>Refund Reference ID:</strong> ${providerRefundId}</p>` : ''}
    <p>Please allow 5–10 business days for your card issuer or bank to post the credit.</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nRefund of ${formatted} for donation ${donationCode} has been processed.${
      providerRefundId ? ` Reference: ${providerRefundId}` : ''
    }`,
  };
}

/** 8. Recurring Donation Mandate Confirmation Email */
export function renderRecurringConfirmationEmail({
  donorName,
  planInterval,
  amountMinor,
  currency = 'INR',
  provider,
  organizationName = 'HopeHorizon Foundation',
}: {
  donorName: string;
  planInterval: string;
  amountMinor: number;
  currency?: string;
  provider: string;
  organizationName?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Recurring Donation Plan Confirmed (${planInterval}) — ${formatted}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Recurring Support Activated</h2>
    <p>Dear ${donorName},</p>
    <p>Thank you for establishing a <strong>${planInterval}</strong> recurring donation of <strong>${formatted}</strong> via <strong>${provider}</strong> to support <strong>${organizationName}</strong>.</p>
    <p>You may pause or cancel your recurring mandate at any time by contacting us or through your donor portal.</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nYour ${planInterval} recurring donation of ${formatted} via ${provider} to ${organizationName} has been registered.`,
  };
}

/** 9. Recurring Donation Payment Failure Alert Email */
export function renderRecurringFailureEmail({
  donorName,
  planInterval,
  amountMinor,
  currency = 'INR',
  reason,
}: {
  donorName: string;
  planInterval: string;
  amountMinor: number;
  currency?: string;
  reason?: string;
}): RenderedEmail {
  const formatted = formatMinorCurrency(amountMinor, currency);
  const subject = `Action Needed: Recurring Donation Charge Failed (${formatted})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #be123c; font-size: 20px;">Recurring Donation Payment Failed</h2>
    <p>Dear ${donorName},</p>
    <p>Your scheduled <strong>${planInterval}</strong> contribution of <strong>${formatted}</strong> could not be processed by the payment provider.</p>
    ${reason ? `<p><strong>Provider Notice:</strong> ${reason}</p>` : ''}
    <p>Please update your payment method or reach out to our donor support desk.</p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Dear ${donorName},\n\nYour scheduled ${planInterval} recurring donation of ${formatted} failed.${
      reason ? ` Reason: ${reason}` : ''
    }`,
  };
}

/** 10. Campaign Approved Notification Email */
export function renderCampaignApprovedEmail({
  recipientName,
  campaignTitle,
  campaignCode,
  approvedBy,
  campaignUrl,
}: {
  recipientName: string;
  campaignTitle: string;
  campaignCode: string;
  approvedBy: string;
  campaignUrl?: string;
}): RenderedEmail {
  const subject = `Campaign Approved: ${campaignTitle} (${campaignCode})`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Fundraising Campaign Approved</h2>
    <p>Hello ${recipientName},</p>
    <p>Fundraising campaign <strong>${campaignTitle}</strong> (${campaignCode}) has been approved by <strong>${approvedBy}</strong> and is ready to activate or publish.</p>
    ${
      campaignUrl
        ? `<p style="text-align: center; margin: 24px 0;"><a href="${campaignUrl}" class="button" target="_blank" rel="noopener noreferrer">Open Campaign</a></p>`
        : ''
    }
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\nCampaign "${campaignTitle}" (${campaignCode}) was approved by ${approvedBy}.`,
  };
}

/** 11. Campaign Published Notification Email */
export function renderCampaignPublishedEmail({
  recipientName,
  campaignTitle,
  targetAmountMinor,
  currency = 'INR',
  publicUrl,
}: {
  recipientName: string;
  campaignTitle: string;
  targetAmountMinor: number;
  currency?: string;
  publicUrl: string;
}): RenderedEmail {
  const target = formatMinorCurrency(targetAmountMinor, currency);
  const subject = `Campaign Live on Public Portal: ${campaignTitle}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Campaign Published</h2>
    <p>Hello ${recipientName},</p>
    <p>Fundraising campaign <strong>${campaignTitle}</strong> (Target: <strong>${target}</strong>) is now live and accepting verified donations.</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${publicUrl}" class="button" target="_blank" rel="noopener noreferrer">View Public Campaign</a>
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Hello ${recipientName},\n\nCampaign "${campaignTitle}" (Target: ${target}) is now live at ${publicUrl}.`,
  };
}

/** 12. Campaign Goal Reached Milestone Notification Email */
export function renderCampaignGoalReachedEmail({
  recipientName,
  campaignTitle,
  raisedAmountMinor,
  targetAmountMinor,
  currency = 'INR',
}: {
  recipientName: string;
  campaignTitle: string;
  raisedAmountMinor: number;
  targetAmountMinor: number;
  currency?: string;
}): RenderedEmail {
  const raised = formatMinorCurrency(raisedAmountMinor, currency);
  const target = formatMinorCurrency(targetAmountMinor, currency);
  const subject = `Goal Reached! ${campaignTitle} hit ${raised}`;
  const bodyHtml = `
    <h2 style="margin-top: 0; color: #087F5B; font-size: 20px;">Fundraising Goal Achieved</h2>
    <p>Hello ${recipientName},</p>
    <p>Congratulations! Campaign <strong>${campaignTitle}</strong> has reached its verified fundraising goal.</p>
    <p style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px;">
      <strong>Verified Net Raised:</strong> ${raised}<br />
      <strong>Campaign Goal:</strong> ${target}
    </p>
  `;
  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText: subject, bodyHtml }),
    text: `Congratulations ${recipientName}! Campaign "${campaignTitle}" reached ${raised} against target ${target}.`,
  };
}
