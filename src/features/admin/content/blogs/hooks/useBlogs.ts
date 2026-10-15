import { useCallback, useEffect, useState } from 'react';
import type {
  BlogListItem,
  BlogStatsSummary,
  BlogFilterState,
  BlogsUiState,
  CreateBlogFormState,
  BlogStatus,
} from '../types/blog.types';
import {
  getBlogsList,
  createBlogApi,
  updateBlogApi,
  deleteBlogApi,
} from '../services/blogs.service';
import { SAMPLE_BLOGS, DEMO_BLOG_STATS } from '../data/sample-blogs';

export interface UseBlogsResult {
  blogs: BlogListItem[];
  stats: BlogStatsSummary;
  state: BlogsUiState;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  createBlog: (form: CreateBlogFormState) => Promise<BlogListItem>;
  updateBlog: (
    id: string,
    form: Partial<CreateBlogFormState> & { status?: BlogStatus },
  ) => Promise<BlogListItem>;
  deleteBlog: (id: string) => Promise<void>;
}

export const useBlogs = (filters?: BlogFilterState & { search?: string }): UseBlogsResult => {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [stats, setStats] = useState<BlogStatsSummary>(DEMO_BLOG_STATS);
  const [state, setState] = useState<BlogsUiState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await getBlogsList({
        status: filters?.status,
        category: filters?.category || undefined,
        dateRange: filters?.dateRange,
        search: filters?.search || undefined,
      });
      setBlogs(data.blogs);
      setStats(data.stats);
      setState('success');
    } catch (err: any) {
      console.warn('Backend Blogs fetch failed, using fallback samples:', err?.message || err);
      // Fallback gracefully so UI never breaks even during server downtime
      let filtered = [...SAMPLE_BLOGS];
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter(item => item.status === filters.status);
      }
      if (filters?.category) {
        filtered = filtered.filter(item => item.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        filtered = filtered.filter(item => item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q));
      }
      setBlogs(filtered);
      setStats(DEMO_BLOG_STATS);
      setState('success');
    }
  }, [filters?.status, filters?.category, filters?.dateRange, filters?.search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const createBlog = async (form: CreateBlogFormState): Promise<BlogListItem> => {
    const created = await createBlogApi(form);
    await fetchBlogs();
    return created;
  };

  const updateBlog = async (
    id: string,
    form: Partial<CreateBlogFormState> & { status?: BlogStatus },
  ): Promise<BlogListItem> => {
    const updated = await updateBlogApi(id, form);
    await fetchBlogs();
    return updated;
  };

  const deleteBlog = async (id: string): Promise<void> => {
    await deleteBlogApi(id);
    await fetchBlogs();
  };

  return {
    blogs,
    stats,
    state,
    errorMessage,
    refresh: fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};
