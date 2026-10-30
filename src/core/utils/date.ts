/**
 * Formats a Date or ISO string to standard date representation: "DD MMM YYYY" (e.g. 28 Sep 2026)
 */
export const formatDate = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats a Date or ISO string to standard time representation: "hh:mm A" (e.g. 10:00 AM)
 */
export const formatTime = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a start and optional end time into a range: "10:00 AM - 01:00 PM"
 */
export const formatTimeRange = (
  start: string | number | Date | null | undefined,
  end?: string | number | Date | null | undefined,
): string => {
  if (!start) return '-';
  const startStr = formatTime(start);
  if (!end) return startStr;
  const endStr = formatTime(end);
  return `${startStr} - ${endStr}`;
};

/**
 * Extracts local 'HH:mm' (24-hour) string from a date or ISO string.
 */
export const extractLocalTime = (date: string | number | Date | null | undefined): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Extracts local 'YYYY-MM-DD' string from a date or ISO string.
 */
export const extractLocalDate = (date: string | number | Date | null | undefined): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Combines local date ('YYYY-MM-DD') and local time ('HH:mm') into a valid ISO 8601 string.
 */
export const combineLocalDateAndTime = (
  dateStr?: string | null,
  timeStr?: string | null,
  defaultTime = '09:00',
): string => {
  if (!dateStr) {
    return new Date().toISOString();
  }
  const time = timeStr || defaultTime;
  const [hours, minutes] = time.split(':').map(val => parseInt(val, 10) || 0);
  const parts = dateStr.split('-');
  if (parts.length < 3) {
    return new Date().toISOString();
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (!year || !month || !day) {
    return new Date().toISOString();
  }
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return d.toISOString();
};

/**
 * Formats a Date or ISO string to standard date-time representation: "DD MMM YYYY, hh:mm A"
 */
export const formatDateTime = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};

/**
 * Returns a human-friendly relative time string (e.g., "Just now", "5m ago", "2h ago", "3d ago")
 */
export const formatRelativeTime = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d);
};
