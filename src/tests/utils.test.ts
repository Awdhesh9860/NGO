import { assert, assertEquals } from './setup';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { IndianPanSchema, EmailSchema } from '../validations/common';

export function runFoundationTests(): { passed: number; failed: number; results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> } {
  const results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ test: name, status: 'PASS' });
      passed++;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ test: name, status: 'FAIL', error: errorMsg });
      failed++;
    }
  };

  // 1. Utility function tests
  test('cn() correctly combines and merges Tailwind classes', () => {
    const res = cn('px-2 py-1', 'bg-red-500', 'px-4');
    assertEquals(res, 'py-1 bg-red-500 px-4', 'Tailwind conflict resolution failed');
  });

  test('formatCurrency() formats Indian Rupees correctly', () => {
    const res = formatCurrency(5000);
    assert(res.includes('5,000') || res.includes('5000'), 'Currency formatting failed');
  });

  test('formatDate() formats standard timestamps', () => {
    const res = formatDate('2026-01-15T00:00:00Z', 'short');
    assert(res.length > 0, 'Date formatting failed');
  });

  // 2. Validation tests
  test('IndianPanSchema validates correct 10-digit PAN format', () => {
    const valid = IndianPanSchema.safeParse('ABCDE1234F');
    assert(valid.success, 'Valid PAN failed validation');
    const invalid = IndianPanSchema.safeParse('12345ABCDE');
    assert(!invalid.success, 'Invalid PAN unexpectedly passed');
  });

  test('EmailSchema validates email format and lowercases', () => {
    const parsed = EmailSchema.parse('DONOR@EXAMPLE.ORG');
    assertEquals(parsed, 'donor@example.org', 'Email lowercase transformation failed');
  });

  return { passed, failed, results };
}
