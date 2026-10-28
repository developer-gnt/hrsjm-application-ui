import type {
  AdminDashboardResponse,
  AssistanceRequestItem,
} from '../types/dashboard.types';

export type GrowthRange = '7d' | '30d' | '3m' | '6m' | '12m' | 3 | 6 | 12 | number | string;

export interface DynamicGrowthPoint {
  label: string;
  dateLabel: string;
  total: number;
  newCount: number;
}

export interface GrowthMemberRecord {
  id?: string;
  created_at?: string | null;
  applied_at?: string | null;
  approval_date?: string | null;
  status?: string | null;
  membership?: {
    approval_date?: string | null;
    startDate?: string | null;
    created_at?: string | null;
    status?: string | null;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

const extractRecordDate = (m: GrowthMemberRecord): Date | null => {
  const raw =
    m.membership?.approval_date ||
    m.membership?.startDate ||
    m.approval_date ||
    m.membership?.created_at ||
    m.created_at ||
    m.applied_at;
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Computes dynamic, interactive membership growth points for daily ('7d', '30d')
 * or monthly (3, 6, 12) timeframes. Uses live member records with fallback to backend growth.
 */
export const computeDynamicGrowthPoints = (
  range: GrowthRange = '7d',
  backendGrowth?: AdminDashboardResponse['memberGrowth'],
  memberRecords?: GrowthMemberRecord[],
  targetDate?: string | Date,
): DynamicGrowthPoint[] => {
  const normRange = String(range || '7d').toLowerCase();
  const records = memberRecords || [];
  const refDate = targetDate ? new Date(targetDate) : new Date();

  // '7d' — Last 7 Days (daily progression)
  if (normRange === '7d' || normRange === '7') {
    const points: DynamicGrowthPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const total = records.filter((m) => {
        const dt = extractRecordDate(m);
        return dt ? dt <= endOfDay : false;
      }).length;

      const newCount = records.filter((m) => {
        const dt = extractRecordDate(m);
        return dt ? dt >= startOfDay && dt <= endOfDay : false;
      }).length;

      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      points.push({
        label: `${dayNum} ${monthStr}`,
        dateLabel: `${dayNum} ${monthStr} ${d.getFullYear()}`,
        total,
        newCount,
      });
    }

    // If records list is empty or smaller than backend latest total, calibrate endpoint
    const latestBackend =
      backendGrowth && backendGrowth.length > 0
        ? backendGrowth[backendGrowth.length - 1].total
        : 0;
    if (points.length > 0 && points[points.length - 1].total < latestBackend) {
      const diff = latestBackend - points[points.length - 1].total;
      points[points.length - 1].total = latestBackend;
      points[points.length - 1].newCount += diff;
    }

    return points;
  }

  // '30d' — Last 30 Days (10 sampled intervals across the past month)
  if (normRange === '30d' || normRange === '30') {
    const points: DynamicGrowthPoint[] = [];
    const stepDays = 3;
    const intervals = [27, 24, 21, 18, 15, 12, 9, 6, 3, 0];

    for (const ago of intervals) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - ago);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const startOfInterval = new Date(d);
      startOfInterval.setDate(startOfInterval.getDate() - stepDays + 1);
      startOfInterval.setHours(0, 0, 0, 0);

      const total = records.filter((m) => {
        const dt = extractRecordDate(m);
        return dt ? dt <= endOfDay : false;
      }).length;

      const newCount = records.filter((m) => {
        const dt = extractRecordDate(m);
        return dt ? dt >= startOfInterval && dt <= endOfDay : false;
      }).length;

      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      points.push({
        label: `${dayNum} ${monthStr}`,
        dateLabel: `${dayNum} ${monthStr} ${d.getFullYear()}`,
        total,
        newCount,
      });
    }

    const latestBackend =
      backendGrowth && backendGrowth.length > 0
        ? backendGrowth[backendGrowth.length - 1].total
        : 0;
    if (points.length > 0 && points[points.length - 1].total < latestBackend) {
      const diff = latestBackend - points[points.length - 1].total;
      points[points.length - 1].total = latestBackend;
      points[points.length - 1].newCount += diff;
    }

    return points;
  }

  // Monthly views: 3, 6, 12
  const monthCount =
    normRange === '3m' || normRange === '3'
      ? 3
      : normRange === '12m' || normRange === '12'
      ? 12
      : 6;

  if (backendGrowth && backendGrowth.length > 0) {
    const sliced = backendGrowth.slice(-monthCount);
    return sliced.map((p, idx) => {
      const [year, mth] = (p.month || '').split('-').map(Number);
      const mDate = new Date(year || 2026, (mth || 1) - 1, 1);
      const shortMonth = mDate.toLocaleDateString('en-US', { month: 'short' });
      const prevTotal = idx > 0 ? sliced[idx - 1].total : 0;
      const pointTotal =
        idx === sliced.length - 1 && records.length > p.total
          ? records.length
          : p.total;
      return {
        label: shortMonth,
        dateLabel: `${shortMonth} ${year || 2026}`,
        total: pointTotal,
        newCount: Math.max(pointTotal - prevTotal, 0),
      };
    });
  }

  // Monthly fallback derived from memberRecords
  const points: DynamicGrowthPoint[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    const total = records.filter((m) => {
      const dt = extractRecordDate(m);
      return dt ? dt <= endOfMonth : false;
    }).length;

    const newCount = records.filter((m) => {
      const dt = extractRecordDate(m);
      return dt ? dt >= startOfMonth && dt <= endOfMonth : false;
    }).length;

    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    points.push({
      label: shortMonth,
      dateLabel: `${shortMonth} ${d.getFullYear()}`,
      total,
      newCount,
    });
  }
  return points;
};

/** Safely computes MoM growth percent; null when there is nothing to compare. */
export const computeGrowthPercent = (
  current: number | undefined,
  previous: number | undefined,
): number | null => {
  if (current === undefined || previous === undefined || previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
};

/** "2026-09" -> "Sep 2026" (per the mockup's month labels). */
export const monthKeyToLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return monthKey;
  }
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${monthName} ${year}`;
};

/** Short month label ("Apr") for chart x-axes. */
export const monthKeyToShortLabel = (monthKey: string): string => {
  const [, month] = monthKey.split('-').map(Number);
  if (!month || month < 1 || month > 12) {
    return monthKey;
  }
  return new Date(2024, month - 1, 1).toLocaleString('en-US', { month: 'short' });
};

/** "Sep 2026" label for the current month chip. */
export const currentMonthLabel = (): string =>
  monthKeyToLabel(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  );

/** Normalises a 6-month growth payload into chart points with labels. */
export const toGrowthChartPoints = (
  growth: AdminDashboardResponse['memberGrowth'],
): Array<{ month: string; label: string; total: number }> =>
  growth.map((point) => ({
    month: point.month,
    label: monthKeyToShortLabel(point.month),
    total: point.total,
  }));

/** Application-status donut segments from the dashboard payload + application stores. */
export const toApplicationStatusSegments = (
  byStatus: AdminDashboardResponse['applicationsByStatus'],
  extra?: { approved?: number; underReview?: number; pending?: number; rejected?: number },
): Array<{ label: string; count: number }> => [
  { label: 'Approved', count: (byStatus?.APPROVED ?? 0) + (extra?.approved ?? 0) },
  { label: 'Under Review', count: (byStatus?.UNDER_REVIEW ?? 0) + (extra?.underReview ?? 0) },
  { label: 'Pending', count: (byStatus?.PENDING ?? 0) + (extra?.pending ?? 0) },
  { label: 'Rejected', count: (byStatus?.REJECTED ?? 0) + (extra?.rejected ?? 0) },
];

/** Complaints-overview donut segments from the dashboard payload. */
export const toComplaintsSegments = (
  byStatus: AdminDashboardResponse['ticketsByStatus'],
): Array<{ label: string; count: number }> => [
  { label: 'Resolved', count: byStatus.RESOLVED },
  { label: 'In Progress', count: byStatus.UNDER_REVIEW },
  { label: 'Open', count: byStatus.SUBMITTED },
  { label: 'Closed', count: byStatus.CLOSED },
];

/** Total across donut segments (fallback 0). */
export const segmentsTotal = (
  segments: Array<{ count: number }>,
): number => segments.reduce((sum, segment) => sum + segment.count, 0);

/** Formats an audit event ("donation_payment.verified") for display. */
export const formatActivityEvent = (event: string): string => {
  const [entity, action] = event.split('.');
  const words = (entity ?? event)
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  const actionLabel = action
    ? action.charAt(0).toUpperCase() + action.slice(1)
    : '';
  return actionLabel ? `${words.join(' ')} · ${actionLabel}` : words.join(' ');
};

/** Derives the recent-applications rows for the dashboard card. */
export const toRecentApplicationRows = (
  items: AssistanceRequestItem[],
): Array<Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'> & { full_name?: string }> =>
  items.map((item) => ({
    id: item.id,
    created_at: item.created_at,
    status: item.status,
    full_name: item.full_name,
  }));
