import type { ImpactStats } from '../types/home.types';

/**
 * Temporary demo values for the Home UI. These are not verified HRSJM
 * statistics; replace this provider when a confirmed backend source exists.
 */
const DEMO_IMPACT_STATS: ImpactStats = {
  members: 100079,
  complaintsHandled: 200000,
  casesResolved: 199800,
};

export const getImpactStats = (): ImpactStats => ({ ...DEMO_IMPACT_STATS });
