import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes cleanly with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique, deterministic-friendly DOM ID.
 */
export function generateElementId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce helper for high-frequency user interactions.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

/**
 * Formats a currency value with locale support.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string into standard enterprise formats.
 */
export function formatDate(
  dateInput: string | Date | number,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium',
  locale: string = 'en-US'
): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  if (format === 'relative') {
    const diffMs = Date.now() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { month: 'numeric', day: 'numeric', year: '2-digit' }
      : format === 'long'
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };

  return date.toLocaleDateString(locale, options);
}
