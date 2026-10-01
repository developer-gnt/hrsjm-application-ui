/**
 * TEMPORARY APP ENTRY (Events UI phase).
 *
 * Switches between the Events list, Event Details, and Create Event screens
 * using local state only, so the full List → View/Add → Details/Create → Back
 * flow can be reviewed on a device/emulator. This is NOT the navigation
 * architecture: the real root navigation is owned by Mubasshir (Phase 2) and
 * will replace this file.
 */
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import {
  EventsScreen,
  EventDetailsScreen,
  CreateEventScreen,
} from './src/features/admin/content/events';
import type { EventListItem } from './src/features/admin/content/events';

type AppRoute =
  | { name: 'list' }
  | { name: 'details'; event: EventListItem }
  | { name: 'create' };

function App() {
  const [route, setRoute] = useState<AppRoute>({ name: 'list' });

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {route.name === 'details' ? (
        <EventDetailsScreen
          event={route.event}
          onBack={() => setRoute({ name: 'list' })}
        />
      ) : route.name === 'create' ? (
        <CreateEventScreen onCancel={() => setRoute({ name: 'list' })} />
      ) : (
        <EventsScreen
          onViewEvent={event => setRoute({ name: 'details', event })}
          onAddEvent={() => setRoute({ name: 'create' })}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;