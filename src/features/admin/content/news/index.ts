/**
 * News feature module — public surface.
 * Consumed by the (future) admin content navigation section.
 *
 * UI-only phase: sample data + local filtering. No API/services yet.
 */
export { NewsListScreen } from './screens/NewsListScreen';
export { NewsDetailsScreen } from './screens/NewsDetailsScreen';
export { CreateNewsScreen } from './screens/CreateNewsScreen';
export { EditNewsScreen } from './screens/EditNewsScreen';
export * from './services/news.service';
export * from './hooks/useNews';
export type {
  NewsListItem,
  NewsStatus,
  NewsStatusFilter,
  NewsFilterTab,
  NewsStatsSummary,
  NewsFilterState,
  NewsUiState,
} from './types/news.types';

