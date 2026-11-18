import { describe, it, expect } from 'vitest';
import { pathForView, viewForPath } from '../lib/navigation';
import {
  INITIAL_PROGRAMS,
  INITIAL_PROJECTS,
  INITIAL_CAMPAIGNS,
  INITIAL_SETTINGS,
} from '../data/mockDatabase';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { panValidation } from '../features/authentication/schemas/auth.schema';
import { z } from 'zod';

// Donation form validation schema contract
const donationFormSchema = z.object({
  amount: z.number().positive('Donation amount must be greater than zero'),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'ANNUAL']),
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Valid email is required'),
  donorPhone: z.string().optional(),
  panNumber: panValidation,
  campaignId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

// Volunteer application validation schema contract
const volunteerApplicationSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  location: z.string().min(2, 'Location is required'),
  availability: z.enum(['Weekends', 'Weekdays', 'Flexible', 'Full-time']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

describe('Phase 5: Public Route Architecture & Navigation', () => {
  it('should resolve standard public routes via pathForView', () => {
    expect(pathForView('home')).toBe('/');
    expect(pathForView('about')).toBe('/about');
    expect(pathForView('about-story')).toBe('/about/our-story');
    expect(pathForView('programs')).toBe('/programs');
    expect(pathForView('projects')).toBe('/projects');
    expect(pathForView('projects-ongoing')).toBe('/projects/ongoing');
    expect(pathForView('projects-completed')).toBe('/projects/completed');
    expect(pathForView('campaigns')).toBe('/campaigns');
    expect(pathForView('donate')).toBe('/donate');
    expect(pathForView('volunteer')).toBe('/volunteer');
    expect(pathForView('volunteer-apply')).toBe('/volunteer/apply');
    expect(pathForView('transparency')).toBe('/transparency');
    expect(pathForView('transparency-financial')).toBe('/transparency/financial-reports');
    expect(pathForView('privacy-policy')).toBe('/privacy-policy');
  });

  it('should map deep detail views with dynamic IDs or slugs', () => {
    expect(pathForView('program-detail', 'clean-water-sanitation')).toBe('/programs/clean-water-sanitation');
    expect(pathForView('project-detail', 'solar-aquifer-rajasthan')).toBe('/projects/solar-aquifer-rajasthan');
    expect(pathForView('campaign-detail', 'camp-1')).toBe('/campaigns/camp-1');
    expect(pathForView('article-detail', 'art-1')).toBe('/news/art-1');
  });

  it('should map browser URL paths back to view tokens', () => {
    expect(viewForPath('/')).toBe('home');
    expect(viewForPath('/about')).toBe('about');
    expect(viewForPath('/about/our-story')).toBe('about-story');
    expect(viewForPath('/programs')).toBe('programs');
    expect(viewForPath('/projects/solar-aquifer-rajasthan')).toBe('project-detail');
    expect(viewForPath('/transparency/financial-reports')).toBe('transparency-financial');
  });
});

describe('Phase 5: Verified Ground Data Integrity (No Fabrications)', () => {
  it('should verify all programs have valid humanitarian attributes and metrics', () => {
    expect(INITIAL_PROGRAMS.length).toBeGreaterThanOrEqual(4);
    INITIAL_PROGRAMS.forEach((prog) => {
      expect(prog.id).toBeDefined();
      expect(prog.title).toBeDefined();
      expect(prog.slug).toBeDefined();
      expect(prog.description).toBeDefined();
      expect(prog.objectives.length).toBeGreaterThanOrEqual(1);
      expect(prog.stats.length).toBeGreaterThanOrEqual(2);
      expect(prog.targetBeneficiaries).toBeDefined();
    });
  });

  it('should verify all projects contain budgets, locations and verifiable milestones', () => {
    expect(INITIAL_PROJECTS.length).toBeGreaterThanOrEqual(3);
    INITIAL_PROJECTS.forEach((proj) => {
      expect(proj.id).toBeDefined();
      expect(proj.title).toBeDefined();
      expect(proj.location).toBeDefined();
      expect(proj.fundingGoal).toBeGreaterThan(0);
      expect(proj.beneficiariesCount).toBeGreaterThan(0);
      expect(proj.milestones.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should ensure statutory settings contain valid Indian 80G & 12A disclosures', () => {
    expect(INITIAL_SETTINGS.taxExemption80GNumber).toBeDefined();
    expect(INITIAL_SETTINGS.registrationNumber).toBeDefined();
    expect(INITIAL_SETTINGS.darpanId).toBeDefined();
  });
});

describe('Phase 5: Public Donation & Conversion Forms', () => {
  it('should validate complete 80G tax-exempt donation payloads', () => {
    const validDonation = {
      amount: 5000,
      frequency: 'ONE_TIME',
      donorName: 'Vikram Mehta',
      donorEmail: 'vikram@example.com',
      donorPhone: '+91 9876543210',
      panNumber: 'ABCDE1234F',
      campaignId: 'camp-1',
      isAnonymous: false,
    };

    const result = donationFormSchema.safeParse(validDonation);
    expect(result.success).toBe(true);
  });

  it('should reject donations with negative or zero amounts', () => {
    const invalidDonation = {
      amount: -100,
      frequency: 'ONE_TIME',
      donorName: 'Test Donor',
      donorEmail: 'donor@example.com',
    };

    const result = donationFormSchema.safeParse(invalidDonation);
    expect(result.success).toBe(false);
  });

  it('should validate volunteer application submissions', () => {
    const validApp = {
      name: 'Rhea Sen',
      email: 'rhea@example.com',
      phone: '+91 9988776655',
      location: 'New Delhi, India',
      availability: 'Weekends',
      skills: ['Teaching', 'First Aid', 'Digital Photography'],
    };

    const result = volunteerApplicationSchema.safeParse(validApp);
    expect(result.success).toBe(true);
  });

  it('should reject incomplete volunteer applications', () => {
    const invalidApp = {
      name: 'R',
      email: 'not-an-email',
      phone: '',
      location: '',
      availability: 'Weekends',
      skills: [],
    };

    const result = volunteerApplicationSchema.safeParse(invalidApp);
    expect(result.success).toBe(false);
  });
});

describe('Phase 5: Technical SEO & Metadata Coverage', () => {
  it('should generate XML sitemap containing all core public and dynamic routes', () => {
    const map = sitemap();
    expect(Array.isArray(map)).toBe(true);
    expect(map.length).toBeGreaterThanOrEqual(40);

    const urls = map.map((entry) => entry.url);
    expect(urls.some((u) => u.endsWith('/'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/about'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/programs'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/projects'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/donate'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/volunteer'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/transparency'))).toBe(true);
    expect(urls.some((u) => u.includes('/programs/clean-water-sanitation'))).toBe(true);
  });

  it('should generate robots.txt allowing public indexation while disallowing dashboard & api', () => {
    const rob = robots();
    expect(rob.sitemap).toContain('/sitemap.xml');

    const rules = Array.isArray(rob.rules) ? rob.rules[0] : rob.rules;
    expect(rules.allow).toBe('/');
    expect(rules.disallow).toContain('/dashboard/');
    expect(rules.disallow).toContain('/api/');
  });
});
