import { z } from 'zod';

export const NewsletterInterestEnum = z.enum(['donor', 'volunteer', 'both'], {
  message: 'Please select an area of interest'
});

export const NewsletterFrequencyEnum = z.enum(['weekly', 'monthly', 'quarterly'], {
  message: 'Please select a valid frequency'
});

export const NewsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address (e.g. name@example.com)' })
    .max(120, { message: 'Email must be less than 120 characters' })
    .toLowerCase(),
  fullName: z
    .string()
    .trim()
    .max(80, { message: 'Name must not exceed 80 characters' })
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/, {
      message: 'Please enter a valid phone number or leave blank'
    })
    .optional()
    .or(z.literal('')),
  interest: NewsletterInterestEnum.default('both'),
  frequency: NewsletterFrequencyEnum.default('monthly'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Please consent to receiving verified dispatches and reports'
  }),
  source: z.string().optional().default('footer')
});

export type NewsletterSubscriptionFormValues = z.infer<typeof NewsletterSubscriptionSchema>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Partial<Record<keyof NewsletterSubscriptionFormValues, string>>;
}

export function validateNewsletterForm(values: unknown): ValidationResult<NewsletterSubscriptionFormValues> {
  const result = NewsletterSubscriptionSchema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Partial<Record<keyof NewsletterSubscriptionFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof NewsletterSubscriptionFormValues;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, errors };
}
