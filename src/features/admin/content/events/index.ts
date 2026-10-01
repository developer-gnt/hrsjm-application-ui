/**
 * Events feature module — public surface.
 * Consumed by the (future) admin content navigation section.
 */
export { EventsScreen } from './screens/EventsScreen';
export { EventCard } from './components/EventCard';
export { EventStatusBadge } from './components/EventStatusBadge';
export { EventSummaryStats } from './components/EventSummaryStats';
export { EventFilters } from './components/EventFilters';
export type {
  EventListItem,
  EventUiStatus,
  EventStatusFilter,
  EventFilterTab,
  EventStatsSummary,
  EventsUiState,
} from './types/events.types';