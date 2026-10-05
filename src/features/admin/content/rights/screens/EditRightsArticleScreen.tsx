import React, { useMemo } from 'react';
import { RightsArticleForm } from '../components/RightsArticleForm';
import type { RightsArticle, RightsArticleFormState } from '../types/rights.types';

/**
 * Maps the selected article to the shared form state so Edit opens
 * pre-filled with that article's existing local data. Paragraphs join with
 * blank lines — the same storage the content text area edits. Fields the
 * list record does not carry yet fall back to UI-only demo values until the
 * backend DTO lands.
 */
const mapArticleToForm = (article: RightsArticle): RightsArticleFormState => ({
  coverImageUri: article.thumbnailUrl ?? null,
  title: article.title,
  category: article.category,
  shortDescription: article.description,
  content: article.content.join('\n\n'),
  author: article.author,
  status: article.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  // Demo preferences — no backend fields exist yet (Create defaults).
  allowComments: true,
  featured: false,
  tags: [...(article.tags ?? [])],
});

interface EditRightsArticleScreenProps {
  /** The article selected on the Know Your Rights list / details screen. */
  article: RightsArticle;
  /** Back navigation to Right Article Details (back arrow, discard). */
  onBack: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

/**
 * Edit Rights Article screen.
 *
 * The SAME shared RightsArticleForm as Create Rights, opened in edit mode and
 * pre-filled with the selected article's data. UI-only phase: validation is
 * local and both save actions show UI-only confirmations — NO API is called
 * and nothing claims the article was actually updated on a backend.
 */
export const EditRightsArticleScreen: React.FC<EditRightsArticleScreenProps> = ({
  article,
  onBack,
  onTabPress,
}) => {
  const initialForm = useMemo(() => mapArticleToForm(article), [article]);

  return (
    <RightsArticleForm
      mode="edit"
      title="Edit Rights Article"
      subtitle="Update the rights article information."
      initialForm={initialForm}
      onCancel={onBack}
      onSaved={onBack}
      onTabPress={onTabPress}
    />
  );
};
