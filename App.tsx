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
import {
  NewsListScreen,
  NewsDetailsScreen,
  CreateNewsScreen,
  EditNewsScreen,
} from './src/features/admin/content/news';
import {
  BlogsListScreen,
  BlogDetailsScreen,
  CreateBlogScreen,
  EditBlogScreen,
} from './src/features/admin/content/blogs';
import type { EventListItem } from './src/features/admin/content/events';
import type { NewsListItem } from './src/features/admin/content/news';
import type { BlogListItem } from './src/features/admin/content/blogs';
import { showAdminShellPreviewNotice } from './src/features/admin/content/events/preview/AdminShellTabBar';

type AppRoute =
  | { name: 'list' }
  | { name: 'details'; event: EventListItem }
  | { name: 'create' }
  | { name: 'edit'; event: EventListItem }
  | { name: 'news' }
  | { name: 'news-details'; news: NewsListItem }
  | { name: 'news-create' }
  | { name: 'news-edit'; news: NewsListItem }
  | { name: 'blogs' }
  | { name: 'blog-details'; blog: BlogListItem }
  | { name: 'blog-create' }
  | { name: 'blog-edit'; blog: BlogListItem };

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
      ) : route.name === 'news-edit' ? (
        <EditNewsScreen
          news={route.news}
          onBack={() => setRoute({ name: 'news-details', news: route.news })}
        />
      ) : route.name === 'news-details' ? (
        <NewsDetailsScreen
          news={route.news}
          onBack={() => setRoute({ name: 'news' })}
          onEdit={news => setRoute({ name: 'news-edit', news })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'blogs') {
              setRoute({ name: 'blogs' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'news-create' ? (
        <CreateNewsScreen onCancel={() => setRoute({ name: 'news' })} />
      ) : route.name === 'blogs' ? (
        <BlogsListScreen
          onAddBlog={() => setRoute({ name: 'blog-create' })}
          onOpenBlog={blog => setRoute({ name: 'blog-details', blog })}
          onEditBlog={blog => setRoute({ name: 'blog-edit', blog })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'news') {
              setRoute({ name: 'news' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'blog-details' ? (
        <BlogDetailsScreen
          blog={route.blog}
          onBack={() => setRoute({ name: 'blogs' })}
          onEdit={blog => setRoute({ name: 'blog-edit', blog })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'news') {
              setRoute({ name: 'news' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'blog-edit' ? (
        <EditBlogScreen
          blog={route.blog}
          onBack={() => setRoute({ name: 'blog-details', blog: route.blog })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'news') {
              setRoute({ name: 'news' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'blog-create' ? (
        <CreateBlogScreen
          onCancel={() => setRoute({ name: 'blogs' })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'news') {
              setRoute({ name: 'news' });
              return;
            }
            showAdminShellPreviewNotice();
          }}
        />
      ) : route.name === 'news' ? (
        <NewsListScreen
          onViewNews={news => setRoute({ name: 'news-details', news })}
          onAddNews={() => setRoute({ name: 'news-create' })}
          onTabPress={tab => {
            if (tab === 'events') {
              setRoute({ name: 'list' });
              return;
            }
            if (tab === 'blogs') {
              setRoute({ name: 'blogs' });
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
            if (tab === 'blogs') {
              setRoute({ name: 'blogs' });
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
