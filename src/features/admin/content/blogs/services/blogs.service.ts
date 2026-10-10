import { apiClient } from '../../../../../core/api/client';
import { ApiRoutes } from '../../../../../core/constants/api-routes';
import type {
  BlogListItem,
  BlogStatsSummary,
  CreateBlogFormState,
  BlogStatus,
} from '../types/blog.types';

export interface BackendBlogItem {
  id: string;
  title: string;
  slug?: string | null;
  excerpt: string;
  content?: string | null;
  category: string;
  status: BlogStatus;
  published_at: string;
  views: number;
  thumbnail_url?: string | null;
  author: string;
  tags?: string[] | null;
  featured: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendBlogsListResponse {
  items: BackendBlogItem[];
  stats: BlogStatsSummary;
  totalCount: number;
  page: number;
  limit: number;
}

export interface BlogsFilterParams {
  status?: string;
  category?: string;
  dateRange?: string;
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

export const mapBackendBlogToUi = (item: BackendBlogItem): BlogListItem => {
  const { date, time } = formatDateDisplay(item.published_at);
  const contentArray = typeof item.content === 'string'
    ? item.content.split('\n\n').filter(p => p.trim().length > 0)
    : undefined;

  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    category: item.category,
    date,
    time,
    status: item.status,
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url,
    author: item.author,
    content: contentArray,
    tags: item.tags || undefined,
  };
};

export const getBlogsList = async (
  params?: BlogsFilterParams,
): Promise<{ blogs: BlogListItem[]; stats: BlogStatsSummary }> => {
  const queryParams: Record<string, any> = {};
  if (params?.status && params.status !== 'ALL') {
    queryParams.status = params.status;
  }
  if (params?.category) {
    queryParams.category = params.category;
  }
  if (params?.dateRange && params.dateRange !== 'ANY') {
    queryParams.dateRange = params.dateRange;
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await apiClient.get<BackendBlogsListResponse>(
    ApiRoutes.BLOGS.BASE,
    { params: queryParams },
  );

  const rawData = res.data;
  return {
    blogs: (rawData.items || []).map(mapBackendBlogToUi),
    stats: rawData.stats || {
      total: 0,
      published: 0,
      drafts: 0,
      archived: 0,
    },
  };
};

export const getBlogDetails = async (id: string): Promise<BlogListItem> => {
  const res = await apiClient.get<BackendBlogItem>(
    ApiRoutes.BLOGS.DETAILS(id),
  );
  return mapBackendBlogToUi(res.data);
};

export const createBlogApi = async (
  form: CreateBlogFormState,
): Promise<BlogListItem> => {
  const parsedTags = form.tagsText
    ? form.tagsText.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const payload = {
    title: form.title,
    excerpt: form.shortDescription,
    content: form.content,
    category: form.category || 'General',
    status: form.status,
    thumbnail_url: form.coverImageUri || 'https://picsum.photos/seed/hrsjm-blog-new/400/300',
    author: form.author || 'HRSJM Admin',
    tags: parsedTags,
    featured: form.featured,
    allow_comments: form.allowComments,
  };

  const res = await apiClient.post<BackendBlogItem>(
    ApiRoutes.BLOGS.BASE,
    payload,
  );
  return mapBackendBlogToUi(res.data);
};

export const updateBlogApi = async (
  id: string,
  form: Partial<CreateBlogFormState> & { status?: BlogStatus },
): Promise<BlogListItem> => {
  const payload: any = {};
  if (form.title) payload.title = form.title;
  if (form.shortDescription) payload.excerpt = form.shortDescription;
  if (form.content) payload.content = form.content;
  if (form.category) payload.category = form.category;
  if (form.status) payload.status = form.status;
  if (form.coverImageUri) payload.thumbnail_url = form.coverImageUri;
  if (form.author) payload.author = form.author;
  if (form.tagsText !== undefined) {
    payload.tags = form.tagsText.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (form.featured !== undefined) payload.featured = form.featured;
  if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;

  const res = await apiClient.patch<BackendBlogItem>(
    ApiRoutes.BLOGS.DETAILS(id),
    payload,
  );
  return mapBackendBlogToUi(res.data);
};

export const deleteBlogApi = async (id: string): Promise<void> => {
  await apiClient.delete(ApiRoutes.BLOGS.DETAILS(id));
};

export const incrementBlogViewsApi = async (id: string): Promise<number> => {
  const res = await apiClient.post<{ views: number }>(
    ApiRoutes.BLOGS.VIEWS(id),
  );
  return res.data?.views || 0;
};
