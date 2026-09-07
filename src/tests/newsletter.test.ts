import { describe, it } from 'vitest';
import { assert, assertEquals } from './setup';
import { validateNewsletterForm } from '../validations/newsletter';

describe('validateNewsletterForm', () => {
  it('accepts a valid donor lead subscription', () => {
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

  it('accepts a valid volunteer lead subscription', () => {
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

  it('rejects an invalid email', () => {
    const res = validateNewsletterForm({
      email: 'invalid-email-string',
      interest: 'donor',
      consent: true
    });
    assert(!res.success, 'Invalid email unexpectedly passed');
    assert(!!res.errors?.email, 'Missing error message for invalid email');
  });

  it('rejects missing consent', () => {
    const res = validateNewsletterForm({
      email: 'supporter@example.com',
      interest: 'both',
      consent: false
    });
    assert(!res.success, 'Missing consent unexpectedly passed');
    assert(!!res.errors?.consent, 'Missing error message for consent');
  });

  it('rejects an empty email', () => {
    const res = validateNewsletterForm({
      email: '   ',
      interest: 'donor',
      consent: true
    });
    assert(!res.success, 'Empty email unexpectedly passed');
  });
});
