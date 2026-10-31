import React, { useMemo } from 'react';
import { EventForm } from '../components/EventForm';
import { extractLocalDate, extractLocalTime } from '../../../../../core/utils/date';
import type {
  CreateEventFormState,
  EventListItem,
} from '../types/events.types';

/**
 * Pre-fill values for fields the list record does not carry.
 */
const DEMO_EVENT_TYPE = 'Awareness Program';
const DEMO_ADDRESS = 'Community Hall, Kurla, Mumbai';
const DEMO_TARGET_AUDIENCE = 'Students, Youth';
const DEMO_LANGUAGE = 'English';
const DEMO_PER_PERSON_LIMIT = '2';

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
const mapEventToForm = (event: EventListItem): CreateEventFormState => ({
  title: event.title,
  description: event.description ?? '',
  coverImageUri: event.coverImageUrl ?? null,
  category: event.category ?? null,
  eventType: DEMO_EVENT_TYPE,
  eventDate: extractLocalDate(event.startAt),
  startTime: extractLocalTime(event.startAt),
  endDate: extractLocalDate(event.endAt) || extractLocalDate(event.startAt),
  endTime: extractLocalTime(event.endAt),
  allDay: false,
  location: event.location ?? '',
  address: DEMO_ADDRESS,
  registrationRequired: true,
  totalSeats: event.capacity ? String(event.capacity) : '',
  perPersonLimit: DEMO_PER_PERSON_LIMIT,
  organizedBy: event.organizer ?? '',
  targetAudience: DEMO_TARGET_AUDIENCE,
  language: DEMO_LANGUAGE,
  shortInformation: '',
  tags: buildDemoTags(event.category),
  status: event.status === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
});

interface EditEventScreenProps {
  /** The event selected on the Events list and shown on Event Details. */
  event: EventListItem;
  /** Back navigation to Event Details (cancel, discard, or after a validated save). */
  onBack: () => void;
  /** Optional callback fired when event is updated. */
  onSaved?: (updatedEvent?: EventListItem) => void;
}

/**
 * Edit Event screen.
 */
export const EditEventScreen: React.FC<EditEventScreenProps> = ({ event, onBack, onSaved }) => {
  const initialForm = useMemo(() => mapEventToForm(event), [event]);

  return (
    <EventForm
      mode="edit"
      eventId={event.id}
      title="Edit Event"
      subtitle="Update event information and save your changes."
      initialForm={initialForm}
      saveLabel="Save Changes"
      descriptionLabel="Short Description"
      backDestination="Event Details"
      onCancel={onBack}
      onSaved={updated => {
        if (onSaved) {
          onSaved(updated);
        } else {
          onBack();
        }
      }}
    />
  );
};
