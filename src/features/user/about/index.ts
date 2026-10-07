/**
 * About feature module — public surface.
 *
 * Reference-locked About page ("What HRSJM Does"): header, community hero,
 * static 3x3 work-area grid, closing movement CTA and the shared six-tab
 * bottom navigation. Content is preview-static until the backend
 * integration phase.
 */
export { AboutScreen } from './screens/AboutScreen';
export type { AboutScreenProps } from './screens/AboutScreen';
export { AboutHero } from './components/AboutHero';
export { AboutWorkCard } from './components/AboutWorkCard';
export { AboutWorkGrid } from './components/AboutWorkGrid';
export { AboutFinalCta } from './components/AboutFinalCta';
export { ABOUT_CONTENT } from './data/about-content';
export type { AboutContent, AboutWorkArea } from './types/about.types';
