import type { RenewalQuotePayload, RenewalPeriodBreakdown } from '../../payments/types/payment.types';

export interface CalculateRenewalQuoteClientSideOptions {
  currentExpiry?: string | Date | null;
  registrationDate?: string | Date | null;
  membershipId?: string;
  membershipNumber?: string | null;
  status?: string;
  pastPaidPeriodsCount?: number;
  overridePeriodsCount?: number;
  asOfDate?: Date;
}

/**
 * Returns annual renewal fee based on renewal sequence number:
 * Sequence 1: ₹500
 * Sequence 2: ₹400
 * Sequence 3+: ₹300 per year
 */
export function getFeeForRenewalSequence(sequenceNumber: number): number {
  if (!Number.isInteger(sequenceNumber) || sequenceNumber <= 0) {
    return 500;
  }
  if (sequenceNumber === 1) return 500;
  if (sequenceNumber === 2) return 400;
  return 300;
}

/**
 * Safely adds years to a date, accurately preserving day of month
 * and handling Feb 29 on leap years (snapping to Feb 28 on non-leap years).
 */
export function addYearsSafe(date: Date, years: number): Date {
  const d = new Date(date.getTime());
  const targetYear = d.getFullYear() + years;
  const targetMonth = d.getMonth();
  const targetDay = d.getDate();

  const candidate = new Date(
    targetYear,
    targetMonth,
    targetDay,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  );

  // If month shifted (e.g., Feb 29 -> March 1 in non-leap year)
  if (candidate.getMonth() !== targetMonth) {
    return new Date(
      targetYear,
      targetMonth + 1,
      0, // last day of target month (Feb 28)
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
    );
  }

  return candidate;
}

export function getDaysDiff(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Pure calculation function for renewal arrears and quotation on client.
 * Guarantees that even if backend quotation endpoint fails (or remote server isn't updated),
 * client calculates sequence fees faithfully and never blocks the user.
 */
export function calculateRenewalQuoteClientSide(
  options: CalculateRenewalQuoteClientSideOptions
): RenewalQuotePayload {
  const {
    currentExpiry,
    registrationDate,
    membershipId = 'hrsjm_membership',
    membershipNumber = null,
    status = 'ACTIVE',
    pastPaidPeriodsCount = 0,
    overridePeriodsCount,
    asOfDate = new Date(),
  } = options;

  let expiryDate: Date;
  if (currentExpiry) {
    const parsed = new Date(currentExpiry);
    expiryDate = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    // Default fallback: 7 days remaining from now
    expiryDate = new Date(asOfDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const isOverdue = expiryDate.getTime() < asOfDate.getTime();
  let unpaidPeriodsCount = 0;

  if (overridePeriodsCount !== undefined) {
    unpaidPeriodsCount = Math.max(0, Math.floor(overridePeriodsCount));
  } else if (isOverdue) {
    // Step forward year by year until expiry covers asOfDate
    let cursor = new Date(expiryDate.getTime());
    while (cursor.getTime() <= asOfDate.getTime()) {
      cursor = addYearsSafe(cursor, 1);
      unpaidPeriodsCount++;
    }
  } else {
    unpaidPeriodsCount = 1;
  }

  const daysOverdue = isOverdue
    ? Math.max(1, getDaysDiff(expiryDate, asOfDate))
    : 0;
  const daysRemaining = !isOverdue
    ? Math.max(0, getDaysDiff(asOfDate, expiryDate))
    : 0;

  const periods: RenewalPeriodBreakdown[] = [];
  let renewalSubtotal = 0;

  if (isOverdue) {
    for (let i = 1; i <= unpaidPeriodsCount; i++) {
      const sequence = pastPaidPeriodsCount + i;
      const fee = getFeeForRenewalSequence(sequence);

      const periodStart = addYearsSafe(expiryDate, i - 1);
      const periodEnd = addYearsSafe(expiryDate, i);

      periods.push({
        sequence,
        label: `Year ${sequence} (${formatDateShort(periodStart)} – ${formatDateShort(periodEnd)})`,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        fee,
        status: 'UNPAID',
      });

      renewalSubtotal += fee;
    }
  } else {
    // Standard not overdue: sequence based on next upcoming renewal year
    const nextSeq = pastPaidPeriodsCount + 1;
    renewalSubtotal = getFeeForRenewalSequence(nextSeq);
    const periodStart = expiryDate;
    const periodEnd = addYearsSafe(expiryDate, 1);
    const label =
      nextSeq === 1
        ? '1st Year Renewal Fees'
        : nextSeq === 2
        ? '2nd Year Renewal Fees'
        : nextSeq === 3
        ? '3rd Year Renewal Fees'
        : 'Annual Renewal Fees';

    periods.push({
      sequence: nextSeq,
      label,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      fee: renewalSubtotal,
      status: 'UNPAID',
    });
  }

  const projectedExpiry = addYearsSafe(expiryDate, unpaidPeriodsCount);

  return {
    membership_id: membershipId,
    membership_number: membershipNumber,
    status,
    registration_date: registrationDate ? new Date(registrationDate).toISOString() : null,
    current_expiry: expiryDate.toISOString(),
    projected_expiry: projectedExpiry.toISOString(),
    is_overdue: isOverdue,
    days_overdue: daysOverdue,
    days_remaining: daysRemaining,
    unpaid_periods_count: isOverdue ? unpaidPeriodsCount : 0,
    paid_periods_count: pastPaidPeriodsCount,
    periods,
    renewal_subtotal: renewalSubtotal,
    platform_fee: 0,
    taxes: 0,
    total_payable: renewalSubtotal,
    explanation: isOverdue
      ? `Outstanding arrears of ₹${renewalSubtotal.toLocaleString('en-IN')} for ${unpaidPeriodsCount} unpaid year(s).`
      : 'Membership is active. Standard 1-year renewal rate applies.',
    requires_verification: false,
  };
}
