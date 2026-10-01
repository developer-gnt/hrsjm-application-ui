/**
 * TEMPORARY APP ENTRY (Events UI phase).
 *
 * Switches between the Events list and the Event Details screen using local
 * state only, so the full List → View → Details → Back flow can be reviewed on
 * a device/emulator. This is NOT the navigation architecture: the real root
 * navigation is owned by Mubasshir (Phase 2) and will replace this file.
 */
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import {
  EventsScreen,
  EventDetailsScreen,
} from './src/features/admin/content/events';
import type { EventListItem } from './src/features/admin/content/events';

function App() {
  const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {selectedEvent ? (
        <EventDetailsScreen
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
        />
      ) : (
        <EventsScreen onViewEvent={setSelectedEvent} />
      )}
    </SafeAreaProvider>
  );
}

export default App;