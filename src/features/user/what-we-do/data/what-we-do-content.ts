import type { WhatWeDoContent, WhatWeDoId } from '../types/what-we-do.types';

const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');
const SOLIDARITY_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');
const ORGANIZATION_IMAGE = require('../../../../assets/images/contact-hero-building.jpg');
const HOME_IMAGE = require('../../../../assets/images/hero-home.webp');

export const WHAT_WE_DO_CONTENT: Record<WhatWeDoId, WhatWeDoContent> = {
  'awareness-campaigns': {
    id: 'awareness-campaigns',
    title: 'Awareness Campaigns',
    heroDescription:
      'Building awareness of human rights, equality and social justice through community education and public engagement.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'We conduct awareness initiatives to help people understand their rights, available support and ways to participate in social change.',
    activities: [
      {
        title: 'Rights Awareness Drives',
        description: 'Community sessions and public outreach.',
        icon: 'megaphone',
      },
      {
        title: 'Community Outreach',
        description: 'Engage with local communities.',
        icon: 'users',
      },
      {
        title: 'Public Education',
        description: 'Educational materials and campaigns.',
        icon: 'file-text',
      },
      {
        title: 'Digital Awareness',
        description: 'Online awareness and information sharing.',
        icon: 'share',
      },
    ],
    whyItMatters:
      'Awareness helps people recognise rights concerns, find relevant information and make informed decisions.',
    whyIcon: 'shield-check',
    participationItems: [
      { text: 'Attend awareness sessions.', icon: 'users' },
      { text: 'Share verified educational resources.', icon: 'share' },
      {
        text: 'Volunteer for approved outreach activities.',
        icon: 'open-hand',
      },
    ],
    ctaTitle: 'Help Spread Awareness',
    ctaButtonLabel: 'Join the Movement',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
  'workshops-training': {
    id: 'workshops-training',
    title: 'Workshops & Training',
    heroDescription:
      'Creating opportunities to learn, develop practical skills and strengthen community participation.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'Our workshops and training sessions provide opportunities for rights education, skill-building and constructive community engagement.',
    activities: [
      {
        title: 'Human Rights Workshops',
        description: 'Sessions on rights, laws and social issues.',
        icon: 'users',
      },
      {
        title: 'Community Training',
        description: 'Skill-building for stronger communities.',
        icon: 'graduation-cap',
      },
      {
        title: 'Youth Leadership',
        description: 'Develop young community leaders.',
        icon: 'child-care',
      },
      {
        title: 'Awareness Sessions',
        description: 'Interactive learning and discussions.',
        icon: 'book-open',
      },
    ],
    whyItMatters:
      'Learning can help people understand rights, build confidence and participate more effectively in their communities.',
    whyIcon: 'bulb',
    participationItems: [
      { text: 'Join relevant learning sessions.', icon: 'book-open' },
      {
        text: 'Participate in approved training programmes.',
        icon: 'graduation-cap',
      },
      {
        text: 'Share learning opportunities with your community.',
        icon: 'share',
      },
    ],
    ctaTitle: 'Learn and Participate',
    ctaButtonLabel: 'Get Involved',
    ctaImage: COMMUNITY_IMAGE,
    ctaDestination: 'contact',
  },
  'research-education': {
    id: 'research-education',
    title: 'Research & Education',
    heroDescription:
      'Supporting informed action through research, documentation and accessible human-rights education.',
    heroImage: ORGANIZATION_IMAGE,
    overview:
      'We support research and educational resources to help people understand human-rights-related issues and access reliable information.',
    activities: [
      {
        title: 'Rights Education',
        description: 'Educational content on human rights.',
        icon: 'file-text',
      },
      {
        title: 'Research & Documentation',
        description: 'Collect and analyse information.',
        icon: 'doc-search',
      },
      {
        title: 'Learning Resources',
        description: 'Guides, resources and materials.',
        icon: 'book-open',
      },
      {
        title: 'Reports & Publications',
        description: 'Research reports and insights.',
        icon: 'news',
      },
    ],
    whyItMatters:
      'Reliable information helps people better understand social issues and make informed decisions.',
    whyIcon: 'doc-search',
    participationItems: [
      { text: 'Explore available learning resources.', icon: 'book-open' },
      { text: 'Read approved publications.', icon: 'file-text' },
      {
        text: 'Contribute information through established HRSJM channels where available.',
        icon: 'message',
      },
    ],
    ctaTitle: 'Explore Rights Education',
    ctaButtonLabel: 'Learn More',
    ctaImage: HOME_IMAGE,
    ctaDestination: 'rights',
  },
  'community-activities': {
    id: 'community-activities',
    title: 'Community Activities',
    heroDescription:
      "Encouraging local participation, community engagement and initiatives that respond to people's needs.",
    heroImage: COMMUNITY_IMAGE,
    overview:
      'We support community engagement that encourages local participation, helps people connect and creates opportunities to address community needs.',
    activities: [
      {
        title: 'Community Outreach',
        description: 'Engage with local communities.',
        icon: 'users',
      },
      {
        title: 'Local Initiatives',
        description: 'Support local participation.',
        icon: 'map-pin',
      },
      {
        title: 'Volunteer Participation',
        description: 'Opportunities to get involved.',
        icon: 'heart-hands',
      },
      {
        title: 'Community Support',
        description: 'Collaborate on community needs.',
        icon: 'handshake',
      },
    ],
    whyItMatters:
      'Community participation helps people connect, share concerns and work together on local priorities.',
    whyIcon: 'users',
    participationItems: [
      {
        text: 'Participate in approved community activities.',
        icon: 'users',
      },
      { text: 'Explore existing volunteer opportunities.', icon: 'open-hand' },
      {
        text: 'Contact HRSJM through existing channels for information.',
        icon: 'message',
      },
    ],
    ctaTitle: 'Join the Community',
    ctaButtonLabel: 'Get Involved',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
};

export const getWhatWeDoContent = (
  contentId: WhatWeDoId,
): WhatWeDoContent => WHAT_WE_DO_CONTENT[contentId];
