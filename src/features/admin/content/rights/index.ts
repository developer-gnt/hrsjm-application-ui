/**
 * Rights feature module — public surface.
 * Consumed by the (future) admin content navigation section.
 *
 * UI-only phase: sample data + local filtering. No API/services yet.
 */
export { KnowYourRightsScreen } from './screens/KnowYourRightsScreen';
export { RightArticleDetailsScreen } from './screens/RightArticleDetailsScreen';
export { CreateRightsArticleScreen } from './screens/CreateRightsArticleScreen';
export { EditRightsArticleScreen } from './screens/EditRightsArticleScreen';
export type {
  RightsListItem,
  RightsArticle,
  RightsHighlight,
  RightsStatus,
  RightsStatusFilter,
  RightsFilterTab,
  RightsStatsSummary,
  RightsFilterState,
  RightsUiState,
  RightsArticleFormState,
  RightsArticleFieldErrors,
} from './types/rights.types';
