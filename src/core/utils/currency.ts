/**
 * Formats a numeric amount to Indian Rupee (INR) representation.
 * Example: 12500 -> "₹ 12,500.00" or "₹ 12,500" if noDecimals=true
 */
export const formatINR = (
  amount: number | string | null | undefined,
  options?: {
    noDecimals?: boolean;
    compact?: boolean;
  }
): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹ 0.00';
  }

  const num = Number(amount);

  if (options?.compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹ ${(num / 1000).toFixed(1)} K`;
    }
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options?.noDecimals ? 0 : 2,
    maximumFractionDigits: options?.noDecimals ? 0 : 2,
  }).format(num);

  // Normalize spacing between currency symbol and amount if needed
  return formatted.replace('₹', '₹ ');
};
