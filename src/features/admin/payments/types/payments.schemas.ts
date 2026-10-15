import { z } from 'zod';

/**
 * Client-side validation for the payment verify flow. Mirrors the backend
 * VerifyMembershipPaymentDto (gateway_payment_id required; NO notes field).
 */
export const verifyPaymentSchema = z.object({
  gateway_payment_id: z
    .string({ message: 'Enter the gateway payment ID' })
    .trim()
    .min(3, 'Enter the gateway payment ID')
    .max(255, 'Gateway payment ID is too long'),
  gateway_order_id: z
    .string()
    .trim()
    .max(255, 'Gateway order ID is too long')
    .optional()
    .or(z.literal('')),
});

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>;

/** Suggests a manual reference when the payment has no gateway ids. */
export const suggestGatewayPaymentId = (
  transactionId: string | null | undefined,
): string =>
  transactionId?.trim() ||
  `MANUAL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
    Math.random() * 9000 + 1000,
  )}`;