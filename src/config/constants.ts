/**
 * Global Constants and Numerical Limits
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const TAX_EXEMPTION = {
  SECTION: '80G(5)(vi)',
  STANDARD_DEDUCTION_PERCENTAGE: 50,
  MINIMUM_ELIGIBLE_AMOUNT: 100,
  MANDATORY_PAN_THRESHOLD: 2000,
} as const;

export const VOLUNTEER_TIERS = {
  BRONZE: { name: 'Bronze Volunteer', minHours: 0, color: 'text-amber-700 bg-amber-50' },
  SILVER: { name: 'Silver Guardian', minHours: 25, color: 'text-slate-700 bg-slate-100' },
  GOLD: { name: 'Gold Champion', minHours: 75, color: 'text-yellow-800 bg-yellow-100' },
  PLATINUM: { name: 'Platinum Luminary', minHours: 150, color: 'text-indigo-800 bg-indigo-100' },
} as const;

export const DONOR_CATEGORIES = [
  { value: 'INDIVIDUAL', label: 'Individual Philanthropist' },
  { value: 'CORPORATE_CSR', label: 'Corporate CSR Entity' },
  { value: 'TRUST_FOUNDATION', label: 'Trust / Family Foundation' },
  { value: 'INTERNATIONAL_GRANT', label: 'International Grant (FCRA)' },
] as const;

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;
