/**
 * PREVIEW DATA ONLY — static content copied from the approved Home reference
 * so the UI can be reviewed without a backend. This file is intentionally
 * isolated: replace every consumer with real API-backed hooks in the
 * backend-integration phase. Do NOT wire this into src/core/api.
 */

import type {
  DonationContent,
  HomeEvent,
  HomeNewsItem,
  HomeQuickAction,
  HomeRecommendation,
  HomeTab,
  MemberActivity,
  MemberGreeting,
  MembershipPreview,
  RightsCategory,
} from '../types/home.types';

export const GUEST_QUICK_ACTIONS: HomeQuickAction[] = [
  { id: 'join', label: 'Join HRSJM', icon: 'users', emphasized: true },
  { id: 'complaint', label: 'File a Complaint', icon: 'file-text' },
  { id: 'donate', label: 'Donate Now', icon: 'heart' },
  { id: 'renew', label: 'Renew Membership', icon: 'refresh' },
];

export const MEMBER_QUICK_ACTIONS: HomeQuickAction[] = [
  { id: 'complaint', label: 'File a Complaint', icon: 'file-text' },
  { id: 'donate', label: 'Donate Now', icon: 'heart' },
  { id: 'renew', label: 'Renew Membership', icon: 'refresh' },
  { id: 'events', label: 'Events & Activities', icon: 'calendar' },
];

export const ABOUT_DESCRIPTION =
  'Human Rights & Social Justice Mission (HRSJM) works for human rights, dignity, equality and social justice through awareness, advocacy, education and community support.';

export const RIGHTS_CATEGORIES: RightsCategory[] = [
  { id: 'human-rights', title: 'Human Rights', icon: 'scale' },
  { id: 'womens-rights', title: "Women's Rights", icon: 'users' },
  {
    id: 'right-to-education',
    title: 'Right to Education',
    icon: 'graduation-cap',
  },
  { id: 'childrens-rights', title: "Children's Rights", icon: 'child-care' },
];

export const WHAT_WE_DO_ITEMS: RightsCategory[] = [
  { id: 'awareness', title: 'Awareness Campaigns', icon: 'megaphone' },
  { id: 'workshops', title: 'Workshops & Training', icon: 'users' },
  { id: 'research', title: 'Research & Education', icon: 'doc-search' },
  { id: 'community', title: 'Community Activities', icon: 'heart-hands' },
];

export const UPCOMING_EVENTS: HomeEvent[] = [
  {
    id: 'event-1',
    title: 'Human Rights Awareness Workshop',
    day: '25',
    month: 'OCT',
    location: 'Mumbai, Maharashtra',
    imageAssetName: 'home/events/rights-workshop.png',
  },
  {
    id: 'event-2',
    title: 'Community Legal Awareness Camp',
    day: '12',
    month: 'NOV',
    location: 'Pune, Maharashtra',
    imageAssetName: 'home/events/legal-camp.png',
  },
  {
    id: 'event-3',
    title: 'Youth Rights Convention',
    day: '18',
    month: 'DEC',
    location: 'Nagpur, Maharashtra',
    imageAssetName: 'home/events/youth-convention.png',
  },
];

export const LATEST_NEWS: HomeNewsItem[] = [
  {
    id: 'news-1',
    category: 'LEGAL RIGHTS',
    title: 'HRSJM Raises Awareness on Citizen Rights and Legal Support',
    date: '20 Sep 2026',
    imageAssetName: 'home/news/legal-awareness.png',
  },
];

export const MEMBER_GREETING: MemberGreeting = {
  salutation: 'Assalamu Alaikum,',
  memberName: 'Mohd. Ayaan Shaikh',
  initials: 'MA',
  badgeLabel: 'Member',
};

export const MEMBERSHIP_PREVIEW: MembershipPreview = {
  memberName: 'Mohd. Ayaan Shaikh',
  memberId: 'HRSJM2026001234',
  validTill: '31 Dec 2027',
};

export const MEMBER_ACTIVITIES: MemberActivity[] = [
  {
    id: 'complaints',
    icon: 'file-text',
    value: '2',
    label: 'Complaints Submitted',
    tone: 'green',
  },
  {
    id: 'events',
    icon: 'calendar',
    value: '1',
    label: 'Event Registered',
    tone: 'blue',
  },
  {
    id: 'membership',
    icon: 'user',
    value: 'Active',
    label: 'Membership',
    tone: 'amber',
  },
  {
    id: 'certificates',
    icon: 'medal',
    value: '3',
    label: 'Certificates',
    tone: 'purple',
  },
];

export const RECOMMENDATIONS: HomeRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Upcoming Workshop on Legal Awareness',
    date: '25 Oct 2026',
    location: 'Mumbai',
    imageAssetName: 'home/recommendations/legal-workshop.png',
  },
  {
    id: 'rec-2',
    title: 'Support Education Initiatives',
    description: 'Help us empower underprivileged children.',
    imageAssetName: 'home/recommendations/education.png',
  },
  {
    id: 'rec-3',
    title: 'Renew Your Membership',
    description: 'Continue your support for a just society.',
    imageAssetName: 'home/recommendations/renewal.png',
  },
];

export const LATEST_UPDATES: HomeNewsItem[] = [
  {
    id: 'update-1',
    category: 'LEGAL RIGHTS',
    title: 'HRSJM Submitted Memorandum on Citizen Rights Protection',
    date: '20 Sep 2026',
    imageAssetName: 'home/updates/memorandum.png',
  },
  {
    id: 'update-2',
    category: 'EVENTS',
    title: 'Community Awareness Program Conducted in Pune',
    date: '18 Sep 2026',
    imageAssetName: 'home/updates/community-program.png',
  },
];

export const DONATION_CONTENT: DonationContent = {
  headline: "Let's Build a Fairer,\nMore Inclusive Society.",
  description:
    'Your support helps us protect rights, create awareness and bring real change.',
  ctaLabel: 'Make a Donation',
};

/**
 * Single source of truth for the User App bottom navigation: six tabs —
 * Home · About · Rights · Events · News · Contact — shared by every User
 * screen (Home, Contact, ...) with the active tab set per screen.
 */
export const USER_TABS: HomeTab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'about', label: 'About', icon: 'file-text' },
  { id: 'rights', label: 'Rights', icon: 'scale' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'news', label: 'News', icon: 'news' },
  { id: 'contact', label: 'Contact', icon: 'user' },
];

export const MEMBER_TABS: HomeTab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'complaints', label: 'Complaints', icon: 'file-text' },
  { id: 'donate', label: 'Donate', icon: 'heart' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];
