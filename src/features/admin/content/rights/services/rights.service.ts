import { apiClient } from '../../../../../core/api/client';
import { ApiRoutes } from '../../../../../core/constants/api-routes';
import type {
  RightsArticle,
  RightsArticleFormState,
  RightsHighlight,
  RightsListItem,
  RightsStatsSummary,
  RightsStatus,
} from '../types/rights.types';

export interface BackendRightItem {
  id: string;
  title: string;
  slug?: string | null;
  description: string;
  content?: string | null;
  category: string;
  category_label?: string | null;
  legal_reference?: string | null;
  highlights?: string | null;
  icon?: string | null;
  color?: string | null;
  icon_color?: string | null;
  badge_bg?: string | null;
  status: RightsStatus;
  published_at: string;
  views: number;
  thumbnail_url?: string | null;
  author: string;
  author_role?: string | null;
  organization?: string | null;
  tags?: string[] | null;
  featured: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendRightsListResponse {
  items: BackendRightItem[];
  stats: RightsStatsSummary;
  totalCount: number;
  page: number;
  limit: number;
}

export interface RightsFilterParams {
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

export const mapBackendRightToUi = (item: BackendRightItem): RightsArticle => {
  const { date, time } = formatDateDisplay(item.published_at);
  const contentArray = typeof item.content === 'string'
    ? item.content.split('\n\n').filter(p => p.trim().length > 0)
    : [item.description];

  let parsedHighlights: RightsHighlight[] = [];
  if (item.highlights) {
    parsedHighlights = item.highlights
      .split(',')
      .map(h => h.trim())
      .filter(Boolean)
      .map((tag, idx) => ({
        title: tag,
        description: `Legal protection and safeguards guaranteed under ${item.legal_reference || 'Indian law'}.`,
      }));
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    lastUpdatedDate: date,
    lastUpdatedTime: time,
    status: item.status,
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url,
    author: item.author || 'HRSJM Legal Cell',
    authorRole: item.author_role || 'Legal Advisor',
    organization: item.organization || 'HRSJM',
    content: contentArray,
    highlights: parsedHighlights,
    tags: item.tags || undefined,
  };
};

export const getRightsList = async (
  params?: RightsFilterParams,
): Promise<{ rights: RightsArticle[]; stats: RightsStatsSummary; totalCount: number }> => {
  const queryParams: Record<string, any> = {};
  if (params?.status && params.status !== 'ALL') {
    queryParams.status = params.status;
  }
  if (params?.category && params.category !== 'ALL') {
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

  const res = await apiClient.get<any>(
    ApiRoutes.RIGHTS.BASE,
    { params: queryParams },
  );

  const payload: any = (res as any)?.data?.items
    ? (res as any).data
    : ((res as any)?.data ?? res);

  const items: BackendRightItem[] = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];

  const rawStats = payload?.stats;
  const stats: RightsStatsSummary = (rawStats && (rawStats.total > 0 || rawStats.published > 0 || rawStats.drafts > 0))
    ? rawStats
    : {
        total: items.length,
        published: items.filter(r => r.status === 'PUBLISHED').length,
        drafts: items.filter(r => r.status === 'DRAFT').length,
        archived: items.filter(r => r.status === 'ARCHIVED').length,
      };

  return {
    rights: items.map(mapBackendRightToUi),
    stats,
    totalCount: payload?.totalCount ?? items.length,
  };
};

export const getRightDetails = async (idOrSlug: string): Promise<RightsArticle> => {
  const res = await apiClient.get<any>(
    ApiRoutes.RIGHTS.DETAILS(idOrSlug),
  );
  const payload: BackendRightItem = (res as any)?.data?.data ?? (res as any)?.data ?? res;
  return mapBackendRightToUi(payload);
};

export const createRightApi = async (
  form: RightsArticleFormState,
): Promise<RightsArticle> => {
  const payload = {
    title: form.title,
    description: form.shortDescription,
    content: form.content,
    category: form.category || 'Constitutional',
    status: form.status,
    thumbnail_url: form.coverImageUri || 'https://picsum.photos/seed/hrsjm-rights-new/400/300',
    author: form.author || 'HRSJM Legal Cell',
    tags: form.tags,
    featured: form.featured,
    allow_comments: form.allowComments,
  };

  const res = await apiClient.post<any>(
    ApiRoutes.RIGHTS.BASE,
    payload,
  );
  const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
  return mapBackendRightToUi(data);
};

export const updateRightApi = async (
  id: string,
  form: Partial<Omit<RightsArticleFormState, 'status'>> & { status?: RightsStatus },
): Promise<RightsArticle> => {
  const payload: any = {};
  if (form.title) payload.title = form.title;
  if (form.shortDescription) payload.description = form.shortDescription;
  if (form.content) payload.content = form.content;
  if (form.category) payload.category = form.category;
  if (form.status) payload.status = form.status;
  if (form.coverImageUri) payload.thumbnail_url = form.coverImageUri;
  if (form.author) payload.author = form.author;
  if (form.tags !== undefined) payload.tags = form.tags;
  if (form.featured !== undefined) payload.featured = form.featured;
  if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;

  const res = await apiClient.patch<any>(
    ApiRoutes.RIGHTS.DETAILS(id),
    payload,
  );
  const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
  return mapBackendRightToUi(data);
};

export const deleteRightApi = async (id: string): Promise<void> => {
  await apiClient.delete(ApiRoutes.RIGHTS.DETAILS(id));
};

export const incrementRightViewsApi = async (id: string): Promise<number> => {
  const res = await apiClient.post<any>(
    ApiRoutes.RIGHTS.VIEWS(id),
  );
  return res.data?.data?.views ?? res.data?.views ?? 0;
};
