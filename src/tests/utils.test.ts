import { describe, it } from 'vitest';
import { assert, assertEquals } from './setup';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { IndianPanSchema, EmailSchema } from '../validations/common';

describe('utility functions', () => {
  it('cn() correctly combines and merges Tailwind classes', () => {
    const res = cn('px-2 py-1', 'bg-red-500', 'px-4');
    assertEquals(res, 'py-1 bg-red-500 px-4', 'Tailwind conflict resolution failed');
  });

  it('formatCurrency() formats amounts correctly', () => {
    const res = formatCurrency(5000);
    assert(res.includes('5,000') || res.includes('5000'), 'Currency formatting failed');
  });

  it('formatDate() formats standard timestamps', () => {
    const res = formatDate('2026-01-15T00:00:00Z', 'short');
    assert(res.length > 0, 'Date formatting failed');
  });
});

describe('validation schemas', () => {
  it('IndianPanSchema validates correct 10-character PAN format', () => {
    const valid = IndianPanSchema.safeParse('ABCDE1234F');
    assert(valid.success, 'Valid PAN failed validation');
    const invalid = IndianPanSchema.safeParse('12345ABCDE');
    assert(!invalid.success, 'Invalid PAN unexpectedly passed');
  });

  it('EmailSchema validates email format and lowercases', () => {
    const parsed = EmailSchema.parse('DONOR@EXAMPLE.ORG');
    assertEquals(parsed, 'donor@example.org', 'Email lowercase transformation failed');
  });
});
