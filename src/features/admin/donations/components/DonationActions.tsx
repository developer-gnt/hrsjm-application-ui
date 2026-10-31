import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  EllipsisVertical,
  X,
  ChevronRight,
} from '../../../../core';

export interface DonationActionItem {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DonationActionsProps {
  title?: string;
  subtitle?: string;
  actions: DonationActionItem[];
  triggerStyle?: ViewStyle;
}

/** Action menu button and modal sheet for donation rows. */
export const DonationActions: React.FC<DonationActionsProps> = ({
  title = 'Donation Actions',
  subtitle,
  actions,
  triggerStyle,
}) => {
  const [visible, setVisible] = useState(false);

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.triggerButton, triggerStyle]}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Donation actions"
        activeOpacity={0.7}
      >
        <EllipsisVertical size={18} color={AdminColors.textPrimary} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.sheetContainer}
            onPress={e => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderTextWrap}>
                <Text style={styles.sheetTitle}>{title}</Text>
                {subtitle ? (
                  <Text style={styles.sheetSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={() => setVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close actions"
              >
                <X size={16} color={AdminColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Actions List */}
            <View style={styles.actionsList}>
              {actions.map((action, idx) => (
                <TouchableOpacity
                  key={`${action.label}-${idx}`}
                  style={[
                    styles.actionItem,
                    idx < actions.length - 1 && styles.actionItemBorder,
                    action.disabled && styles.actionItemDisabled,
                  ]}
                  disabled={action.disabled}
                  onPress={() => {
                    setVisible(false);
                    setTimeout(() => {
                      action.onPress();
                    }, 50);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  {action.icon ? (
                    <View
                      style={[
                        styles.actionIconContainer,
                        action.destructive && styles.actionIconContainerDestructive,
                      ]}
                    >
                      {action.icon}
                    </View>
                  ) : null}
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionLabel,
                        action.destructive && styles.actionLabelDestructive,
                        action.disabled && styles.actionLabelDisabled,
                      ]}
                    >
                      {action.label}
                    </Text>
                    {action.subtitle ? (
                      <Text style={styles.actionSubtitle} numberOfLines={1}>
                        {action.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    ...Shadows.floating,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: Spacing.xs,
  },
  sheetHeaderTextWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: AdminColors.textPrimary,
  },
  sheetSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsList: {
    marginVertical: Spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  actionItemDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AdminColors.primaryLight || '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  actionIconContainerDestructive: {
    backgroundColor: '#FEE2E2',
  },
  actionTextWrap: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  actionLabelDestructive: {
    color: AdminColors.error,
  },
  actionLabelDisabled: {
    color: AdminColors.textMuted,
  },
  actionSubtitle: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: Spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },
});
