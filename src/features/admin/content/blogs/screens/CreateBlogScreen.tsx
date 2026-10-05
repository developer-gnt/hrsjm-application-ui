import React from 'react';
import { EMPTY_BLOG_FORM, BlogForm } from '../components/BlogForm';

interface CreateBlogScreenProps {
  /**
   * TEMPORARY: back navigation to the Blogs list (back arrow, discard,
   * Android hardware back, after-create confirmation). Real navigation
   * replaces this later.
   */
  onCancel: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

/**
 * Create Blog screen (Create Blog reference).
 *
 * Thin wrapper around the shared BlogForm so the future Edit Blog flow can
 * reuse the exact same form. All sections, validation, pickers, dirty-state
 * handling and the UI-only confirmations live in BlogForm.
 */
export const CreateBlogScreen: React.FC<CreateBlogScreenProps> = ({
  onCancel,
  onTabPress,
}) => {
  return (
    <BlogForm
      title="Create Blog"
      subtitle="Create and publish a new blog article."
      initialForm={EMPTY_BLOG_FORM}
      onCancel={onCancel}
      onTabPress={onTabPress}
    />
  );
};
