/**
 * Events module — UI-facing types.
 *
 * TEMPORARY NOTE: These types mirror the reference UI, not a confirmed backend
 * contract. The Events API, DTOs and status enums are not defined yet (HRSJM
 * Suraj Development Specification, sections 30/32/35). Re-align these names and
 * fields against the real backend DTOs before API integration.
 */

/**
 * UI display statuses for an event.
 * NOT a confirmed backend enum — a backend-status -> UI-status mapping layer
 * will be added once the contract is known (spec section 25). DRAFT is kept
 * here for the future publish/unpublish lifecycle (spec section 12) but is not
 * used by the current list UI.
 */
export type EventUiStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT';

/** Status tab keys shown on the Events list. 'ALL' is a UI-only pseudo filter. */
export type EventStatusFilter = 'ALL' | EventUiStatus;

/**
 * List-row representation of an event.
 * Field names intentionally match what the Event Card renders; they will be
 * mapped from the backend DTO when the Events API is confirmed.
 */
export interface EventListItem {
  id: string;
  title: string;
  category?: string;
  location?: string;
  /** Demo remote URL for now; will be replaced by the backend asset flow (spec section 26). */
  coverImageUrl?: string | null;
  /** ISO 8601 datetimes. Timezone contract is pending backend confirmation (spec section 42). */
  startAt: string;
  endAt?: string;
  organizer?: string;
  registrations: number;
  capacity?: number;
  status: EventUiStatus;
}

/** Aggregated counts shown in the summary/stat cards (UI demonstration values for now). */
export interface EventStatsSummary {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

/** A single status tab rendered by EventFilters. */
export interface EventFilterTab {
  key: EventStatusFilter;
  label: string;
  count: number;
}

/**
 * Local render states of the Events list screen. They exist so the screen can
 * later be wired to real data hooks (loading/error coming from the API layer)
 * without structural changes.
 */
export type EventsUiState = 'loading' | 'success' | 'error';