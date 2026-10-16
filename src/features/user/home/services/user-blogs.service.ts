import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type { HomeBlogItem } from '../types/home.types';
import type { UserNewsArticle } from '../../news/data/user-news';

const DEFAULT_BLOG_IMAGE = require('../../../../assets/images/article-rights-book.jpg');

export interface RawBlogItem {
  id: string;
  title: string;
  slug?: string | null;
  excerpt: string;
  content?: string | null;
  category: string;
  status: string;
  published_at: string;
  views?: number;
  thumbnail_url?: string | null;
  author?: string;
  tags?: string[] | null;
  featured?: boolean;
}

export interface RawBlogsResponse {
  items: RawBlogItem[];
  totalCount: number;
}

export const formatBlogDate = (isoString?: string): string => {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
};

export const mapRawBlogToUserArticle = (item: RawBlogItem): UserNewsArticle => {
  const publishedDate = formatBlogDate(item.published_at);
  const bodyParagraphs = typeof item.content === 'string'
    ? item.content.split('\n\n').filter(p => p.trim().length > 0)
    : [item.excerpt || ''];

  return {
    id: item.id,
    category: 'Legal Awareness',
    contentType: 'Initiative',
    title: item.title,
    excerpt: item.excerpt || '',
    date: publishedDate,
    publishedAt: item.published_at ? item.published_at.slice(0, 10) : '2026-10-14',
    time: '11:00 AM',
    location: 'Mumbai, Maharashtra',
    tags: item.tags || ['Article', 'Blog', 'HRSJM'],
    image: item.thumbnail_url ? ({ uri: item.thumbnail_url } as any) : DEFAULT_BLOG_IMAGE,
    galleryImages: [],
    highlights: ['Key insights and practical takeaways', 'Guidance for community members'],
    relatedTopics: ['Citizen Rights', 'Community Protection', 'Social Justice'],
    body: bodyParagraphs.length > 0 ? bodyParagraphs : [item.excerpt || 'No additional content provided.'],
    isDemo: false as any,
  };
};

export const mapRawToHomeBlogItem = (item: RawBlogItem): HomeBlogItem => {
  const article = mapRawBlogToUserArticle(item);
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt || '',
    category: (item.category || 'ARTICLE').toUpperCase(),
    date: formatBlogDate(item.published_at),
    author: item.author || 'HRSJM Editorial',
    thumbnailUrl: item.thumbnail_url || undefined,
    content: article.body,
    article,
  };
};

export const DEFAULT_HOME_BLOGS: HomeBlogItem[] = [
  {
    id: 'default-blog-1',
    title: 'Understanding Your Legal Rights as a Citizen',
    excerpt: 'A simple guide to fundamental rights every citizen should know to participate actively in a democratic society.',
    category: 'KNOW YOUR RIGHTS',
    date: '28 Sep 2026',
    author: 'HRSJM Admin',
    thumbnailUrl: 'https://picsum.photos/seed/hrsjm-blog-01/400/300',
    article: {
      id: 'default-blog-1',
      category: 'Legal Awareness',
      contentType: 'Initiative',
      title: 'Understanding Your Legal Rights as a Citizen',
      excerpt: 'A simple guide to fundamental rights every citizen should know.',
      date: '28 Sep 2026',
      publishedAt: '2026-09-28',
      time: '11:00 AM',
      location: 'Mumbai, Maharashtra',
      tags: ['Know Your Rights', 'Citizenship', 'Constitution'],
      image: { uri: 'https://picsum.photos/seed/hrsjm-blog-01/400/300' } as any,
      galleryImages: [],
      highlights: ['Key constitutional rights', 'Guidance for seeking justice'],
      relatedTopics: ['Citizen Rights', 'Community Protection'],
      body: [
        'Every citizen has fundamental rights that protect their freedom, dignity and equality. Understanding these rights helps individuals participate actively in a democratic society and seek justice when needed.',
        'In this article, we explore the key constitutional rights, their importance in daily life, and how citizens can make informed decisions to safeguard their rights.',
      ],
      isDemo: false as any,
    },
  },
  {
    id: 'default-blog-2',
    title: 'The Importance of Community Support',
    excerpt: 'How collective action creates stronger, more resilient and deeply supportive communities.',
    category: 'SOCIAL JUSTICE',
    date: '24 Sep 2026',
    author: 'HRSJM Admin',
    thumbnailUrl: 'https://picsum.photos/seed/hrsjm-blog-02/400/300',
    article: {
      id: 'default-blog-2',
      category: 'Community',
      contentType: 'Initiative',
      title: 'The Importance of Community Support',
      excerpt: 'How collective action creates stronger and more supportive communities.',
      date: '24 Sep 2026',
      publishedAt: '2026-09-24',
      time: '11:00 AM',
      location: 'Mumbai, Maharashtra',
      tags: ['Community', 'Social Justice', 'Solidarity'],
      image: { uri: 'https://picsum.photos/seed/hrsjm-blog-02/400/300' } as any,
      galleryImages: [],
      highlights: ['Collective responsibility', 'Grassroots mutual aid networks'],
      relatedTopics: ['Community Support', 'Solidarity'],
      body: [
        'Strong communities are built on mutual support and collective responsibility. When people come together, they can overcome challenges that no individual could face alone.',
        'This blog looks at how community networks strengthen social justice, and how small acts of solidarity create lasting change in neighbourhoods.',
      ],
      isDemo: false as any,
    },
  },
  {
    id: 'default-blog-3',
    title: 'Relief Efforts for Flood-Affected Families',
    excerpt: 'On-ground updates on food, shelter, clean water and medical assistance delivered to affected regions.',
    category: 'RELIEF WORK',
    date: '20 Sep 2026',
    author: 'HRSJM Admin',
    thumbnailUrl: 'https://picsum.photos/seed/hrsjm-blog-03/400/300',
    article: {
      id: 'default-blog-3',
      category: 'Community',
      contentType: 'Initiative',
      title: 'Relief Efforts for Flood-Affected Families',
      excerpt: 'HRSJM on-ground work to support affected families.',
      date: '20 Sep 2026',
      publishedAt: '2026-09-20',
      time: '11:00 AM',
      location: 'Mumbai, Maharashtra',
      tags: ['Relief Work', 'Emergency Response', 'Volunteers'],
      image: { uri: 'https://picsum.photos/seed/hrsjm-blog-03/400/300' } as any,
      galleryImages: [],
      highlights: ['Over 500 emergency kits distributed', 'Active field coordination'],
      relatedTopics: ['Disaster Relief', 'Community Action'],
      body: [
        'When floods affect a region, timely relief can make the difference between recovery and prolonged hardship. HRSJM teams work alongside affected families from day one.',
        'This update covers our on-ground relief efforts, the supplies distributed, and how volunteers coordinated with local authorities to reach the families who needed help most.',
      ],
      isDemo: false as any,
    },
  },
];

export const fetchPublishedBlogs = async (limit: number = 8): Promise<HomeBlogItem[]> => {
  try {
    const res = await apiClient.get<RawBlogsResponse>(ApiRoutes.BLOGS.BASE, {
      params: { status: 'PUBLISHED', limit },
    });
    const rawData = (res as any)?.data ?? res;
    const items: RawBlogItem[] = Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData)
      ? rawData
      : Array.isArray((res as any)?.items)
      ? (res as any).items
      : [];

    if (items.length > 0) {
      // Sort in strict descending order by published_at / created_at so newest blog appears in 1st position
      const sorted = [...items].sort((a, b) => {
        const timeA = new Date(a.published_at || (a as any).created_at || 0).getTime();
        const timeB = new Date(b.published_at || (b as any).created_at || 0).getTime();
        return timeB - timeA;
      });
      return sorted.map(mapRawToHomeBlogItem);
    }
    return DEFAULT_HOME_BLOGS;
  } catch (error) {
    console.warn('Failed to fetch dynamic blogs from backend, fallback to default:', error);
    return DEFAULT_HOME_BLOGS;
  }
};
