/**
 * TEMPORARY APP ENTRY (Events UI phase).
 *
 * The Events list screen is mounted directly here so it can be reviewed on a
 * device/emulator. This file will be replaced by the shared root navigation
 * owned by Mubasshir (Phase 2) — do not build further app-level structure here.
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EventsScreen } from './src/features/admin/content/events';

function App() {
  return (
    <SafeAreaProvider>
      <EventsScreen />
    </SafeAreaProvider>
  );
}

export default App;