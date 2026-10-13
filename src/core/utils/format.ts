// Display formatting helpers. Never used for API values - only for presentation.

export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/**
 * Converts a numeric amount to Indian Rupee representation in words.
 * Example: 5000 -> "Five Thousand Rupees Only"
 * Example: 1500 -> "One Thousand Five Hundred Rupees Only"
 */
export function amountToWords(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  const num = Math.floor(Math.abs(Number(amount)));
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred) {
      str += ones[hundred] + ' Hundred';
    }
    if (rest) {
      str += (str ? ' ' : '') + convertTwoDigits(rest);
    }
    return str;
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) words += convertThreeDigits(thousand) + ' Thousand ';
  if (hundred) words += convertThreeDigits(hundred);

  return words.trim() + ' Rupees Only';
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return `${formatDate(iso)}, ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initialsOf(fullName?: string | null): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'M';
  }
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'M';
  }
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (`${first}${last}`.toUpperCase()) || 'M';
}

export function maskEmail(email: string | null | undefined): string {
  return email ?? '—';
}
