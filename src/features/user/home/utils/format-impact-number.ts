const indianNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 3,
});

export const formatImpactNumber = (
  value: number | null | undefined,
): string => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '—';
  }

  return indianNumberFormatter.format(value);
};
