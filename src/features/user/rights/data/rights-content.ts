import type {
  RightDetailsContent,
  RightsIndexItem,
} from '../types/rights.types';

const RIGHTS_HERO_IMAGE = require('../../../../assets/images/about-hero-community.png');
const COMMUNITY_HERO_IMAGE = require('../../../../assets/images/hero-home.webp');
const SOLIDARITY_HERO_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');

export const RIGHTS_INDEX: RightsIndexItem[] = [
  {
    id: 'human-rights',
    title: 'Human Rights',
    description: 'Basic rights and freedoms every human being has.',
    icon: 'users',
    color: '#FFF8E8',
    iconColor: '#FCE9B8',
  },
  {
    id: 'civil-rights',
    title: 'Civil Rights',
    description: 'Rights related to equal treatment and protection under law.',
    icon: 'scale',
    color: '#EEF4FF',
    iconColor: '#DCE9FF',
  },
  {
    id: 'fundamental-rights',
    title: 'Fundamental Rights',
    description: 'Constitutional rights guaranteed to every citizen of India.',
    icon: 'file-text',
    color: '#FFF8E8',
    iconColor: '#FCE9B8',
  },
  {
    id: 'womens-rights',
    title: "Women's Rights",
    description: 'Rights, protection and support for women.',
    icon: 'user',
    color: '#FFF0F2',
    iconColor: '#F9DDE3',
  },
  {
    id: 'childrens-rights',
    title: "Children's Rights",
    description: 'Rights and welfare of children and young people.',
    icon: 'child-care',
    color: '#EEF4FF',
    iconColor: '#DCE9FF',
  },
  {
    id: 'senior-citizen-rights',
    title: 'Senior Citizen Rights',
    description: 'Rights and schemes for elderly citizens.',
    icon: 'clock',
    color: '#FFF8E8',
    iconColor: '#FCE9B8',
  },
  {
    id: 'minority-rights',
    title: 'Minority Rights',
    description: 'Rights of religious, linguistic and other minorities.',
    icon: 'users',
    color: '#F5F0FF',
    iconColor: '#E7DFFF',
  },
  {
    id: 'labour-rights',
    title: 'Labour Rights',
    description: 'Rights and protections for workers.',
    icon: 'handshake',
    color: '#FFF0F2',
    iconColor: '#F9DDE3',
  },
  {
    id: 'right-to-education',
    title: 'Right to Education',
    description: 'Right to free and compulsory education.',
    icon: 'graduation-cap',
    color: '#ECF9F4',
    iconColor: '#D0F0E3',
  },
  {
    id: 'right-to-information',
    title: 'Right to Information',
    description: 'Right to access information from public authorities.',
    icon: 'doc-search',
    color: '#EEF4FF',
    iconColor: '#DCE9FF',
  },
  {
    id: 'freedom-of-speech',
    title: 'Freedom of Speech',
    description: 'Right to express opinions and ideas freely.',
    icon: 'megaphone',
    color: '#FFF8E8',
    iconColor: '#FCE9B8',
  },
  {
    id: 'civil-liberties',
    title: 'Civil Liberties',
    description: 'Rights to personal freedom and privacy in daily life.',
    icon: 'shield-check',
    color: '#EEF4FF',
    iconColor: '#DCE9FF',
  },
];

const womensRightsContent: RightDetailsContent = {
  id: 'womens-rights',
  badge: "WOMEN'S RIGHTS",
  title: "Women's Rights",
  description:
    'Rights, protection and support for women to ensure equality, safety and opportunities in all areas of life.',
  heroImage: RIGHTS_HERO_IMAGE,
  overview: {
    title: "What are Women's Rights?",
    description:
      "Women's rights are the fundamental human rights that ensure equality, safety, dignity and equal opportunities for women in all areas of life, at home, in society, at the workplace and in public spaces.",
    quote:
      'Women’s rights strengthen families, communities and create a more equal and progressive society.',
  },
  keyTopics: [
    {
      id: 'right-to-equality',
      title: 'Right to Equality',
      description: 'Equal opportunities in all areas',
      icon: 'scale',
    },
    {
      id: 'protection-from-violence',
      title: 'Protection from Violence',
      description: 'Legal safeguards and support systems',
      icon: 'shield-check',
    },
    {
      id: 'workplace-rights',
      title: 'Workplace Rights',
      description: 'Safe and fair working environment',
      icon: 'briefcase',
    },
  ],
  keyAreas: [
    {
      id: 'safety-protection',
      title: 'Safety & Protection',
      description: 'Freedom from violence, harassment and exploitation.',
      icon: 'shield-check',
      color: '#FFF0F2',
      iconColor: '#F9DDE3',
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Equal access to quality education and skill development.',
      icon: 'book-open',
      color: '#EEF4FF',
      iconColor: '#DCE9FF',
    },
    {
      id: 'employment-equal-pay',
      title: 'Employment & Equal Pay',
      description: 'Fair work opportunities and equal wages.',
      icon: 'briefcase',
      color: '#FFF8E8',
      iconColor: '#FCE9B8',
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      description: 'Access to quality healthcare and reproductive rights.',
      icon: 'heart-pulse',
      color: '#ECF9F4',
      iconColor: '#D0F0E3',
    },
    {
      id: 'legal-rights',
      title: 'Legal Rights',
      description: 'Equal treatment and access to justice.',
      icon: 'scale',
      color: '#F5F0FF',
      iconColor: '#E7DFFF',
    },
    {
      id: 'participation',
      title: 'Participation',
      description: 'Representation in decision-making at all levels.',
      icon: 'users',
      color: '#FFF0F2',
      iconColor: '#F9DDE3',
    },
  ],
  legalFramework: {
    title: 'Constitutional Guarantees',
    description:
      'The Constitution of India guarantees equality before the law and prohibits discrimination on the grounds of sex.',
  },
  supportAreas: [
    { id: 'awareness', title: 'Awareness Campaigns', icon: 'megaphone' },
    {
      id: 'legal-support',
      title: 'Legal Support & Counselling',
      icon: 'users',
    },
    { id: 'workshops', title: 'Workshops & Training', icon: 'graduation-cap' },
    { id: 'community', title: 'Community Initiatives', icon: 'users' },
  ],
  resources: [
    {
      id: 'government-schemes',
      title: 'Government Schemes for Women',
      icon: 'file-text',
    },
    { id: 'important-links', title: 'Important Links', icon: 'link' },
    {
      id: 'downloadable-materials',
      title: 'Downloadable Materials',
      icon: 'download',
    },
  ],
  relatedRights: ['childrens-rights', 'civil-rights', 'minority-rights'],
  legalProtections: [
    {
      id: 'constitutional-equality',
      title: 'Constitutional Equality',
      description: 'Right to equality and non-discrimination.',
      icon: 'file-text',
      color: '#FFF8E8',
      iconColor: '#FCE9B8',
    },
    {
      id: 'protection-violence',
      title: 'Protection from Violence',
      description: 'Laws against domestic violence, harassment and abuse.',
      icon: 'shield-check',
      color: '#F5F0FF',
      iconColor: '#E7DFFF',
    },
    {
      id: 'workplace-rights',
      title: 'Workplace Rights',
      description: 'Safe working environment and equal opportunities.',
      icon: 'briefcase',
      color: '#ECF9F4',
      iconColor: '#D0F0E3',
    },
    {
      id: 'property-inheritance',
      title: 'Property & Inheritance',
      description: 'Right to own, inherit and manage property.',
      icon: 'home',
      color: '#FFF0F2',
      iconColor: '#F9DDE3',
    },
  ],
  helpOptions: [
    {
      id: 'file-complaint',
      title: 'File a Complaint',
      description: 'Report rights violations easily.',
      icon: 'file-text',
    },
    {
      id: 'legal-help',
      title: 'Legal Support',
      description: 'Get guidance from legal experts.',
      icon: 'scale',
    },
    {
      id: 'community-help',
      title: 'Community Support',
      description: 'Connect with support groups.',
      icon: 'users',
    },
    {
      id: 'contact-hrsjm',
      title: 'Contact HRSJM',
      description: 'Reach out for assistance and information.',
      icon: 'phone',
    },
  ],
};

const humanRightsContent: RightDetailsContent = {
  id: 'human-rights',
  badge: 'HUMAN RIGHTS',
  title: 'Human Rights',
  description: 'Basic rights and freedoms every human being has.',
  heroImage: COMMUNITY_HERO_IMAGE,
  overview: {
    title: 'Overview',
    description:
      'Human rights are the basic rights and freedoms that belong to every person, simply because they are human. These rights are universal, inalienable and applicable to all, regardless of caste, gender, religion, language or social background.',
    quote:
      'Human rights protect your dignity, ensure equal opportunities and help create a just and inclusive society.',
  },
  keyTopics: [
    {
      id: 'what-are-human-rights',
      title: 'What are Human Rights?',
      description: 'Meaning, scope and importance',
      icon: 'users',
    },
    {
      id: 'universal-declaration',
      title: 'Universal Declaration of Human Rights',
      description: 'Global commitment to human dignity',
      icon: 'file-text',
    },
    {
      id: 'right-to-equality',
      title: 'Right to Equality',
      description: 'Equal treatment and non-discrimination',
      icon: 'scale',
    },
  ],
};

const educationRightsContent: RightDetailsContent = {
  id: 'right-to-education',
  badge: 'RIGHT TO EDUCATION',
  title: 'Right to Education',
  description: 'Right to free and compulsory education.',
  heroImage: RIGHTS_HERO_IMAGE,
  overview: {
    title: 'Overview',
    description:
      'The Right to Education ensures that every child has access to free and compulsory education, helping them build a brighter future. Education empowers individuals and strengthens society.',
    quote:
      'Education is a fundamental right and a powerful tool for change.',
  },
  keyTopics: [
    {
      id: 'free-compulsory-education',
      title: 'Free and Compulsory Education',
      description: 'For children aged 6–14 years',
      icon: 'graduation-cap',
    },
    {
      id: 'quality-education',
      title: 'Quality Education',
      description: 'Inclusive and equitable learning',
      icon: 'book-open',
    },
    {
      id: 'schools-communities',
      title: 'Role of Schools and Communities',
      description: 'Creating supportive learning environments',
      icon: 'users',
    },
  ],
};

const childrensRightsContent: RightDetailsContent = {
  id: 'childrens-rights',
  badge: "CHILDREN'S RIGHTS",
  title: "Children's Rights",
  description: 'Rights and welfare of children and young people.',
  heroImage: COMMUNITY_HERO_IMAGE,
  overview: {
    title: 'Overview',
    description:
      "Children's rights ensure every child has the right to survival, development, protection and participation. These rights help create a safe, supportive and nurturing environment for every child.",
    quote:
      'Every child has the right to a safe, healthy and happy childhood.',
  },
  keyTopics: [
    {
      id: 'right-to-education',
      title: 'Right to Education',
      description: 'Access to quality education',
      icon: 'graduation-cap',
    },
    {
      id: 'right-to-protection',
      title: 'Right to Protection',
      description: 'Protection from abuse and exploitation',
      icon: 'shield-check',
    },
    {
      id: 'health-nutrition',
      title: 'Right to Health and Nutrition',
      description: 'Healthy growth and development',
      icon: 'heart-pulse',
    },
  ],
};

const civilRightsContent: RightDetailsContent = {
  id: 'civil-rights',
  badge: 'CIVIL RIGHTS',
  title: 'Civil Rights',
  description: 'Rights related to equal treatment and protection under law.',
  heroImage: SOLIDARITY_HERO_IMAGE,
  overview: {
    title: 'Overview',
    description:
      'Civil rights ensure every individual is treated equally under the law and protected from discrimination. These rights are essential for a fair and democratic society.',
    quote:
      'Civil rights protect individuals from unlawful discrimination and ensure equal access to opportunities.',
  },
  keyTopics: [
    {
      id: 'right-to-equality',
      title: 'Right to Equality',
      description: 'Equal treatment under law',
      icon: 'scale',
    },
    {
      id: 'non-discrimination',
      title: 'Right to Non-Discrimination',
      description: 'Protection from unfair treatment',
      icon: 'users',
    },
    {
      id: 'legal-remedies',
      title: 'Right to Legal Remedies',
      description: 'Access to justice and fair trial',
      icon: 'file-text',
    },
  ],
};

const minorityRightsContent: RightDetailsContent = {
  id: 'minority-rights',
  badge: 'MINORITY RIGHTS',
  title: 'Minority Rights',
  description: 'Rights of religious, linguistic and other minorities.',
  heroImage: RIGHTS_HERO_IMAGE,
  overview: {
    title: 'Overview',
    description:
      'Minority rights protect the cultural, religious, linguistic and educational identity of minority communities. These rights ensure equal opportunities and freedom to practice and preserve their unique heritage.',
    quote:
      'Diversity is our strength. Minority rights promote inclusion, respect and equal opportunities for all.',
  },
  keyTopics: [
    {
      id: 'cultural-religious-freedom',
      title: 'Cultural and Religious Freedom',
      description: 'Right to practice and preserve culture',
      icon: 'globe',
    },
    {
      id: 'educational-rights',
      title: 'Educational Rights',
      description: 'Establish and manage educational institutions',
      icon: 'graduation-cap',
    },
    {
      id: 'protection-discrimination',
      title: 'Protection from Discrimination',
      description: 'Equal opportunities in society',
      icon: 'shield-check',
    },
  ],
};

export const RIGHTS_DETAILS: Partial<Record<string, RightDetailsContent>> = {
  'human-rights': humanRightsContent,
  'womens-rights': womensRightsContent,
  'childrens-rights': childrensRightsContent,
  'civil-rights': civilRightsContent,
  'minority-rights': minorityRightsContent,
  'right-to-education': educationRightsContent,
};

export const findRightById = (rightId: string): RightsIndexItem | undefined =>
  RIGHTS_INDEX.find(right => right.id === rightId);

export const searchRights = (query: string): RightsIndexItem[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return RIGHTS_INDEX;
  }

  return RIGHTS_INDEX.filter(({ title, description }) =>
    `${title} ${description}`.toLocaleLowerCase().includes(normalizedQuery),
  );
};
