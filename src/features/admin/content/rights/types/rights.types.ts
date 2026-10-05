/**
 * Rights module — UI-facing types.
 *
 * TEMPORARY NOTE: These types mirror the reference UI, not a confirmed backend
 * contract. The Rights API, DTOs and status enums are not defined yet. Re-align
 * these names and fields against the real backend DTOs before API integration.
 */

/** UI display statuses for a rights article. NOT a confirmed backend enum. */
export type RightsStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

/** Status tab keys shown on the Know Your Rights list. 'ALL' is a UI-only pseudo filter. */
export type RightsStatusFilter = 'ALL' | RightsStatus;

/** Date-range filter options for the rights filter sheet (UI-only semantics). */
export type RightsDateFilter = 'ANY' | 'TODAY' | 'WEEK' | 'MONTH';

/**
 * List-row representation of a rights article.
 * Field names intentionally match what the article row renders; they will be
 * mapped from the backend DTO when the Rights API is confirmed.
 */
export interface RightsListItem {
  id: string;
  title: string;
  /** Short muted summary shown under the row title. */
  description: string;
  category: string;
  /** Demo display date (e.g. "28 Sep 2026"). */
  lastUpdatedDate: string;
  /** Demo display time (e.g. "04:30 PM"). */
  lastUpdatedTime: string;
  status: RightsStatus;
  /** Raw view count; rows format it (e.g. 2100 -> "2.1K"). */
  views: number;
  /** Demo remote URL for now; replaced by the backend asset flow later. */
  thumbnailUrl?: string | null;
}

/** Aggregated counts shown in the summary/stat cards (UI demonstration values). */
export interface RightsStatsSummary {
  total: number;
  drafts: number;
  published: number;
  archived: number;
}

/** A single status tab rendered on the Know Your Rights list. */
export interface RightsFilterTab {
  key: RightsStatusFilter;
  label: string;
  count: number;
}

/**
 * Local render states of the Know Your Rights screen, so the screen can later
 * be wired to real data hooks without structural changes.
 */
export type RightsUiState = 'loading' | 'success' | 'error';

/** Filters applied to the local sample list (status + category + date range). */
export interface RightsFilterState {
  status: RightsStatusFilter;
  category: string | null;
  dateRange: RightsDateFilter;
}

/** One numbered entry of the details screen's "Key Highlights" section. */
export interface RightsHighlight {
  title: string;
  description: string;
}

/**
 * Details-screen representation of a rights article: the list row plus the
 * fields only the details screen renders. NOT the backend DTO — re-align with
 * the real contract before API integration.
 */
export interface RightsArticle extends RightsListItem {
  author: string;
  authorRole: string;
  organization: string;
  /** Article body paragraphs (details screen only). */
  content: string[];
  /** Numbered "Key Highlights" entries (details screen only). */
  highlights: RightsHighlight[];
  /** Demo tags for the Edit form's chips editor; local UI state, not backend. */
  tags?: string[];
}

/**
 * Create Rights Article screen — local FORM STATE field names only.
 *
 * NOT the backend DTO: the final API payload must be created only after the
 * Rights backend contract is confirmed. Mirrors the Create Blog form-state
 * pattern. `status` deliberately narrows to Draft/Published — a new article
 * is never created archived (existing RightsStatus keeps Archived for the
 * list).
 */
export interface RightsArticleFormState {
  /** Local demo image URI chosen from the sample imagery; no upload happens. */
  coverImageUri: string | null;
  title: string;
  category: string | null;
  shortDescription: string;
  content: string;
  author: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  /** Local UI-only preferences; no backend fields exist yet. */
  allowComments: boolean;
  featured: boolean;
  tags: string[];
}

/** Validation errors keyed by RightsArticleFormState field name. */
export type RightsArticleFieldErrors = Partial<Record<keyof RightsArticleFormState, string>>;
