import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import {
  AlertCircle,
  CheckCircle2,
  TriangleAlert,
  X,
} from '../icons';

export type FeedbackTone = 'success' | 'warning' | 'error' | 'info';

export interface FeedbackAction {
  text: string;
  onPress?: () => void | Promise<void>;
  variant?: 'primary' | 'destructive' | 'outline' | 'secondary';
  loading?: boolean;
}

export interface AppFeedbackModalProps {
  visible: boolean;
  tone?: FeedbackTone;
  title: string;
  message: string;
  badgeText?: string;
  primaryAction?: FeedbackAction;
  secondaryAction?: FeedbackAction;
  onClose: () => void;
}

const TONE_CONFIG = {
  success: {
    badge: 'SUCCESS',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    badgeBorder: '#A7F3D0',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    accentBorder: '#10B981',
    Icon: CheckCircle2,
    defaultBtnText: 'Great, Done',
    btnBg: BrandColors.navy,
  },
  warning: {
    badge: 'ATTENTION',
    badgeBg: '#FFFBEB',
    badgeText: '#92400E',
    badgeBorder: '#FDE68A',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    accentBorder: '#F59E0B',
    Icon: TriangleAlert,
    defaultBtnText: 'Proceed',
    btnBg: '#D97706',
  },
  error: {
    badge: 'FAILED',
    badgeBg: '#FEF2F2',
    badgeText: '#991B1B',
    badgeBorder: '#FECACA',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentBorder: '#EF4444',
    Icon: AlertCircle,
    defaultBtnText: 'Dismiss',
    btnBg: '#DC2626',
  },
  info: {
    badge: 'NOTICE',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    badgeBorder: '#BFDBFE',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    accentBorder: BrandColors.navy,
    Icon: AlertCircle,
    defaultBtnText: 'Got It',
    btnBg: BrandColors.navy,
  },
};

export const AppFeedbackModal: React.FC<AppFeedbackModalProps> = ({
  visible,
  tone = 'success',
  title,
  message,
  badgeText,
  primaryAction,
  secondaryAction,
  onClose,
}) => {
  const config = TONE_CONFIG[tone] || TONE_CONFIG.success;
  const ToneIcon = config.Icon;

  const handlePrimaryPress = async () => {
    if (primaryAction?.onPress) {
      await primaryAction.onPress();
    }
    onClose();
  };

  const handleSecondaryPress = async () => {
    if (secondaryAction?.onPress) {
      await secondaryAction.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Top Decorative Strip */}
          <View
            style={[styles.topStrip, { backgroundColor: config.accentBorder }]}
          />

          <View style={styles.content}>
            {/* Tone Icon with Glowing Outer Halo */}
            <View
              style={[
                styles.iconHalo,
                { backgroundColor: config.badgeBg, borderColor: config.badgeBorder },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: config.iconBg },
                ]}
              >
                <ToneIcon size={28} color={config.iconColor} strokeWidth={2.5} />
              </View>
            </View>

            {/* Badge Pill */}
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: config.badgeBg,
                  borderColor: config.badgeBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgePillText,
                  { color: config.badgeText },
                ]}
              >
                {badgeText || config.badge}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Actions */}
            <View style={styles.actionContainer}>
              {secondaryAction ? (
                <TouchableOpacity
                  onPress={handleSecondaryPress}
                  style={styles.secondaryBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryBtnText}>
                    {secondaryAction.text}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={handlePrimaryPress}
                style={[
                  styles.primaryBtn,
                  primaryAction?.variant === 'destructive'
                    ? styles.destructiveBtn
                    : { backgroundColor: config.btnBg },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>
                  {primaryAction?.text || config.defaultBtnText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 58, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  topStrip: {
    height: 4,
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  iconHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.navyDeep,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xl,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.navyDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  destructiveBtn: {
    backgroundColor: BrandColors.danger,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default AppFeedbackModal;
