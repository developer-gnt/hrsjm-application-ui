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
    id: 'womens-rights',
    title: "Women's Rights",
    description: "Support related to women's rights and protection",
    keywords: ['women', "women's rights", 'gender', 'equality', 'protection', 'discrimination'],
    icon: 'user',
    iconColor: '#D75486',
    iconBackground: '#FCE4EC',
  },
  {
    id: 'childrens-rights',
    title: "Children's Rights",
    description: "Support related to children's rights and welfare",
    keywords: ['children', 'child', 'minor', 'welfare', 'protection', 'education'],
    icon: 'child-care',
    iconColor: '#B67D00',
    iconBackground: '#FDF1CD',
  },
  {
    id: 'human-rights-violation',
    title: 'Human Rights Violation',
    description: 'Report human rights violations and seek support',
    keywords: ['human rights', 'violation', 'abuse', 'harassment', 'justice', 'support'],
    icon: 'scale',
    iconColor: '#3558B0',
    iconBackground: '#E8EEFF',
  },
  {
    id: 'civil-rights',
    title: 'Civil Rights',
    description: 'Support for civil rights and equal treatment',
    keywords: ['civil rights', 'equality', 'justice', 'non-discrimination', 'rights'],
    icon: 'doc-search',
    iconColor: '#6B4EB3',
    iconBackground: '#F1EBFF',
  },
  {
    id: 'right-to-education',
    title: 'Right to Education',
    description: 'Support related to education rights and access to learning',
    keywords: ['education', 'school', 'college', 'learning', 'rights', 'students'],
    icon: 'graduation-cap',
    iconColor: '#2F9B71',
    iconBackground: '#E7F8EE',
  },
  {
    id: 'labour-rights',
    title: 'Labour Rights',
    description: "Support related to workers' rights and fair working conditions",
    keywords: ['labour', 'labor', 'work', 'workers', 'employment', 'fair wages'],
    icon: 'briefcase',
    iconColor: '#D45B6A',
    iconBackground: '#FDEBEA',
  },
  {
    id: 'senior-citizen-rights',
    title: 'Senior Citizen Rights',
    description: "Support for elderly citizens' rights and welfare",
    keywords: ['senior', 'elderly', 'old age', 'care', 'welfare', 'support'],
    icon: 'clock',
    iconColor: '#B17B00',
    iconBackground: '#FDF5D8',
  },
  {
    id: 'womens-safety',
    title: "Women's Safety",
    description: 'Report safety concerns, harassment and violence',
    keywords: ['women safety', 'safety', 'harassment', 'violence', 'abuse', 'support'],
    icon: 'shield-check',
    iconColor: '#D75486',
    iconBackground: '#FCE4EC',
  },
  {
    id: 'workplace-rights',
    title: 'Workplace Rights',
    description: 'Support for workplace equality and fair treatment',
    keywords: ['workplace', 'employment', 'office', 'equality', 'fair treatment', 'harassment'],
    icon: 'briefcase',
    iconColor: '#C2466A',
    iconBackground: '#FDEBED',
  },
  {
    id: 'domestic-violence-support',
    title: 'Domestic Violence Support',
    description: 'Help and support for domestic violence issues',
    keywords: ['domestic violence', 'violence', 'abuse', 'support', 'safety', 'home'],
    icon: 'heart-hands',
    iconColor: '#DB5F74',
    iconBackground: '#FFEFF3',
  },
  {
    id: 'gender-discrimination',
    title: 'Gender Discrimination',
    description: 'Report discrimination based on gender',
    keywords: ['gender discrimination', 'discrimination', 'gender', 'equality', 'fairness'],
    icon: 'users',
    iconColor: '#7C4D9E',
    iconBackground: '#F4EAFE',
  },
  {
    id: 'minority-rights',
    title: 'Minority Rights',
    description: 'Support for minority communities and equal protection',
    keywords: ['minority', 'community', 'rights', 'equality', 'protection', 'inclusion'],
    icon: 'users',
    iconColor: '#3C7BFF',
    iconBackground: '#EAF1FF',
  },
  {
    id: 'freedom-of-speech',
    title: 'Freedom of Speech',
    description: 'Support related to free expression and civic participation',
    keywords: ['speech', 'expression', 'civics', 'freedom', 'rights', 'voice'],
    icon: 'message',
    iconColor: '#0F7FB6',
    iconBackground: '#EAF8FF',
  },
  {
    id: 'right-to-information',
    title: 'Right to Information',
    description: 'Support for access to public information and transparency',
    keywords: ['rti', 'information', 'transparency', 'access', 'records', 'public rights'],
    icon: 'file-text',
    iconColor: '#2A7F73',
    iconBackground: '#E7F8F4',
  },
];

export const POPULAR_HELP_TOPICS = HELP_TOPICS.slice(0, 7);

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
