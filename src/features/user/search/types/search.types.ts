import type { UserEvent } from '../../events/data/user-events';
import type { UserNewsArticle } from '../../news/data/user-news';
import type { WhatWeDoId } from '../../what-we-do';

export type GlobalSearchResult =
  | {
      id: string;
      kind: 'event';
      title: string;
      excerpt: string;
      event: UserEvent;
    }
  | {
      id: string;
      kind: 'news';
      title: string;
      excerpt: string;
      article: UserNewsArticle;
    }
  | {
      id: string;
      kind: 'right';
      title: string;
      excerpt: string;
      rightId: string;
    }
  | {
      id: string;
      kind: 'work-area';
      title: string;
      excerpt: string;
      contentId: WhatWeDoId;
    }
  | {
      id: string;
      kind: 'about';
      title: string;
      excerpt: string;
    };
