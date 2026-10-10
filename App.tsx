/**
 * TEMPORARY APP ENTRY (Events/News UI phase).
 *
 * Switches between the Events list, Event Details, Create Event, Edit Event
 * and News list screens using local state only, so the full
 * List → View/Add → Details → Create/Edit → Back flow can be reviewed on a
 * device/emulator. This is NOT the navigation architecture: the real root
 * navigation is owned by Mubasshir (Phase 2) and will replace this file.
 *
 * USER APP PHASE: the app boots into the 'user-home' preview route. The
 * About, Contact and User Rights pages are standalone screens reachable
 * from the shared six-tab bottom navigation. The Admin content
 * preview routes below remain available in code (reachable by switching the
 * initial route while the real navigation is pending).
 */
import React, { useRef, useState } from 'react';
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
import { UserHomeScreen } from './src/features/user/home';
import { AboutScreen } from './src/features/user/about';
import { ContactUsScreen } from './src/features/user/contact';
import { GetHelpScreen, FileComplaintScreen } from './src/features/user/help';
import { RightDetailsScreen as UserRightDetailsScreen } from './src/features/user/rights';
import {
  RegisterForEventScreen,
  UserEventDetailsScreen,
  UserEventsScreen,
} from './src/features/user/events';
import type { UserEvent } from './src/features/user/events';
import {
  NewsDetailsScreen as UserNewsDetailsScreen,
  NewsScreen as UserNewsScreen,
} from './src/features/user/news';
import type { UserNewsArticle } from './src/features/user/news';
import { showAdminShellPreviewNotice } from './src/features/admin/content/events/preview/AdminShellTabBar';
import { WhatWeDoDetailScreen } from './src/features/user/what-we-do';
import type { WhatWeDoId } from './src/features/user/what-we-do';
import { UserActionPageScreen } from './src/features/user/action-pages';
import type { ActionPageId } from './src/features/user/action-pages';
import { SearchScreen } from './src/features/user/search';
import type { GlobalSearchResult } from './src/features/user/search';
import { NotificationsScreen } from './src/features/user/notifications';
import { HeaderActionsProvider } from './src/features/user/components/HeaderActionsContext';
import {
  MemberDashboardDetailsScreen,
  MemberHomeDashboardScreen,
  MOCK_ACTIVE_MEMBERSHIP,
} from './src/features/user/member-dashboard';

type AppRoute =
  | { name: 'user-home' }
  | { name: 'about'; returnTo?: 'user-home' | 'user-search' }
  | { name: 'what-we-do-detail'; contentId: WhatWeDoId; returnTo: 'home' | 'about' | 'search' }
  | {
      name: 'user-action-page';
      pageId: ActionPageId;
      returnTo: 'user-home' | 'member-dashboard' | 'member-details';
    }
  | { name: 'member-dashboard' }
  | { name: 'member-details' }
  | { name: 'user-search' }
  | { name: 'user-notifications' }
  | { name: 'contact' }
  | { name: 'user-help' }
  | { name: 'file-complaint' }
  | { name: 'user-rights' }
  | {
      name: 'user-right-details';
      rightId: string;
      returnTo:
        | 'user-rights'
        | 'user-home'
        | 'user-search'
        | 'member-dashboard';
      topicsOnly?: boolean;
    }
  | {
      name: 'user-events';
      returnTo?: 'user-home' | 'member-dashboard' | 'member-details';
    }
  | {
      name: 'user-event-details';
      event: UserEvent;
      returnTo?: 'user-events' | 'user-search' | 'member-dashboard' | 'member-details';
      eventsReturnTo?: 'user-home' | 'member-dashboard' | 'member-details';
    }
  | {
      name: 'user-event-register';
      event: UserEvent;
      returnTo?: 'user-events' | 'user-search' | 'member-dashboard' | 'member-details';
      eventsReturnTo?: 'user-home' | 'member-dashboard' | 'member-details';
    }
  | { name: 'user-news' }
  | { name: 'user-news-details'; article: UserNewsArticle; returnTo?: 'user-news' | 'user-search' }
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

/** TEMPORARY: launch route of the preview shell. */
const INITIAL_ROUTE: AppRoute = { name: 'user-home' };

function App() {
  // Boots into the Home screen. The About, Contact and User Rights pages are
  // standalone screens reachable from the shared six-tab bottom navigation.
  const [route, setRoute] = useState<AppRoute>(INITIAL_ROUTE);
  const homeScrollOffset = useRef(0);
  const routeBeforeHeaderDestination = useRef<AppRoute>(INITIAL_ROUTE);
  const searchQuery = useRef('');

  const openSearch = () => {
    routeBeforeHeaderDestination.current = route;
    setRoute({ name: 'user-search' });
  };

  const openNotifications = () => {
    routeBeforeHeaderDestination.current = route;
    setRoute({ name: 'user-notifications' });
  };

  const handleSearchResult = (result: GlobalSearchResult) => {
    if (result.kind === 'event') {
      setRoute({
        name: 'user-event-details',
        event: result.event,
        returnTo: 'user-search',
      });
    } else if (result.kind === 'news') {
      setRoute({
        name: 'user-news-details',
        article: result.article,
        returnTo: 'user-search',
      });
    } else if (result.kind === 'right') {
      setRoute({
        name: 'user-right-details',
        rightId: result.rightId,
        returnTo: 'user-search',
      });
    } else if (result.kind === 'work-area') {
      setRoute({
        name: 'what-we-do-detail',
        contentId: result.contentId,
        returnTo: 'search',
      });
    } else {
      setRoute({ name: 'about', returnTo: 'user-search' });
    }
  };

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
        <HeaderActionsProvider
          value={{
            onOpenSearch: openSearch,
            onOpenNotifications: openNotifications,
            hasUnreadNotifications: false,
          }}
        >
        <StatusBar barStyle="dark-content" />
        {route.name === 'user-home' ? (
          <UserHomeScreen
            initialScrollOffset={homeScrollOffset.current}
            onScrollOffsetChange={offset => {
              homeScrollOffset.current = offset;
            }}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenGetHelp={() => setRoute({ name: 'user-help' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenWhatWeDo={contentId =>
              setRoute({ name: 'what-we-do-detail', contentId, returnTo: 'home' })
            }
            onOpenActionPage={pageId =>
              pageId === 'membership'
                ? setRoute({ name: 'member-dashboard' })
                : setRoute({ name: 'user-action-page', pageId, returnTo: 'user-home' })
            }
            onOpenRight={rightId =>
              setRoute({
                name: 'user-right-details',
                rightId,
                returnTo: 'user-home',
                topicsOnly: rightId === 'womens-rights',
              })
            }
          />
        ) : route.name === 'user-search' ? (
          <SearchScreen
            onBack={() => setRoute(routeBeforeHeaderDestination.current)}
            onSelectResult={handleSearchResult}
            initialQuery={searchQuery.current}
            onQueryChange={query => {
              searchQuery.current = query;
            }}
            onOpenNotifications={openNotifications}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'user-notifications' ? (
          <NotificationsScreen
            onBack={() => setRoute(routeBeforeHeaderDestination.current)}
            onOpenSearch={openSearch}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'member-dashboard' ? (
          <MemberHomeDashboardScreen
            membership={MOCK_ACTIVE_MEMBERSHIP}
            onBack={() => setRoute({ name: 'user-home' })}
            onOpenMembershipInfo={() =>
              setRoute({
                name: 'user-action-page',
                pageId: 'membership',
                returnTo: 'member-dashboard',
              })
            }
            onOpenMembershipDetails={() => setRoute({ name: 'member-details' })}
            onOpenRight={rightId =>
              setRoute({
                name: 'user-right-details',
                rightId,
                returnTo: 'member-dashboard',
              })
            }
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenComplaint={() => setRoute({ name: 'user-help' })}
            onOpenEvents={() =>
              setRoute({ name: 'user-events', returnTo: 'member-dashboard' })
            }
            onOpenEvent={event =>
              setRoute({
                name: 'user-event-details',
                event,
                returnTo: 'member-dashboard',
              })
            }
            onOpenDonation={() =>
              setRoute({
                name: 'user-action-page',
                pageId: 'donate',
                returnTo: 'member-dashboard',
              })
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'member-details' ? (
          <MemberDashboardDetailsScreen
            membership={MOCK_ACTIVE_MEMBERSHIP}
            onBack={() => setRoute({ name: 'member-dashboard' })}
            onOpenMembershipInfo={() =>
              setRoute({
                name: 'user-action-page',
                pageId: 'membership',
                returnTo: 'member-details',
              })
            }
            onOpenComplaint={() => setRoute({ name: 'user-help' })}
            onOpenDonation={() =>
              setRoute({
                name: 'user-action-page',
                pageId: 'donate',
                returnTo: 'member-details',
              })
            }
            onOpenEvents={() =>
              setRoute({ name: 'user-events', returnTo: 'member-details' })
            }
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenRight={rightId =>
              setRoute({
                name: 'user-right-details',
                rightId,
                returnTo: 'user-rights',
              })
            }
            onOpenEvent={event =>
              setRoute({
                name: 'user-event-details',
                event,
                returnTo: 'member-details',
              })
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'what-we-do-detail' ? (
          <WhatWeDoDetailScreen
            contentId={route.contentId}
            onBack={() =>
              setRoute(
                route.returnTo === 'about'
                  ? ({ name: 'about' } as const)
                  : route.returnTo === 'search'
                    ? ({ name: 'user-search' } as const)
                    : ({ name: 'user-home' } as const),
              )
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'user-action-page' ? (
          <UserActionPageScreen
            pageId={route.pageId}
            onBack={() =>
              route.returnTo === 'member-dashboard'
                ? setRoute({ name: 'member-dashboard' })
                : route.returnTo === 'member-details'
                  ? setRoute({ name: 'member-details' })
                  : setRoute({ name: 'user-home' })
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'about' ? (
          <AboutScreen
            onBack={() =>
              route.returnTo === 'user-search'
                ? setRoute({ name: 'user-search' })
                : setRoute({ name: 'user-home' })
            }
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenWhatWeDo={contentId =>
              setRoute({ name: 'what-we-do-detail', contentId, returnTo: 'about' })
            }
          />
        ) : route.name === 'contact' ? (
          <ContactUsScreen
            onBack={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenGetHelp={() => setRoute({ name: 'user-help' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
          />
        ) : route.name === 'user-help' ? (
          <GetHelpScreen
            onBack={() => setRoute({ name: 'user-home' })}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenFileComplaint={() => setRoute({ name: 'file-complaint' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
          />
        ) : route.name === 'file-complaint' ? (
          <FileComplaintScreen
            onBack={() => setRoute({ name: 'user-help' })}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
          />
        ) : route.name === 'user-rights' ? (
          <UserRightDetailsScreen
            rightId="womens-rights"
            onBack={() => setRoute({ name: 'user-home' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenRight={rightId =>
              setRoute({
                name: 'user-right-details',
                rightId,
                returnTo: 'user-rights',
              })
            }
            onFileComplaint={() => setRoute({ name: 'file-complaint' })}
          />
        ) : route.name === 'user-right-details' ? (
          <UserRightDetailsScreen
            rightId={route.rightId}
            onBack={() =>
              route.returnTo === 'user-rights'
                ? setRoute({ name: 'user-rights' })
                : route.returnTo === 'user-search'
                  ? setRoute({ name: 'user-search' })
                  : route.returnTo === 'member-dashboard'
                    ? setRoute({ name: 'member-dashboard' })
                  : setRoute({ name: 'user-home' })
            }
            topicsOnly={route.topicsOnly}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
            onOpenRight={rightId =>
              setRoute({
                name: 'user-right-details',
                rightId,
                returnTo: route.returnTo,
              })
            }
            onFileComplaint={() => setRoute({ name: 'file-complaint' })}
          />
        ) : route.name === 'user-event-details' ? (
          <UserEventDetailsScreen
            event={route.event}
            onBack={() =>
              route.returnTo === 'user-search'
                ? setRoute({ name: 'user-search' })
                : route.returnTo === 'member-dashboard'
                  ? setRoute({ name: 'member-dashboard' })
                  : route.returnTo === 'member-details'
                    ? setRoute({ name: 'member-details' })
                  : setRoute({
                      name: 'user-events',
                      returnTo: route.eventsReturnTo,
                    })
            }
            onRegister={() =>
              setRoute({
                name: 'user-event-register',
                event: route.event,
                returnTo: route.returnTo,
                eventsReturnTo: route.eventsReturnTo,
              })
            }
          />
        ) : route.name === 'user-event-register' ? (
          <RegisterForEventScreen
            event={route.event}
            onBack={() =>
              setRoute({
                name: 'user-event-details',
                event: route.event,
                returnTo: route.returnTo,
                eventsReturnTo: route.eventsReturnTo,
              })
            }
            onBackToEvents={() =>
              route.returnTo === 'user-search'
                ? setRoute({ name: 'user-search' })
                : route.returnTo === 'member-dashboard'
                  ? setRoute({ name: 'member-dashboard' })
                  : route.returnTo === 'member-details'
                    ? setRoute({ name: 'member-details' })
                  : setRoute({
                      name: 'user-events',
                      returnTo: route.eventsReturnTo,
                    })
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
          />
        ) : route.name === 'user-events' ? (
          <UserEventsScreen
            onBack={() =>
              route.returnTo === 'member-dashboard'
                ? setRoute({ name: 'member-dashboard' })
                : route.returnTo === 'member-details'
                  ? setRoute({ name: 'member-details' })
                  : setRoute({ name: 'user-home' })
            }
            onOpenEvent={event =>
              setRoute({
                name: 'user-event-details',
                event,
                returnTo: 'user-events',
                eventsReturnTo: route.returnTo,
              })
            }
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
            onOpenNews={() => setRoute({ name: 'user-news' })}
          />
        ) : route.name === 'user-news-details' ? (
          <UserNewsDetailsScreen
            article={route.article}
            onBack={() =>
              route.returnTo === 'user-search'
                ? setRoute({ name: 'user-search' })
                : setRoute({ name: 'user-news' })
            }
            onOpenArticle={article =>
              setRoute({ name: 'user-news-details', article })
            }
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'user-news' ? (
          <UserNewsScreen
            onOpenArticle={article => setRoute({ name: 'user-news-details', article })}
            onOpenHome={() => setRoute({ name: 'user-home' })}
            onOpenAbout={() => setRoute({ name: 'about' })}
            onOpenRights={() => setRoute({ name: 'user-rights' })}
            onOpenEvents={() => setRoute({ name: 'user-events' })}
            onOpenContact={() => setRoute({ name: 'contact' })}
          />
        ) : route.name === 'edit' ? (
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
      </HeaderActionsProvider>
    </SafeAreaProvider>
  );
}

export default App;
