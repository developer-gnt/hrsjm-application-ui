/**
 * TEMPORARY APP ENTRY (Events/News UI phase).
 *
 * Switches between the Events list, Event Details, Create Event, Edit Event
 * and News list screens using local state only, so the full
 * List → View/Add → Details → Create/Edit → Back flow can be reviewed on a
 * device/emulator. This is NOT the navigation architecture: the real root
 * navigation is owned by Mubasshir (Phase 2) and will replace this file.
 */
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import {
  EventsScreen,
  EventDetailsScreen,
  CreateEventScreen,
  EditEventScreen,
} from './src/features/admin/content/events';
import { NewsListScreen, NewsDetailsScreen } from './src/features/admin/content/news';
import type { EventListItem } from './src/features/admin/content/events';
import type { NewsListItem } from './src/features/admin/content/news';
import { showAdminShellPreviewNotice } from './src/features/admin/content/events/preview/AdminShellTabBar';

type AppRoute =
  | { name: 'list' }
  | { name: 'details'; event: EventListItem }
  | { name: 'create' }
  | { name: 'edit'; event: EventListItem }
  | { name: 'news' }
  | { name: 'news-details'; news: NewsListItem };

function App() {
  const [route, setRoute] = useState<AppRoute>({ name: 'list' });

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {route.name === 'edit' ? (
        <EditEventScreen
          event={route.event}
          onBack={() => setRoute({ name: 'details', event: route.event })}
        />
      ) : route.name === 'details' ? (
        <EventDetailsScreen
          event={route.event}
          onBack={() => setRoute({ name: 'list' })}
          onEdit={() => setRoute({ name: 'edit', event: route.event })}
        />
      ) : route.name === 'create' ? (
        <CreateEventScreen onCancel={() => setRoute({ name: 'list' })} />
      ) : route.name === 'news-details' ? (
        <NewsDetailsScreen
          news={route.news}
          onBack={() => setRoute({ name: 'news' })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'news' ? (
        <NewsListScreen
          onViewNews={news => setRoute({ name: 'news-details', news })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : (
        <EventsScreen
          onViewEvent={event => setRoute({ name: 'details', event })}
          onAddEvent={() => setRoute({ name: 'create' })}
          onTabPress={tab => {
            if (tab === 'news') {
              setRoute({ name: 'news' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
