import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../../core/theme/theme';
import type { AppStackParamList, TabsParamList } from '../../../core/navigation/types';
import { useAuth } from '../../../core/auth/AuthContext';
import { AppLogo } from '../../../core/components/common/AppLogo';
import { Icon } from '../../../core/components/common/Icon';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';
import { AppButton } from '../../../core/components/common/AppButton';
import { useUnreadCount } from '../../admin/notifications/hooks/useUnreadCount';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface MembershipTopBarProps {
  showBack?: boolean;
  onBackPress?: () => void;
}

export function MembershipTopBar({ showBack = false, onBackPress }: MembershipTopBarProps) {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadCount();
  const [menuVisible, setMenuVisible] = useState(false);

  const switchTab = (screen: keyof TabsParamList) => {
    setMenuVisible(false);
    navigation.navigate('Tabs', { screen });
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'MembersTab' });
    }
  };

  const initials = (user?.full_name ?? '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return (
    <View style={styles.bar}>
      {showBack ? (
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.actionButton}>
          <Icon name="chevron-left" size={22} color={colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={styles.actionButton}>
          <Icon name="menu" size={22} color={colors.textPrimary} strokeWidth={2.1} />
        </TouchableOpacity>
      )}

      <View style={styles.logoWrap}>
        <AppLogo size={42} />
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          style={styles.bellButton}>
          <Icon name="bell" size={24} color={colors.primary} strokeWidth={1.9} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => switchTab('MoreTab')}
          accessibilityRole="button"
          accessibilityLabel="Open profile and settings"
          style={styles.profileButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <AppBottomSheet visible={menuVisible} title="Menu" onClose={() => setMenuVisible(false)}>
        <View style={styles.menuList}>
          <AppButton
            title="Membership"
            onPress={() => switchTab('MembersTab')}
            variant="secondary"
            fullWidth
          />
          <AppButton
            title="Donations"
            onPress={() => switchTab('DonationSeekersTab')}
            variant="secondary"
            fullWidth
          />
          <AppButton
            title="Receipts List"
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ReceiptsList');
            }}
            variant="secondary"
            fullWidth
          />
          <AppButton
            title="Complaints"
            onPress={() => switchTab('ComplaintsTab')}
            variant="secondary"
            fullWidth
          />
          <AppButton
            title="Profile & Settings"
            onPress={() => switchTab('MoreTab')}
            variant="secondary"
            fullWidth
          />
          <AppButton
            title="Log Out"
            variant="danger"
            fullWidth
            onPress={() => {
              setMenuVisible(false);
              signOut().catch(() => undefined);
            }}
          />
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    marginRight: spacing.sm,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  menuList: {
    gap: spacing.md,
  },
});

export default MembershipTopBar;
