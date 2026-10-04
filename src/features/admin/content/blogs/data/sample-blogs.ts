/**
 * TEMPORARY UI SAMPLE DATA — NOT AN API. NOT FAKE ENDPOINTS.
 *
 * This file exists only so the Blogs list screen can be rendered and reviewed
 * during the UI-only phase. Every value here is display-only demonstration
 * data rendered by local components.
 *
 * REPLACE WITH: the real blogs feature service/hooks once the backend contract
 * for the Blogs module is confirmed. Delete this file at that point.
 */
import type { BlogFilterTab, BlogListItem, BlogStatsSummary } from '../types/blog.types';

/**
 * Thumbnails reuse the News sample imagery (same demo source already used by
 * the News module) — no new/external image sources are introduced here.
 */
const demoThumbnail = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/200/200`;

/** The eight reference blog rows (display strings exactly as referenced). */
export const SAMPLE_BLOGS: BlogListItem[] = [
  {
    id: 'b-01',
    title: 'Understanding Your Legal Rights as a Citizen',
    excerpt: 'A simple guide to fundamental rights every citizen should know.',
    category: 'Know Your Rights',
    date: '28 Sep 2026',
    time: '04:30 PM',
    status: 'PUBLISHED',
    views: 2100,
    thumbnailUrl: demoThumbnail('hrsjm-blog-01'),
    author: 'HRSJM Admin',
    content: [
      'Every citizen has fundamental rights that protect their freedom, dignity and equality. Understanding these rights helps individuals participate actively in a democratic society and seek justice when needed.',
      'In this blog, we explore the key constitutional rights, their importance in daily life, and how citizens can make informed decisions to safeguard their rights.',
    ],
    tags: ['Know Your Rights', 'Citizenship', 'Constitution', 'Legal Awareness'],
  },
  {
    id: 'b-02',
    title: 'The Importance of Community Support',
    excerpt: 'How collective action creates stronger and more supportive communities.',
    category: 'Social Justice',
    date: '24 Sep 2026',
    time: '11:15 AM',
    status: 'PUBLISHED',
    views: 1900,
    thumbnailUrl: demoThumbnail('hrsjm-blog-02'),
    author: 'HRSJM Admin',
    content: [
      'Strong communities are built on mutual support and collective responsibility. When people come together, they can overcome challenges that no individual could face alone.',
      'This blog looks at how community networks strengthen social justice, and how small acts of solidarity create lasting change in neighbourhoods.',
    ],
    tags: ['Community', 'Social Justice', 'Solidarity'],
  },
  {
    id: 'b-03',
    title: 'Relief Efforts for Flood-Affected Families',
    excerpt: "HRSJM's on-ground work to support affected families.",
    category: 'Relief Work',
    date: '20 Sep 2026',
    time: '02:40 PM',
    status: 'PUBLISHED',
    views: 1800,
    thumbnailUrl: demoThumbnail('hrsjm-blog-03'),
    author: 'HRSJM Admin',
    content: [
      'When floods affect a region, timely relief can make the difference between recovery and prolonged hardship. HRSJM teams work alongside affected families from day one.',
      'This update covers our on-ground relief efforts, the supplies distributed, and how volunteers coordinated with local authorities to reach the families who needed help most.',
    ],
    tags: ['Relief Work', 'Flood Response', 'Volunteers'],
  },
  {
    id: 'b-04',
    title: 'Child Rights and Education for All',
    excerpt: 'Every child deserves access to education, safety and opportunity.',
    category: 'Education',
    date: '15 Sep 2026',
    time: '10:00 AM',
    status: 'DRAFT',
    views: 320,
    thumbnailUrl: demoThumbnail('hrsjm-blog-04'),
    author: 'HRSJM Admin',
    content: [
      'Education is the foundation of opportunity, yet millions of children remain out of school due to poverty, displacement and social barriers.',
      'This draft explores how child rights and access to education go hand in hand, and what communities can do to keep every child learning.',
    ],
    tags: ['Child Rights', 'Education', 'Learning'],
  },
  {
    id: 'b-05',
    title: 'Protecting Our Environment Together',
    excerpt: 'Environmental justice is essential for healthier communities.',
    category: 'Environment',
    date: '12 Sep 2026',
    time: '01:20 PM',
    status: 'PUBLISHED',
    views: 980,
    thumbnailUrl: demoThumbnail('hrsjm-blog-05'),
    author: 'HRSJM Admin',
    content: [
      'Environmental justice means every community deserves clean air, safe water and a healthy place to live, regardless of income or background.',
      'Here we share practical steps our teams and volunteers are taking to protect local ecosystems and build healthier, more sustainable neighbourhoods.',
    ],
    tags: ['Environment', 'Sustainability', 'Green Living'],
  },
  {
    id: 'b-06',
    title: 'Empowering Women Through Legal Awareness',
    excerpt: 'Creating awareness and access to justice for women.',
    category: 'Women Rights',
    date: '08 Sep 2026',
    time: '12:10 PM',
    status: 'PUBLISHED',
    views: 1200,
    thumbnailUrl: demoThumbnail('hrsjm-blog-06'),
    author: 'HRSJM Admin',
    content: [
      'Legal awareness is often the first step towards justice for women facing discrimination or violence. Knowing their rights empowers women to seek help with confidence.',
      "This blog outlines the key legal protections available to women and how HRSJM's awareness programmes are making them accessible at the grassroots level.",
    ],
    tags: ['Women Rights', 'Legal Awareness', 'Empowerment'],
  },
  {
    id: 'b-07',
    title: 'How to File a Complaint: A Step-by-Step Guide',
    excerpt: 'A complete guide to help you file a complaint with confidence.',
    category: 'Guides',
    date: '04 Sep 2026',
    time: '05:00 PM',
    status: 'ARCHIVED',
    views: 640,
    thumbnailUrl: demoThumbnail('hrsjm-blog-07'),
    author: 'HRSJM Admin',
    content: [
      'Filing a complaint can feel overwhelming, especially when you are unfamiliar with the process. A clear, step-by-step approach removes much of that uncertainty.',
      'This archived guide walks through each stage of filing a complaint, from gathering evidence to following up, so you can act with confidence.',
    ],
    tags: ['Complaints', 'Guides', 'Step-by-Step'],
  },
  {
    id: 'b-08',
    title: "Highlights from HRSJM's Community Outreach Program",
    excerpt: 'A look back at our recent outreach and community impact.',
    category: 'Events',
    date: '28 Aug 2026',
    time: '03:45 PM',
    status: 'PUBLISHED',
    views: 1600,
    thumbnailUrl: demoThumbnail('hrsjm-blog-08'),
    author: 'HRSJM Admin',
    content: [
      'Our recent community outreach programme brought together volunteers, families and local partners for a day of service, learning and connection.',
      'This look back at the programme highlights the activities conducted, the people reached, and the moments that made the outreach memorable.',
    ],
    tags: ['Outreach', 'Community', 'HRSJM'],
  },
];

/** Distinct categories present in the sample dataset (drives the filter sheet). */
export const SAMPLE_BLOG_CATEGORIES: string[] = Array.from(
  new Set(SAMPLE_BLOGS.map(blog => blog.category)),
);

/**
 * DEMO summary/tab counts — display-only values matching the reference
 * (28/6/18/4), NOT derived from the 8-row sample list above. The local tabs
 * still filter the 8 sample rows; replace these with real backend counts when
 * the Blogs contract is confirmed.
 */
export const DEMO_BLOG_STATS: BlogStatsSummary = {
  total: 28,
  published: 18,
  drafts: 6,
  archived: 4,
};

/** Status tabs shown above the list (labels + demo counts per the reference). */
export const BLOG_STATUS_TABS: BlogFilterTab[] = [
  { key: 'ALL', label: 'All', count: DEMO_BLOG_STATS.total },
  { key: 'PUBLISHED', label: 'Published', count: DEMO_BLOG_STATS.published },
  { key: 'DRAFT', label: 'Drafts', count: DEMO_BLOG_STATS.drafts },
  { key: 'ARCHIVED', label: 'Archived', count: DEMO_BLOG_STATS.archived },
];
