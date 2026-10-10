import { z } from 'zod';

/**
 * Client-side validation mirroring the backend DTO constraints exactly
 * (login.dto.ts, password.dto.ts). Validate locally before dispatching API
 * calls per rule.md §6.3.
 */

export const loginSchema = z.object({
  identifier: z
    .string({ message: 'Enter your mobile number or email' })
    .trim()
    .min(3, 'Enter your mobile number or email'),
  password: z
    .string({ message: 'Enter your password' })
    .min(1, 'Enter your password'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string({ message: 'Enter your mobile number or email' })
    .trim()
    .min(3, 'Enter your mobile number or email'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Account types offered at registration (mockup). `role_name` must be one of
 * the backend's PUBLIC_REGISTER_ROLE_NAMES; undefined → backend default MEMBER. */
export const ACCOUNT_TYPE_OPTIONS = [
  { key: 'GENERAL_USER', label: 'General User', description: 'Explore, learn and support HRSJM', role_name: undefined, icon: '👤' },
  { key: 'MEMBER', label: 'Member', description: 'Join as a member of HRSJM', role_name: 'MEMBER', icon: '👥' },
  { key: 'DONATION_SEEKER', label: 'Donation Seeker', description: 'Request support for approved causes', role_name: 'DONATION_SEEKER', icon: '❤️' },
  { key: 'ORGANISATION', label: 'Organisation', description: 'NGO, educational or corporate', role_name: 'DONOR', icon: '💼' },
] as const;

export type AccountTypeKey = (typeof ACCOUNT_TYPE_OPTIONS)[number]['key'];

export const registerSchema = z
  .object({
    full_name: z
      .string({ message: 'Enter your full name' })
      .trim()
      .min(2, 'Enter your full name')
      .max(255, 'Name is too long'),
    email: z
      .string({ message: 'Enter your email address' })
      .trim()
      .min(1, 'Enter your email address')
      .email('Enter a valid email address')
      .max(255, 'Email is too long'),
    mobile_number: z
      .string({ message: 'Enter your mobile number' })
      .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
    password: z
      .string({ message: 'Create a password' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirm_password: z
      .string({ message: 'Confirm your password' })
      .min(1, 'Confirm your password'),
    accepts_terms: z.literal(true, {
      message: 'Please accept the Terms & Conditions',
    }),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is missing'),
    password: z
      .string({ message: 'Enter a new password' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirm_password: z
      .string({ message: 'Confirm your new password' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Flattens a zod error into a `{ fieldName: firstMessage }` map for inline
 * field errors (rule.md §8: helpful inline error messages).
 */
export const zodErrorsToFieldErrors = (
  error: z.ZodError,
): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
};