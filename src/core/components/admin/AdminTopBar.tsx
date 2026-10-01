import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../theme/theme';
import type { AppStackParamList, TabsParamList } from '../../navigation/types';
import { useAuth } from '../../auth/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Icon } from '../common/Icon';
import { AppBottomSheet } from '../common/AppBottomSheet';
import { AppButton } from '../common/AppButton';
import { useUnreadCount } from '../../../features/admin/notifications/hooks/useUnreadCount';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Application top bar per the approved design: hamburger, HRSJM logo,
// notification bell with unread badge, profile avatar.
export function AdminTopBar() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadCount();
  const [menuVisible, setMenuVisible] = useState(false);

  const switchTab = (screen: keyof TabsParamList) => {
    setMenuVisible(false);
    navigation.navigate('Tabs', { screen });
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
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={styles.menuButton}>
        <Icon name="menu" size={22} color={colors.textPrimary} strokeWidth={2.1} />
      </TouchableOpacity>

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
          <Icon name="chevron-down" size={16} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <AppBottomSheet visible={menuVisible} title="Menu" onClose={() => setMenuVisible(false)}>
        <View style={styles.menuList}>
          <AppButton title="Donation Seekers" onPress={() => switchTab('DonationSeekersTab')} variant="secondary" fullWidth />
          <AppButton title="Complaints" onPress={() => switchTab('ComplaintsTab')} variant="secondary" fullWidth />
          <AppButton title="Profile & Settings" onPress={() => switchTab('MoreTab')} variant="secondary" fullWidth />
          <AppButton title="Log Out" variant="danger" fullWidth onPress={() => {
            setMenuVisible(false);
            signOut().catch(() => undefined);
          }} />
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
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  menuList: {
    gap: spacing.md,
  },
});

export default AdminTopBar;
