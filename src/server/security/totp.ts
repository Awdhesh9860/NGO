import { generateSecret, verifySync, generateURI } from 'otplib';

/**
 * Generates a base32 TOTP secret for Two-Factor Authentication.
 */
export function generate2FASecret(): string {
  return generateSecret();
}

/**
 * Generates an otpauth:// URI for rendering as a QR code.
 */
export function get2FAKeyURI(userEmail: string, secret: string, serviceName: string = 'HopeHorizon'): string {
  return generateURI({
    issuer: serviceName,
    label: userEmail,
    secret,
  });
}

/**
 * Verifies a 6-digit TOTP token against a user's secret.
 * Supports both (secret, token) and (token, secret) argument order.
 */
export function verify2FAToken(arg1: string, arg2: string): boolean {
  try {
    const token = /^\d{6}$/.test(arg1.trim()) ? arg1.trim() : arg2.trim();
    const secret = token === arg1.trim() ? arg2.trim() : arg1.trim();
    const result = verifySync({ token, secret });
    return !!result;
  } catch {
    return false;
  }
}
