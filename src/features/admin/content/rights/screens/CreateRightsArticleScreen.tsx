import React from 'react';
import { RightsArticleForm } from '../components/RightsArticleForm';
import { EMPTY_RIGHTS_ARTICLE_FORM } from '../data/sample-rights';

interface CreateRightsArticleScreenProps {
  /**
   * TEMPORARY: back navigation to the Know Your Rights list (back arrow,
   * discard, Android hardware back). Real navigation replaces this later.
   */
  onCancel: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

/**
 * Create Rights Article screen (Create Rights reference).
 *
 * Renders the shared RightsArticleForm with the reference starting values.
 * All sections, validation, pickers, dirty-state handling and the UI-only
 * confirmations live in RightsArticleForm. NO backend — nothing is uploaded
 * or persisted.
 */
export const CreateRightsArticleScreen: React.FC<CreateRightsArticleScreenProps> = ({
  onCancel,
  onTabPress,
}) => {
  return (
    <RightsArticleForm
      title="Create Rights Article"
      subtitle="Add new informational content about human rights."
      initialForm={EMPTY_RIGHTS_ARTICLE_FORM}
      onCancel={onCancel}
      onTabPress={onTabPress}
    />
  );
};
