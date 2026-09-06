import { assert, assertEquals } from './setup';
import { validateNewsletterForm } from '../validations/newsletter';

export function runNewsletterTests(): { passed: number; failed: number; results: Array<{ test: string; status: 'PASS' | 'FAIL'; error?: string }> } {
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

  test('validateNewsletterForm accepts valid donor lead subscription', () => {
    const res = validateNewsletterForm({
      email: 'DONOR.LEAD@EXAMPLE.COM',
      fullName: 'Sarah Connor',
      interest: 'donor',
      frequency: 'monthly',
      consent: true,
      source: 'footer'
    });
    assert(res.success, 'Valid donor lead failed validation');
    assert(res.data?.email === 'donor.lead@example.com', 'Email was not lowercased');
    assertEquals(res.data?.interest, 'donor', 'Interest was not preserved');
  });

  test('validateNewsletterForm accepts valid volunteer lead subscription', () => {
    const res = validateNewsletterForm({
      email: 'volunteer@example.org',
      fullName: 'David Miller',
      phone: '+1 (555) 345-6789',
      interest: 'volunteer',
      frequency: 'weekly',
      consent: true
    });
    assert(res.success, 'Valid volunteer lead failed validation');
    assertEquals(res.data?.interest, 'volunteer', 'Volunteer interest not preserved');
    assertEquals(res.data?.frequency, 'weekly', 'Weekly frequency not preserved');
  });

  test('validateNewsletterForm rejects invalid email', () => {
    const res = validateNewsletterForm({
      email: 'invalid-email-string',
      interest: 'donor',
      consent: true
    });
    assert(!res.success, 'Invalid email unexpectedly passed');
    assert(!!res.errors?.email, 'Missing error message for invalid email');
  });

  test('validateNewsletterForm rejects missing consent', () => {
    const res = validateNewsletterForm({
      email: 'supporter@example.com',
      interest: 'both',
      consent: false
    });
    assert(!res.success, 'Missing consent unexpectedly passed');
    assert(!!res.errors?.consent, 'Missing error message for consent');
  });

  test('validateNewsletterForm rejects empty email', () => {
    const res = validateNewsletterForm({
      email: '   ',
      interest: 'donor',
      consent: true
    });
    assert(!res.success, 'Empty email unexpectedly passed');
  });

  return { passed, failed, results };
}
