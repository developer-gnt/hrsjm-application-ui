/**
 * Content for the four "How HRSJM Supports Women" detail pages.
 *
 * IDs match supportAreas in rights-content.ts:
 *   awareness, legal-support, workshops, community
 */
import type { IconName } from '../../components/icons';

export type SupportPageId =
  | 'awareness'
  | 'legal-support'
  | 'workshops'
  | 'community';

export interface SupportItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface SupportPageContent {
  id: SupportPageId;
  title: string;
  badge: string;
  description: string;
  accentColor: string;
  highlightIcon: IconName;
  highlightTitle: string;
  highlightDescription: string;
  sectionHeading: string;
  items: SupportItem[];
  ctaLabel: string;
}

const SUPPORT_PAGES: Record<SupportPageId, SupportPageContent> = {
  awareness: {
    id: 'awareness',
    title: 'Awareness Campaigns',
    badge: 'AWARENESS',
    description:
      'Raising awareness about women\'s rights and creating a more equal and informed society.',
    accentColor: '#FFF0C7',
    highlightIcon: 'megaphone',
    highlightTitle: 'Stronger Voices',
    highlightDescription:
      'Building a more informed and equal society for all women.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'rights-awareness-drives',
        title: 'Rights Awareness Drives',
        description: 'Programs to spread awareness about women\'s rights.',
        icon: 'users',
      },
      {
        id: 'public-campaigns',
        title: 'Public Campaigns',
        description: 'Information on ongoing and upcoming campaigns.',
        icon: 'megaphone',
      },
      {
        id: 'digital-awareness',
        title: 'Digital Awareness',
        description: 'Online resources and social media initiatives.',
        icon: 'globe',
      },
      {
        id: 'community-outreach',
        title: 'Community Outreach',
        description: 'Local engagement and awareness events.',
        icon: 'users',
      },
      {
        id: 'campaign-updates',
        title: 'Campaign Updates',
        description: 'Latest news and announcements about our campaigns.',
        icon: 'file-text',
      },
    ],
    ctaLabel: 'Explore Awareness Resources',
  },
  'legal-support': {
    id: 'legal-support',
    title: 'Legal Support & Counselling',
    badge: 'LEGAL SUPPORT',
    description:
      'Find information about legal support, counselling and guidance for women\'s rights.',
    accentColor: '#FFF0C7',
    highlightIcon: 'scale',
    highlightTitle: 'Access to Justice',
    highlightDescription:
      'Information and support for your legal rights and well-being.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'understanding-legal-options',
        title: 'Understanding Legal Options',
        description: 'Learn about available legal pathways.',
        icon: 'file-text',
      },
      {
        id: 'finding-legal-aid',
        title: 'Finding Legal Aid',
        description: 'Information on legal aid services and support.',
        icon: 'users',
      },
      {
        id: 'counselling-information',
        title: 'Counselling Information',
        description: 'Guidance on counselling and emotional support.',
        icon: 'heart-pulse',
      },
      {
        id: 'preparing-consultation',
        title: 'Preparing for a Consultation',
        description: 'Tips to help you prepare for legal or counselling sessions.',
        icon: 'briefcase',
      },
      {
        id: 'support-resources',
        title: 'Support Resources',
        description: 'Additional resources and referrals.',
        icon: 'shield-check',
      },
    ],
    ctaLabel: 'Explore Support Options',
  },
  workshops: {
    id: 'workshops',
    title: 'Workshops & Training',
    badge: 'WORKSHOPS',
    description:
      'Learning opportunities to build awareness, skills and leadership for a better future.',
    accentColor: '#FFF0C7',
    highlightIcon: 'graduation-cap',
    highlightTitle: 'Learn, Grow, Lead',
    highlightDescription:
      'Skill-building and knowledge for empowered communities.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'rights-education-sessions',
        title: 'Rights Education Sessions',
        description: 'Workshops on women\'s rights and legal awareness.',
        icon: 'book-open',
      },
      {
        id: 'safety-awareness',
        title: 'Safety Awareness',
        description: 'Training on personal safety and risk prevention.',
        icon: 'shield-check',
      },
      {
        id: 'leadership-development',
        title: 'Leadership Development',
        description: 'Programs to build leadership and confidence.',
        icon: 'users',
      },
      {
        id: 'skill-building-workshops',
        title: 'Skill-Building Workshops',
        description: 'Practical skills for personal and professional growth.',
        icon: 'briefcase',
      },
      {
        id: 'training-resources',
        title: 'Training Resources',
        description: 'Additional learning materials and guides.',
        icon: 'file-text',
      },
    ],
    ctaLabel: 'Explore Learning Resources',
  },
  community: {
    id: 'community',
    title: 'Community Initiatives',
    badge: 'COMMUNITY',
    description:
      'Supporting local initiatives that promote dignity, participation and equal opportunities.',
    accentColor: '#FFF0C7',
    highlightIcon: 'users',
    highlightTitle: 'Stronger Communities',
    highlightDescription:
      'Working together for safer, more inclusive communities.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'community-outreach',
        title: 'Community Outreach',
        description: 'Local programs and engagement activities.',
        icon: 'users',
      },
      {
        id: 'womens-groups',
        title: "Women's Groups",
        description: 'Information about support groups and networks.',
        icon: 'users',
      },
      {
        id: 'local-awareness-events',
        title: 'Local Awareness Events',
        description: 'Community events and initiatives in your area.',
        icon: 'megaphone',
      },
      {
        id: 'volunteer-participation',
        title: 'Volunteer Participation',
        description: 'Opportunities to get involved and make a difference.',
        icon: 'heart-pulse',
      },
      {
        id: 'initiative-updates',
        title: 'Initiative Updates',
        description: 'Latest news and stories from our community work.',
        icon: 'file-text',
      },
    ],
    ctaLabel: 'Explore Community Activities',
  },
};

export const findSupportPageById = (id: string): SupportPageContent | undefined =>
  SUPPORT_PAGES[id as SupportPageId];
