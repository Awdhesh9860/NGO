import { z } from 'zod';

/**
 * Common Reusable Zod Validation Schemas
 */

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const UuidSchema = z.string().uuid({ message: 'Invalid unique identifier' });

export const EmailSchema = z.string().email({ message: 'Please enter a valid email address' }).toLowerCase();

export const IndianPanSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Must be a valid 10-character PAN format (e.g. ABCDE1234F)' })
  .toUpperCase();

export const PhoneNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit mobile number' });

export const DateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});
