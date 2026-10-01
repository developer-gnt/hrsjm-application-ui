/**
 * TEMPORARY UI SAMPLE DATA — NOT AN API. NOT FAKE ENDPOINTS.
 *
 * This file exists only so the Events list screen can be rendered and reviewed
 * during the UI-only phase (Phase 1 of the Suraj content scope). Every value
 * here is display-only demonstration data rendered by local components.
 *
 * REPLACE WITH: the real events feature service/hooks (events.service.ts +
 * useEvents.ts) once the backend contract for the Events module is confirmed
 * (spec Phase 0 / section 60). Delete this file at that point.
 */
import type { EventListItem } from '../types/events.types';

/** Demo cover images only; will be replaced by the backend asset URL flow (spec section 26). */
const demoCoverImage = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/400/300`;

const SAMPLE_EVENT_BASE: EventListItem[] = [
  // --- Upcoming (6) ---
  {
    id: 'e-01',
    title: 'Human Rights Awareness Seminar',
    category: 'Seminar',
    location: 'Kurla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-01'),
    startAt: '2026-10-15T10:00:00',
    endAt: '2026-10-15T13:00:00',
    organizer: 'HRSJM Awareness Team',
    registrations: 120,
    capacity: 150,
    status: 'UPCOMING',
  },
  {
    id: 'e-02',
    title: 'Food Distribution Drive',
    category: 'Relief Activity',
    location: 'Govandi, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-02'),
    startAt: '2026-10-10T09:00:00',
    endAt: '2026-10-10T12:00:00',
    organizer: 'HRSJM Relief Team',
    registrations: 85,
    capacity: 100,
    status: 'UPCOMING',
  },
  {
    id: 'e-03',
    title: 'Legal Awareness Camp',
    category: 'Awareness Camp',
    location: 'Mankhurd, Kurla',
    coverImageUrl: demoCoverImage('hrsjm-event-03'),
    startAt: '2026-09-28T11:00:00',
    endAt: '2026-09-28T14:00:00',
    organizer: 'HRSJM Legal Team',
    registrations: 60,
    capacity: 80,
    status: 'UPCOMING',
  },
  {
    id: 'e-04',
    title: 'Free Medical Checkup Camp',
    category: 'Health Camp',
    location: 'Dharavi, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-04'),
    startAt: '2026-10-08T09:00:00',
    endAt: '2026-10-08T16:00:00',
    organizer: 'HRSJM Health Team',
    registrations: 95,
    capacity: 200,
    status: 'UPCOMING',
  },
  {
    id: 'e-05',
    title: 'Child Education Support Drive',
    category: 'Community Service',
    location: 'Wadala, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-05'),
    startAt: '2026-10-05T08:00:00',
    endAt: '2026-10-05T12:00:00',
    organizer: 'HRSJM Education Team',
    registrations: 40,
    capacity: 60,
    status: 'UPCOMING',
  },
  {
    id: 'e-06',
    title: 'Senior Citizen Care Workshop',
    category: 'Workshop',
    location: 'Dadar, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-06'),
    startAt: '2026-10-22T10:00:00',
    endAt: '2026-10-22T13:00:00',
    organizer: 'HRSJM Care Team',
    registrations: 30,
    capacity: 50,
    status: 'UPCOMING',
  },

  // --- Completed (14) ---
  {
    id: 'e-07',
    title: 'Women Empowerment Workshop',
    category: 'Workshop',
    location: 'Byculla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-07'),
    startAt: '2026-09-12T10:00:00',
    endAt: '2026-09-12T13:00:00',
    organizer: 'HRSJM Women Welfare Team',
    registrations: 75,
    capacity: 100,
    status: 'COMPLETED',
  },
  {
    id: 'e-08',
    title: 'Environmental Clean Up',
    category: 'Community Service',
    location: 'Sion, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-08'),
    startAt: '2026-09-02T08:00:00',
    endAt: '2026-09-02T11:00:00',
    organizer: 'HRSJM Environment Team',
    registrations: 50,
    capacity: 60,
    status: 'COMPLETED',
  },
  {
    id: 'e-09',
    title: 'Blood Donation Camp',
    category: 'Health Camp',
    location: 'Kurla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-09'),
    startAt: '2026-08-20T09:00:00',
    endAt: '2026-08-20T15:00:00',
    organizer: 'HRSJM Health Team',
    registrations: 110,
    capacity: 120,
    status: 'COMPLETED',
  },
  {
    id: 'e-10',
    title: 'Fundraising Gala',
    category: 'Fundraising',
    location: 'South Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-10'),
    startAt: '2026-07-25T18:00:00',
    endAt: '2026-07-25T22:00:00',
    organizer: 'HRSJM Fundraising Team',
    registrations: 200,
    capacity: 250,
    status: 'COMPLETED',
  },
  {
    id: 'e-11',
    title: 'Legal Aid Camp for Tenants',
    category: 'Awareness Camp',
    location: 'Chembur, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-11'),
    startAt: '2026-07-18T10:00:00',
    endAt: '2026-07-18T14:00:00',
    organizer: 'HRSJM Legal Team',
    registrations: 65,
    capacity: 90,
    status: 'COMPLETED',
  },
  {
    id: 'e-12',
    title: 'Skill Development Training',
    category: 'Training Program',
    location: 'Kurla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-12'),
    startAt: '2026-07-10T11:00:00',
    endAt: '2026-07-10T15:00:00',
    organizer: 'HRSJM Skill Team',
    registrations: 80,
    capacity: 100,
    status: 'COMPLETED',
  },
  {
    id: 'e-13',
    title: 'Monsoon Relief Kit Distribution',
    category: 'Relief Activity',
    location: 'Mankhurd, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-13'),
    startAt: '2026-07-02T09:00:00',
    endAt: '2026-07-02T13:00:00',
    organizer: 'HRSJM Relief Team',
    registrations: 150,
    capacity: 150,
    status: 'COMPLETED',
  },
  {
    id: 'e-14',
    title: 'Anti-Ragging Awareness Session',
    category: 'Seminar',
    location: 'Sion, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-14'),
    startAt: '2026-06-25T10:00:00',
    endAt: '2026-06-25T12:00:00',
    organizer: 'HRSJM Awareness Team',
    registrations: 90,
    capacity: 120,
    status: 'COMPLETED',
  },
  {
    id: 'e-15',
    title: 'Tree Plantation Drive',
    category: 'Community Service',
    location: 'Bhandup, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-15'),
    startAt: '2026-06-20T07:00:00',
    endAt: '2026-06-20T11:00:00',
    organizer: 'HRSJM Environment Team',
    registrations: 60,
    capacity: 80,
    status: 'COMPLETED',
  },
  {
    id: 'e-16',
    title: 'Free Eye Checkup Camp',
    category: 'Health Camp',
    location: 'Govandi, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-16'),
    startAt: '2026-06-12T09:00:00',
    endAt: '2026-06-12T15:00:00',
    organizer: 'HRSJM Health Team',
    registrations: 130,
    capacity: 160,
    status: 'COMPLETED',
  },
  {
    id: 'e-17',
    title: "Women's Safety Workshop",
    category: 'Workshop',
    location: 'Kurla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-17'),
    startAt: '2026-06-05T10:00:00',
    endAt: '2026-06-05T13:00:00',
    organizer: 'HRSJM Women Welfare Team',
    registrations: 55,
    capacity: 70,
    status: 'COMPLETED',
  },
  {
    id: 'e-18',
    title: 'Child Rights Awareness Rally',
    category: 'Awareness Camp',
    location: 'Dadar, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-18'),
    startAt: '2026-05-28T08:00:00',
    endAt: '2026-05-28T12:00:00',
    organizer: 'HRSJM Child Welfare Team',
    registrations: 170,
    capacity: 200,
    status: 'COMPLETED',
  },
  {
    id: 'e-19',
    title: 'Volunteer Training Program',
    category: 'Training Program',
    location: 'Sion, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-19'),
    startAt: '2026-05-15T10:00:00',
    endAt: '2026-05-15T14:00:00',
    organizer: 'HRSJM Volunteer Team',
    registrations: 45,
    capacity: 60,
    status: 'COMPLETED',
  },
  {
    id: 'e-20',
    title: 'Annual Sports Day for Children',
    category: 'Community Service',
    location: 'Wadala, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-20'),
    startAt: '2026-05-02T09:00:00',
    endAt: '2026-05-02T16:00:00',
    organizer: 'HRSJM Child Welfare Team',
    registrations: 120,
    capacity: 140,
    status: 'COMPLETED',
  },

  // --- Cancelled (4) ---
  {
    id: 'e-21',
    title: 'Youth Leadership Program',
    category: 'Training Program',
    location: 'Andheri, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-21'),
    startAt: '2026-08-05T10:00:00',
    endAt: '2026-08-05T13:00:00',
    organizer: 'HRSJM Youth Team',
    registrations: 30,
    capacity: 50,
    status: 'CANCELLED',
  },
  {
    id: 'e-22',
    title: 'Community Legal Clinic',
    category: 'Awareness Camp',
    location: 'Sion, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-22'),
    startAt: '2026-07-18T11:00:00',
    endAt: '2026-07-18T14:00:00',
    organizer: 'HRSJM Legal Team',
    registrations: 20,
    capacity: 40,
    status: 'CANCELLED',
  },
  {
    id: 'e-23',
    title: 'Beach Clean-Up Drive',
    category: 'Community Service',
    location: 'Versova, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-23'),
    startAt: '2026-06-10T07:00:00',
    endAt: '2026-06-10T10:00:00',
    organizer: 'HRSJM Environment Team',
    registrations: 25,
    capacity: 50,
    status: 'CANCELLED',
  },
  {
    id: 'e-24',
    title: 'Health & Wellness Fair',
    category: 'Health Camp',
    location: 'Kurla, Mumbai',
    coverImageUrl: demoCoverImage('hrsjm-event-24'),
    startAt: '2026-05-22T09:00:00',
    endAt: '2026-05-22T17:00:00',
    organizer: 'HRSJM Health Team',
    registrations: 35,
    capacity: 80,
    status: 'CANCELLED',
  },
];

/**
 * TEMPORARY demo description copy per category, applied to the base sample
 * records below. Replace with real backend content once the Events contract
 * is confirmed (spec Phase 0). The `description` field itself is already part
 * of the Event type (spec section 10 "potential fields").
 */
const SAMPLE_EVENT_DESCRIPTIONS: Record<string, string> = {
  Seminar:
    'This seminar aims to spread awareness about human rights, legal support and social justice in our community. Experts, social workers and legal professionals will share their insights and guide participants on rights, remedies and available government support.',
  'Relief Activity':
    'Volunteers will distribute essential relief supplies to families in need. Participants will assist in packing, organising and handing out kits while following the coordination plan shared by the HRSJM relief team.',
  'Awareness Camp':
    'An interactive community camp explaining everyday rights, available government schemes and how to seek help. Materials and guidance will be provided by HRSJM volunteers and invited resource persons.',
  'Health Camp':
    'Free basic health check-ups and consultations for the community, conducted with volunteer medical professionals. Registration counters open at the start of the camp and services are offered on a first-come basis.',
  'Community Service':
    'A community service activity where volunteers support local residents through practical, hands-on help. All necessary materials will be provided at the venue by the organising team.',
  Workshop:
    'A guided workshop with practical sessions and group activities. Facilitators will walk participants through each topic step by step, and printed reference material will be shared at the venue.',
  'Training Program':
    'A structured training programme for volunteers and community members. Sessions cover core concepts, hands-on practice and a short feedback round at the end of the day.',
  Fundraising:
    'An evening in support of HRSJM programmes, with updates on ongoing initiatives and how contributions are used. Donors and well-wishers are encouraged to register in advance.',
};

export const SAMPLE_EVENTS: EventListItem[] = SAMPLE_EVENT_BASE.map(event => ({
  ...event,
  description:
    event.description ??
    (event.category ? SAMPLE_EVENT_DESCRIPTIONS[event.category] : undefined),
}));

/** Distinct categories present in the sample dataset (used by the local filter panel). */
export const SAMPLE_EVENT_CATEGORIES: string[] = Array.from(
  new Set(
    SAMPLE_EVENTS.map(event => event.category).filter(
      (category): category is string => Boolean(category),
    ),
  ),
).sort();