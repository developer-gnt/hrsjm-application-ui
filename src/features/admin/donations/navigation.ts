/**
 * Donations feature routing helpers.
 *
 * Routing now lives in the shared app router (`src/core/navigation`);
 * this module keeps the donations-facing API stable for the existing
 * screens (navigateToDonations / navigateToReceipt).
 */
export {
  navigateToDonations,
  navigateToReceipt,
  navigateToProfile,
  subscribeToRoute,
  getRouteSnapshot,
} from '../../../core/navigation/appRouter';
export type { AppRoute } from '../../../core/navigation/appRouter';
