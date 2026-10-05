import { useCallback, useEffect, useState } from 'react';
import type {
  NewsListItem,
  NewsStatsSummary,
  NewsFilterState,
  NewsUiState,
  CreateNewsFormState,
  NewsStatus,
} from '../types/news.types';
import {
  getNewsList,
  createNewsApi,
  updateNewsApi,
  deleteNewsApi,
} from '../services/news.service';
import { SAMPLE_NEWS, DEMO_NEWS_STATS } from '../data/sample-news';

export interface UseNewsResult {
  news: NewsListItem[];
  stats: NewsStatsSummary;
  state: NewsUiState;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  createNews: (form: CreateNewsFormState) => Promise<NewsListItem>;
  updateNews: (
    id: string,
    form: Partial<CreateNewsFormState> & { status?: NewsStatus },
  ) => Promise<NewsListItem>;
  deleteNews: (id: string) => Promise<void>;
}

export const useNews = (filters?: NewsFilterState & { search?: string }): UseNewsResult => {
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [stats, setStats] = useState<NewsStatsSummary>(DEMO_NEWS_STATS);
  const [state, setState] = useState<NewsUiState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await getNewsList({
        status: filters?.status,
        category: filters?.category || undefined,
        search: filters?.search || undefined,
      });
      setNews(data.news);
      setStats(data.stats);
      setState('success');
    } catch (err: any) {
      console.warn('Backend News fetch failed, using fallback samples:', err?.message || err);
      // Fallback gracefully so UI never breaks even during server downtime
      let filtered = [...SAMPLE_NEWS];
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter(item => item.status === filters.status);
      }
      if (filters?.category) {
        filtered = filtered.filter(item => item.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        filtered = filtered.filter(item => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q));
      }
      setNews(filtered);
      setStats(DEMO_NEWS_STATS);
      setState('success');
    }
  }, [filters?.status, filters?.category, filters?.search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const createNews = async (form: CreateNewsFormState): Promise<NewsListItem> => {
    const created = await createNewsApi(form);
    await fetchNews();
    return created;
  };

  const updateNews = async (
    id: string,
    form: Partial<CreateNewsFormState> & { status?: NewsStatus },
  ): Promise<NewsListItem> => {
    const updated = await updateNewsApi(id, form);
    await fetchNews();
    return updated;
  };

  const deleteNews = async (id: string): Promise<void> => {
    await deleteNewsApi(id);
    await fetchNews();
  };

  return {
    news,
    stats,
    state,
    errorMessage,
    refresh: fetchNews,
    createNews,
    updateNews,
    deleteNews,
  };
};
