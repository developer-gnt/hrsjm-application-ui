import { Alert } from 'react-native';
import type { NewsListItem } from '../types/news.types';

/**
 * Three-dot action menu for a news row, matching the Events menu pattern.
 * ALL actions are UI-only placeholders in this phase — no backend calls,
 * no endpoints, nothing is persisted. The placeholder copy says so.
 */

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

const showPlaceholder = (action: string) => {
  Alert.alert(action, PLACEHOLDER_MESSAGE);
};

/** Actions per status per the reference (Archived rows offer Restore/Delete). */
export const showNewsActionMenu = (news: NewsListItem): void => {
  const view = () => showPlaceholder('View News');
  const edit = () => showPlaceholder('Edit News');

  const commonButtons: Array<{ text: string; onPress: () => void; style?: 'destructive' | 'cancel' }> = [
    { text: 'View', onPress: view },
    { text: 'Edit', onPress: edit },
  ];

  let statusButtons: typeof commonButtons = [];
  if (news.status === 'PUBLISHED') {
    statusButtons = [
      { text: 'Unpublish', onPress: () => showPlaceholder('Unpublish') },
      { text: 'Archive', onPress: () => showPlaceholder('Archive') },
    ];
  } else if (news.status === 'DRAFT') {
    statusButtons = [
      { text: 'Publish', onPress: () => showPlaceholder('Publish') },
      { text: 'Archive', onPress: () => showPlaceholder('Archive') },
    ];
  } else {
    statusButtons = [
      { text: 'Restore', onPress: () => showPlaceholder('Restore') },
      { text: 'Delete', style: 'destructive', onPress: () => showPlaceholder('Delete') },
    ];
  }

  Alert.alert(news.title, undefined, [...commonButtons, ...statusButtons, { text: 'Cancel', style: 'cancel' }]);
};
