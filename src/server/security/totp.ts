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
export function get2FAKeyURI(userEmail: string, serviceName: string, secret: string): string {
  return generateURI({
    issuer: serviceName,
    label: userEmail,
    secret,
  });
}

/**
 * Verifies a 6-digit TOTP token against a user's secret.
 */
export function verify2FAToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token: token.trim(), secret });
    return !!result;
  } catch {
    return false;
  }
}
