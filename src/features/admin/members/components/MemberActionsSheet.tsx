import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  AppIconComponent,
  Eye,
  KeyRound,
  Pencil,
  UserCheck,
  UserX,
} from '../../../../core/components/icons';
import { Member } from '../types';

export interface MenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MemberActionsSheetProps {
  member: Member | null;
  anchor?: MenuAnchor | null;
  visible?: boolean;
  onClose: () => void;
  onSelectAction?: (key: string, member: Member) => void;
}

interface ActionItem {
  key: string;
  label: string;
  Icon: AppIconComponent;
  destructive?: boolean;
}

/**
 * Compact floating contextual popup menu (popover/overflow menu) anchored
 * to the three-dot button of a member card.
 */
export const MemberActionsSheet: React.FC<MemberActionsSheetProps> = ({
  member,
  anchor,
  visible = true,
  onClose,
  onSelectAction,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (member && visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.94);
    }
  }, [member, visible, fadeAnim, scaleAnim]);

  // Support Escape key to close popup on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const globalScope = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
      if (globalScope?.addEventListener) {
        const handleKeyDown = (e: any) => {
          if (e?.key === 'Escape') {
            onClose();
          }
        };
        globalScope.addEventListener('keydown', handleKeyDown);
        return () => globalScope.removeEventListener('keydown', handleKeyDown);
      }
    }
  }, [onClose]);

  if (!member || !visible) return null;

  const isActive = member.status !== 'INACTIVE';

  const actions: ActionItem[] = [
    {
      key: 'view',
      label: 'View Profile',
      Icon: Eye,
    },
    {
      key: 'edit',
      label: 'Edit Member',
      Icon: Pencil,
    },
    {
      key: 'reset-password',
      label: 'Reset Password',
      Icon: KeyRound,
    },
    isActive
      ? {
          key: 'block',
          label: 'Block User',
          Icon: UserX,
          destructive: true,
        }
      : {
          key: 'unblock',
          label: 'Unblock User',
          Icon: UserCheck,
        },
  ];

  const POPUP_WIDTH = 195;
  const POPUP_HEIGHT = 186;
  const MARGIN = 10;

  // Horizontal positioning: align right edge of popup with right edge of anchor button
  let left = anchor
    ? anchor.x + anchor.width - POPUP_WIDTH
    : windowWidth - POPUP_WIDTH - MARGIN;

  if (left < MARGIN) {
    left = MARGIN;
  } else if (left + POPUP_WIDTH > windowWidth - MARGIN) {
    left = windowWidth - POPUP_WIDTH - MARGIN;
  }

  // Vertical positioning: prefer below anchor; if overflows screen, flip above anchor
  let top = anchor ? anchor.y + anchor.height + 4 : 120;

  if (top + POPUP_HEIGHT > windowHeight - MARGIN) {
    if (anchor && anchor.y - POPUP_HEIGHT - 4 >= MARGIN) {
      top = anchor.y - POPUP_HEIGHT - 4;
    } else {
      top = Math.max(MARGIN, windowHeight - POPUP_HEIGHT - MARGIN);
    }
  }

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.popup,
                {
                  top,
                  left,
                  width: POPUP_WIDTH,
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
              testID="member-actions-popup"
            >
              {actions.map(({ key, label, Icon, destructive }) => (
                <TouchableOpacity
                  key={key}
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onSelectAction?.(key, member);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  testID={`member-action-${key}`}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      destructive && styles.iconCircleDestructive,
                    ]}
                  >
                    <Icon
                      size={15}
                      color={destructive ? '#EF4444' : '#06294D'}
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.actionLabel,
                      destructive && styles.actionLabelDestructive,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const MemberActionsMenu = MemberActionsSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  popup: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDestructive: {
    backgroundColor: '#FDEEEF',
  },
  actionLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#06294D',
    letterSpacing: 0.1,
  },
  actionLabelDestructive: {
    color: '#EF4444',
  },
});

export default MemberActionsSheet;

