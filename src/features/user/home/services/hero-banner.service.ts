import { create } from 'zustand';
import { apiClient } from '../../../../core/api/client';
import HeroHomeSource from '../../../../assets/images/hero-home.webp';

export interface HeroSlide {
  id: string;
  headlineLines: string[];
  goldLine: string;
  supporting: string;
  ctaLabel?: string;
  ctaAction?: 'join' | 'donate' | 'membership' | 'rights' | 'events' | 'about' | 'help' | string;
  image: any;
  scriptLines?: string[];
  eyebrow?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'mission-human-rights',
    headlineLines: ['For Human Rights,', 'Dignity and a'],
    goldLine: 'More Just Society.',
    supporting: 'We work for equal rights, social justice and stronger communities across India.',
    ctaLabel: 'Join the Movement',
    ctaAction: 'join',
    scriptLines: ['People.', 'Rights.', 'Justice.', 'Change.'],
    image: HeroHomeSource,
  },
  {
    id: 'stand-for-dignity',
    headlineLines: ['Stand for Rights.', 'Stand for'],
    goldLine: 'Human Dignity.',
    supporting: 'Together we can build stronger, fairer and more inclusive communities across every state.',
    ctaLabel: 'Become a Member',
    ctaAction: 'membership',
    scriptLines: ['Empower.', 'Unite.', 'Protect.', 'Lead.'],
    image: require('../../../../assets/images/member-hero-rally.jpg'),
  },
  {
    id: 'grassroots-aid',
    headlineLines: ['Awareness.', 'Action.'],
    goldLine: 'Real Impact.',
    supporting: 'Protecting fundamental human rights and delivering immediate relief to families in need.',
    ctaLabel: 'Donate to Causes',
    ctaAction: 'donate',
    scriptLines: ['Hope.', 'Action.', 'Relief.', 'Care.'],
    image: require('../../../../assets/images/contact-cta-hands.jpg'),
  },
  {
    id: 'legal-awareness',
    headlineLines: ['Know Your Law.', 'Claim Your'],
    goldLine: 'Fundamental Rights.',
    supporting: 'Providing free legal consultations, constitutional awareness camps, and citizen support.',
    ctaLabel: 'Know Your Rights',
    ctaAction: 'rights',
    scriptLines: ['Justice.', 'Equality.', 'Truth.', 'Voice.'],
    image: require('../../../../assets/images/event-legal-awareness.jpg'),
  },
  {
    id: 'community-workshops',
    headlineLines: ['United for Peace.', 'Driven by'],
    goldLine: 'Social Justice.',
    supporting: 'Join nationwide human rights workshops, citizen conventions, and community seminars.',
    ctaLabel: 'Explore Events',
    ctaAction: 'events',
    scriptLines: ['Engage.', 'Inspire.', 'Transform.', 'Serve.'],
    image: require('../../../../assets/images/about-hero-community.png'),
  },
];

interface HeroBannerState {
  slides: HeroSlide[];
  isLoading: boolean;
  error: string | null;
  fetchHeroSlides: () => Promise<void>;
  updateSlide: (id: string, patch: Partial<HeroSlide>) => void;
  setSlides: (slides: HeroSlide[]) => void;
}

export const useHeroBannerStore = create<HeroBannerState>((set, get) => ({
  slides: DEFAULT_HERO_SLIDES,
  isLoading: false,
  error: null,

  fetchHeroSlides: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<HeroSlide[]>('/content/hero-banners');
      const data = (res as any)?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        set({
          slides: data.map(item => ({
            ...item,
            image: item.image ? (typeof item.image === 'string' ? { uri: item.image } : item.image) : HeroHomeSource,
          })),
          isLoading: false,
        });
        return;
      }
    } catch {
      // Backend route optional; graceful fallback to default official slides
    }
    set({ isLoading: false });
  },

  updateSlide: (id: string, patch: Partial<HeroSlide>) => {
    set(state => ({
      slides: state.slides.map(slide => (slide.id === id ? { ...slide, ...patch } : slide)),
    }));
  },

  setSlides: (slides: HeroSlide[]) => {
    set({ slides });
  },
}));

export const useHeroBanner = () => {
  const slides = useHeroBannerStore(state => state.slides);
  const isLoading = useHeroBannerStore(state => state.isLoading);
  const fetchHeroSlides = useHeroBannerStore(state => state.fetchHeroSlides);
  const updateSlide = useHeroBannerStore(state => state.updateSlide);

  return {
    slides,
    isLoading,
    fetchHeroSlides,
    updateSlide,
  };
};

