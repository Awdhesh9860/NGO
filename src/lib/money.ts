/**
 * Precision-Safe Money Representation & Arithmetic Utilities
 * All financial amounts are persisted and computed as integer minor currency units
 * (e.g., INR paise: ₹100.00 = 10000; USD cents: $25.50 = 2550) to eliminate IEEE-754 floating-point drift.
 */

export const CURRENCY_MINOR_UNIT_FACTORS: Record<string, number> = {
  INR: 100,
  USD: 100,
  EUR: 100,
  GBP: 100,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function getMinorFactor(currency: string): number {
  return CURRENCY_MINOR_UNIT_FACTORS[currency.toUpperCase()] || 100;
}

/**
 * Converts a major-unit decimal value (e.g. 100.50) safely into integer minor units (10050).
 */
export function toMinorUnits(majorAmount: number, currency = 'INR'): number {
  if (!Number.isFinite(majorAmount)) {
    throw new Error('Invalid monetary amount');
  }
  const factor = getMinorFactor(currency);
  return Math.round(majorAmount * factor);
}

/**
 * Converts integer minor units into major units for display only (never for arithmetic).
 */
export function fromMinorUnits(minorAmount: number, currency = 'INR'): number {
  const factor = getMinorFactor(currency);
  return Math.trunc(minorAmount) / factor;
}

/**
 * Integer-only addition for minor units.
 */
export function sumMinorUnits(amounts: number[]): number {
  return amounts.reduce((acc, val) => acc + Math.trunc(val || 0), 0);
}

/**
 * Integer-only subtraction for minor units.
 */
export function subtractMinorUnits(a: number, b: number): number {
  return Math.trunc(a || 0) - Math.trunc(b || 0);
}

/**
 * Integer-safe basis-point percentage calculation (returns 2 decimal places, e.g. 75.25).
 */
export function calculateMinorPercentage(partMinor: number, totalMinor: number): number {
  if (!totalMinor || totalMinor <= 0) return 0;
  const basisPoints = Math.round((Math.trunc(partMinor) * 10000) / Math.trunc(totalMinor));
  return basisPoints / 100;
}

/**
 * Formats integer minor units into a locale-formatted currency string.
 */
export function formatMinorCurrency(minorAmount: number, currency = 'INR'): string {
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  const factor = getMinorFactor(code);
  const absMinor = Math.abs(Math.trunc(minorAmount || 0));
  const whole = Math.floor(absMinor / factor);
  const fraction = absMinor % factor;
  const sign = minorAmount < 0 ? '-' : '';
  const locale = code === 'INR' ? 'en-IN' : 'en-US';
  const wholeFormatted = whole.toLocaleString(locale);

  if (fraction === 0) {
    return `${sign}${symbol}${wholeFormatted}`;
  }
  return `${sign}${symbol}${wholeFormatted}.${String(fraction).padStart(2, '0')}`;
}
