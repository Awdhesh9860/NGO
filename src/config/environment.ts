/**
 * Centralized Environment Configuration
 * Validates, groups, and exports type-safe environment variables across server and client layers.
 * Enforces fail-closed cryptographic secret validation in production (`NODE_ENV === 'production'`).
 */

const MIN_PRODUCTION_SECRET_LENGTH = 32;

export function resolveRequiredSecret(
  envKeys: string[],
  devFallback: string,
  secretLabel: string
): string {
  for (const key of envKeys) {
    const val = process.env[key]?.trim();
    if (val && val.length > 0) {
      if (process.env.NODE_ENV === 'production' && val.length < MIN_PRODUCTION_SECRET_LENGTH) {
        throw new Error(
          `[SECURITY CONFIG ERROR] ${secretLabel} (${key}) must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production.`
        );
      }
      return val;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `[SECURITY CONFIG ERROR] Missing required production secret for ${secretLabel}. Set one of: ${envKeys.join(', ')}.`
    );
  }

  return devFallback;
}

export const DEV_FALLBACK_JWT_SECRET =
  'hopehorizon-dev-insecure-jwt-secret-min-32-chars-key-2026';
export const DEV_FALLBACK_FINANCIAL_KEY =
  'dev-only-financial-encryption-key-do-not-use-in-prod';
export const DEV_FALLBACK_STORAGE_SIGNING_KEY =
  'dev-only-storage-signing-key-do-not-use-in-prod-32';

export function getJwtSecret(): string {
  return resolveRequiredSecret(['JWT_SECRET'], DEV_FALLBACK_JWT_SECRET, 'JWT signing secret');
}

export function getFinancialEncryptionSecret(): string {
  return resolveRequiredSecret(
    ['FINANCIAL_ENCRYPTION_KEY', 'JWT_SECRET'],
    DEV_FALLBACK_FINANCIAL_KEY,
    'Financial AES-256-GCM encryption key'
  );
}

export function getStorageSigningSecret(): string {
  return resolveRequiredSecret(
    ['STORAGE_SIGNING_SECRET', 'JWT_SECRET'],
    DEV_FALLBACK_STORAGE_SIGNING_KEY,
    'Document storage HMAC signing secret'
  );
}

export const ENV = {
  app: {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
    url: process.env.APP_URL || 'http://localhost:3000',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ngo_platform',
  },

  auth: {
    get jwtSecret(): string {
      return getJwtSecret();
    },
    sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE || 86400 * 7), // 7 days
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER as 'local' | 's3' | 'gcs') || 'local',
    bucket: process.env.S3_BUCKET || 'ngo-documents-vault',
    region: process.env.S3_REGION || 'ap-south-1',
    publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL || '/api/v1/storage/files',
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
} as const;

export default ENV;
