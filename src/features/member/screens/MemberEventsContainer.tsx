import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { EventsScreen } from '../../admin/content/events/screens/EventsScreen';
import { EventDetailsScreen } from '../../admin/content/events/screens/EventDetailsScreen';
import type { EventListItem } from '../../admin/content/events/types/events.types';

export const MemberEventsContainer: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(null);

  if (selectedEvent) {
    return (
      <EventDetailsScreen
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        canManage={false}
      />
    );
  }

  return (
    <EventsScreen
      canCreate={false}
      onViewEvent={event => setSelectedEvent(event)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
