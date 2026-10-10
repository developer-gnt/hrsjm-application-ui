/**
 * TEMPORARY UI SAMPLE DATA — NOT AN API. NOT FAKE ENDPOINTS.
 *
 * This file exists only so the Know Your Rights list screen can be rendered
 * and reviewed during the UI-only phase. Every value here is display-only
 * demonstration data rendered by local components.
 *
 * REPLACE WITH: the real rights feature service/hooks once the backend
 * contract for the Rights module is confirmed. Delete this file at that point.
 */
import type {
  RightsArticle,
  RightsArticleFormState,
  RightsFilterTab,
  RightsListItem,
  RightsStatsSummary,
} from '../types/rights.types';

/**
 * Thumbnails reuse the demo imagery approach already used by the News/Blogs
 * modules — no new/external image sources are introduced here.
 */
const demoThumbnail = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/200/200`;

/** The eight reference article rows (display values exactly as referenced). */
export const SAMPLE_RIGHTS_ARTICLES: RightsListItem[] = [
  {
    id: 'r-01',
    title: 'Fundamental Rights of Every Citizen',
    description:
      'Understand the fundamental rights guaranteed by the Constitution to every citizen.',
    category: 'Constitution',
    lastUpdatedDate: '28 Sep 2026',
    lastUpdatedTime: '04:30 PM',
    status: 'PUBLISHED',
    views: 2100,
    thumbnailUrl: demoThumbnail('hrsjm-rights-01'),
  },
  {
    id: 'r-02',
    title: "Women's Rights and Legal Protection",
    description:
      'Know your rights as a woman and the legal protection available to you.',
    category: 'Women Rights',
    lastUpdatedDate: '24 Sep 2026',
    lastUpdatedTime: '11:15 AM',
    status: 'PUBLISHED',
    views: 1800,
    thumbnailUrl: demoThumbnail('hrsjm-rights-02'),
  },
  {
    id: 'r-03',
    title: 'Child Rights and Protection',
    description:
      "Protection of children's rights in India and how they are protected.",
    category: 'Child Rights',
    lastUpdatedDate: '20 Sep 2026',
    lastUpdatedTime: '02:40 PM',
    status: 'PUBLISHED',
    views: 1500,
    thumbnailUrl: demoThumbnail('hrsjm-rights-03'),
  },
  {
    id: 'r-04',
    title: 'Senior Citizen Rights',
    description: 'Legal rights & benefits for senior citizens in India.',
    category: 'Senior Citizens',
    lastUpdatedDate: '18 Sep 2026',
    lastUpdatedTime: '10:00 AM',
    status: 'PUBLISHED',
    views: 980,
    thumbnailUrl: demoThumbnail('hrsjm-rights-04'),
  },
  {
    id: 'r-05',
    title: 'Labour Rights and Workplace Safety',
    description: 'Know your rights as a worker and safety measures at work.',
    category: 'Labour Rights',
    lastUpdatedDate: '15 Sep 2026',
    lastUpdatedTime: '03:45 PM',
    status: 'DRAFT',
    views: 640,
    thumbnailUrl: demoThumbnail('hrsjm-rights-05'),
  },
  {
    id: 'r-06',
    title: 'Rights of Minorities',
    description:
      'Protecting the rights of religious, linguistic and cultural minorities.',
    category: 'Minority Rights',
    lastUpdatedDate: '12 Sep 2026',
    lastUpdatedTime: '01:20 PM',
    status: 'PUBLISHED',
    views: 1200,
    thumbnailUrl: demoThumbnail('hrsjm-rights-06'),
  },
  {
    id: 'r-07',
    title: 'Property Rights',
    description:
      'Understand your rights related to property ownership and disputes.',
    category: 'Property',
    lastUpdatedDate: '08 Sep 2026',
    lastUpdatedTime: '12:10 PM',
    status: 'PUBLISHED',
    views: 860,
    thumbnailUrl: demoThumbnail('hrsjm-rights-07'),
  },
  {
    id: 'r-08',
    title: 'Environmental Rights',
    description: 'Right to clean, healthy and sustainable environment.',
    category: 'Environment',
    lastUpdatedDate: '04 Sep 2026',
    lastUpdatedTime: '05:00 PM',
    status: 'PUBLISHED',
    views: 720,
    thumbnailUrl: demoThumbnail('hrsjm-rights-08'),
  },
];

/** Distinct categories present in the sample dataset (drives the filter sheet). */
export const SAMPLE_RIGHTS_CATEGORIES: string[] = Array.from(
  new Set(SAMPLE_RIGHTS_ARTICLES.map(article => article.category)),
);

/** Cover-image choices reuse the existing rights sample imagery (no uploads). */
export const RIGHTS_COVER_IMAGE_OPTIONS: string[] = SAMPLE_RIGHTS_ARTICLES.flatMap(
  article => (article.thumbnailUrl ? [article.thumbnailUrl] : []),
);

/** Demo author shown in the reference Author field. */
export const DEMO_RIGHTS_AUTHOR = {
  name: 'Priya Sharma',
  role: 'Content Writer',
  organization: 'HRSJM',
};

/**
 * Starting values for Create Rights Article (reference field states: title,
 * category, author, status and tags pre-filled; description/content empty).
 * Also the dirty-state baseline.
 */
export const EMPTY_RIGHTS_ARTICLE_FORM: RightsArticleFormState = {
  coverImageUri: null,
  title: 'Fundamental Rights of Every Citizen',
  category: 'Constitution',
  shortDescription: '',
  content: '',
  author: DEMO_RIGHTS_AUTHOR.name,
  status: 'DRAFT',
  allowComments: true,
  featured: false,
  tags: ['Human Rights', 'Constitution', 'Rights'],
};

/**
 * DEMO summary/tab counts — display-only values matching the reference
 * (36/26/8/2), NOT derived from the 8-row sample list above. The local tabs
 * still filter the 8 sample rows; replace these with real backend counts when
 * the Rights contract is confirmed.
 */
export const DEMO_RIGHTS_STATS: RightsStatsSummary = {
  total: 36,
  published: 26,
  drafts: 8,
  archived: 2,
};

/** Status tabs shown above the list (labels + demo counts per the reference). */
export const RIGHTS_STATUS_TABS: RightsFilterTab[] = [
  { key: 'ALL', label: 'All', count: DEMO_RIGHTS_STATS.total },
  { key: 'PUBLISHED', label: 'Published', count: DEMO_RIGHTS_STATS.published },
  { key: 'DRAFT', label: 'Drafts', count: DEMO_RIGHTS_STATS.drafts },
  { key: 'ARCHIVED', label: 'Archived', count: DEMO_RIGHTS_STATS.archived },
];

/**
 * Demo details data for the reference article ("Fundamental Rights of Every
 * Citizen", id rights-001). Display-only values exactly as referenced —
 * replaced by the backend contract later. The avatar reuses the News/Blogs
 * demo imagery approach.
 */
export const SAMPLE_RIGHTS_ARTICLE_DETAILS: Record<string, RightsArticle> = {
  'r-01': {
    ...SAMPLE_RIGHTS_ARTICLES[0],
    author: 'Priya Sharma',
    authorRole: 'Content Writer',
    organization: 'HRSJM',
    tags: ['Human Rights', 'Constitution', 'Rights'],
    content: [
      'The Fundamental Rights are the basic human rights guaranteed to every citizen of India by the Constitution. These rights ensure individual freedom, equality, and justice, and protect citizens from discrimination and arbitrary actions.',
      'Fundamental Rights empower citizens to live with dignity and provide the foundation for a just and democratic society. They are enforceable by courts and are essential for the protection of human rights in India.',
    ],
    highlights: [
      { title: 'Right to Equality', description: 'Equal treatment before the law.' },
      {
        title: 'Right to Freedom',
        description: 'Freedom of speech, expression, and movement.',
      },
      {
        title: 'Right against Exploitation',
        description: 'Protection from forced labour and child labour.',
      },
      {
        title: 'Right to Freedom of Religion',
        description: 'Freedom to practice, profess and propagate religion.',
      },
    ],
  },
};
