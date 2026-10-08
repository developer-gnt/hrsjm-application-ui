import type { ImageSourcePropType } from 'react-native';
import type { IconName } from '../../components/icons';

export interface RightsIndexItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  iconColor: string;
}

export interface RightsContentCard {
  id: string;
  title: string;
  description?: string;
  icon: IconName;
  color?: string;
  iconColor?: string;
}

export interface RightDetailsContent {
  id: string;
  badge: string;
  title: string;
  description: string;
  heroImage: ImageSourcePropType;
  overview: {
    title: string;
    description: string;
    quote?: string;
  };
  keyAreas?: RightsContentCard[];
  keyTopics?: RightsContentCard[];
  legalFramework?: {
    title: string;
    description: string;
    image?: ImageSourcePropType;
  };
  supportAreas?: RightsContentCard[];
  resources?: RightsContentCard[];
  relatedRights?: string[];
  legalProtections?: RightsContentCard[];
  helpOptions?: RightsContentCard[];
}
