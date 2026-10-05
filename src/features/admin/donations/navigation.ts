/**
 * Minimal hash-based routing for the app shell.
 *
 * Navigation infrastructure is not built yet (see App.tsx), so routes
 * are represented by the URL hash on web (`#/donations`,
 * `#/donations/:donationId/receipt`) and by an in-memory store on
 * native. This keeps the Receipt Details URL shareable and the browser
 * back button functional without introducing a router dependency.
 */

export type AppRoute =
  | { name: 'donations' }
  | { name: 'receipt'; donationId: string };

const RECEIPT_HASH_PATTERN = /^\/donations\/([^/]+)\/receipt$/;

const getWebWindow = (): any =>
  typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;

const parseHash = (): AppRoute => {
  const win = getWebWindow();
  if (!win || !win.location) {
    return { name: 'donations' };
  }
  const hash = win.location.hash.replace(/^#/, '');
  const match = hash.match(RECEIPT_HASH_PATTERN);
  if (match) {
    return { name: 'receipt', donationId: decodeURIComponent(match[1]) };
  }
  return { name: 'donations' };
};

const routeToHash = (route: AppRoute): string =>
  route.name === 'receipt'
    ? `#/donations/${encodeURIComponent(route.donationId)}/receipt`
    : '#/donations';

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
        next.donationId !== currentRoute.donationId)
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

export const navigateToReceipt = (donationId: string): void => {
  navigate({ name: 'receipt', donationId });
};
