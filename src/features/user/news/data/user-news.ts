import type { ImageSourcePropType } from 'react-native';

export const USER_NEWS_CATEGORIES = [
  'Human Rights',
  'Women and Child',
  'Legal Awareness',
  'Community',
] as const;

export type UserNewsCategory = (typeof USER_NEWS_CATEGORIES)[number];
export type UserNewsContentType = 'Campaign' | 'Initiative' | 'Program' | 'Outreach';

export interface UserNewsArticle {
  id: string;
  category: UserNewsCategory;
  contentType: UserNewsContentType;
  title: string;
  excerpt: string;
  date: string;
  publishedAt: string;
  time?: string;
  location?: string;
  tags: string[];
  image: ImageSourcePropType;
  galleryImages: ImageSourcePropType[];
  highlights: string[];
  relatedTopics: string[];
  body: string[];
  isDemo: true;
}

export interface UserNewsHeroSlide {
  id: string;
  title: string;
  accent: string;
  description: string;
  image: ImageSourcePropType;
}

const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');
const COMMUNITY_HANDS_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');
const HOME_HERO_IMAGE = require('../../../../assets/images/hero-home.webp');
const COMMUNITY_EVENT_IMAGE = require('../../../../assets/images/hero-home.webp');

export const USER_NEWS_HERO_SLIDES: UserNewsHeroSlide[] = [
  {
    id: 'latest-news',
    title: 'Latest',
    accent: 'News',
    description: 'Stay informed about human rights, justice and community action.',
    image: COMMUNITY_IMAGE,
  },
  {
    id: 'rights-and-justice',
    title: 'Rights &',
    accent: 'Justice',
    description: 'Explore sample updates about rights awareness and access to support.',
    image: COMMUNITY_HANDS_IMAGE,
  },
  {
    id: 'community-action',
    title: 'Community',
    accent: 'Action',
    description: 'Read demonstration stories about learning, dignity and inclusion.',
    image: HOME_HERO_IMAGE,
  },
];

export const USER_NEWS_ARTICLES: UserNewsArticle[] = [
  {
    id: 'human-rights-awareness-campaign',
    category: 'Human Rights',
    contentType: 'Campaign',
    title: 'Human Rights Awareness Campaign Across Cities',
    excerpt:
      'HRSJM launches a city-wide awareness campaign to promote fundamental rights and empower communities through education and outreach programs.',
    date: '25 Oct 2026',
    publishedAt: '2026-10-25',
    time: '10:00 AM – 1:00 PM',
    location: 'Mumbai, Maharashtra',
    tags: ['rights', 'awareness', 'cities', 'campaign'],
    image: COMMUNITY_IMAGE,
    galleryImages: [COMMUNITY_IMAGE, COMMUNITY_HANDS_IMAGE, COMMUNITY_EVENT_IMAGE],
    highlights: [
      'Awareness rally across key locations',
      'Community engagement sessions',
      'Legal guidance and support information',
      'Participation from volunteers, advocates and experts',
      'Distribution of educational materials',
    ],
    relatedTopics: [
      'Human Rights',
      'Legal Awareness',
      'Community Outreach',
      'Citizenship Rights',
      'Awareness Campaign',
      'Public Participation',
    ],
    body: [
      'This sample article demonstrates how a community awareness story may appear in the HRSJM User App. It is not a report of a confirmed campaign or event.',
      'The example focuses on conversations that can help people learn about fundamental rights, dignity and ways to find reliable support. Replace this demonstration copy with verified editorial content when the News service is connected.',
    ],
    isDemo: true,
  },
  {
    id: 'legal-awareness-initiative',
    category: 'Legal Awareness',
    contentType: 'Initiative',
    title: 'New Legal Awareness Initiative Supports Communities',
    excerpt:
      'An interactive program to help citizens understand their legal rights and available...',
    date: '12 Nov 2026',
    publishedAt: '2026-11-12',
    time: '11:00 AM – 2:00 PM',
    location: 'Pune, Maharashtra',
    tags: ['legal awareness', 'communities', 'rights', 'initiative'],
    image: COMMUNITY_HANDS_IMAGE,
    galleryImages: [COMMUNITY_HANDS_IMAGE, COMMUNITY_IMAGE, COMMUNITY_EVENT_IMAGE],
    highlights: [
      'Introduction to legal rights',
      'Community information sessions',
      'Guidance on finding support',
    ],
    relatedTopics: ['Legal Awareness', 'Human Rights', 'Community Outreach'],
    body: [
      'This sample story presents a possible format for a legal-awareness update. It is demonstration content only and does not describe a confirmed HRSJM initiative.',
      'A future verified article can explain the subject, audience and practical resources covered, using approved information from HRSJM.',
    ],
    isDemo: true,
  },
  {
    id: 'womens-rights-awareness-program',
    category: 'Women and Child',
    contentType: 'Program',
    title: 'HRSJM Conducts Women’s Rights Awareness Program',
    excerpt:
      'A special session to empower women with knowledge about their rights and support...',
    date: '05 Dec 2026',
    publishedAt: '2026-12-05',
    time: '11:00 AM – 2:00 PM',
    location: 'Pune, Maharashtra',
    tags: ['women', 'child', 'safety', 'awareness'],
    image: HOME_HERO_IMAGE,
    galleryImages: [HOME_HERO_IMAGE, COMMUNITY_IMAGE, COMMUNITY_HANDS_IMAGE],
    highlights: [
      'Women’s rights information',
      'Awareness and community discussion',
      'Support resources and guidance',
    ],
    relatedTopics: ['Women and Child', 'Safety', 'Human Rights', 'Community Support'],
    body: [
      'This sample content is included to demonstrate a Women and Child article detail. It is not a claim that a program took place.',
      'Verified editorial content can provide practical information about rights, safety and support options in an accessible format.',
    ],
    isDemo: true,
  },
  {
    id: 'community-outreach-rights-education',
    category: 'Community',
    contentType: 'Outreach',
    title: 'Community Outreach Drive Brings Rights Education Closer to Citizens',
    excerpt:
      'HRSJM’s outreach program reaches underserved communities with essential...',
    date: '18 Dec 2026',
    publishedAt: '2026-12-18',
    time: '9:00 AM – 12:00 PM',
    location: 'Navi Mumbai, Maharashtra',
    tags: ['community', 'outreach', 'rights education'],
    image: COMMUNITY_IMAGE,
    galleryImages: [COMMUNITY_IMAGE, HOME_HERO_IMAGE, COMMUNITY_HANDS_IMAGE],
    highlights: [
      'Community rights awareness',
      'Information about local support',
      'Learning and participation opportunities',
    ],
    relatedTopics: ['Community Outreach', 'Human Rights', 'Public Participation'],
    body: [
      'This demonstration article shows how an outreach update could be presented in the app. It does not report a confirmed HRSJM activity.',
      'Once connected to verified News content, this space can describe the activity, the information shared and relevant community resources.',
    ],
    isDemo: true,
  },
  {
    id: 'child-protection-safety-drive',
    category: 'Women and Child',
    contentType: 'Initiative',
    title: 'Child Protection & Safety Awareness Drive in Schools',
    excerpt: 'HRSJM volunteers conduct safety workshops helping children and parents understand child rights and protection laws.',
    date: '20 Oct 2026',
    publishedAt: '2026-10-20',
    time: '10:00 AM – 1:00 PM',
    location: 'Thane, Maharashtra',
    tags: ['child protection', 'safety', 'rights', 'education'],
    image: COMMUNITY_HANDS_IMAGE,
    galleryImages: [COMMUNITY_HANDS_IMAGE, COMMUNITY_IMAGE],
    highlights: [
      'Child rights awareness for parents and teachers',
      'Guidance on reporting grievances safely',
      'Distribution of educational safety booklets',
    ],
    relatedTopics: ['Women and Child', 'Child Rights', 'Safety'],
    body: [
      'HRSJM organized a dedicated child rights and safety awareness initiative across primary schools.',
      'Parents, educators, and community workers gathered to discuss protection laws and practical safety steps for children.',
    ],
    isDemo: true,
  },
  {
    id: 'free-legal-aid-clinic-suburbs',
    category: 'Legal Awareness',
    contentType: 'Program',
    title: 'Weekly Free Legal Aid Clinic Launched for Citizens',
    excerpt: 'Dedicated advocates provide free consultation, documentation support, and legal guidance for underprivileged families.',
    date: '18 Oct 2026',
    publishedAt: '2026-10-18',
    time: '11:00 AM – 4:00 PM',
    location: 'Kurla, Mumbai',
    tags: ['legal aid', 'citizens', 'justice', 'consultation'],
    image: COMMUNITY_IMAGE,
    galleryImages: [COMMUNITY_IMAGE, HOME_HERO_IMAGE],
    highlights: [
      'One-on-one consultation with legal experts',
      'Affidavit and legal notice guidance',
      'Assistance with social welfare scheme applications',
    ],
    relatedTopics: ['Legal Awareness', 'Human Rights', 'Legal Aid'],
    body: [
      'To make justice accessible to every citizen, HRSJM inaugurated a weekend legal aid clinic in Mumbai.',
      'Our panel of advocates offers free guidance on civil, family, labor, and tenant rights issues.',
    ],
    isDemo: true,
  },
  {
    id: 'fundamental-rights-youth-workshop',
    category: 'Human Rights',
    contentType: 'Campaign',
    title: 'Fundamental Rights & Constitutional Values Workshop',
    excerpt: 'Interactive youth symposium focusing on constitutional protections, anti-discrimination safeguards, and civic rights.',
    date: '16 Oct 2026',
    publishedAt: '2026-10-16',
    time: '2:00 PM – 5:30 PM',
    location: 'Mumbai, Maharashtra',
    tags: ['human rights', 'constitution', 'youth', 'values'],
    image: HOME_HERO_IMAGE,
    galleryImages: [HOME_HERO_IMAGE, COMMUNITY_IMAGE],
    highlights: [
      'Study of Article 14, 19, and 21 guarantees',
      'Youth advocacy training',
      'Interactive panel with civil liberties advocates',
    ],
    relatedTopics: ['Human Rights', 'Citizenship Rights', 'Legal Awareness'],
    body: [
      'Over 200 students and young professionals participated in the Constitutional Rights workshop conducted by HRSJM.',
      'The seminar emphasized how understanding fundamental freedoms empowers communities to stand up against injustice.',
    ],
    isDemo: true,
  },
  {
    id: 'rural-empowerment-relief-drive',
    category: 'Community',
    contentType: 'Outreach',
    title: 'Community Empowerment Camp Delivers Health & Civic Support',
    excerpt: 'Multidisciplinary outreach program reaches rural settlements with healthcare checkups, ration distribution, and legal help.',
    date: '12 Oct 2026',
    publishedAt: '2026-10-12',
    time: '9:00 AM – 3:00 PM',
    location: 'Raigad District, Maharashtra',
    tags: ['community', 'rural', 'health', 'empowerment'],
    image: COMMUNITY_HANDS_IMAGE,
    galleryImages: [COMMUNITY_HANDS_IMAGE, COMMUNITY_IMAGE],
    highlights: [
      'Comprehensive health checkups for 400+ residents',
      'Essential dry ration and sanitation kits distributed',
      'Government welfare scheme documentation desk',
    ],
    relatedTopics: ['Community', 'Relief Work', 'Public Participation'],
    body: [
      'A multi-service outreach camp was organized to assist underserved rural families with medical care and legal guidance.',
      'Volunteers worked closely with local gram panchayat representatives to ensure every household received necessary support.',
    ],
    isDemo: true,
  },
];
