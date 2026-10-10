import type { ImageSourcePropType } from 'react-native';

const EVENT_PHOTO = require('../../../../assets/images/about-hero-community.png');
const EVENT_LEGAL_PHOTO = require('../../../../assets/images/event-legal-awareness.jpg');

export type UserEventCategory = 'Workshop' | 'Awareness' | 'Community' | 'Education';

export interface UserEvent {
  id: string;
  title: string;
  category: UserEventCategory;
  tag: string;
  day: string;
  month: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  description: string;
  topics: string[];
  image: ImageSourcePropType;
}

export const USER_EVENTS: UserEvent[] = [
  {
    id: 'legal-awareness-workshop',
    title: 'Legal Awareness Workshop for Citizens',
    category: 'Workshop',
    tag: 'Legal Awareness',
    day: '18',
    month: 'Oct',
    date: '18 Oct 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Mumbai, Maharashtra',
    venue: 'HRSJM Community Hall',
    description:
      'An interactive session to create awareness about fundamental rights, legal protections and practical steps to seek justice.',
    topics: [
      'Overview of Fundamental Rights',
      'Legal Protection and Support',
      'Filing a Complaint – Process and Guidance',
      'Real-life Case Studies',
      'Q&A with Experts',
    ],
    image: EVENT_LEGAL_PHOTO,
  },
  {
    id: 'womens-rights-program',
    title: 'Women’s Rights and Safety Awareness Program',
    category: 'Awareness',
    tag: 'Women’s Rights',
    day: '12',
    month: 'NOV',
    date: '12 Nov 2026',
    time: '11:00 AM – 2:00 PM',
    location: 'Pune, Maharashtra',
    venue: 'Community Learning Centre',
    description:
      'A community program focused on women’s rights, personal safety and practical ways to access support.',
    topics: [
      'Know Your Rights',
      'Safety and Support Resources',
      'Accessing Legal Help',
      'Community Support Networks',
    ],
    image: EVENT_PHOTO,
  },
  {
    id: 'community-outreach-drive',
    title: 'Community Outreach Drive',
    category: 'Community',
    tag: 'Field Activity',
    day: '05',
    month: 'DEC',
    date: '05 Dec 2026',
    time: '9:00 AM – 12:00 PM',
    location: 'Navi Mumbai, Maharashtra',
    venue: 'HRSJM Community Centre',
    description:
      'Join local volunteers for a community outreach activity connecting residents with essential rights and resources.',
    topics: [
      'Community Rights Awareness',
      'Local Support Services',
      'Volunteer Activities',
      'Community Q&A',
    ],
    image: EVENT_PHOTO,
  },
  {
    id: 'education-awareness-session',
    title: 'Right to Education – Student Awareness Session',
    category: 'Education',
    tag: 'Children’s Rights',
    day: '18',
    month: 'DEC',
    date: '18 Dec 2026',
    time: '10:00 AM – 12:00 PM',
    location: 'Thane, Maharashtra',
    venue: 'HRSJM Learning Centre',
    description:
      'An awareness session for students and families on the right to education and available learning support.',
    topics: [
      'Right to Education',
      'Access to Learning Support',
      'Student Safety',
      'Guidance for Families',
    ],
    image: EVENT_PHOTO,
  },
];

export const USER_EVENT_CATEGORIES: Array<'All' | 'Upcoming' | UserEventCategory> = [
  'All',
  'Upcoming',
  'Workshop',
  'Awareness',
  'Community',
];
