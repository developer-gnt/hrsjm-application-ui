import type { IconName } from '../../components/icons';

export type HomeVariant = 'guest' | 'member';

export interface HomeQuickAction {
  id: string;
  label: string;
  icon: IconName;
  /** Navy emphasized card (reference: "Join HRSJM" on the guest home). */
  emphasized?: boolean;
}

export interface RightsCategory {
  id: string;
  title: string;
  icon: IconName;
}

/** Shares the card design of RightsCategoryCard (reference-identical). */
export type WhatWeDoItem = RightsCategory;

export interface ImpactStats {
  members: number;
  complaintsHandled: number;
  casesResolved: number;
}

export interface HomeEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  location: string;
  /**
   * Required image asset identifier (e.g. 'home/events/workshop.png').
   * No photo assets are bundled yet — ImageSlot documents the requirement.
   */
  imageAssetName: string;
}

export interface HomeNewsItem {
  id: string;
  category: string;
  title: string;
  date: string;
  imageAssetName: string;
}

export type ActivityTone = 'green' | 'blue' | 'amber' | 'purple';

export interface MemberActivity {
  id: string;
  icon: IconName;
  value: string;
  label: string;
  tone: ActivityTone;
}

export interface HomeRecommendation {
  id: string;
  title: string;
  imageAssetName: string;
  description?: string;
  date?: string;
  location?: string;
}

export type HomeTabId =
  | 'home'
  | 'about'
  | 'rights'
  | 'events'
  | 'news'
  | 'contact'
  | 'complaints'
  | 'donate'
  | 'profile';

export interface HomeTab {
  id: HomeTabId;
  label: string;
  icon: IconName;
}

export interface MemberGreeting {
  salutation: string;
  memberName: string;
  initials: string;
  badgeLabel: string;
}

export interface MembershipPreview {
  memberName: string;
  memberId: string;
  validTill: string;
}

export interface DonationContent {
  headline: string;
  description: string;
  ctaLabel: string;
}
