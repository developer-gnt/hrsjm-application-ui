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

const fundamentalRightsContent: RightDetailsContent = {
  id: 'fundamental-rights',
  badge: 'CONSTITUTIONAL RIGHTS',
  title: 'Fundamental Rights of Every Citizen',
  description: 'Guaranteed by the Constitution of India to secure equality, liberty, and justice for all citizens.',
  heroImage: RIGHTS_HERO_IMAGE,
  overview: {
    title: 'The Cornerstone of Indian Democracy',
    description:
      'Part III of the Constitution of India guarantees Fundamental Rights to all citizens. These rights act as a shield against arbitrary State actions and ensure that every individual can live with dignity, equality, and intellectual freedom.',
    quote:
      'Fundamental rights are essential to preserve human dignity and foster democratic living.',
  },
  keyTopics: [
    { id: 'equality', title: 'Right to Equality (Articles 14–18)', description: 'Prohibits discrimination on grounds of religion, race, caste, sex or place of birth.', icon: 'scale' },
    { id: 'freedom', title: 'Right to Freedom (Articles 19–22)', description: 'Protects freedom of speech, assembly, movement, residence, and profession.', icon: 'shield-check' },
    { id: 'remedies', title: 'Right to Constitutional Remedies (Article 32)', description: 'Right to approach the Supreme Court for enforcement of fundamental rights.', icon: 'file-text' },
  ],
  keyAreas: [
    { id: 'art-14', title: 'Equality Before Law', description: 'Equal protection of laws for all persons within India.', icon: 'scale', color: '#ECF9F4', iconColor: '#D0F0E3' },
    { id: 'art-19', title: 'Protection of Six Freedoms', description: 'Speech, peaceful assembly, association, free movement, residence, and trade.', icon: 'megaphone', color: '#FFF8E8', iconColor: '#FCE9B8' },
    { id: 'art-21', title: 'Protection of Life & Personal Liberty', description: 'No person shall be deprived of life or personal liberty except according to procedure established by law.', icon: 'shield-check', color: '#F5F0FF', iconColor: '#E7DFFF' },
    { id: 'art-32', title: 'Direct Access to Supreme Court', description: 'Power of the Supreme Court to issue Writs including Habeas Corpus, Mandamus, and Certiorari.', icon: 'file-text', color: '#EEF4FF', iconColor: '#DCE9FF' },
  ],
  legalFramework: {
    title: 'Part III of the Constitution of India',
    description:
      'Fundamental Rights are enforceable directly by High Courts (Article 226) and the Supreme Court (Article 32), making them justiciable and inviolable.',
  },
  supportAreas: [
    { id: 'legal-advice', title: 'Constitutional Advisory & Representation', icon: 'scale' },
    { id: 'writ-assistance', title: 'Writ Petition Preparation Assistance', icon: 'file-text' },
    { id: 'rights-camps', title: 'Community Legal Awareness Camps', icon: 'users' },
  ],
  resources: [
    { id: 'const-handbook', title: 'Constitution of India (Part III Summary)', icon: 'file-text' },
    { id: 'article32-guide', title: 'Filing a Writ Petition Guide (PDF)', icon: 'download' },
  ],
  legalProtections: [
    { id: 'art-14-p', title: 'Article 14: Equality', description: 'The State shall not deny to any person equality before the law.', icon: 'scale', color: '#ECF9F4', iconColor: '#D0F0E3' },
    { id: 'art-21-p', title: 'Article 21: Life with Dignity', description: 'Includes right to clean environment, livelihood, and privacy.', icon: 'shield-check', color: '#FFF0F2', iconColor: '#F9DDE3' },
    { id: 'art-25-p', title: 'Article 25: Freedom of Conscience', description: 'Freedom of religion and peaceful conscience.', icon: 'heart', color: '#FFF8E8', iconColor: '#FCE9B8' },
  ],
  helpOptions: [
    { id: 'file-complaint', title: 'File a Complaint', description: 'Report rights violations directly.', icon: 'file-text' },
    { id: 'contact-hrsjm', title: 'Contact Legal Cell', description: 'Speak with our constitutional legal advocates.', icon: 'phone' },
  ],
};

const childRightsContent: RightDetailsContent = {
  id: 'childrens-rights',
  badge: "CHILDREN'S RIGHTS",
  title: "Child Rights and Protection",
  description: "Protection of children from exploitation, cruelty, and compulsory access to healthcare and education.",
  heroImage: COMMUNITY_HERO_IMAGE,
  overview: {
    title: "Protecting Our Children's Future",
    description:
      "Every child has the inherent right to care, safety, education, and development free from physical abuse, mental cruelty, and child labour. India's legal framework provides rigorous safeguards against exploitation of minors.",
    quote:
      "A child's world should be filled with learning, safety, and joy — not labor and exploitation.",
  },
  keyTopics: [
    { id: 'pocso', title: 'POCSO Act 2012', description: 'Protection of Children from Sexual Offences Act.', icon: 'shield-check' },
    { id: 'rte', title: 'Right to Free Education', description: 'Compulsory schooling for all children aged 6 to 14 years.', icon: 'graduation-cap' },
    { id: 'child-labour', title: 'Prohibition of Child Labour', description: 'Strict ban on employment in hazardous and non-hazardous work.', icon: 'scale' },
  ],
  keyAreas: [
    { id: 'care-protection', title: 'Care & Protection (JJ Act)', description: 'Juvenile Justice (Care and Protection of Children) Act safeguards.', icon: 'heart', color: '#EEF4FF', iconColor: '#DCE9FF' },
    { id: 'edu-welfare', title: 'Free Schooling (RTE Act)', description: 'Right of children to free and compulsory admission in neighborhood schools.', icon: 'graduation-cap', color: '#ECF9F4', iconColor: '#D0F0E3' },
    { id: 'nutrition', title: 'Nutrition & Healthcare', description: 'Statutory midday meals, health checkups, and vaccinations.', icon: 'heart-pulse', color: '#FFF8E8', iconColor: '#FCE9B8' },
  ],
  legalFramework: {
    title: 'POCSO Act 2012 & Juvenile Justice Act 2015',
    description:
      'Stringent criminal laws, special child-friendly courts, and child welfare committees (CWC) established in every district.',
  },
  supportAreas: [
    { id: 'childline', title: 'Childline 1098 Coordination', icon: 'phone' },
    { id: 'rescue', title: 'Child Labour Rescue Operations', icon: 'shield-check' },
    { id: 'education-aid', title: 'Free School Enrollment Assistance', icon: 'graduation-cap' },
  ],
  resources: [
    { id: 'pocso-handbook', title: 'POCSO Act Citizen Handbook (PDF)', icon: 'file-text' },
    { id: 'child-rights-guide', title: 'National Commission for Protection of Child Rights Guidelines', icon: 'download' },
  ],
  legalProtections: [
    { id: 'art-21a', title: 'Article 21A: Right to Education', description: 'Free & compulsory education for children between 6 and 14.', icon: 'graduation-cap', color: '#ECF9F4', iconColor: '#D0F0E3' },
    { id: 'art-24', title: 'Article 24: Prohibition of Child Labour', description: 'Ban on employing children under 14 in factories or mines.', icon: 'scale', color: '#FFF0F2', iconColor: '#F9DDE3' },
  ],
  helpOptions: [
    { id: 'file-complaint', title: 'Report Child Abuse / Labour', description: 'Confidential reporting to HRSJM Child Cell.', icon: 'file-text' },
    { id: 'contact-hrsjm', title: 'Contact Child Helpline', description: 'Immediate assistance for children in distress.', icon: 'phone' },
  ],
};

const rtiContent: RightDetailsContent = {
  id: 'right-to-information',
  badge: 'RIGHT TO INFORMATION',
  title: 'Right to Information (RTI Act 2005)',
  description: 'Empowering every citizen to demand accountability, inspect public documents, and promote transparency in government functioning.',
  heroImage: SOLIDARITY_HERO_IMAGE,
  overview: {
    title: 'Democracy Thrives on Transparency',
    description:
      'The Right to Information Act 2005 mandates timely response to citizen requests for government information. It serves as a master key against corruption and ensures democratic oversight by the public.',
    quote:
      'Information is the currency of democracy; transparent governance is the right of every citizen.',
  },
  keyTopics: [
    { id: 'how-to-file', title: 'How to File an RTI Application', description: 'Step-by-step guidance on drafting queries to Public Information Officers.', icon: 'file-text' },
    { id: 'timelines', title: 'Statutory Timelines (30 Days)', description: 'Mandatory 30-day response window (48 hours for life & liberty).', icon: 'clock' },
    { id: 'appeals', title: 'First & Second Appeals', description: 'Recourse to Information Commissions when requests are denied.', icon: 'scale' },
  ],
  keyAreas: [
    { id: 'inspection', title: 'Inspection of Public Works & Files', description: 'Citizens have the right to inspect government registers and take certified samples.', icon: 'doc-search', color: '#EEF4FF', iconColor: '#DCE9FF' },
    { id: 'fund-audit', title: 'Tracking Public Fund Expenditures', description: 'Query municipal budgets, development allocations, and tenders.', icon: 'scale', color: '#FFF8E8', iconColor: '#FCE9B8' },
  ],
  legalFramework: {
    title: 'Right to Information Act, 2005',
    description:
      'Covers Central and State government ministries, departments, public sector undertakings, and government-aided NGOs.',
  },
  supportAreas: [
    { id: 'drafting', title: 'RTI Application Drafting Help', icon: 'file-text' },
    { id: 'appeal-aid', title: 'Second Appeal Legal Representation', icon: 'scale' },
  ],
  resources: [
    { id: 'sample-rti', title: 'Sample RTI Application Format (PDF)', icon: 'download' },
  ],
  helpOptions: [
    { id: 'file-complaint', title: 'Report Non-Compliance', description: 'Submit RTI grievance to HRSJM Transparency Cell.', icon: 'file-text' },
    { id: 'contact-hrsjm', title: 'RTI Advisory Hotline', description: 'Talk to an RTI legal expert.', icon: 'phone' },
  ],
};

export const RIGHTS_DETAILS: Partial<Record<string, RightDetailsContent>> = {
  'human-rights': humanRightsContent,
  'womens-rights': womensRightsContent,
  'fundamental-rights': fundamentalRightsContent,
  'childrens-rights': childRightsContent,
  'right-to-information': rtiContent,
};

export const findRightById = (rightId: string): RightsIndexItem | undefined =>
  RIGHTS_INDEX.find(right => right.id === rightId);

/**
 * Builds dynamic content for any right in RIGHTS_INDEX that doesn't have custom copy.
 */
export const getRightDetails = (rightId: string): RightDetailsContent => {
  if (RIGHTS_DETAILS[rightId]) {
    return RIGHTS_DETAILS[rightId]!;
  }

  const item = findRightById(rightId) || RIGHTS_INDEX[0];
  return {
    id: item.id,
    badge: item.title.toUpperCase(),
    title: item.title,
    description: item.description,
    heroImage: RIGHTS_HERO_IMAGE,
    overview: {
      title: `Understanding Your ${item.title}`,
      description: `${item.description} In India, legal protections and statutory frameworks guarantee that no individual can be denied this right arbitrarily. HRSJM stands with citizens to safeguard these entitlements.`,
      quote: `Justice and equality are only realized when every citizen knows and asserts their ${item.title.toLowerCase()}.`,
    },
    keyTopics: [
      { id: 'legal-scope', title: 'Legal Protections & Laws', description: 'Statutory guarantees under Indian law.', icon: 'scale' },
      { id: 'remedies', title: 'Enforcement & Grievance Redressal', description: 'How to claim and protect this right.', icon: 'shield-check' },
    ],
    keyAreas: [
      { id: 'protection', title: 'Equal Protection Under Law', description: 'Freedom from discrimination and unfair denial.', icon: 'shield-check', color: '#EEF4FF', iconColor: '#DCE9FF' },
      { id: 'support', title: 'Legal Aid & Advice', description: 'Access to counsel and court representation.', icon: 'scale', color: '#FFF8E8', iconColor: '#FCE9B8' },
    ],
    legalFramework: {
      title: 'Constitution of India & Statutory Laws',
      description: 'Enforceable under relevant central and state laws and the fundamental constitutional guarantees.',
    },
    supportAreas: [
      { id: 'legal-guidance', title: 'Legal Counseling & Grievance Cell', icon: 'scale' },
      { id: 'mediation', title: 'Community Rights Advocacy', icon: 'users' },
    ],
    resources: [
      { id: 'citizen-guide', title: `${item.title} Citizen Handbook (PDF)`, icon: 'download' },
    ],
    helpOptions: [
      { id: 'file-complaint', title: 'File a Complaint', description: 'Report rights violations directly.', icon: 'file-text' },
      { id: 'contact-hrsjm', title: 'Contact HRSJM Support', description: 'Call our citizen assistance desk.', icon: 'phone' },
    ],
  };
};
