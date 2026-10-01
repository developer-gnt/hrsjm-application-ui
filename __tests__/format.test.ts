import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  initialsOf,
} from '../src/core/utils/format';

describe('formatCurrency', () => {
  it('formats numeric strings with the rupee symbol and Indian grouping', () => {
    expect(formatCurrency('50000')).toBe('₹50,000');
    expect(formatCurrency('1234567')).toBe('₹12,34,567');
  });

  it('accepts numbers', () => {
    expect(formatCurrency(1500.5)).toBe('₹1,500.5');
  });

  it('falls back to a dash for invalid input', () => {
    expect(formatCurrency('not-a-number')).toBe('—');
  });
});

describe('formatDate / formatDateTime', () => {
  it('returns a dash for null/undefined/invalid dates', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('garbage')).toBe('—');
    expect(formatDateTime(null)).toBe('—');
  });

  it('formats a valid ISO date', () => {
    const result = formatDate('2026-09-28T10:30:00.000Z');
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/Sep/);
  });

  it('formats date and time together', () => {
    const result = formatDateTime('2026-09-28T10:30:00.000Z');
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/:/);
  });
});

describe('formatFileSize', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('returns a dash for invalid sizes', () => {
    expect(formatFileSize(-1)).toBe('—');
    expect(formatFileSize(Number.NaN)).toBe('—');
  });
});

describe('initialsOf', () => {
  it('uses first and last name initials', () => {
    expect(initialsOf('Ahmed Khan')).toBe('AK');
  });

  it('handles single names and extra whitespace', () => {
    expect(initialsOf('  Aisha  ')).toBe('A');
  });

  it('falls back for empty names', () => {
    expect(initialsOf('   ')).toBe('?');
  });
});
