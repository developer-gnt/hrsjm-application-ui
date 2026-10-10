/**
 * Contact feature content — static UI copy and tab configuration from the
 * approved reference. Form submission itself is wired to the backend in a
 * later phase (no fake API).
 */

import type {
  ContactAction,
  ContactDetailCard,
  ContactTab,
} from '../types/contact.types';

export const CONTACT_ACTIONS: ContactAction[] = [
  { id: 'call', icon: 'phone', title: 'Call Us', description: 'Get in touch\ndirectly' },
  { id: 'email', icon: 'email', title: 'Email Us', description: 'Send us\na message' },
  { id: 'visit', icon: 'map-pin', title: 'Visit Us', description: 'Our office\naddress' },
  { id: 'help', icon: 'users', title: 'Get Help', description: 'Report an issue\nor seek support' },
];

/**
 * Six-tab bottom navigation for the Contact page (reference-locked):
 * Home · About · Rights · Events · News · Contact — Contact active in gold.
 */
export const CONTACT_TABS: ContactTab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'about', label: 'About', icon: 'file-text' },
  { id: 'rights', label: 'Rights', icon: 'scale' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'news', label: 'News', icon: 'news' },
  { id: 'contact', label: 'Contact', icon: 'user' },
];

/** UI-only dropdown options for the Subject field. */
export const CONTACT_SUBJECT_OPTIONS = [
  'General Inquiry',
  'Membership Support',
  'Complaint Assistance',
  'Donations',
  'Partnership / Collaboration',
  'Other',
];

/** "Our Contact Details" 2x2 grid content (Home contact section). */
export const CONTACT_DETAIL_CARDS: ContactDetailCard[] = [
  {
    id: 'phone',
    icon: 'phone',
    title: 'Phone',
    lines: ['+91 22 1234 5678', '+91 98765 43210', 'Mon - Fri, 10:00 AM - 6:00 PM'],
  },
  {
    id: 'email',
    icon: 'email',
    title: 'Email',
    lines: ['info@hrsjm.org', 'support@hrsjm.org', 'We usually respond within 24–48 hours.'],
  },
  {
    id: 'address',
    icon: 'map-pin',
    title: 'Office Address',
    lines: ['HRSJM', '123 Justice Lane, Kurla (W)', 'Mumbai, Maharashtra', '400070, India'],
    linkLabel: 'View on Maps',
  },
  {
    id: 'hours',
    icon: 'clock',
    title: 'Working Hours',
    lines: [
      'Monday - Friday',
      '10:00 AM - 6:00 PM',
      'Saturday',
      '10:00 AM - 2:00 PM',
      'Sunday',
      'Closed',
    ],
  },
];

export const CONTACT_DETAILS_SUBTITLE =
  'Reach out to us through any of the following channels.';

export const CONTACT_FINAL_CTA = {
  headline: 'Together for a\nMore Just Society',
  description:
    "Your voice matters. Let's work together to protect rights, empower communities and create positive change.",
};
