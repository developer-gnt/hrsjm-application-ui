import type { ImageSourcePropType } from 'react-native';
import type { IconName } from '../../components/icons';

export type ActionPageId = 'join' | 'donate' | 'membership';

export interface ActionPageCard {
  title: string;
  description: string;
  icon: IconName;
}

export interface ActionPageContent {
  title: string;
  description: string;
  heroImage: ImageSourcePropType;
  overviewTitle: string;
  overviewDescription: string;
  cardsTitle: string;
  cards: ActionPageCard[];
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  ctaImage: ImageSourcePropType;
}
