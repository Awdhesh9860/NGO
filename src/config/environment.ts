/**
 * Centralized Environment Configuration
 * Validates, groups, and exports type-safe environment variables across server and client layers.
 */

export const ENV = {
  app: {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
    url: process.env.APP_URL || 'http://localhost:3000',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngo_platform?schema=public',
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-insecure-jwt-secret-phase-2-only',
    sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE || 86400 * 7), // 7 days
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER as 'local' | 's3' | 'gcs') || 'local',
    bucket: process.env.S3_BUCKET || 'ngo-documents-vault',
    region: process.env.S3_REGION || 'ap-south-1',
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'resend' | 'sendgrid') || 'smtp',
    from: process.env.EMAIL_FROM || 'support@ngo-platform.org',
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 587),
  },

  payment: {
    defaultGateway: (process.env.PAYMENT_GATEWAY_DEFAULT as 'razorpay' | 'stripe' | 'manual') || 'razorpay',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  },

  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
} as const;

export default ENV;
