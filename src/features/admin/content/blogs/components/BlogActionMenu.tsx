import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import type { BlogListItem, BlogStatus } from '../types/blog.types';

/**
 * Three-dot action menu for a blog row, rendered as a bottom action sheet that
 * matches the News details action menu pattern. ALL actions are UI-only
 * placeholders in this phase — no backend calls, no endpoints, nothing is
 * persisted. The placeholder copy says so.
 *
 * Implemented as a Modal instead of Alert.alert because Android renders at
 * most three Alert buttons, which silently dropped Delete/Cancel.
 */

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

const showPlaceholder = (action: string) => {
  Alert.alert(action, PLACEHOLDER_MESSAGE);
};

interface BlogActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Actions per status per the reference (Archived rows offer Restore). */
const actionsForStatus = (status: BlogStatus): BlogActionRow[] => {
  const rows: BlogActionRow[] = [{ key: 'edit', icon: '✏️', label: 'Edit' }];

  if (status === 'PUBLISHED') {
    rows.push(
      { key: 'unpublish', icon: '🚫', label: 'Unpublish', destructive: true },
      { key: 'archive', icon: '📦', label: 'Archive' },
    );
  } else if (status === 'DRAFT') {
    rows.push({ key: 'publish', icon: '📣', label: 'Publish' });
  } else {
    rows.push({ key: 'restore', icon: '♻️', label: 'Restore' });
  }

  rows.push({ key: 'delete', icon: '🗑️', label: 'Delete', destructive: true });
  return rows;
};

interface BlogActionMenuProps {
  visible: boolean;
  /** Blog whose menu is open; kept mounted during the close animation. */
  blog: BlogListItem | null;
  /**
   * Optional handler for a pressed action key ('edit', 'unpublish', ...).
   * When not provided, every action shows the UI-only placeholder alert.
   */
  onAction?: (action: string) => void;
  onClose: () => void;
}

export const BlogActionMenu: React.FC<BlogActionMenuProps> = ({
  visible,
  blog,
  onAction,
  onClose,
}) => {
  if (!blog) {
    return null;
  }

  const handleAction = (row: BlogActionRow) => {
    onClose();
    if (onAction) {
      onAction(row.key);
      return;
    }
    showPlaceholder(row.label);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={onClose}
          accessibilityLabel="Close actions"
        />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle} numberOfLines={1} ellipsizeMode="tail">
              {blog.title}
            </Text>

            {actionsForStatus(blog.status).map(row => (
              <TouchableOpacity
                key={row.key}
                style={styles.actionRow}
                onPress={() => handleAction(row)}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <Text style={styles.actionIcon}>{row.icon}</Text>
                <Text style={[styles.actionLabel, row.destructive && styles.actionLabelDanger]}>
                  {row.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel actions"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: AdminColors.cardSurface,
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.border,
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.divider,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  actionLabelDanger: {
    color: AdminColors.error,
  },
  cancelButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  cancelButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
});
