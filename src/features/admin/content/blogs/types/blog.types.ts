/**
 * Blogs module — UI-facing types.
 *
 * TEMPORARY NOTE: These types mirror the reference UI, not a confirmed backend
 * contract. The Blogs API, DTOs and status enums are not defined yet. Re-align
 * these names and fields against the real backend DTOs before API integration.
 */

/** UI display statuses for a blog article. NOT a confirmed backend enum. */
export type BlogStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

/** Status tab keys shown on the Blogs list. 'ALL' is a UI-only pseudo filter. */
export type BlogStatusFilter = 'ALL' | BlogStatus;

/** Date-range filter options for the Blogs filter sheet (UI-only semantics). */
export type BlogDateFilter = 'ANY' | 'TODAY' | 'WEEK' | 'MONTH';

/**
 * List-row representation of a blog article.
 * Field names intentionally match what the Blog row renders; they will be
 * mapped from the backend DTO when the Blogs API is confirmed.
 */
export interface BlogListItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  /** Demo display date (e.g. "28 Sep 2026"). */
  date: string;
  /** Demo display time (e.g. "04:30 PM"). */
  time: string;
  status: BlogStatus;
  /** Raw view count; rows format it (e.g. 2100 -> "2.1K"). */
  views: number;
  /** Demo remote URL for now; replaced by the backend asset flow later. */
  thumbnailUrl?: string | null;
  /** Details-screen fields below mirror the News list item's optional fields. */
  author?: string;
  /** Article body paragraphs (details screen only; falls back to `excerpt`). */
  content?: string[];
}

/** Aggregated counts shown in the summary/stat cards (UI demonstration values). */
export interface BlogStatsSummary {
  total: number;
  drafts: number;
  published: number;
  archived: number;
}

/** A single status tab rendered on the Blogs list. */
export interface BlogFilterTab {
  key: BlogStatusFilter;
  label: string;
  count: number;
}

/**
 * Local render states of the Blogs list screen, so the screen can later be
 * wired to real data hooks without structural changes.
 */
export type BlogsUiState = 'loading' | 'success' | 'error';

/** Filters applied to the local sample list (status + category + date range). */
export interface BlogFilterState {
  status: BlogStatusFilter;
  category: string | null;
  dateRange: BlogDateFilter;
}

/**
 * Create Blog screen — local FORM STATE field names only.
 *
 * NOT the backend DTO: the final API payload must be created only after the
 * Blogs backend contract is confirmed. Mirrors the Create News form-state
 * pattern. `status` deliberately narrows to Draft/Published — a new blog is
 * never created archived (existing BlogStatus keeps Archived for the list).
 */
export interface CreateBlogFormState {
  /** Local demo image URI chosen from the sample imagery; no upload happens. */
  coverImageUri: string | null;
  title: string;
  category: string | null;
  shortDescription: string;
  content: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  /** Local UI-only preferences; no backend fields exist yet. */
  allowComments: boolean;
  featured: boolean;
  /** Comma-separated tags as typed (parsed for display later, local only). */
  tagsText: string;
}

/** Validation errors keyed by CreateBlogFormState field name. */
export type CreateBlogFieldErrors = Partial<Record<keyof CreateBlogFormState, string>>;
