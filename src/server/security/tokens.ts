import crypto from 'crypto';

/**
 * Generates a cryptographically secure URL-safe random string.
 */
export function generateCryptoToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Creates a SHA-256 hash of a token for safe database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a numeric One-Time Password (OTP).
 */
export function generateOTP(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const num = crypto.randomInt(min, max + 1);
  return num.toString();
}

/**
 * Hashes an OTP with SHA-256.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
