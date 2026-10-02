import { z } from 'zod';
import { expenseDateSchema, voucherAmountSchema } from '../../expenses/types/expenses.schemas';

/**
 * Client-side validation mirroring CreateReceiptEntryDto: receipt_date,
 * received_from (≤150), INCOME-type account, ASSET-type received-in account,
 * positive amount ≤2 dp, payment method enum. Account TYPE checks are
 * enforced by the picker + backend.
 */
export const createReceiptSchema = z.object({
  receipt_date: expenseDateSchema,
  received_from: z
    .string({ message: 'Enter the payer name' })
    .trim()
    .min(1, 'Enter the payer name')
    .max(150, 'Payer name is too long'),
  income_account_id: z
    .string({ message: 'Select an income account' })
    .uuid('Select an income account'),
  received_in_account_id: z
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

export type CreateReceiptFormData = z.infer<typeof createReceiptSchema>;

export { zodFieldErrors } from '../../expenses/types/expenses.schemas';