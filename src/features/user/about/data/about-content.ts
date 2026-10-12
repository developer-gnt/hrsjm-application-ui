import type { AboutContent } from '../types/about.types';

export const ABOUT_CONTENT: AboutContent = {
  hero: {
    eyebrow: 'OUR PURPOSE',
    titleLine: 'About',
    titleAccentLine: 'HRSJM',
    description:
      'Advancing human rights, dignity and social justice for every community.',
    imageAssetName: 'assets/images/about-hero-community.png',
  },
  principles: [
    {
      id: 'dignity',
      title: 'Human Dignity',
      description: 'Every individual matters.',
      icon: 'users',
    },
    {
      id: 'equality',
      title: 'Equal Rights',
      description: 'Fair opportunities for all.',
      icon: 'scale',
    },
    {
      id: 'justice',
      title: 'Social Justice',
      description: 'Stronger, more inclusive communities.',
      icon: 'heart-hands',
    },
  ],
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
      title: 'Workshops &\nTraining',
      description: 'Build knowledge and skills for stronger communities.',
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
      title: 'Advocacy &\nAwareness',
      description: 'Engage with institutions and stakeholders.',
      icon: 'megaphone',
    },
    {
      id: 'research',
      title: 'Research &\nRights Education',
      description: 'Research, publish and educate on human rights.',
      icon: 'doc-search',
    },
    {
      id: 'legal',
      title: 'Legal Rights\nAwareness',
      description: 'Provide information and guidance on legal rights and support.',
      icon: 'scale',
    },
    {
      id: 'other',
      title: 'Other Work Areas',
      description: 'Education, healthcare, women and child welfare, and more.',
      icon: 'heart',
    },
  ],
  approach: {
    title: 'Our Approach',
    description: 'A people-centred and collaborative process',
    steps: [
      {
        id: 'listen',
        title: 'Listen',
        description: "Understand people's concerns.",
        icon: 'ear',
      },
      {
        id: 'document',
        title: 'Document',
        description: 'Gather facts and evidence.',
        icon: 'file-text',
      },
      {
        id: 'support',
        title: 'Support',
        description: 'Provide guidance and connect resources.',
        icon: 'heart-hands',
      },
      {
        id: 'advocate',
        title: 'Advocate',
        description: 'Engage stakeholders for real change.',
        icon: 'megaphone',
      },
    ],
  },
  impact: {
    title: 'Our Impact',
    description: 'Building stronger, fairer and more inclusive communities',
    stats: [
      {
        id: 'communities',
        value: '—',
        label: 'Communities Reached',
        icon: 'users',
      },
      {
        id: 'people',
        value: '—',
        label: 'People Supported',
        icon: 'users',
      },
      {
        id: 'rights-issues',
        value: '—',
        label: 'Rights Issues Documented',
        icon: 'file-text',
      },
    ],
  },
  finalCta: {
    headingLine: 'Together for',
    headingAccentLine: 'Real Change',
    supporting: 'People. Rights. Justice. Dignity.',
    buttonLabel: 'Join the Movement',
    imageAssetName: 'assets/images/contact-cta-hands.jpg',
  },
};
