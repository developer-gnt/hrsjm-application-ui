import React, { useMemo } from 'react';
import { BlogForm } from '../components/BlogForm';
import type { BlogListItem, CreateBlogFormState } from '../types/blog.types';

/**
 * Maps the selected blog row to the shared form state so Edit opens
 * pre-filled with that blog's existing local data. Paragraphs join with
 * blank lines — the same storage the content text area edits. Fields the
 * list record does not carry yet fall back to UI-only demo values until the
 * backend DTO lands.
 */
const mapBlogToForm = (blog: BlogListItem): CreateBlogFormState => ({
  coverImageUri: blog.thumbnailUrl ?? null,
  title: blog.title,
  category: blog.category,
  shortDescription: blog.excerpt,
  content:
    blog.content && blog.content.length > 0 ? blog.content.join('\n\n') : blog.excerpt,
  author: blog.author ?? 'HRSJM',
  status: blog.status,
  // Demo preferences — no backend fields exist yet (Create Blog defaults).
  allowComments: true,
  featured: false,
  tagsText: (blog.tags ?? []).join(', '),
});

interface EditBlogScreenProps {
  /** The blog selected on the Blogs list / shown on Blog Details. */
  blog: BlogListItem;
  /** Back navigation to Blog Details (back arrow, Cancel, discard). */
  onBack: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

/**
 * Edit Blog screen.
 *
 * The SAME shared BlogForm as Create Blog, opened in edit mode and pre-filled
 * with the selected blog's data. UI-only phase: validation is local and both
 * save actions show UI-only confirmations — NO API is called and nothing
 * claims the blog was actually updated on a backend.
 */
export const EditBlogScreen: React.FC<EditBlogScreenProps> = ({
  blog,
  onBack,
  onTabPress,
}) => {
  const initialForm = useMemo(() => mapBlogToForm(blog), [blog]);

  return (
    <BlogForm
      mode="edit"
      title="Edit Blog"
      subtitle="Update and manage this blog article."
      initialForm={initialForm}
      onCancel={onBack}
      onSaved={onBack}
      onTabPress={onTabPress}
    />
  );
};
