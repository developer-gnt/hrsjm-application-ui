import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthLogo } from '../../features/auth/components/AuthLogo';
import { AdminColors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { useAuthStore } from '../../features/auth/store/authStore';

interface DashboardHeaderProps {
  unreadCount?: number;
  /** Navigate helper from the dashboard screen's tab navigator. */
  onOpenMore: () => void;
}

/**
 * Top navigation header matching the approved official brand design:
 * Clean white background with safe area support, hamburger menu,
 * official HRSJM shield logo + bilingual wordmark, notification bell with badge,
 * and user profile avatar with dropdown chevron.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  unreadCount = 3,
  onOpenMore,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'A';

  return (
    <View
      style={[
        styles.band,
        {
          paddingTop:
            Platform.OS === 'ios'
              ? Math.max(insets.top, 12)
              : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 14),
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Hamburger Menu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onOpenMore}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Open more menu"
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Official HRSJM Logo + Wordmark */}
      <View style={styles.logoWrap}>
        <AuthLogo size="sm" layout="horizontal" variant="dark" />
      </View>

      {/* Right Controls: Notifications & Profile */}
      <View style={styles.rightRow}>
        <TouchableOpacity
          style={styles.bellWrap}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={onOpenMore}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuButton: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A365D',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellWrap: {
    position: 'relative',
    padding: 4,
  },
  bellIcon: {
    fontSize: 20,
    color: '#1A365D',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.bodyBold,
    color: '#1A365D',
    fontSize: 13,
  },
  chevron: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A365D',
  },
});

export default DashboardHeader;
