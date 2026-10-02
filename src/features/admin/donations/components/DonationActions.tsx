import React, { useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../../core';

export interface DonationActionItem {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface DonationActionsProps {
  /**
   * Actions are decided by permission-aware callers; the menu renders
   * nothing when no permitted actions exist.
   */
  actions: DonationActionItem[];
}

/** Three-dot action menu for donation rows. */
export const DonationActions: React.FC<DonationActionsProps> = ({ actions }) => {
  const [visible, setVisible] = useState(false);

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Donation actions"
      >
        <Text style={styles.dots}>⋮</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.menu, Shadows.cardMedium]}>
            {actions.map(action => (
              <TouchableOpacity
                key={action.label}
                style={styles.menuItem}
                disabled={action.disabled}
                onPress={() => {
                  setVisible(false);
                  action.onPress();
                }}
              >
                <Text
                  style={[
                    styles.menuLabel,
                    action.destructive && styles.menuLabelDanger,
                    action.disabled && styles.menuLabelDisabled,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dots: {
    fontSize: 20,
    fontWeight: '700',
    color: AdminColors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  menu: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.xs,
    marginTop: 100,
    marginRight: Spacing.base,
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  menuLabel: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  menuLabelDanger: {
    color: AdminColors.error,
  },
  menuLabelDisabled: {
    color: AdminColors.textMuted,
  },
});