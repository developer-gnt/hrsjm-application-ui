import { ABOUT_CONTENT } from '../../about/data/about-content';
import { USER_EVENTS } from '../../events/data/user-events';
import { USER_NEWS_ARTICLES } from '../../news/data/user-news';
import { RIGHTS_INDEX } from '../../rights/data/rights-content';
import { WHAT_WE_DO_CONTENT } from '../../what-we-do/data/what-we-do-content';
import type { WhatWeDoId } from '../../what-we-do';
import type { GlobalSearchResult } from '../types/search.types';

const workAreaIdMap: Record<string, WhatWeDoId> = {
  monitoring: 'human-rights-monitoring',
  awareness: 'awareness-campaigns',
  workshops: 'workshops-training',
  community: 'community-activities',
  leadership: 'leadership-development',
  advocacy: 'advocacy-awareness',
  research: 'research-rights-education',
  legal: 'legal-rights-awareness',
  other: 'other-work-areas',
};

const getSearchCorpus = (): Array<{
  result: GlobalSearchResult;
  searchableText: string;
}> => [
  ...USER_EVENTS.map(event => ({
    result: {
      id: `event:${event.id}`,
      kind: 'event' as const,
      title: event.title,
      excerpt: `${event.category} · ${event.date} · ${event.location} — ${event.description}`,
      event,
    },
    searchableText: [
      event.title,
      event.category,
      event.tag,
      event.date,
      event.location,
      event.venue,
      event.description,
      ...event.topics,
    ].join(' '),
  })),
  ...USER_NEWS_ARTICLES.map(article => ({
    result: {
      id: `news:${article.id}`,
      kind: 'news' as const,
      title: article.title,
      excerpt: article.excerpt,
      article,
    },
    searchableText: [
      article.title,
      article.category,
      article.contentType,
      article.excerpt,
      ...article.tags,
      ...article.relatedTopics,
      ...article.body,
    ].join(' '),
  })),
  ...RIGHTS_INDEX.map(right => ({
    result: {
      id: `right:${right.id}`,
      kind: 'right' as const,
      title: right.title,
      excerpt: right.description,
      rightId: right.id,
    },
    searchableText: `${right.title} ${right.description}`,
  })),
  ...ABOUT_CONTENT.workAreas.flatMap(area => {
    const contentId = workAreaIdMap[area.id];
    if (!contentId) {
      return [];
    }
    const content = WHAT_WE_DO_CONTENT[contentId];
    return [{
      result: {
        id: `work-area:${contentId}`,
        kind: 'work-area' as const,
        title: area.title.replace(/\n/g, ' '),
        excerpt: `${area.description} ${content.overview}`,
        contentId,
      },
      searchableText: [
        area.title,
        area.description,
        content.title,
        content.heroDescription,
        content.overview,
        ...content.activities.flatMap(activity => [
          activity.title,
          activity.description,
        ]),
      ].join(' '),
    }];
  }),
  {
    result: {
      id: 'about:hrsjm',
      kind: 'about',
      title: 'About HRSJM',
      excerpt: ABOUT_CONTENT.hero.description,
    },
    searchableText: [
      ABOUT_CONTENT.hero.titleLine,
      ABOUT_CONTENT.hero.titleAccentLine,
      ABOUT_CONTENT.hero.description,
      ...ABOUT_CONTENT.principles.flatMap(principle => [
        principle.title,
        principle.description,
      ]),
    ].join(' '),
  },
];

export const searchApplicationContent = (query: string): GlobalSearchResult[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return getSearchCorpus()
    .filter(({ searchableText }) =>
      searchableText.toLocaleLowerCase().includes(normalizedQuery),
    )
    .map(({ result }) => result);
};
