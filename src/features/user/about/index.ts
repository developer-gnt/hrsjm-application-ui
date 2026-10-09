/**
 * About feature module — public surface.
 *
 * About page with the HRSJM purpose hero, nine work areas, monitoring
 * feature, approach, impact, final CTA and the shared six-tab navigation.
 */
export { AboutScreen } from './screens/AboutScreen';
export type { AboutScreenProps } from './screens/AboutScreen';
export { AboutHero } from './components/AboutHero';
export { AboutWhoWeAreSection } from './components/AboutWhoWeAreSection';
export { AboutWorkCard } from './components/AboutWorkCard';
export { AboutWorkGrid } from './components/AboutWorkGrid';
export { AboutApproachSection } from './components/AboutApproachSection';
export { AboutImpactSection } from './components/AboutImpactSection';
export { HumanRightsMonitoringSection } from './components/HumanRightsMonitoringSection';
export { AboutFinalCta } from './components/AboutFinalCta';
export { ABOUT_CONTENT } from './data/about-content';
export type {
  AboutContent,
  AboutWorkArea,
  AboutPrinciple,
  AboutApproachStep,
  AboutImpactStat,
} from './types/about.types';
