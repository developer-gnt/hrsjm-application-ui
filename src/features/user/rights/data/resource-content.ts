/**
 * Content for the three "Useful Resources" detail pages.
 *
 * IDs match resources in rights-content.ts:
 *   government-schemes, important-links, downloadable-materials
 */
import type { IconName } from '../../components/icons';

export type ResourcePageId =
  | 'government-schemes'
  | 'important-links'
  | 'downloadable-materials';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface ResourcePageContent {
  id: ResourcePageId;
  title: string;
  badge: string;
  description: string;
  accentColor: string;
  highlightIcon: IconName;
  highlightTitle: string;
  highlightDescription: string;
  sectionHeading: string;
  items: ResourceItem[];
  ctaLabel: string;
}

const RESOURCE_PAGES: Record<ResourcePageId, ResourcePageContent> = {
  'government-schemes': {
    id: 'government-schemes',
    title: 'Government Schemes for Women',
    badge: 'GOV SCHEMES',
    description:
      'Discover information on relevant government schemes and programs for women\'s empowerment.',
    accentColor: '#EAF0FF',
    highlightIcon: 'file-text',
    highlightTitle: 'Access to Opportunities',
    highlightDescription:
      'Learn about government schemes designed to support women.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'scheme-eligibility',
        title: 'Scheme Eligibility',
        description: 'Understand who can apply and the basic requirements.',
        icon: 'shield-check',
      },
      {
        id: 'benefits-coverage',
        title: 'Benefits and Coverage',
        description: 'Information on what each scheme offers.',
        icon: 'heart-pulse',
      },
      {
        id: 'documents-to-prepare',
        title: 'Documents to Prepare',
        description: 'List of common documents required.',
        icon: 'file-text',
      },
      {
        id: 'how-to-apply',
        title: 'How to Apply',
        description: 'Step-by-step application process guidance.',
        icon: 'briefcase',
      },
      {
        id: 'official-scheme-sources',
        title: 'Official Scheme Sources',
        description: 'Links to official government resources.',
        icon: 'globe',
      },
    ],
    ctaLabel: 'Browse Scheme Information',
  },
  'important-links': {
    id: 'important-links',
    title: 'Important Links',
    badge: 'RESOURCES',
    description:
      'Find reliable official information and support resources related to women\'s rights.',
    accentColor: '#EAF0FF',
    highlightIcon: 'link',
    highlightTitle: 'Trusted Information',
    highlightDescription:
      'Verified links to official portals, resources and support services.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'government-portals',
        title: 'Government Portals',
        description: 'Official government websites and portals.',
        icon: 'globe',
      },
      {
        id: 'womens-rights-resources',
        title: "Women's Rights Resources",
        description: 'Reliable organizations and resource centers.',
        icon: 'users',
      },
      {
        id: 'legal-information',
        title: 'Legal Information',
        description: 'Official legal resources and information portals.',
        icon: 'file-text',
      },
      {
        id: 'safety-support-resources',
        title: 'Safety and Support Resources',
        description: 'Helplines and support services (verified sources only).',
        icon: 'shield-check',
      },
      {
        id: 'verified-organizations',
        title: 'Verified Organizations',
        description: 'Trusted NGO and institutional links.',
        icon: 'link',
      },
    ],
    ctaLabel: 'View Verified Links',
  },
  'downloadable-materials': {
    id: 'downloadable-materials',
    title: 'Downloadable Materials',
    badge: 'MATERIALS',
    description:
      'Educational materials available for reading and download.',
    accentColor: '#EAF0FF',
    highlightIcon: 'download',
    highlightTitle: 'Learn and Stay Informed',
    highlightDescription:
      'Guides, reports and educational materials on women\'s rights.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'rights-awareness-guides',
        title: 'Rights Awareness Guides',
        description: 'Informative guides and booklets.',
        icon: 'book-open',
      },
      {
        id: 'safety-information-sheets',
        title: 'Safety Information Sheets',
        description: 'Materials on safety and protection.',
        icon: 'shield-check',
      },
      {
        id: 'workshop-materials',
        title: 'Workshop Materials',
        description: 'Presentations and training resources.',
        icon: 'graduation-cap',
      },
      {
        id: 'government-publications',
        title: 'Government Publications',
        description: 'Official reports and policy documents.',
        icon: 'file-text',
      },
      {
        id: 'educational-booklets',
        title: 'Educational Booklets',
        description: 'Easy-to-read materials on key topics.',
        icon: 'book-open',
      },
    ],
    ctaLabel: 'Browse Materials',
  },
};

export const findResourcePageById = (id: string): ResourcePageContent | undefined =>
  RESOURCE_PAGES[id as ResourcePageId];
