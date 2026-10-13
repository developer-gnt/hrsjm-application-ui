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
  { id: 'call', icon: 'phone', title: 'Call Us', description: 'Get in touch with our team directly.' },
  { id: 'email', icon: 'email', title: 'Email Us', description: 'Send us a message or inquiry.' },
  { id: 'visit', icon: 'map-pin', title: 'Visit Us', description: 'Find our office location on maps.' },
  { id: 'help', icon: 'users', title: 'Get Help', description: 'Report an issue or seek support.' },
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

export interface ContactFaq {
  question: string;
  answer: string;
}

/** Collapsible FAQ items shown on the Contact Us page. */
export const CONTACT_FAQS: ContactFaq[] = [
  {
    question: 'How do I report a human rights violation?',
    answer:
      'You can report a violation using the "Get Help" option on this page or by calling our helpline directly. Our team will assess your case and guide you through the next steps. All reports are handled with strict confidentiality.',
  },
  {
    question: 'What services does HRSJM offer?',
    answer:
      'HRSJM offers legal advice, complaint assistance, community education, advocacy support, and membership services. We work across women\'s rights, children\'s rights, labour rights, and civil liberties to ensure justice for all.',
  },
  {
    question: 'How quickly will you respond to my enquiry?',
    answer:
      'We aim to respond to all enquiries within 24–48 business hours. For urgent matters, please call our helpline directly. Email responses may take slightly longer during peak periods.',
  },
  {
    question: 'Is my personal information kept confidential?',
    answer:
      'Yes. All personal information shared with HRSJM is held in strict confidence under our privacy policy. We do not share your details with any third party without your explicit consent except where required by law.',
  },
  {
    question: 'How can I volunteer or become a member?',
    answer:
      'We welcome volunteers and members who share our mission. You can get in touch via the form on this page, email us at info@hrsjm.org, or visit us at our office. Our team will guide you through the onboarding process.',
  },
  {
    question: 'Can I donate to support HRSJM\'s work?',
    answer:
      'Yes. HRSJM is a registered non-profit organisation and gratefully accepts donations. Please email donations@hrsjm.org or contact us via this page for details on how to contribute.',
  },
];

