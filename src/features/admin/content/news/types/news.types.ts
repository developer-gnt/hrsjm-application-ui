/**
 * News module — UI-facing types.
 *
 * TEMPORARY NOTE: These types mirror the reference UI, not a confirmed backend
 * contract. The News API, DTOs and status enums are not defined yet. Re-align
 * these names and fields against the real backend DTOs before API integration.
 */

/** UI display statuses for a news item. NOT a confirmed backend enum. */
export type NewsStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

/** Status tab keys shown on the News list. 'ALL' is a UI-only pseudo filter. */
export type NewsStatusFilter = 'ALL' | NewsStatus;

/**
 * List-row representation of a news item.
 * Field names intentionally match what the News row renders; they will be
 * mapped from the backend DTO when the News API is confirmed.
 */
export interface NewsListItem {
  id: string;
  title: string;
  /** Short summary shown under the headline. */
  summary: string;
  category: string;
  /** Demo display date (e.g. "28 Sep 2026") until the backend format is known. */
  date: string;
  /** Demo display time (e.g. "04:30 PM"). */
  time: string;
  status: NewsStatus;
  /** Raw view count; the row formats it (e.g. 1200 -> "1.2K"). */
  views: number;
  /** Demo remote URL for now; replaced by the backend asset flow later. */
  thumbnailUrl?: string | null;
}

/** Aggregated counts shown in the summary/stat cards (UI demonstration values). */
export interface NewsStatsSummary {
  total: number;
  drafts: number;
  published: number;
  archived: number;
}

/** A single status tab rendered by NewsStatusTabs. */
export interface NewsFilterTab {
  key: NewsStatusFilter;
  label: string;
  count: number;
}

/**
 * Local render states of the News list screen. They exist so the screen can
 * later be wired to real data hooks (loading/error coming from the API layer)
 * without structural changes.
 */
export type NewsUiState = 'loading' | 'success' | 'error';

/** Filters applied to the local sample list (status + category for now). */
export interface NewsFilterState {
  status: NewsStatusFilter;
  category: string | null;
}
