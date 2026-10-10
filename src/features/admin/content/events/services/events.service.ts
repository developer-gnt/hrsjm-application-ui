import { apiClient } from '../../../../../core/api/client';
import { ApiRoutes } from '../../../../../core/constants/api-routes';
import type {
  EventListItem,
  EventStatsSummary,
  CreateEventFormState,
} from '../types/events.types';

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

export const mapBackendEventToUi = (item: BackendEventItem): EventListItem => ({
  id: item.id,
  title: item.title,
  category: item.category,
  location: item.location,
  coverImageUrl: item.cover_image_url,
  startAt: item.start_at,
  endAt: item.end_at || undefined,
  organizer: item.organized_by || undefined,
  description: item.description,
  registrations: item.registrations ?? 0,
  capacity: item.capacity,
  status: item.status,
});

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

  const rawData = res.data;
  return {
    events: (rawData.items || []).map(mapBackendEventToUi),
    stats: rawData.stats || {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    },
  };
};

export const getEventDetails = async (id: string): Promise<EventListItem> => {
  const res = await apiClient.get<BackendEventItem>(
    ApiRoutes.EVENTS.DETAILS(id),
  );
  return mapBackendEventToUi(res.data);
};

export const createEventApi = async (
  form: CreateEventFormState,
): Promise<EventListItem> => {
  const startAt = form.eventDate
    ? `${form.eventDate}T${form.startTime || '09:00'}:00`
    : new Date().toISOString();

  const endAt = form.endDate
    ? `${form.endDate}T${form.endTime || '17:00'}:00`
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
  };

  const res = await apiClient.post<BackendEventItem>(
    ApiRoutes.EVENTS.BASE,
    payload,
  );
  return mapBackendEventToUi(res.data);
};

export const updateEventApi = async (
  id: string,
  form: CreateEventFormState,
): Promise<EventListItem> => {
  const startAt = form.eventDate
    ? `${form.eventDate}T${form.startTime || '09:00'}:00`
    : new Date().toISOString();

  const endAt = form.endDate
    ? `${form.endDate}T${form.endTime || '17:00'}:00`
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
  };

  const res = await apiClient.patch<BackendEventItem>(
    ApiRoutes.EVENTS.DETAILS(id),
    payload,
  );
  return mapBackendEventToUi(res.data);
};

export const deleteEventApi = async (id: string): Promise<void> => {
  await apiClient.delete(ApiRoutes.EVENTS.DETAILS(id));
};
