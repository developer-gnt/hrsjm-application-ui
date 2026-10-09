/**
 * Shared lightweight app router.
 *
 * Navigation infrastructure (React Navigation stack) is not built yet,
 * so routes are represented by the URL hash on web (`#/donations`,
 * `#/donations/:donationId/receipt`, `#/profile`, …) and by an
 * in-memory store on native. This module is the single source of truth
 * for app-level routing; feature-local `navigation.ts` modules
 * re-export the helpers relevant to them so screens keep a stable API.
 */

export type AppRoute =
  | { name: 'donations' }
  | { name: 'receipt'; donationId: string }
  | { name: 'profile' }
  | { name: 'profile-edit-personal' }
  | { name: 'profile-admin-details' }
  | { name: 'profile-id-card' }
  | { name: 'membership-applications' }
  | { name: 'membership-application-details'; applicationId: string }
  | { name: 'create-account' }
  | { name: 'create-account-additional' }
  | { name: 'create-account-verification' }
  | { name: 'create-account-complete' }
  | { name: 'become-member' }
  | { name: 'membership-categories' };

const RECEIPT_HASH_PATTERN = /^\/donations\/([^/]+)\/receipt$/;
const MEMBERSHIP_DETAILS_HASH_PATTERN = /^\/membership-applications\/([^/]+)$/;

const PROFILE_HASH_ROUTES: Record<string, AppRoute> = {
  '/profile': { name: 'profile' },
  '/profile/edit/personal': { name: 'profile-edit-personal' },
  '/profile/edit/admin-details': { name: 'profile-admin-details' },
  '/profile/id-card': { name: 'profile-id-card' },
  '/membership-applications': { name: 'membership-applications' },
  '/applications': { name: 'membership-applications' },
  '/create-account': { name: 'create-account' },
  '/create-account/additional': { name: 'create-account-additional' },
  '/create-account/verification': { name: 'create-account-verification' },
  '/create-account/complete': { name: 'create-account-complete' },
  '/register': { name: 'create-account' },
  '/become-member': { name: 'become-member' },
  '/membership': { name: 'become-member' },
  '/join': { name: 'become-member' },
  '/membership-categories': { name: 'membership-categories' },
  '/categories': { name: 'membership-categories' },
};

const PROFILE_HASH_BY_ROUTE: Record<AppRoute['name'], string> = {
  donations: '#/donations',
  receipt: '#/donations',
  profile: '#/profile',
  'profile-edit-personal': '#/profile/edit/personal',
  'profile-admin-details': '#/profile/edit/admin-details',
  'profile-id-card': '#/profile/id-card',
  'membership-applications': '#/membership-applications',
  'membership-application-details': '#/membership-applications',
  'create-account': '#/create-account',
  'create-account-additional': '#/create-account/additional',
  'create-account-verification': '#/create-account/verification',
  'create-account-complete': '#/create-account/complete',
  'become-member': '#/become-member',
  'membership-categories': '#/membership-categories',
};

const getWebWindow = (): any =>
  typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;

const parseHash = (): AppRoute => {
  const win = getWebWindow();
  if (!win || !win.location) {
    return { name: 'membership-applications' };
  }
  const hash = win.location.hash.replace(/^#/, '');
  const profileRoute = PROFILE_HASH_ROUTES[hash];
  if (profileRoute) {
    return profileRoute;
  }
  const match = hash.match(RECEIPT_HASH_PATTERN);
  if (match) {
    return { name: 'receipt', donationId: decodeURIComponent(match[1]) };
  }
  const detailsMatch = hash.match(MEMBERSHIP_DETAILS_HASH_PATTERN);
  if (detailsMatch) {
    return { name: 'membership-application-details', applicationId: decodeURIComponent(detailsMatch[1]) };
  }
  return { name: 'membership-applications' };
};

const routeToHash = (route: AppRoute): string => {
  if (route.name === 'receipt') {
    return `#/donations/${encodeURIComponent(route.donationId)}/receipt`;
  }
  if (route.name === 'membership-application-details') {
    return `#/membership-applications/${encodeURIComponent(route.applicationId)}`;
  }
  return PROFILE_HASH_BY_ROUTE[route.name];
};

let currentRoute: AppRoute = parseHash();
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

const webWindow = getWebWindow();
if (webWindow && webWindow.addEventListener) {
  webWindow.addEventListener('hashchange', () => {
    const next = parseHash();
    if (
      next.name !== currentRoute.name ||
      (next.name === 'receipt' &&
        currentRoute.name === 'receipt' &&
        next.donationId !== currentRoute.donationId) ||
      (next.name === 'membership-application-details' &&
        currentRoute.name === 'membership-application-details' &&
        next.applicationId !== currentRoute.applicationId)
    ) {
      currentRoute = next;
      notify();
    }
  });
}

export const subscribeToRoute = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getRouteSnapshot = (): AppRoute => currentRoute;

export const navigate = (route: AppRoute): void => {
  const win = getWebWindow();
  if (win && win.location) {
    const hash = routeToHash(route);
    if (win.location.hash !== hash) {
      win.location.hash = hash;
      // hashchange listener updates currentRoute on web.
      return;
    }
  }
  currentRoute = route;
  notify();
};

export const navigateToDonations = (): void => {
  navigate({ name: 'donations' });
};

export const navigateToDashboard = (): void => {
  navigate({ name: 'donations' });
};

export const navigateToReceipt = (donationId: string): void => {
  navigate({ name: 'receipt', donationId });
};

export const navigateToProfile = (): void => {
  navigate({ name: 'profile' });
};

export const navigateToProfileEditPersonal = (): void => {
  navigate({ name: 'profile-edit-personal' });
};

export const navigateToProfileAdminDetails = (): void => {
  navigate({ name: 'profile-admin-details' });
};

export const navigateToProfileIdCard = (): void => {
  navigate({ name: 'profile-id-card' });
};

export const navigateToMembershipApplications = (): void => {
  navigate({ name: 'membership-applications' });
};

export const navigateToMembershipApplicationDetails = (applicationId: string): void => {
  navigate({ name: 'membership-application-details', applicationId });
};

export const navigateToCreateAccount = (): void => {
  navigate({ name: 'create-account' });
};

export const navigateToCreateAccountAdditional = (): void => {
  navigate({ name: 'create-account-additional' });
};

export const navigateToCreateAccountVerification = (): void => {
  navigate({ name: 'create-account-verification' });
};

export const navigateToCreateAccountComplete = (): void => {
  navigate({ name: 'create-account-complete' });
};

export const navigateToBecomeMember = (): void => {
  navigate({ name: 'become-member' });
};

export const navigateToMembershipCategories = (): void => {
  navigate({ name: 'membership-categories' });
};



