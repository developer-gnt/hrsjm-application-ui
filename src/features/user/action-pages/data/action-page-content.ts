import type { ActionPageContent, ActionPageId } from '../types/action-page.types';

const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');
const SOLIDARITY_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');
const HOME_IMAGE = require('../../../../assets/images/hero-home.webp');

export const ACTION_PAGE_CONTENT: Record<ActionPageId, ActionPageContent> = {
  join: {
    title: 'Join HRSJM',
    description:
      'Be a part of our mission for human rights, justice and dignity. Together we can create stronger, safer and more inclusive communities.',
    heroImage: COMMUNITY_IMAGE,
    overviewTitle: 'Why Join HRSJM?',
    overviewDescription:
      'By joining HRSJM, you can become part of a community working towards awareness, education and positive change in society.',
    cardsTitle: 'Key Benefits',
    cards: [
      {
        title: 'Be Part of a Larger Mission',
        description: 'Work towards human rights and social justice.',
        icon: 'users',
      },
      {
        title: 'Access Learning Resources',
        description: 'Stay informed and develop your knowledge.',
        icon: 'book-open',
      },
      {
        title: 'Participate in Initiatives',
        description: 'Explore approved programmes and activities.',
        icon: 'heart-hands',
      },
      {
        title: 'Make a Positive Impact',
        description: 'Contribute to stronger communities.',
        icon: 'heart',
      },
    ],
    ctaTitle: 'Join HRSJM Today',
    ctaDescription: 'Take the next step towards learning about membership.',
    ctaLabel: 'Apply for Membership',
    ctaImage: SOLIDARITY_IMAGE,
  },
  donate: {
    title: 'Donate Now',
    description:
      'Your support can help advance human rights, education and stronger communities.',
    heroImage: HOME_IMAGE,
    overviewTitle: 'Your Contribution Creates Change',
    overviewDescription:
      'Every contribution can support efforts towards awareness, education and community initiatives. Please review the available donation information before proceeding.',
    cardsTitle: 'Where Your Donation Helps',
    cards: [
      {
        title: 'Awareness & Education',
        description: 'Support learning initiatives and awareness.',
        icon: 'book-open',
      },
      {
        title: 'Community Activities',
        description: 'Support approved outreach and community programmes.',
        icon: 'users',
      },
      {
        title: 'Rights Awareness',
        description: 'Help people access human-rights information.',
        icon: 'scale',
      },
      {
        title: 'Programmes & Initiatives',
        description: 'Support approved activities and initiatives.',
        icon: 'heart',
      },
    ],
    ctaTitle: 'Together We Create Change',
    ctaDescription:
      'Your support can contribute to stronger and more inclusive communities.',
    ctaLabel: 'Donate Now',
    ctaImage: SOLIDARITY_IMAGE,
  },
  membership: {
    title: 'I Want to Become a Member',
    description:
      'Join as a member and support our mission for human rights, justice and dignity.',
    heroImage: COMMUNITY_IMAGE,
    overviewTitle: 'Membership Overview',
    overviewDescription:
      'Membership information helps individuals understand available membership options and the process for applying to HRSJM.',
    cardsTitle: 'Membership Benefits',
    cards: [
      {
        title: 'Access Learning Resources',
        description: 'Explore relevant educational material.',
        icon: 'book-open',
      },
      {
        title: 'Participate in Community Activities',
        description: 'Learn about approved opportunities.',
        icon: 'users',
      },
      {
        title: 'Be Part of a Supportive Network',
        description: 'Connect with people interested in social justice.',
        icon: 'heart-hands',
      },
      {
        title: 'Contribute to Positive Change',
        description: 'Explore ways to participate constructively.',
        icon: 'heart',
      },
    ],
    ctaTitle: 'Start Your Membership Journey',
    ctaDescription: 'Explore membership and application information.',
    ctaLabel: 'Become a Member',
    ctaImage: COMMUNITY_IMAGE,
  },
};

export const MEMBERSHIP_CATEGORIES = [
  {
    title: 'Regular Member',
    description: 'For individuals interested in participating in HRSJM initiatives.',
    icon: 'user',
  },
  {
    title: 'Student Member',
    description: 'For students interested in learning and contributing to social awareness.',
    icon: 'graduation-cap',
  },
  {
    title: 'Volunteer Member',
    description: 'For individuals interested in contributing time and skills to approved activities.',
    icon: 'users',
  },
] as const;

export const JOIN_STEPS = [
  {
    title: 'Fill the Application',
    description: 'Complete the membership application form.',
  },
  {
    title: 'Submit Required Details',
    description:
      'Provide the information and documents requested by the existing membership process.',
  },
  {
    title: 'Get Confirmation',
    description: 'Follow the existing application status and confirmation process.',
  },
] as const;
