import React from 'react';
import { EventForm, EMPTY_EVENT_FORM } from '../components/EventForm';

export interface CreateEventScreenProps {
  onCancel: () => void;
}

/**
 * Admin › Content › Events › Create Event screen.
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

export default CreateEventScreen;
