/**
 * Events feature module — public surface.
 * Consumed by the (future) admin content navigation section.
 *
 * NOTE: components in ./preview/ (AdminShellHeader, AdminShellTabBar) are
 * TEMPORARY visual-review shells and are deliberately NOT exported here.
 */
export { EventsScreen } from './screens/EventsScreen';
export { EventDetailsScreen } from './screens/EventDetailsScreen';
export { CreateEventScreen } from './screens/CreateEventScreen';
export { EditEventScreen } from './screens/EditEventScreen';
export { EventCard, EventListHeader } from './components/EventCard';
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