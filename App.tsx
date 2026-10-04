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
import {
  KnowYourRightsScreen,
  RightArticleDetailsScreen,
  CreateRightsArticleScreen,
  EditRightsArticleScreen,
} from './src/features/admin/content/rights';
import type { EventListItem } from './src/features/admin/content/events';
import type { NewsListItem } from './src/features/admin/content/news';
import type { BlogListItem } from './src/features/admin/content/blogs';
import type { RightsArticle } from './src/features/admin/content/rights';
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
  | { name: 'blog-edit'; blog: BlogListItem }
  | { name: 'rights' }
  | { name: 'rights-details'; article: RightsArticle }
  | { name: 'rights-create' }
  | { name: 'rights-edit'; article: RightsArticle; from: 'details' | 'list' };

function App() {
  const [route, setRoute] = useState<AppRoute>({ name: 'list' });

  // TEMPORARY preview-shell tab routing shared by the content screens: the
  // host switches to the matching list route; unhandled tabs show the shell's
  // preview notice. Pressing the active tab re-selects the same route, which
  // is a harmless no-op.
  const handleContentTabPress = (tab: string) => {
    if (tab === 'events') {
      setRoute({ name: 'list' });
      return;
    }
    if (tab === 'news') {
      setRoute({ name: 'news' });
      return;
    }
    if (tab === 'blogs') {
      setRoute({ name: 'blogs' });
      return;
    }
    if (tab === 'rights') {
      setRoute({ name: 'rights' });
      return;
    }
    showAdminShellPreviewNotice();
  };

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
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'news-create' ? (
        <CreateNewsScreen onCancel={() => setRoute({ name: 'news' })} />
      ) : route.name === 'blogs' ? (
        <BlogsListScreen
          onAddBlog={() => setRoute({ name: 'blog-create' })}
          onOpenBlog={blog => setRoute({ name: 'blog-details', blog })}
          onEditBlog={blog => setRoute({ name: 'blog-edit', blog })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'blog-details' ? (
        <BlogDetailsScreen
          blog={route.blog}
          onBack={() => setRoute({ name: 'blogs' })}
          onEdit={blog => setRoute({ name: 'blog-edit', blog })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'blog-edit' ? (
        <EditBlogScreen
          blog={route.blog}
          onBack={() => setRoute({ name: 'blog-details', blog: route.blog })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'blog-create' ? (
        <CreateBlogScreen
          onCancel={() => setRoute({ name: 'blogs' })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'rights' ? (
        <KnowYourRightsScreen
          onAddRights={() => setRoute({ name: 'rights-create' })}
          onOpenArticle={article => setRoute({ name: 'rights-details', article })}
          onEditArticle={article => setRoute({ name: 'rights-edit', article, from: 'list' })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'rights-create' ? (
        <CreateRightsArticleScreen
          onCancel={() => setRoute({ name: 'rights' })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'rights-details' ? (
        <RightArticleDetailsScreen
          article={route.article}
          onBack={() => setRoute({ name: 'rights' })}
          onEdit={article => setRoute({ name: 'rights-edit', article, from: 'details' })}
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'rights-edit' ? (
        <EditRightsArticleScreen
          article={route.article}
          onBack={() =>
            route.from === 'list'
              ? setRoute({ name: 'rights' })
              : setRoute({ name: 'rights-details', article: route.article })
          }
          onTabPress={handleContentTabPress}
        />
      ) : route.name === 'news' ? (
        <NewsListScreen
          onViewNews={news => setRoute({ name: 'news-details', news })}
          onAddNews={() => setRoute({ name: 'news-create' })}
          onTabPress={handleContentTabPress}
        />
      ) : (
        <EventsScreen
          onViewEvent={event => setRoute({ name: 'details', event })}
          onAddEvent={() => setRoute({ name: 'create' })}
          onTabPress={handleContentTabPress}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
