import type { ImageSourcePropType } from 'react-native';
import type { IconName } from '../../components/icons';

export const WHAT_WE_DO_IDS = [
  'awareness-campaigns',
  'workshops-training',
  'research-education',
  'community-activities',
] as const;

export type WhatWeDoId = (typeof WHAT_WE_DO_IDS)[number];

export interface WhatWeDoActivity {
  title: string;
  description: string;
  icon: IconName;
}

export interface WhatWeDoParticipationItem {
  text: string;
  icon: IconName;
}

export interface WhatWeDoContent {
  id: WhatWeDoId;
  title: string;
  heroDescription: string;
  heroImage: ImageSourcePropType;
  overview: string;
  activities: WhatWeDoActivity[];
  whyItMatters: string;
  whyIcon: IconName;
  participationItems: WhatWeDoParticipationItem[];
  ctaTitle: string;
  ctaButtonLabel: string;
  ctaImage: ImageSourcePropType;
  ctaDestination: 'contact' | 'rights';
}

export interface WhatWeDoHomeItem {
  id: WhatWeDoId;
  title: string;
  icon: IconName;
}
