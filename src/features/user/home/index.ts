/**
 * User Home feature module — public surface.
 *
 * Reference-locked Home implementation (guest flow: header, hero, quick
 * actions, About, rights, what-we-do, impact, events, latest updates,
 * donation CTA + guest navigation). Content is preview-static until the
 * backend integration phase. Member-specific components (MembershipCard,
 * MemberProfileHeader, ActivityCard, RecommendationCard,
 * MemberBottomNavigation) remain exported for the future Member Home.
 */
export { UserHomeScreen } from './screens/UserHomeScreen';

export { HomeHeader } from './components/HomeHeader';
export { HeroBanner } from './components/HeroBanner';
export { QuickActionCard, QuickActionsRow } from './components/QuickActionCard';
export { SectionHeader } from './components/SectionHeader';
export { GoldButton } from './components/GoldButton';
export { AboutSection } from './components/AboutSection';
export {
  CategoryIconCard,
  CategoryIconRow,
} from './components/CategoryIconCard';
export { ImpactSection } from './components/ImpactSection';
export { HomeEventCard } from './components/HomeEventCard';
export { NewsCard } from './components/NewsCard';
export { MemberProfileHeader } from './components/MemberProfileHeader';
export { MembershipCard } from './components/MembershipCard';
export { ActivityCard, ActivitiesRow } from './components/ActivityCard';
export { RecommendationCard } from './components/RecommendationCard';
export { DonationBanner } from './components/DonationBanner';
export { HomeTabBar } from './components/HomeTabBar';
export { UserBottomNavigation } from './components/UserBottomNavigation';

export type {
  HomeVariant,
  HomeQuickAction,
  RightsCategory,
  WhatWeDoItem,
  ImpactStats,
  HomeEvent,
  HomeNewsItem,
  MemberActivity,
  ActivityTone,
  HomeRecommendation,
  HomeTab,
  HomeTabId,
  MemberGreeting,
  MembershipPreview,
  DonationContent,
} from './types/home.types';
