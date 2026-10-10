import type {
  AdminDashboardResponse,
  AssistanceRequestItem,
} from '../types/dashboard.types';

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

/** Application-status donut segments from the dashboard payload. */
export const toApplicationStatusSegments = (
  byStatus: AdminDashboardResponse['applicationsByStatus'],
): Array<{ label: string; count: number }> => [
  { label: 'Approved', count: byStatus.APPROVED },
  { label: 'Under Review', count: byStatus.UNDER_REVIEW },
  { label: 'Pending', count: byStatus.PENDING },
  { label: 'Rejected', count: byStatus.REJECTED },
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
): Array<Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'>> =>
  items.map((item) => ({
    id: item.id,
    created_at: item.created_at,
    status: item.status,
  }));
