import { Alert } from 'react-native';
import type { BlogListItem } from '../types/blog.types';

/**
 * Three-dot action menu for a blog row, matching the News/Events menu
 * pattern. ALL actions are UI-only placeholders in this phase — no backend
 * calls, no endpoints, nothing is persisted. The placeholder copy says so.
 */

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

const showPlaceholder = (action: string) => {
  Alert.alert(action, PLACEHOLDER_MESSAGE);
};

/** Actions per status per the reference (Archived rows offer Restore). */
export const showBlogActionMenu = (blog: BlogListItem): void => {
  const commonButtons: Array<{ text: string; onPress: () => void; style?: 'destructive' | 'cancel' }> = [
    { text: 'Edit', onPress: () => showPlaceholder('Edit Blog') },
  ];

  let statusButtons: typeof commonButtons = [];
  if (blog.status === 'PUBLISHED') {
    statusButtons = [
      { text: 'Unpublish', onPress: () => showPlaceholder('Unpublish') },
      { text: 'Archive', onPress: () => showPlaceholder('Archive') },
    ];
  } else if (blog.status === 'DRAFT') {
    statusButtons = [
      { text: 'Publish', onPress: () => showPlaceholder('Publish') },
    ];
  } else {
    statusButtons = [
      { text: 'Restore', onPress: () => showPlaceholder('Restore') },
    ];
  }

  Alert.alert(blog.title, undefined, [
    ...commonButtons,
    ...statusButtons,
    { text: 'Delete', style: 'destructive', onPress: () => showPlaceholder('Delete') },
    { text: 'Cancel', style: 'cancel' },
  ]);
};
