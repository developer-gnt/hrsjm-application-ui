import React, { useMemo } from 'react';
import { NewsForm } from '../components/NewsForm';
import type { CreateNewsFormState, NewsListItem } from '../types/news.types';

/**
 * Maps a display date ("28 Sep 2026") to the form's ISO YYYY-MM-DD storage —
 * the reverse of formatDate. Returns null when the format is unexpected.
 */
const parseDisplayDate = (value: string): string | null => {
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) {
    return null;
  }
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthIndex = months.findIndex(month => month === match[2].toLowerCase());
  if (monthIndex < 0) {
    return null;
  }
  return `${match[3]}-${String(monthIndex + 1).padStart(2, '0')}-${match[1].padStart(2, '0')}`;
};

/** Maps a display time ("04:30 PM") to the form's 24h HH:mm storage. */
const parseDisplayTime = (value: string): string | null => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') {
    hours += 12;
  }
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
};

const slugifyTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Maps the selected list-row news to the shared form state so Edit opens
 * pre-filled. Display strings are converted back into the form's existing
 * storage formats (ISO YYYY-MM-DD dates, 24h HH:mm times) — the same
 * conventions Create News uses. Fields the list record does not carry yet
 * fall back to UI-only demo values until the backend DTO lands.
 */
const mapNewsToForm = (news: NewsListItem): CreateNewsFormState => ({
  headline: news.title,
  slug: slugifyTitle(news.title),
  summary: news.summary,
  content: (news.content ?? []).join('\n\n'),
  featuredImageUri: news.thumbnailUrl ?? null,
  author: news.author ?? null,
  category: news.category,
  tags: news.tags ? [...news.tags] : [],
  publishDate: parseDisplayDate(news.date),
  publishTime: parseDisplayTime(news.time),
  status: news.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  // Demo preference — the backend comments contract is not defined yet.
  allowComments: true,
});

interface EditNewsScreenProps {
  /** The news item selected on the News list / shown on News Details. */
  news: NewsListItem;
  /** Back navigation to News Details (back arrow, Cancel, discard). */
  onBack: () => void;
}

/**
 * Edit News screen (Edit News reference / PRD).
 *
 * The SAME shared NewsForm as Create News, pre-filled with the selected
 * news item's data. UI-only phase: validation is local and both save actions
 * show UI-only confirmations — NO API is called and nothing claims the news
 * was actually updated on a backend.
 */
export const EditNewsScreen: React.FC<EditNewsScreenProps> = ({ news, onBack }) => {
  const initialForm = useMemo(() => mapNewsToForm(news), [news]);

  return (
    <NewsForm
      mode="edit"
      title="Edit News"
      subtitle="Update news, updates and announcements on HRSJM activities and initiatives."
      initialForm={initialForm}
      onCancel={onBack}
    />
  );
};
