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
export { AboutMonitorBanner } from './components/AboutMonitorBanner';
export { AboutInfoTile } from './components/AboutInfoTile';
export { AboutInfoSection } from './components/AboutInfoSection';
export { AboutImpactSection } from './components/AboutImpactSection';
export { HumanRightsMonitoringSection } from './components/HumanRightsMonitoringSection';
export { AboutFinalCta } from './components/AboutFinalCta';
export { ABOUT_CONTENT } from './data/about-content';
export type {
  AboutContent,
  AboutWorkArea,
  AboutTile,
  AboutImpactStat,
  AboutInfoBlock,
  AboutImpactBlock,
} from './types/about.types';
