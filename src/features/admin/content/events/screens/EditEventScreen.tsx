import React, { useMemo } from 'react';
import { EventForm, EMPTY_EVENT_FORM } from '../components/EventForm';
import { extractLocalDate, extractLocalTime } from '../../../../../core/utils';
import type {
  CreateEventFormState,
  EventListItem,
} from '../types/events.types';

/**
 * Pre-fill fallback values for optional event fields.
 */
const DEFAULT_EVENT_TYPE = 'IN_PERSON';
const DEFAULT_ADDRESS = 'Community Hall, Kurla, Mumbai';
const DEFAULT_TARGET_AUDIENCE = 'Open to All';
const DEFAULT_LANGUAGE = 'English, Hindi';
const DEFAULT_PER_PERSON_LIMIT = '1';

/** Demo tags per event: category slug appended to the reference default set. */
const buildDemoTags = (category?: string): string[] => {
  const tags = ['human-rights', 'awareness'];
  if (category) {
    tags.push(category.toLowerCase().replace(/\s+/g, '-'));
  }
  return tags;
};

/**
 * Maps the selected event to the shared form state so Edit opens pre-filled with local date and time.
 */
const mapEventToForm = (event?: EventListItem | null): CreateEventFormState => {
  if (!event) {
    return {
      ...EMPTY_EVENT_FORM,
    };
  }

  const anyEvent = event as any;

  return {
    title: event.title || '',
    description: event.description ?? '',
    coverImageUri: event.coverImageUrl ?? anyEvent.coverImageUri ?? null,
    category: event.category ?? 'Seminar',
    eventType: anyEvent.eventType ?? anyEvent.event_type ?? DEFAULT_EVENT_TYPE,
    eventDate: extractLocalDate(event.startAt),
    startTime: extractLocalTime(event.startAt),
    endDate: extractLocalDate(event.endAt) || extractLocalDate(event.startAt),
    endTime: extractLocalTime(event.endAt),
    allDay: Boolean(anyEvent.allDay ?? anyEvent.all_day ?? false),
    location: event.location ?? '',
    address: anyEvent.address ?? DEFAULT_ADDRESS,
    registrationRequired:
      anyEvent.registrationRequired !== undefined
        ? Boolean(anyEvent.registrationRequired)
        : anyEvent.registration_required !== undefined
        ? Boolean(anyEvent.registration_required)
        : Boolean(event.capacity),
    totalSeats: event.capacity
      ? String(event.capacity)
      : anyEvent.totalSeats
      ? String(anyEvent.totalSeats)
      : '100',
    perPersonLimit: anyEvent.perPersonLimit
      ? String(anyEvent.perPersonLimit)
      : DEFAULT_PER_PERSON_LIMIT,
    organizedBy:
      event.organizer ?? anyEvent.organizedBy ?? anyEvent.organized_by ?? 'HRSJM Mission',
    targetAudience:
      anyEvent.targetAudience ?? anyEvent.target_audience ?? DEFAULT_TARGET_AUDIENCE,
    language: anyEvent.language ?? DEFAULT_LANGUAGE,
    shortInformation: anyEvent.shortInformation ?? anyEvent.short_information ?? '',
    tags:
      Array.isArray(anyEvent.tags) && anyEvent.tags.length > 0
        ? anyEvent.tags
        : buildDemoTags(event.category),
    status: event.status === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
    isDonationEnabled: Boolean(event.isDonationEnabled ?? anyEvent.is_donation_enabled ?? false),
    donationMessage: event.donationMessage || anyEvent.donation_message || '',
  };
};

export interface EditEventScreenProps {
  /** The event selected on the Events list and shown on Event Details. */
  event?: EventListItem;
  /** React Navigation route prop if passed via navigation.navigate */
  route?: { params?: { event?: EventListItem } };
  /** React Navigation navigation prop */
  navigation?: any;
  /** Back navigation to Event Details (cancel, discard, or after a validated save). */
  onBack?: () => void;
  /** Optional callback fired when event is updated. */
  onSaved?: (updatedEvent?: EventListItem) => void;
}

/**
 * Edit Event screen.
 */
export const EditEventScreen: React.FC<EditEventScreenProps> = ({
  event,
  route,
  navigation,
  onBack,
  onSaved,
}) => {
  const targetEvent = event || route?.params?.event;
  const initialForm = useMemo(() => mapEventToForm(targetEvent), [targetEvent]);

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleSaved = (updated?: EventListItem) => {
    if (onSaved) {
      onSaved(updated);
    } else {
      handleCancel();
    }
  };

  return (
    <EventForm
      mode="edit"
      eventId={targetEvent?.id}
      title="Edit Event"
      subtitle="Update event information and save your changes."
      initialForm={initialForm}
      saveLabel="Save Changes"
      descriptionLabel="Short Description"
      backDestination="Event Details"
      onCancel={handleCancel}
      onSaved={handleSaved}
    />
  );
};

export default EditEventScreen;

