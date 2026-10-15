import { z } from 'zod';

/**
 * Client-side validation mirroring CreateExpenseEntryDto exactly:
 * expense_date (date string), paid_to (≤150), EXPENSE-type account,
 * ASSET-type paid-from account, positive amount ≤2 dp, payment method enum.
 * Account TYPE checks are enforced by the picker + backend.
 */
export const expenseDateSchema = z
  .string({ message: 'Enter the voucher date' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD date format');

export const voucherAmountSchema = z
  .string({ message: 'Enter an amount' })
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (max 2 decimals)')
  .refine(value => Number(value) > 0, 'Amount must be greater than zero');

export const createExpenseSchema = z.object({
  expense_date: expenseDateSchema,
  paid_to: z
    .string({ message: 'Enter the payee name' })
    .trim()
    .min(1, 'Enter the payee name')
    .max(150, 'Payee name is too long'),
  expense_account_id: z
    .string({ message: 'Select an expense account' })
    .uuid('Select an expense account'),
  paid_from_account_id: z
    .string({ message: 'Select the bank/cash account' })
    .uuid('Select the bank/cash account'),
  amount: voucherAmountSchema,
  payment_method: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'CHEQUE',
    'UPI',
    'CARD',
    'OTHER',
  ]),
  reference_number: z
    .string()
    .trim()
    .max(100, 'Reference is too long')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(1000, 'Description is too long')
    .optional()
    .or(z.literal('')),
});

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

/** Collects the first message per field from a zod error. */
export const zodFieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
};