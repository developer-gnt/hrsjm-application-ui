export const SUGGESTED_DONATION_AMOUNTS = [100, 500, 1000, 5000] as const;

export const parseCustomDonationAmount = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return undefined;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
};

export const formatRupees = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
