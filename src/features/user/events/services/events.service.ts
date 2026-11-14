import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import {
  USER_EVENTS,
  type UserEvent,
  type UserEventCategory,
} from '../data/user-events';

const DEFAULT_EVENT_IMAGE = require('../../../../assets/images/event-legal-awareness.jpg');

export interface BackendEventItem {
  id: string;
  title: string;
  description: string;
  short_information?: string | null;
  category: string;
  event_type: string;
  cover_image_url?: string | null;
  start_at: string;
  end_at?: string | null;
  all_day: boolean;
  location: string;
  address?: string | null;
  organized_by?: string | null;
  registration_required: boolean;
  capacity: number;
  registrations: number;
  per_person_limit: number;
  target_audience?: string | null;
  language?: string | null;
  tags?: string[] | null;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT';
  is_donation_enabled?: boolean;
  isDonationEnabled?: boolean;
  donation_message?: string | null;
  donationMessage?: string | null;
}

export const mapBackendEventToUserEvent = (item: BackendEventItem): UserEvent => {
  const start = new Date(item.start_at);
  const end = item.end_at ? new Date(item.end_at) : null;
  const day = isNaN(start.getDate()) ? '01' : String(start.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = isNaN(start.getMonth()) ? 'Oct' : monthNames[start.getMonth()];
  const year = isNaN(start.getFullYear()) ? 2026 : start.getFullYear();

  const formatClock = (d: Date) => {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const time = isNaN(start.getTime())
    ? '10:00 AM – 1:00 PM'
    : end && !isNaN(end.getTime())
    ? `${formatClock(start)} – ${formatClock(end)}`
    : `${formatClock(start)}`;

  const hasValidUri =
    typeof item.cover_image_url === 'string' &&
    item.cover_image_url.trim().length > 0 &&
    (item.cover_image_url.startsWith('http://') ||
      item.cover_image_url.startsWith('https://') ||
      item.cover_image_url.startsWith('data:') ||
      item.cover_image_url.startsWith('file:') ||
      item.cover_image_url.startsWith('blob:') ||
      item.cover_image_url.startsWith('/'));

  const image = hasValidUri
    ? { uri: item.cover_image_url!.trim() }
    : DEFAULT_EVENT_IMAGE;

  const topics =
    Array.isArray(item.tags) && item.tags.length > 0
      ? item.tags
      : item.short_information
      ? [item.short_information]
      : ['Community Engagement', 'Legal Awareness & Protection', 'HRSJM Mission'];

  const isDonationEnabled = Boolean(item.isDonationEnabled ?? item.is_donation_enabled);
  const donationMessage = item.donationMessage ?? item.donation_message ?? null;

  return {
    id: item.id,
    title: item.title,
    category: (item.category as UserEventCategory) || 'Workshop',
    tag: Array.isArray(item.tags) && item.tags[0] ? item.tags[0] : item.category || 'Event',
    day,
    month,
    date: `${day} ${month} ${year}`,
    time,
    location: item.location || 'Maharashtra',
    venue: item.address || item.location || 'HRSJM Centre',
    description: item.description || '',
    topics,
    image,
    status: item.status,
    createdAt: (item as any).created_at || (item as any).createdAt || item.start_at,
    isDonationEnabled,
    donationMessage,
    rawEvent: item,
  };
};

export const fetchDatabaseEvents = async (): Promise<UserEvent[]> => {
  try {
    const res = await apiClient.get<any>(ApiRoutes.EVENTS.BASE, {
      params: { limit: 50 },
    });
    const rawData = res?.data ?? res ?? {};
    const rawItems: BackendEventItem[] = Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData)
      ? rawData
      : [];

    if (rawItems.length > 0) {
      return rawItems.map(mapBackendEventToUserEvent);
    }
    return USER_EVENTS;
  } catch (error) {
    console.warn('Failed to fetch events from API, using fallback data:', error);
    return USER_EVENTS;
  }
};
