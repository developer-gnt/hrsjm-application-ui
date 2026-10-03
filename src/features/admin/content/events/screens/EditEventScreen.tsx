import React, { useMemo } from 'react';
import { EventForm } from '../components/EventForm';
import type {
  CreateEventFormState,
  EventListItem,
} from '../types/events.types';

/**
 * TEMPORARY demo pre-fill values for fields the current list record does not
 * carry yet (no backend contract — spec Phase 0). They match the Edit Event
 * reference UI for the demo event and are replaced by real per-event values
 * once the event DTO lands.
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
 * Maps the selected list-row event to the shared form state so Edit opens
 * pre-filled. Datetimes stay in the form's existing local storage formats
 * (ISO YYYY-MM-DD dates, 24h HH:mm times) — no conversion is introduced.
 */
const mapEventToForm = (event: EventListItem): CreateEventFormState => ({
  title: event.title,
  description: event.description ?? '',
  coverImageUri: event.coverImageUrl ?? null,
  category: event.category ?? null,
  eventType: DEMO_EVENT_TYPE,
  eventDate: event.startAt ? event.startAt.slice(0, 10) : null,
  startTime: event.startAt ? event.startAt.slice(11, 16) : null,
  endDate: event.endAt ? event.endAt.slice(0, 10) : null,
  endTime: event.endAt ? event.endAt.slice(11, 16) : null,
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
  // Published lifecycle statuses all map to the Publish intent; only a draft
  // event opens with the Draft card selected.
  status: event.status === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
});

interface EditEventScreenProps {
  /** The event selected on the Events list and shown on Event Details. */
  event: EventListItem;
  /** Back navigation to Event Details (cancel, discard, or after a validated save). */
  onBack: () => void;
}

/**
 * Edit Event screen (spec section 11 / Edit Event UI guide).
 *
 * The SAME shared EventForm as Create Event, pre-filled with the selected
 * event's data. UI-only phase: validation is local and a successful save
 * shows a UI-only confirmation before returning to Event Details — NO API is
 * called and nothing claims the event was actually updated on a backend.
 */
export const EditEventScreen: React.FC<EditEventScreenProps> = ({ event, onBack }) => {
  const initialForm = useMemo(() => mapEventToForm(event), [event]);

  return (
    <EventForm
      mode="edit"
      title="Edit Event"
      subtitle="Update event information and save your changes."
      initialForm={initialForm}
      saveLabel="Save Changes"
      descriptionLabel="Short Description"
      backDestination="Event Details"
      onCancel={onBack}
      onSaved={onBack}
    />
  );
};
