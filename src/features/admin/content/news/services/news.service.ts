import { apiClient } from '../../../../../core/api/client';
import { ApiRoutes } from '../../../../../core/constants/api-routes';
import type {
  NewsListItem,
  NewsStatsSummary,
  CreateNewsFormState,
  NewsStatus,
} from '../types/news.types';

export interface BackendNewsItem {
  id: string;
  title: string;
  slug?: string | null;
  summary: string;
  summary_detailed?: string | null;
  content?: string | null;
  category: string;
  status: NewsStatus;
  published_at: string;
  views: number;
  thumbnail_url?: string | null;
  author: string;
  tags?: string[] | null;
  highlights?: string[] | null;
  gallery?: string[] | null;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendNewsListResponse {
  items: BackendNewsItem[];
  stats: NewsStatsSummary;
  totalCount: number;
  page: number;
  limit: number;
}

export interface NewsFilterParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const formatDateDisplay = (dateIso: string): { date: string; time: string } => {
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return { date: '28 Sep 2026', time: '12:00 PM' };
    const dateStr = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { date: dateStr, time: timeStr };
  } catch {
    return { date: '28 Sep 2026', time: '12:00 PM' };
  }
};

export const mapBackendNewsToUi = (item: BackendNewsItem): NewsListItem => {
  const { date, time } = formatDateDisplay(item.published_at);
  const contentArray = typeof item.content === 'string'
    ? item.content.split('\n\n').filter(p => p.trim().length > 0)
    : undefined;

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    summaryDetailed: item.summary_detailed || item.summary,
    category: item.category,
    date,
    time,
    status: item.status,
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url,
    author: item.author,
    content: contentArray,
    highlights: item.highlights || undefined,
    gallery: item.gallery || undefined,
    tags: item.tags || undefined,
  };
};

export const getNewsList = async (
  params?: NewsFilterParams,
): Promise<{ news: NewsListItem[]; stats: NewsStatsSummary }> => {
  const queryParams: Record<string, any> = {};
  if (params?.status && params.status !== 'ALL') {
    queryParams.status = params.status;
  }
  if (params?.category) {
    queryParams.category = params.category;
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await apiClient.get<BackendNewsListResponse>(
    ApiRoutes.NEWS.BASE,
    { params: queryParams },
  );

  const rawData = res.data;
  return {
    news: (rawData.items || []).map(mapBackendNewsToUi),
    stats: rawData.stats || {
      total: 0,
      published: 0,
      drafts: 0,
      archived: 0,
    },
  };
};

export const getNewsDetails = async (id: string): Promise<NewsListItem> => {
  const res = await apiClient.get<BackendNewsItem>(
    ApiRoutes.NEWS.DETAILS(id),
  );
  return mapBackendNewsToUi(res.data);
};

export const createNewsApi = async (
  form: CreateNewsFormState,
): Promise<NewsListItem> => {
  let publishedAt: string;
  try {
    if (form.publishDate) {
      const timePart = form.publishTime || '09:00';
      const parsed = new Date(`${form.publishDate}T${timePart}:00`);
      publishedAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    } else {
      publishedAt = new Date().toISOString();
    }
  } catch {
    publishedAt = new Date().toISOString();
  }

  const cleanSlug = form.slug?.trim()
    ? form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    : undefined;

  const payload = {
    title: form.headline.trim(),
    slug: cleanSlug,
    summary: form.summary.trim(),
    summary_detailed: form.summary.trim(),
    content: form.content.trim(),
    category: form.category || 'General',
    status: form.status,
    published_at: publishedAt,
    thumbnail_url: form.featuredImageUri || 'https://picsum.photos/seed/hrsjm-news-new/400/300',
    author: form.author?.trim() || 'HRSJM Team',
    tags: Array.isArray(form.tags) && form.tags.length > 0 ? form.tags : undefined,
    allow_comments: form.allowComments ?? true,
  };

  const res = await apiClient.post<BackendNewsItem>(
    ApiRoutes.NEWS.BASE,
    payload,
  );
  return mapBackendNewsToUi(res.data);
};

export const updateNewsApi = async (
  id: string,
  form: Partial<CreateNewsFormState> & { status?: NewsStatus },
): Promise<NewsListItem> => {
  const payload: any = {};
  if (form.headline !== undefined) payload.title = form.headline.trim();
  if (form.slug !== undefined) {
    payload.slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  if (form.summary !== undefined) {
    payload.summary = form.summary.trim();
    payload.summary_detailed = form.summary.trim();
  }
  if (form.content !== undefined) payload.content = form.content.trim();
  if (form.category !== undefined) payload.category = form.category;
  if (form.status !== undefined) payload.status = form.status;
  if (form.featuredImageUri !== undefined) payload.thumbnail_url = form.featuredImageUri;
  if (form.author !== undefined) payload.author = form.author?.trim();
  if (form.tags !== undefined) {
    payload.tags = Array.isArray(form.tags) && form.tags.length > 0 ? form.tags : null;
  }
  if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;
  if (form.publishDate) {
    try {
      const timePart = form.publishTime || '09:00';
      const parsed = new Date(`${form.publishDate}T${timePart}:00`);
      payload.published_at = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    } catch {
      payload.published_at = new Date().toISOString();
    }
  }

  try {
    const res = await apiClient.patch<BackendNewsItem>(
      ApiRoutes.NEWS.DETAILS(id),
      payload,
    );
    return mapBackendNewsToUi(res.data);
  } catch (err: any) {
    if (err?.response?.status === 404 || id.startsWith('n-') || id.startsWith('news-')) {
      console.warn(`News ${id} not found on backend, updated locally.`);
      return { id, ...payload } as any;
    }
    throw err;
  }
};

export const deleteNewsApi = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(ApiRoutes.NEWS.DETAILS(id));
  } catch (err: any) {
    if (err?.response?.status === 404 || id.startsWith('n-') || id.startsWith('news-')) {
      console.warn(`News ${id} not found on backend, deleted locally.`);
      return;
    }
    throw err;
  }
};

export const incrementNewsViewsApi = async (id: string): Promise<number> => {
  const res = await apiClient.post<{ views: number }>(
    ApiRoutes.NEWS.VIEWS(id),
  );
  return res.data?.views || 0;
};
