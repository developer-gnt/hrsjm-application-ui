import { apiClient } from '../../../../core/api/client';
import { causesService } from '../../../member/services/causes.service';

export interface DynamicAreaItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  actionLabel?: string;
  linkType?: 'rights' | 'events' | 'news' | 'causes';
  rawData?: any;
}

export interface DynamicAboutStats {
  rightsCount: number;
  eventsCount: number;
  blogsCount: number;
  newsCount: number;
  causesCount: number;
  supportersCount: number;
  impactMetrics: {
    communities: string;
    people: string;
    rightsIssues: string;
  };
  areaBadges: Record<string, string>;
}

class AboutService {
  private cachedStats: DynamicAboutStats | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  public async getDynamicAboutStats(): Promise<DynamicAboutStats> {
    const now = Date.now();
    if (this.cachedStats && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedStats;
    }

    let rightsCount = 13;
    let eventsCount = 5;
    let blogsCount = 9;
    let newsCount = 9;
    let causesCount = 12;
    let supportersCount = 68;

    try {
      const [rightsRes, eventsRes, blogsRes, newsRes, causes, donationsRes] =
        await Promise.allSettled([
          apiClient.get<any>('/rights?limit=100'),
          apiClient.get<any>('/events?limit=100'),
          apiClient.get<any>('/blogs?limit=100'),
          apiClient.get<any>('/news?limit=100'),
          causesService.getCauses(),
          apiClient.get<any>('/donations?limit=100'),
        ]);

      if (rightsRes.status === 'fulfilled' && rightsRes.value) {
        const payload = (rightsRes.value as any)?.data || rightsRes.value;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        if (items.length > 0) rightsCount = items.length;
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        const payload = (eventsRes.value as any)?.data || eventsRes.value;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        if (items.length > 0) eventsCount = items.length;
      }

      if (blogsRes.status === 'fulfilled' && blogsRes.value) {
        const payload = (blogsRes.value as any)?.data || blogsRes.value;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        if (items.length > 0) blogsCount = items.length;
      }

      if (newsRes.status === 'fulfilled' && newsRes.value) {
        const payload = (newsRes.value as any)?.data || newsRes.value;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        if (items.length > 0) newsCount = items.length;
      }

      if (causes.status === 'fulfilled' && Array.isArray(causes.value)) {
        if (causes.value.length > 0) causesCount = causes.value.length;
      }

      if (donationsRes.status === 'fulfilled' && donationsRes.value) {
        const payload = (donationsRes.value as any)?.data || donationsRes.value;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        if (items.length > 0) supportersCount = items.length;
      }
    } catch {
      // Fallback to defaults
    }

    const calculatedCommunities = `${Math.max(500, (rightsCount + eventsCount) * 45)}+`;
    const calculatedPeople = `${Math.max(50, Math.round(50 + (rightsCount + eventsCount) * 1.5))}K+`;
    const calculatedRightsIssues = `${Math.max(1200, rightsCount * 110)}+`;

    const areaBadges: Record<string, string> = {
      monitoring: `${rightsCount}+ Rights Cases`,
      'human-rights-monitoring': `${rightsCount}+ Rights Cases`,
      awareness: `${blogsCount + newsCount} Live Drives`,
      'awareness-campaigns': `${blogsCount + newsCount} Live Drives`,
      workshops: `${eventsCount} Active Sessions`,
      'workshops-training': `${eventsCount} Active Sessions`,
      community: `${causesCount > 0 ? causesCount : 40}+ Local Drives`,
      'community-activities': `${causesCount > 0 ? causesCount : 40}+ Local Drives`,
      leadership: `${supportersCount}+ Leaders & Wings`,
      'leadership-development': `${supportersCount}+ Leaders & Wings`,
      advocacy: `${blogsCount}+ Policy Campaigns`,
      'advocacy-awareness': `${blogsCount}+ Policy Campaigns`,
      research: `${rightsCount} Publications`,
      'research-rights-education': `${rightsCount} Publications`,
      legal: `${rightsCount} Legal Frameworks`,
      'legal-rights-awareness': `${rightsCount} Legal Frameworks`,
      other: `Education, Health & Welfare`,
      'other-work-areas': `Education, Health & Welfare`,
    };

    this.cachedStats = {
      rightsCount,
      eventsCount,
      blogsCount,
      newsCount,
      causesCount,
      supportersCount,
      impactMetrics: {
        communities: calculatedCommunities,
        people: calculatedPeople,
        rightsIssues: calculatedRightsIssues,
      },
      areaBadges,
    };
    this.lastFetchTime = now;

    return this.cachedStats;
  }

  public async getRelatedDynamicItems(contentId: string): Promise<{
    title: string;
    items: DynamicAreaItem[];
  }> {
    const id = contentId.toLowerCase();

    if (
      id.includes('monitoring') ||
      id.includes('rights') ||
      id.includes('legal') ||
      id.includes('research')
    ) {
      try {
        const res = await apiClient.get<any>('/rights?limit=20');
        const payload = (res as any)?.data || res;
        const list = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];

        const items: DynamicAreaItem[] = list.map((r: any) => ({
          id: r.id || r.slug || String(Math.random()),
          title: r.title,
          description: r.summary || r.content?.slice(0, 110) + '...',
          category: r.category || 'Human Rights',
          actionLabel: 'Read Full Guide',
          linkType: 'rights',
          rawData: r,
        }));

        return {
          title:
            id.includes('legal')
              ? 'Verified Legal Rights & Frameworks'
              : id.includes('research')
              ? 'Research Papers & Rights Education'
              : 'Verified Rights Documentation & Cases',
          items: items.slice(0, 6),
        };
      } catch {
        return { title: 'Verified Rights Documentation', items: [] };
      }
    }

    if (id.includes('workshop') || id.includes('training')) {
      try {
        const res = await apiClient.get<any>('/events?limit=10');
        const payload = (res as any)?.data || res;
        const list = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];

        const items: DynamicAreaItem[] = list.map((ev: any) => ({
          id: ev.id || String(Math.random()),
          title: ev.title || 'Community Workshop',
          description: ev.description || 'Hands-on learning and skill-building session.',
          category: ev.category || 'Workshop',
          date: ev.event_date ? new Date(ev.event_date).toLocaleDateString() : undefined,
          actionLabel: 'Register / View Session',
          linkType: 'events',
          rawData: ev,
        }));

        return {
          title: 'Upcoming Workshops & Interactive Training',
          items: items.slice(0, 6),
        };
      } catch {
        return { title: 'Upcoming Workshops', items: [] };
      }
    }

    if (id.includes('awareness') || id.includes('campaign') || id.includes('advocacy')) {
      try {
        const [blogsRes, newsRes] = await Promise.allSettled([
          apiClient.get<any>('/blogs?limit=5'),
          apiClient.get<any>('/news?limit=5'),
        ]);

        const blogList =
          blogsRes.status === 'fulfilled'
            ? (blogsRes.value as any)?.data?.items || (blogsRes.value as any)?.items || []
            : [];
        const newsList =
          newsRes.status === 'fulfilled'
            ? (newsRes.value as any)?.data?.items || (newsRes.value as any)?.items || []
            : [];

        const combined = [...blogList, ...newsList];
        const items: DynamicAreaItem[] = combined.map((article: any) => ({
          id: article.id || String(Math.random()),
          title: article.title,
          description: article.summary || article.content?.slice(0, 110) + '...',
          category: article.category || 'Awareness Campaign',
          date: article.created_at
            ? new Date(article.created_at).toLocaleDateString()
            : undefined,
          actionLabel: 'Read Campaign Article',
          linkType: 'news',
          rawData: article,
        }));

        return {
          title: 'Active Awareness Campaigns & Updates',
          items: items.slice(0, 6),
        };
      } catch {
        return { title: 'Active Awareness Campaigns', items: [] };
      }
    }

    if (id.includes('community') || id.includes('other')) {
      try {
        const causes = await causesService.getCauses();
        const items: DynamicAreaItem[] = causes.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description || (c as any).fullDescription?.slice(0, 110) || '',
          category: c.category || 'Community Action',
          actionLabel: 'Support This Cause',
          linkType: 'causes',
          rawData: c,
        }));

        return {
          title: 'Active Community Outreach & Field Initiatives',
          items: items.slice(0, 6),
        };
      } catch {
        return { title: 'Active Community Initiatives', items: [] };
      }
    }

    return { title: 'Active Initiatives & Resources', items: [] };
  }
}

export const aboutService = new AboutService();
