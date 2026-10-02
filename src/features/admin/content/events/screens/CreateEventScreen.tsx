import React from 'react';
import { EMPTY_EVENT_FORM, EventForm } from '../components/EventForm';

interface CreateEventScreenProps {
  /** TEMPORARY: back navigation to the Events list (real navigation later). */
  onCancel: () => void;
}

/**
 * Create Event screen (spec section 10 / PRD Create Event).
 *
 * Thin wrapper around the shared EventForm — the exact same form the Edit
 * Event screen uses, starting empty. All sections, validation, pickers,
 * dirty-state handling and the UI-only save confirmation live in EventForm.
 */
export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ onCancel }) => {
  return (
    <EventForm
      mode="create"
      title="Create Event"
      subtitle="Add a new event or activity to keep your community informed and engaged."
      initialForm={EMPTY_EVENT_FORM}
      saveLabel="Save Event"
      backDestination="Events list"
      onCancel={onCancel}
    />
  );
};
