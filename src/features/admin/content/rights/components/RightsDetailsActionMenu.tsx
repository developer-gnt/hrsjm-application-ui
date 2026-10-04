import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import type { RightsStatus } from '../types/rights.types';

/**
 * Details-screen three-dot action menu, rendered as the reference's anchored
 * top-right dropdown card (white, rounded, subtle shadow, icon rows, red
 * destructive styling, Cancel separated by a hairline). UI-only in this
 * phase: every action is a placeholder handled by the parent screen.
 *
 * Implemented as a transparent Modal positioned below the page-header ⋮
 * button; tapping the backdrop closes it and Android back closes it via
 * onRequestClose (so hardware back never leaves the screen while open).
 */

interface ActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Status-based rows per the reference: Publish follows the article status. */
const actionsForStatus = (status: RightsStatus): ActionRow[] => {
  const rows: ActionRow[] = [{ key: 'edit', icon: '✏️', label: 'Edit' }];

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

interface RightsDetailsActionMenuProps {
  visible: boolean;
  status: RightsStatus;
  /** Called with the pressed action key ('edit', 'unpublish', ...). */
  onAction: (action: string) => void;
  onClose: () => void;
}

export const RightsDetailsActionMenu: React.FC<RightsDetailsActionMenuProps> = ({
  visible,
  status,
  onAction,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Full-screen backdrop: taps anywhere outside the card close the menu. */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close actions"
      >
        <View style={styles.menuCard}>
          {actionsForStatus(status).map((row, index) => (
            <TouchableOpacity
              key={row.key}
              style={[
                styles.actionRow,
                index > 0 && styles.actionRowDivider,
              ]}
              onPress={() => onAction(row.key)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <Text style={[styles.actionIcon, row.destructive && styles.actionIconDanger]}>
                {row.icon}
              </Text>
              <Text style={[styles.actionLabel, row.destructive && styles.actionLabelDanger]}>
                {row.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Cancel separated from the actions per the reference. */}
          <TouchableOpacity
            style={[styles.actionRow, styles.actionRowDivider]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel actions"
          >
            <Text style={styles.actionIcon}>✕</Text>
            <Text style={styles.actionLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.15)',
  },
  menuCard: {
    position: 'absolute',
    top: 96,
    right: Spacing.base,
    minWidth: 200,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    // Reference shows a soft elevated card over the page.
    elevation: 6,
    shadowColor: AdminColors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  actionRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.divider,
  },
  actionIcon: {
    fontSize: 15,
    color: AdminColors.primary,
  },
  actionIconDanger: {
    color: AdminColors.error,
  },
  actionLabel: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  actionLabelDanger: {
    color: AdminColors.error,
  },
});
