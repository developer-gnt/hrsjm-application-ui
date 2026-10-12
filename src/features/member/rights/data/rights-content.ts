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

const humanRightsContent: RightDetailsContent = {
  id: 'human-rights',
  badge: 'HUMAN RIGHTS',
  title: 'Human Rights',
  description: 'Basic rights and freedoms every human being has.',
  heroImage: COMMUNITY_HERO_IMAGE,
  overview: {
    title: 'What are Human Rights?',
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
  keyAreas: [
    {
      id: 'equality-dignity',
      title: 'Right to Equality & Dignity',
      description: 'Equal treatment under law and freedom from discrimination.',
      icon: 'scale',
      color: '#EEF4FF',
      iconColor: '#DCE9FF',
    },
    {
      id: 'life-liberty',
      title: 'Right to Life & Liberty',
      description: 'Freedom from arbitrary arrest, detention and torture.',
      icon: 'shield-check',
      color: '#FFF0F2',
      iconColor: '#F9DDE3',
    },
    {
      id: 'freedom-expression',
      title: 'Freedom of Expression',
      description: 'Right to speak, write and express views freely without fear.',
      icon: 'megaphone',
      color: '#FFF8E8',
      iconColor: '#FCE9B8',
    },
    {
      id: 'social-justice',
      title: 'Social & Economic Justice',
      description: 'Access to livelihood, healthcare, education and shelter.',
      icon: 'heart-pulse',
      color: '#ECF9F4',
      iconColor: '#D0F0E3',
    },
    {
      id: 'legal-remedy',
      title: 'Right to Constitutional Remedies',
      description: 'Direct recourse to courts for enforcement of fundamental rights.',
      icon: 'file-text',
      color: '#F5F0FF',
      iconColor: '#E7DFFF',
    },
    {
      id: 'fair-trial',
      title: 'Right to Fair Trial & Due Process',
      description: 'Presumption of innocence and legal representation for all.',
      icon: 'briefcase',
      color: '#FFF8E8',
      iconColor: '#FCE9B8',
    },
  ],
  legalFramework: {
    title: 'Universal Declaration & Indian Constitution',
    description:
      'Human rights are enshrined in the Universal Declaration of Human Rights (UDHR) 1948 and protected under Part III (Fundamental Rights) of the Constitution of India.',
  },
  supportAreas: [
    { id: 'monitoring', title: 'Human Rights Monitoring', icon: 'shield-check' },
    { id: 'legal-aid', title: 'Free Legal Aid & Guidance', icon: 'scale' },
    { id: 'awareness', title: 'Legal Literacy Workshops', icon: 'book-open' },
    { id: 'advocacy', title: 'Victim Advocacy & Rehabilitation', icon: 'users' },
  ],
  resources: [
    {
      id: 'udhr-document',
      title: 'Universal Declaration of Human Rights (UDHR)',
      icon: 'file-text',
    },
    { id: 'nhrc-guidelines', title: 'NHRC Complaint Guidelines', icon: 'link' },
    {
      id: 'citizens-handbook',
      title: 'Citizens Legal Rights Handbook (PDF)',
      icon: 'download',
    },
  ],
  relatedRights: ['civil-rights', 'womens-rights', 'childrens-rights'],
  legalProtections: [
    {
      id: 'protection-act',
      title: 'Protection of Human Rights Act, 1993',
      description: 'Statutory basis for National & State Human Rights Commissions.',
      icon: 'file-text',
      color: '#FFF8E8',
      iconColor: '#FCE9B8',
    },
    {
      id: 'article-21',
      title: 'Article 21: Protection of Life & Personal Liberty',
      description: 'Fundamental guarantee ensuring dignity and bodily autonomy.',
      icon: 'shield-check',
      color: '#F5F0FF',
      iconColor: '#E7DFFF',
    },
    {
      id: 'article-14',
      title: 'Article 14: Equality Before Law',
      description: 'Equal protection of laws for all persons within India.',
      icon: 'scale',
      color: '#ECF9F4',
      iconColor: '#D0F0E3',
    },
    {
      id: 'article-32',
      title: 'Article 32: Constitutional Remedies',
      description: 'Right to move Supreme Court via Writs for rights enforcement.',
      icon: 'briefcase',
      color: '#EEF4FF',
      iconColor: '#DCE9FF',
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

export const RIGHTS_DETAILS: Partial<Record<string, RightDetailsContent>> = {
  'human-rights': humanRightsContent,
  'womens-rights': womensRightsContent,
};

export const findRightById = (rightId: string): RightsIndexItem | undefined =>
  RIGHTS_INDEX.find(right => right.id === rightId);
