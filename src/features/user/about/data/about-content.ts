import type { AboutContent } from '../types/about.types';

/**
 * Reference-locked About page content ("What HRSJM Does"). Preview-static
 * until the backend integration phase; icons use the shared User glyph set.
 */
export const ABOUT_CONTENT: AboutContent = {
  hero: {
    titleLine: 'What',
    titleAccentLine: 'HRSJM Does',
    description:
      'We work on multiple fronts to protect human rights, promote social justice and support marginalised communities across India.',
    imageAssetName: 'assets/images/about-hero-community.png',
  },
  workAreas: [
    {
      id: 'monitoring',
      title: 'Human-rights\nMonitoring',
      description: 'Track, document and highlight rights violations.',
      icon: 'eye',
    },
    {
      id: 'awareness',
      title: 'Awareness\nCampaigns',
      description: 'Create awareness on rights, laws and social issues.',
      icon: 'megaphone',
    },
    {
      id: 'workshops',
      title: 'Workshops\nand Training',
      description: 'Conduct programs to build knowledge and skills.',
      icon: 'users',
    },
    {
      id: 'community',
      title: 'Community\nActivities',
      description: 'Run local initiatives to support people in need.',
      icon: 'heart-hands',
    },
    {
      id: 'leadership',
      title: 'Leadership\nDevelopment',
      description: 'Empower youth and community leaders.',
      icon: 'graduation-cap',
    },
    {
      id: 'advocacy',
      title: 'Advocacy and\nAwareness Work',
      description: 'Engage with authorities and stakeholders.',
      icon: 'handshake',
    },
    {
      id: 'research',
      title: 'Research and\nRights Education',
      description: 'Research, publish and educate on human rights.',
      icon: 'doc-search',
    },
    {
      id: 'legal',
      title: 'Legal / Right-\nAwareness Work',
      description: 'Provide legal support and awareness on rights and remedies.',
      icon: 'scale',
    },
    {
      id: 'other',
      title: 'Other Work Areas',
      description:
        'Education, healthcare, women & child welfare, senior citizens, minority, tribal and labour-related activities.',
      icon: 'heart',
    },
  ],
  finalCta: {
    headingLine: 'Together for',
    headingAccentLine: 'Real Change',
    supporting: 'People. Rights. Justice. Dignity.',
    buttonLabel: 'Join the Movement',
    imageAssetName: 'assets/images/contact-cta-hands.jpg',
  },
};
