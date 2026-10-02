import React from 'react';
import { EMPTY_NEWS_FORM, NewsForm } from '../components/NewsForm';

interface CreateNewsScreenProps {
  /**
   * TEMPORARY: back navigation to the News list (back arrow, Cancel, discard,
   * Android hardware back). Real navigation replaces this later.
   */
  onCancel: () => void;
}

/**
 * Create News screen (Create News reference / PRD).
 *
 * Thin wrapper around the shared NewsForm — the exact same form the Edit
 * News screen uses, starting empty. All sections, validation, pickers,
 * dirty-state handling and the UI-only save confirmations live in NewsForm.
 */
export const CreateNewsScreen: React.FC<CreateNewsScreenProps> = ({ onCancel }) => {
  return (
    <NewsForm
      mode="create"
      title="Create News"
      subtitle="Create and publish news, updates and announcements on HRSJM activities and initiatives."
      initialForm={EMPTY_NEWS_FORM}
      onCancel={onCancel}
    />
  );
};
