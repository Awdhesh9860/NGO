/**
 * System Feature Flags
 */
export const FEATURE_FLAGS = {
  enableGoogleWorkspaceSync: true,
  enableRazorpayPayments: true,
  enableStripePayments: true,
  enableTwoFactorAuth: true,
  enableMultiLanguage: true,
  enableLiveAuditStreaming: true,
  enableDonorSelfServiceReceipts: true,
  enablePublicCertificateVerification: true,
} as const;

export default FEATURE_FLAGS;
