/**
 * TEMPORARY UI SAMPLE DATA — NOT AN API. NOT FAKE ENDPOINTS.
 *
 * This file exists only so the News list screen can be rendered and reviewed
 * during the UI-only phase. Every value here is display-only demonstration
 * data rendered by local components.
 *
 * REPLACE WITH: the real news feature service/hooks (news.service.ts +
 * useNews.ts) once the backend contract for the News module is confirmed.
 * Delete this file at that point.
 */
import type {
  NewsFilterTab,
  NewsListItem,
  NewsStatsSummary,
} from '../types/news.types';

/** Demo thumbnails only; will be replaced by the backend asset URL flow. */
const demoThumbnail = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/200/200`;

/**
 * The eight reference news rows. Dates/times/views are display strings exactly
 * as the reference shows them — no date parsing is introduced in this phase.
 */
export const SAMPLE_NEWS: NewsListItem[] = [
  {
    id: 'n-01',
    title: 'HRSJM Organizes Legal Aid Camp in Kurla',
    summary: 'Free legal consultation camp held for community members.',
    category: 'Legal',
    date: '28 Sep 2026',
    time: '04:30 PM',
    status: 'PUBLISHED',
    views: 1200,
    thumbnailUrl: demoThumbnail('hrsjm-news-01'),
  },
  {
    id: 'n-02',
    title: 'Supreme Court Highlights Importance of Human Rights',
    summary: 'Key observations on protection of fundamental rights.',
    category: 'Legal Update',
    date: '24 Sep 2026',
    time: '11:15 AM',
    status: 'PUBLISHED',
    views: 980,
    thumbnailUrl: demoThumbnail('hrsjm-news-02'),
  },
  {
    id: 'n-03',
    title: 'Relief Support Provided to Flood-Affected Families',
    summary: 'HRSJM distributes essential supplies to affected families.',
    category: 'Relief Work',
    date: '20 Sep 2026',
    time: '02:20 PM',
    status: 'PUBLISHED',
    views: 1500,
    thumbnailUrl: demoThumbnail('hrsjm-news-03'),
  },
  {
    id: 'n-04',
    title: 'Know Your Rights: Arrest and Bail Process',
    summary: 'Important information on your rights during arrest.',
    category: 'Know Your Rights',
    date: '18 Sep 2026',
    time: '10:00 AM',
    status: 'PUBLISHED',
    views: 2100,
    thumbnailUrl: demoThumbnail('hrsjm-news-04'),
  },
  {
    id: 'n-05',
    title: 'HRSJM Conducts Awareness Session at Local School',
    summary: 'Interactive session on child rights and safety.',
    category: 'Awareness',
    date: '15 Sep 2026',
    time: '03:05 PM',
    status: 'DRAFT',
    views: 0,
    thumbnailUrl: demoThumbnail('hrsjm-news-05'),
  },
  {
    id: 'n-06',
    title: 'Environmental Justice Initiative Launched',
    summary: 'Campaign to address environmental issues in urban communities.',
    category: 'Environment',
    date: '12 Sep 2026',
    time: '01:20 PM',
    status: 'PUBLISHED',
    views: 890,
    thumbnailUrl: demoThumbnail('hrsjm-news-06'),
  },
  {
    id: 'n-07',
    title: 'Blood Donation Drive a Huge Success',
    summary: 'More than 150 people donated blood at HRSJM camp.',
    category: 'Health',
    date: '08 Sep 2026',
    time: '12:20 PM',
    status: 'ARCHIVED',
    views: 720,
    thumbnailUrl: demoThumbnail('hrsjm-news-07'),
  },
  {
    id: 'n-08',
    title: 'HRSJM Raises Concern on Recent Policy Changes',
    summary: 'Press conference highlights changing policies affecting communities.',
    category: 'Advocacy',
    date: '04 Sep 2026',
    time: '06:00 PM',
    status: 'PUBLISHED',
    views: 1100,
    thumbnailUrl: demoThumbnail('hrsjm-news-08'),
  },
];

/** Distinct categories present in the sample dataset (drives the filter sheet). */
export const SAMPLE_NEWS_CATEGORIES: string[] = Array.from(
  new Set(SAMPLE_NEWS.map(news => news.category)),
);

/**
 * DEMO summary/tab counts — display-only values matching the reference design
 * (42/30/8/4), NOT derived from the 8-row sample list above. The local tabs
 * still filter the 8 sample rows; replace these with real backend counts when
 * the News contract is confirmed.
 */
export const DEMO_NEWS_STATS: NewsStatsSummary = {
  total: 42,
  published: 30,
  drafts: 8,
  archived: 4,
};

/** Status tabs shown above the list (labels + demo counts per the reference). */
export const NEWS_STATUS_TABS: NewsFilterTab[] = [
  { key: 'ALL', label: 'All', count: DEMO_NEWS_STATS.total },
  { key: 'PUBLISHED', label: 'Published', count: DEMO_NEWS_STATS.published },
  { key: 'DRAFT', label: 'Drafts', count: DEMO_NEWS_STATS.drafts },
  { key: 'ARCHIVED', label: 'Archived', count: DEMO_NEWS_STATS.archived },
];
