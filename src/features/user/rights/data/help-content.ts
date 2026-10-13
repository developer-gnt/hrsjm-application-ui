/**
 * Content for the two "Get Help & Support" detail pages:
 *   - 'legal-help'      → Legal Support
 *   - 'community-help'  → Community Support
 *
 * IDs match helpOptions in rights-content.ts.
 */
import type { IconName } from '../../components/icons';

export type HelpPageId = 'legal-help' | 'community-help';

export interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface HelpPageContent {
  id: HelpPageId;
  title: string;
  badge: string;
  description: string;
  /** Hero/highlight accent colour (tint background). */
  accentColor: string;
  /** Hero icon colour. */
  iconTint: string;
  highlightIcon: IconName;
  highlightTitle: string;
  highlightDescription: string;
  sectionHeading: string;
  items: HelpItem[];
  ctaLabel: string;
}

const HELP_PAGES: Record<HelpPageId, HelpPageContent> = {
  'legal-help': {
    id: 'legal-help',
    title: 'Legal Support',
    badge: 'LEGAL SUPPORT',
    description:
      'Get guidance from legal experts. Understand your rights and how to access legal assistance.',
    accentColor: '#FFF0C7',
    iconTint: '#D9A514',
    highlightIcon: 'scale',
    highlightTitle: 'Access to Legal Guidance',
    highlightDescription:
      'Understand your options and take informed steps towards justice.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'understanding-rights',
        title: 'Understanding Your Legal Rights',
        description: 'Learn about the legal rights available to you.',
        icon: 'file-text',
      },
      {
        id: 'finding-legal-aid',
        title: 'Finding Legal Aid',
        description: 'Information on free and subsidised legal aid services.',
        icon: 'briefcase',
      },
      {
        id: 'legal-consultation',
        title: 'Preparing for a Legal Consultation',
        description: 'Tips on what to prepare before meeting a lawyer.',
        icon: 'scale',
      },
      {
        id: 'filing-complaint',
        title: 'Filing a Formal Complaint',
        description: 'Guidance on how to file rights violations formally.',
        icon: 'shield-check',
      },
      {
        id: 'legal-resources',
        title: 'Additional Legal Resources',
        description: 'Verified links and resources for legal information.',
        icon: 'globe',
      },
    ],
    ctaLabel: 'Explore Legal Guidance',
  },

  'community-help': {
    id: 'community-help',
    title: 'Community Support',
    badge: 'COMMUNITY SUPPORT',
    description:
      'Connect with support groups and local networks. You are not alone — community is here.',
    accentColor: '#E9F5F0',
    iconTint: '#10A673',
    highlightIcon: 'users',
    highlightTitle: 'Stronger Together',
    highlightDescription:
      'Building safe, supportive networks for women in our communities.',
    sectionHeading: "What You'll Find",
    items: [
      {
        id: 'support-groups',
        title: 'Support Groups',
        description: 'Connect with women-led support groups near you.',
        icon: 'users',
      },
      {
        id: 'safe-spaces',
        title: 'Safe Spaces',
        description: 'Information on safe shelters and spaces for women.',
        icon: 'shield-check',
      },
      {
        id: 'counselling-services',
        title: 'Counselling Services',
        description: 'Access to emotional and psychological support services.',
        icon: 'heart-pulse',
      },
      {
        id: 'community-events',
        title: 'Community Events',
        description: 'Upcoming events, workshops and gatherings.',
        icon: 'megaphone',
      },
      {
        id: 'volunteer-networks',
        title: 'Volunteer Networks',
        description: 'Get involved and support your community.',
        icon: 'users',
      },
    ],
    ctaLabel: 'Find Community Support',
  },
};

export const findHelpPageById = (id: string): HelpPageContent | undefined => {
  if (id === 'legal-support') return HELP_PAGES['legal-help'];
  if (id === 'community-support') return HELP_PAGES['community-help'];
  return HELP_PAGES[id as HelpPageId];
};
