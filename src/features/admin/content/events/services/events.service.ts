import { apiClient } from '../../../../../core/api/client';
import { ApiRoutes } from '../../../../../core/constants/api-routes';
import { combineLocalDateAndTime } from '../../../../../core/utils/date';
import type {
  EventListItem,
  EventStatsSummary,
  CreateEventFormState,
} from '../types/events.types';
import { SAMPLE_EVENTS } from '../data/sample-events';

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
  donation_message?: string | null;
  isDonationEnabled?: boolean;
  donationMessage?: string | null;
}

export interface BackendEventsListResponse {
  items: BackendEventItem[];
  stats: EventStatsSummary;
  totalCount: number;
  page: number;
  limit: number;
}

export interface EventsFilterParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const mapBackendEventToUi = (item: BackendEventItem): EventListItem => {
  const raw = item as any;
  return {
    id: raw.id,
    title: raw.title || '',
    category: raw.category || 'Seminar',
    location: raw.location || '',
    coverImageUrl: raw.cover_image_url || raw.coverImageUrl || null,
    startAt: raw.start_at || raw.startAt || new Date().toISOString(),
    endAt: raw.end_at || raw.endAt || undefined,
    organizer: raw.organized_by || raw.organizedBy || raw.organizer || undefined,
    description: raw.description || '',
    registrations: raw.registrations ?? 0,
    capacity: raw.capacity,
    status: raw.status || 'UPCOMING',
    isEnabled: raw.is_enabled !== undefined ? Boolean(raw.is_enabled) : raw.isEnabled !== undefined ? Boolean(raw.isEnabled) : true,
    isDonationEnabled: Boolean(raw.is_donation_enabled ?? raw.isDonationEnabled ?? false),
    donationMessage: raw.donation_message ?? raw.donationMessage ?? null,
  };
};

export const getEventsList = async (
  params?: EventsFilterParams,
): Promise<{ events: EventListItem[]; stats: EventStatsSummary }> => {
  const queryParams: Record<string, any> = {};
  if (params?.status && params.status !== 'ALL') {
    queryParams.status = params.status;
  }
  if (params?.category) {
    queryParams.category = params.category;
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await apiClient.get<BackendEventsListResponse>(
    ApiRoutes.EVENTS.BASE,
    { params: queryParams },
  );

  const rawData: any = res?.data ?? res ?? {};
  const unwrapped = rawData?.items ? rawData : (rawData?.data || rawData);
  const rawItems = Array.isArray(unwrapped?.items)
    ? unwrapped.items
    : Array.isArray(unwrapped)
    ? unwrapped
    : [];

  return {
    events: rawItems.map(mapBackendEventToUi),
    stats: unwrapped?.stats || {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    },
  };
};

export const getEventDetails = async (id: string): Promise<EventListItem> => {
  try {
    const res = await apiClient.get<BackendEventItem>(
      ApiRoutes.EVENTS.DETAILS(id),
    );
    const rawData: any = res?.data ?? res ?? {};
    const item = rawData?.id ? rawData : (rawData?.data || rawData);
    return mapBackendEventToUi(item);
  } catch (err: any) {
    const sample = SAMPLE_EVENTS.find(e => e.id === id);
    if (sample) return sample;
    throw err;
  }
};

export const createEventApi = async (
  form: CreateEventFormState,
): Promise<EventListItem> => {
  const eventDate = form.eventDate || new Date().toISOString().slice(0, 10);
  const endDate = form.endDate || eventDate;
  const startAt = combineLocalDateAndTime(eventDate, form.startTime, '09:00');
  const endAt = form.endTime
    ? combineLocalDateAndTime(endDate, form.endTime, '17:00')
    : undefined;

  const payload = {
    title: form.title,
    description: form.description,
    short_information: form.shortInformation || undefined,
    category: form.category || 'Seminar',
    event_type: form.eventType || 'IN_PERSON',
    cover_image_url: form.coverImageUri || 'https://picsum.photos/seed/hrsjm-new-event/400/300',
    start_at: startAt,
    end_at: endAt,
    all_day: form.allDay,
    location: form.location,
    address: form.address || undefined,
    organized_by: form.organizedBy || undefined,
    registration_required: form.registrationRequired,
    capacity: Number(form.totalSeats) || 100,
    per_person_limit: Number(form.perPersonLimit) || 1,
    target_audience: form.targetAudience || undefined,
    language: form.language || undefined,
    tags: form.tags,
    status: form.status === 'PUBLISH' ? 'UPCOMING' : 'DRAFT',
    is_enabled: form.isEnabled !== undefined ? Boolean(form.isEnabled) : true,
    isEnabled: form.isEnabled !== undefined ? Boolean(form.isEnabled) : true,
    is_donation_enabled: Boolean(form.isDonationEnabled),
    donation_message: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
    isDonationEnabled: Boolean(form.isDonationEnabled),
    donationMessage: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
  };

  const res = await apiClient.post<BackendEventItem>(
    ApiRoutes.EVENTS.BASE,
    payload,
  );
  const rawData: any = res?.data ?? res ?? {};
  const item = rawData?.id ? rawData : (rawData?.data || rawData);
  return mapBackendEventToUi(item);
};

export const updateEventApi = async (
  id: string,
  form: CreateEventFormState,
): Promise<EventListItem> => {
  const eventDate = form.eventDate || new Date().toISOString().slice(0, 10);
  const endDate = form.endDate || eventDate;
  const startAt = combineLocalDateAndTime(eventDate, form.startTime, '09:00');
  const endAt = form.endTime
    ? combineLocalDateAndTime(endDate, form.endTime, '17:00')
    : undefined;

  const payload = {
    title: form.title,
    description: form.description,
    short_information: form.shortInformation || undefined,
    category: form.category || 'Seminar',
    event_type: form.eventType || 'IN_PERSON',
    cover_image_url: form.coverImageUri || 'https://picsum.photos/seed/hrsjm-new-event/400/300',
    start_at: startAt,
    end_at: endAt,
    all_day: form.allDay,
    location: form.location,
    address: form.address || undefined,
    organized_by: form.organizedBy || undefined,
    registration_required: form.registrationRequired,
    capacity: Number(form.totalSeats) || 100,
    per_person_limit: Number(form.perPersonLimit) || 1,
    target_audience: form.targetAudience || undefined,
    language: form.language || undefined,
    tags: form.tags,
    status: form.status === 'PUBLISH' ? 'UPCOMING' : 'DRAFT',
    is_enabled: form.isEnabled !== undefined ? Boolean(form.isEnabled) : true,
    isEnabled: form.isEnabled !== undefined ? Boolean(form.isEnabled) : true,
    is_donation_enabled: Boolean(form.isDonationEnabled),
    donation_message: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
    isDonationEnabled: Boolean(form.isDonationEnabled),
    donationMessage: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
  };

  const res = await apiClient.patch<BackendEventItem>(
    ApiRoutes.EVENTS.DETAILS(id),
    payload,
  );
  const rawData: any = res?.data ?? res ?? {};
  const item = rawData?.id ? rawData : (rawData?.data || rawData);
  return mapBackendEventToUi(item);
};

export const deleteEventApi = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(ApiRoutes.EVENTS.DETAILS(id));
  } catch (err: any) {
    if (err?.response?.status === 404 || id.startsWith('e-') || id.startsWith('event-')) {
      console.warn(`Event ${id} not found on backend, deleted locally.`);
      return;
    }
    throw err;
  }
};

export const updateEventStatusApi = async (
  id: string,
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT',
): Promise<EventListItem> => {
  try {
    const res = await apiClient.patch<BackendEventItem>(
      ApiRoutes.EVENTS.DETAILS(id),
      { status },
    );
    const rawData: any = res?.data ?? res ?? {};
    const item = rawData?.id ? rawData : (rawData?.data || rawData);
    return mapBackendEventToUi(item);
  } catch (err: any) {
    if (err?.response?.status === 404 || id.startsWith('e-') || id.startsWith('event-')) {
      console.warn(`Event ${id} not found on backend, updated status locally.`);
      return { id, status } as any;
    }
    throw err;
  }
};
