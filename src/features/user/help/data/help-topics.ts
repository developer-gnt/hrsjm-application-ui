import type { IconName } from '../../components/icons';

export type HelpTopic = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon: IconName;
  iconColor: string;
  iconBackground: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'custodial-death',
    title: 'CUSTODIAL DEATH',
    description: 'Report custodial death or death in police/judicial custody',
    keywords: ['custodial death', 'custody', 'police', 'death', 'detention'],
    icon: 'scale',
    iconColor: '#DC2626',
    iconBackground: '#FEE2E2',
  },
  {
    id: 'child-labor',
    title: 'CHILD LABOR',
    description: 'Report child labor, exploitation, or hazardous work by minors',
    keywords: ['child labor', 'child labour', 'minor', 'children', 'exploitation'],
    icon: 'child-care',
    iconColor: '#B67D00',
    iconBackground: '#FDF1CD',
  },
  {
    id: 'consumer-issue',
    title: 'CONSUMER ISSUE',
    description: 'Report consumer rights violations, fraud, or unfair trade practices',
    keywords: ['consumer', 'fraud', 'service', 'product', 'unfair trade'],
    icon: 'file-text',
    iconColor: '#2A7F73',
    iconBackground: '#E7F8F4',
  },
  {
    id: 'communal-violence',
    title: 'COMMUNAL VIOLENCE',
    description: 'Report communal tension, hate crimes, or group violence',
    keywords: ['communal', 'violence', 'riot', 'hate crime', 'harmony'],
    icon: 'users',
    iconColor: '#C2466A',
    iconBackground: '#FDEBED',
  },
  {
    id: 'domestic-violence',
    title: 'DOMESTIC VIOLENCE',
    description: 'Help and support for domestic violence and family abuse',
    keywords: ['domestic violence', 'violence', 'abuse', 'home', 'safety'],
    icon: 'heart-hands',
    iconColor: '#DB5F74',
    iconBackground: '#FFEFF3',
  },
  {
    id: 'dowry-related-issue',
    title: 'DOWRY RELATED ISSUE',
    description: 'Report dowry harassment, demand, or dowry-related abuse',
    keywords: ['dowry', 'harassment', 'marriage', 'abuse', 'protection'],
    icon: 'shield-check',
    iconColor: '#D75486',
    iconBackground: '#FCE4EC',
  },
  {
    id: 'environment-destruction',
    title: 'ENVIRONMENT DESTRUCTION',
    description: 'Report environmental pollution, illegal deforestation, or ecological damage',
    keywords: ['environment', 'pollution', 'deforestation', 'ecology', 'waste'],
    icon: 'doc-search',
    iconColor: '#2F9B71',
    iconBackground: '#E7F8EE',
  },
  {
    id: 'human-trafficking',
    title: 'HUMAN TRAFFICKING',
    description: 'Report human trafficking, forced labor, or illegal exploitation',
    keywords: ['human trafficking', 'trafficking', 'forced', 'rescue', 'missing'],
    icon: 'users',
    iconColor: '#7C4D9E',
    iconBackground: '#F4EAFE',
  },
  {
    id: 'labor-issue',
    title: 'LABOR ISSUE',
    description: 'Support related to workers’ rights, unpaid wages, and workplace issues',
    keywords: ['labor', 'labour', 'worker', 'wages', 'employment', 'workplace'],
    icon: 'briefcase',
    iconColor: '#D45B6A',
    iconBackground: '#FDEBEA',
  },
  {
    id: 'rape-or-sexual-harassment',
    title: 'RAPE OR SEXUAL HARASSMENT',
    description: 'Report sexual assault, harassment, or gender-based violence',
    keywords: ['rape', 'sexual harassment', 'assault', 'safety', 'women'],
    icon: 'shield-check',
    iconColor: '#B91C1C',
    iconBackground: '#FEE2E2',
  },
  {
    id: 'suspicious-death',
    title: 'SUSPICIOUS DEATH',
    description: 'Report suspicious death requiring investigation or legal support',
    keywords: ['suspicious death', 'death', 'investigation', 'justice'],
    icon: 'clock',
    iconColor: '#B17B00',
    iconBackground: '#FDF5D8',
  },
  {
    id: 'civil-issues',
    title: 'CIVIL ISSUES',
    description: 'Support for civil disputes, property, and civic rights issues',
    keywords: ['civil', 'civil issues', 'dispute', 'rights', 'civic'],
    icon: 'scale',
    iconColor: '#3558B0',
    iconBackground: '#E8EEFF',
  },
  {
    id: 'others',
    title: 'OTHERS',
    description: 'Other human rights or social justice complaints',
    keywords: ['others', 'other', 'general', 'complaint', 'help'],
    icon: 'message',
    iconColor: '#0F7FB6',
    iconBackground: '#EAF8FF',
  },
];

export const POPULAR_HELP_TOPICS = HELP_TOPICS;

export const getMatchedHelpTopics = (query: string) => {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return POPULAR_HELP_TOPICS;
  }

  return HELP_TOPICS.filter(topic => {
    const searchableText = [
      topic.title,
      topic.description,
      ...topic.keywords,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(trimmedQuery);
  });
};
