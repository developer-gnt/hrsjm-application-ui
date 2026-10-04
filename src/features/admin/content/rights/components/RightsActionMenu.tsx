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
import type { RightsListItem, RightsStatus } from '../types/rights.types';

/**
 * Three-dot action menu for a rights article, rendered as a bottom action
 * sheet that matches the Blog action menu pattern. ALL actions are UI-only
 * placeholders in this phase — no backend calls, no endpoints, nothing is
 * persisted. The placeholder copy says so.
 *
 * Implemented as a Modal instead of Alert.alert because Android renders at
 * most three Alert buttons, which would drop Delete/Cancel.
 */

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

const showPlaceholder = (action: string) => {
  Alert.alert(action, PLACEHOLDER_MESSAGE);
};

interface RightsActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Actions per status per the reference (Publish/Unpublish follow the status). */
const actionsForStatus = (status: RightsStatus): RightsActionRow[] => {
  const rows: RightsActionRow[] = [{ key: 'edit', icon: '✏️', label: 'Edit' }];

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

interface RightsActionMenuProps {
  visible: boolean;
  /** Article whose menu is open; kept mounted during the close animation. */
  article: RightsListItem | null;
  /**
   * Optional handler for a pressed action key ('edit', 'unpublish', ...).
   * When not provided, every action shows the UI-only placeholder alert.
   */
  onAction?: (action: string) => void;
  onClose: () => void;
}

export const RightsActionMenu: React.FC<RightsActionMenuProps> = ({
  visible,
  article,
  onAction,
  onClose,
}) => {
  if (!article) {
    return null;
  }

  const handleAction = (row: RightsActionRow) => {
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
              {article.title}
            </Text>

            {actionsForStatus(article.status).map(row => (
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
