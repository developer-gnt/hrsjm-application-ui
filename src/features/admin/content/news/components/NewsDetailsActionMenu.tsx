import React from 'react';
import {
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
import type { NewsStatus, NewsListItem } from '../types/news.types';

/**
 * Details-screen action bottom sheet + delete confirmation dialog.
 * UI-only in this phase: every action is a placeholder handled by the parent
 * screen (no backend calls). Visual language matches the reference: white
 * sheet, rounded top corners, drag handle, icon rows, red destructive styling,
 * and a centered delete dialog with a light-red icon circle.
 */

interface ActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Status-based rows (spec section 24) — Cancel renders as a separate button. */
const actionsForStatus = (status: NewsStatus): ActionRow[] => {
  if (status === 'PUBLISHED') {
    return [
      { key: 'edit', icon: '✏️', label: 'Edit' },
      { key: 'unpublish', icon: '🚫', label: 'Unpublish', destructive: true },
      { key: 'archive', icon: '📦', label: 'Archive' },
      { key: 'share', icon: '🔗', label: 'Share' },
      { key: 'copyLink', icon: '📋', label: 'Copy Link' },
      { key: 'delete', icon: '🗑️', label: 'Delete', destructive: true },
    ];
  }
  if (status === 'DRAFT') {
    return [
      { key: 'edit', icon: '✏️', label: 'Edit' },
      { key: 'publish', icon: '📣', label: 'Publish' },
      { key: 'archive', icon: '📦', label: 'Archive' },
      { key: 'share', icon: '🔗', label: 'Share' },
      { key: 'copyLink', icon: '📋', label: 'Copy Link' },
      { key: 'delete', icon: '🗑️', label: 'Delete', destructive: true },
    ];
  }
  return [
    { key: 'view', icon: '👁', label: 'View' },
    { key: 'restore', icon: '♻️', label: 'Restore' },
    { key: 'delete', icon: '🗑️', label: 'Delete', destructive: true },
  ];
};

interface NewsDetailsActionMenuProps {
  visible: boolean;
  news: NewsListItem;
  /** Called with the pressed action key ('edit', 'unpublish', ... ). */
  onAction: (action: string) => void;
  onClose: () => void;
}

export const NewsDetailsActionMenu: React.FC<NewsDetailsActionMenuProps> = ({
  visible,
  news,
  onAction,
  onClose,
}) => {
  const rows = actionsForStatus(news.status);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} accessibilityLabel="Close actions" />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />

            {rows.map(row => (
              <TouchableOpacity
                key={row.key}
                style={styles.actionRow}
                onPress={() => onAction(row.key)}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <Text style={styles.actionIcon}>{row.icon}</Text>
                <Text style={[styles.actionLabel, row.destructive && styles.actionLabelDanger]}>
                  {row.label}
                </Text>
              </TouchableOpacity>
            ))}

            <AppButtonLike
              label="Cancel"
              onPress={onClose}
              accessibilityLabel="Cancel actions"
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const AppButtonLike: React.FC<{ label: string; onPress: () => void; accessibilityLabel: string }> = ({
  label,
  onPress,
  accessibilityLabel,
}) => (
  <TouchableOpacity
    style={styles.cancelButton}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
  >
    <Text style={styles.cancelButtonText}>{label}</Text>
  </TouchableOpacity>
);

interface NewsDeleteConfirmDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Centered delete confirmation matching the reference: red trash icon in a
 * light-red circle, Cancel + red Delete. State-driven, so duplicate dialogs
 * cannot stack; Android back closes it via onRequestClose.
 */
export const NewsDeleteConfirmDialog: React.FC<NewsDeleteConfirmDialogProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogBackdrop}>
        <View style={styles.dialogCard}>
          <View style={styles.dialogIconCircle}>
            <Text style={styles.dialogIcon}>🗑️</Text>
          </View>
          <Text style={styles.dialogTitle}>Delete News</Text>
          <Text style={styles.dialogMessage}>
            Are you sure you want to delete this news? This action cannot be undone.
          </Text>
          <View style={styles.dialogButtonsRow}>
            <TouchableOpacity
              style={styles.dialogCancelButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel delete"
            >
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogDeleteButton}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete"
            >
              <Text style={styles.dialogDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  dialogIconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dialogIcon: {
    fontSize: 22,
  },
  dialogTitle: {
    ...Typography.bodyBold,
    fontSize: 17,
    lineHeight: 22,
    color: AdminColors.textPrimary,
  },
  dialogMessage: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
  dialogCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  dialogCancelText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  dialogDeleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.error,
  },
  dialogDeleteText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textOnDark,
  },
});
