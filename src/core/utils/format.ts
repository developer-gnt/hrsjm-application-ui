// Display formatting helpers. Never used for API values - only for presentation.

export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
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
