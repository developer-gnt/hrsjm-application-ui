import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional buttons row rendered under the content. */
  footer?: React.ReactNode;
  /** Max content height; content scrolls. */
  maxHeight?: number;
}

/**
 * Centered modal dialog used for forms, pickers and confirmations across
 * admin features (spec §10 AppModal). Content scrolls when tall.
 */
export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeight = 420,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      <View style={[styles.card, { maxHeight }]}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  close: {
    ...Typography.sectionHeader,
    color: AdminColors.textMuted,
  },
  footer: {
    marginTop: Spacing.md,
  },
});