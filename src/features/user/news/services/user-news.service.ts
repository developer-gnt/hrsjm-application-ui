import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type { HomeNewsItem } from '../../home/types/home.types';
import type {
  UserNewsArticle,
  UserNewsCategory,
  UserNewsContentType,
} from '../data/user-news';

const DEFAULT_NEWS_PHOTO = require('../../../../assets/images/contact-hero-building.jpg');

export interface RawNewsResponse {
  items: Array<{
    id: string;
    title: string;
    slug?: string | null;
    summary: string;
    summary_detailed?: string | null;
    content?: string | null;
    category: string;
    status: string;
    published_at: string;
    views?: number;
    thumbnail_url?: string | null;
    author?: string;
    tags?: string[] | null;
    highlights?: string[] | null;
    created_at?: string;
  }>;
  totalCount: number;
}

export const formatNewsDate = (isoString?: string): string => {
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

export const mapRawToUserNewsArticle = (
  item: RawNewsResponse['items'][0],
): UserNewsArticle => {
  const publishedDate = formatNewsDate(item.published_at || item.created_at);
  const bodyParagraphs = item.content
    ? item.content.split('\n\n').filter(p => p.trim().length > 0)
    : [item.summary || ''];

  let validCategory: UserNewsCategory = 'Legal Awareness';
  const catLower = (item.category || '').toLowerCase();
  if (catLower.includes('human') || catLower.includes('rights')) {
    validCategory = 'Human Rights';
  } else if (catLower.includes('women') || catLower.includes('child')) {
    validCategory = 'Women & Child';
  } else if (catLower.includes('community') || catLower.includes('relief')) {
    validCategory = 'Community';
  }

  return {
    id: item.id,
    category: validCategory,
    contentType: 'Initiative' as UserNewsContentType,
    title: item.title,
    excerpt: item.summary || item.summary_detailed || '',
    date: publishedDate,
    publishedAt: item.published_at ? item.published_at.slice(0, 10) : '2026-10-14',
    time: '10:00 AM',
    location: 'Mumbai, Maharashtra',
    tags: item.tags || ['HRSJM', 'Rights'],
    image: item.thumbnail_url ? ({ uri: item.thumbnail_url } as any) : DEFAULT_NEWS_PHOTO,
    galleryImages: [],
    highlights: item.highlights || [],
    relatedTopics: ['Citizen Rights', 'Community Protection'],
    body: bodyParagraphs,
    isDemo: false as any,
  };
};

export const mapRawToHomeNewsItem = (
  item: RawNewsResponse['items'][0],
): HomeNewsItem => {
  const article = mapRawToUserNewsArticle(item);
  return {
    id: item.id,
    category: (item.category || 'LEGAL RIGHTS').toUpperCase(),
    title: item.title,
    date: formatNewsDate(item.published_at || item.created_at),
    imageAssetName: 'home/news/legal-awareness.png',
    imageUrl: item.thumbnail_url || undefined,
    article,
  };
};

export const fetchLatestPublishedNews = async (
  limit: number = 3,
): Promise<HomeNewsItem[]> => {
  try {
    const res = await apiClient.get<RawNewsResponse>(ApiRoutes.NEWS.BASE, {
      params: { status: 'PUBLISHED', limit },
    });
    const items = res.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map(mapRawToHomeNewsItem);
    }
    return [];
  } catch (error) {
    console.warn('Failed to fetch dynamic news from backend, fallback to default:', error);
    return [];
  }
};

export const fetchAllPublishedArticles = async (
  limit: number = 20,
): Promise<UserNewsArticle[]> => {
  try {
    const res = await apiClient.get<RawNewsResponse>(ApiRoutes.NEWS.BASE, {
      params: { status: 'PUBLISHED', limit },
    });
    const items = res.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map(mapRawToUserNewsArticle);
    }
    return [];
  } catch (error) {
    console.warn('Failed to fetch published articles from backend:', error);
    return [];
  }
};
