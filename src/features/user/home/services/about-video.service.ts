import { create } from 'zustand';
import { apiClient } from '../../../../core/api/client';

export interface AboutVideoData {
  id: string;
  title: string;
  subtitle: string;
  summaryText: string;
  videoUrl: string;
  embedUrl: string;
  fallbackVideoUrl: string;
  duration: string;
  viewsCount: string;
  releaseYear: string;
  badgeLabel: string;
  description: string;
  highlights: string[];
  tags: string[];
  thumbnailUrl?: string;
}

export const DEFAULT_ABOUT_VIDEO: AboutVideoData = {
  id: 'hrsjm-intro-video-2026',
  title: 'Human Rights & Social Justice Mission',
  subtitle: 'Official Mission Overview & Community Impact',
  summaryText:
    'Human Rights and Social Justice Mission (HRSJM) works for human rights, dignity, equality and social justice through awareness, advocacy, education and community support.',
  videoUrl: 'https://www.youtube.com/watch?v=k5k_2K6-4Ww',
  embedUrl: 'https://www.youtube-nocookie.com/embed/k5k_2K6-4Ww?autoplay=1&rel=0&modestbranding=1',
  fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  duration: '3:45',
  viewsCount: '18.5K views',
  releaseYear: '2026',
  badgeLabel: 'Official Video',
  description:
    'Human Rights and Social Justice Mission (HRSJM) is dedicated to advancing human dignity, ensuring constitutional rights, and providing grassroots assistance to underprivileged and vulnerable communities across India.\n\nThrough our national network of volunteers and legal professionals, we provide free legal aid clinics, organize human rights workshops, protect child and women welfare, and deliver emergency assistance.',
  highlights: [
    'Constitutional & Fundamental Rights Awareness',
    'Free Legal Consultation & Grievance Redressal',
    'Women & Child Protection Initiatives',
    'Community Assistance & Grassroots Action Across India',
  ],
  tags: ['Human Rights', 'Social Justice', 'Community Aid', 'Legal Awareness'],
};

interface AboutVideoState {
  video: AboutVideoData;
  isLoading: boolean;
  error: string | null;
  fetchAboutVideo: () => Promise<void>;
  updateVideo: (patch: Partial<AboutVideoData>) => void;
}

export const useAboutVideoStore = create<AboutVideoState>((set, get) => ({
  video: DEFAULT_ABOUT_VIDEO,
  isLoading: false,
  error: null,

  fetchAboutVideo: async () => {
    set({ isLoading: true, error: null });
    try {
      // Attempt to load dynamic video configuration if configured on the backend
      const res = await apiClient.get<AboutVideoData>('/content/about-video');
      const data = (res as any)?.data || res;
      if (data && data.videoUrl) {
        set({
          video: {
            ...get().video,
            ...data,
          },
          isLoading: false,
        });
        return;
      }
    } catch {
      // Backend route optional; graceful fallback to default rich HRSJM mission video
    }
    set({ isLoading: false });
  },

  updateVideo: (patch: Partial<AboutVideoData>) => {
    set(state => ({
      video: {
        ...state.video,
        ...patch,
      },
    }));
  },
}));

/**
 * Convenient React hook to access and manage the dynamic About HRSJM video
 */
export const useAboutVideo = () => {
  const video = useAboutVideoStore(state => state.video);
  const isLoading = useAboutVideoStore(state => state.isLoading);
  const fetchAboutVideo = useAboutVideoStore(state => state.fetchAboutVideo);
  const updateVideo = useAboutVideoStore(state => state.updateVideo);

  return {
    video,
    isLoading,
    fetchAboutVideo,
    updateVideo,
  };
};

