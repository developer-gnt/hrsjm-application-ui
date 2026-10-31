import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon, IconName } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { useNotificationsStore } from '../../../notifications/store/useNotificationsStore';
import type { NotificationItem } from '../../../notifications/types/notification.types';

export interface NotificationsScreenProps {
  onBack: () => void;
  onOpenSearch?: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recent';
  const now = Date.now();
  const past = new Date(dateString).getTime();
  if (isNaN(past)) return 'Recent';

  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function getNotificationCategory(item: NotificationItem): {
  icon: IconName;
  badgeBg: string;
  badgeColor: string;
} {
  const title = (item.notification?.title || '').toLowerCase();
  const body = (item.notification?.body || '').toLowerCase();

  if (title.includes('donation') || body.includes('donation') || title.includes('💰') || body.includes('gratitude')) {
    return { icon: 'heart-hands', badgeBg: '#ECFDF5', badgeColor: '#059669' };
  }
  if (title.includes('membership') || body.includes('membership') || title.includes('renew')) {
    return { icon: 'shield-check', badgeBg: '#EFF6FF', badgeColor: '#2563EB' };
  }
  if (title.includes('ticket') || title.includes('support') || body.includes('complaint')) {
    return { icon: 'message', badgeBg: '#FEF3C7', badgeColor: '#D97706' };
  }
  if (title.includes('event') || body.includes('event') || title.includes('📅')) {
    return { icon: 'calendar', badgeBg: '#F3E8FF', badgeColor: '#7C3AED' };
  }
  if (title.includes('cause') || body.includes('assistance') || title.includes('urgent') || title.includes('appeal')) {
    return { icon: 'heart', badgeBg: '#FEE2E2', badgeColor: '#DC2626' };
  }

  return { icon: 'bell', badgeBg: AdminColors.accentGoldLight, badgeColor: AdminColors.primaryDark };
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenSearch,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    activeFilter,
    setFilter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') onOpenHome?.();
    else if (tab.id === 'about') onOpenAbout?.();
    else if (tab.id === 'rights') onOpenRights?.();
    else if (tab.id === 'events') onOpenEvents?.();
    else if (tab.id === 'news') onOpenNews?.();
    else if (tab.id === 'contact') onOpenContact?.();
  };

  const handleItemPress = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.recipient_id);
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const meta = getNotificationCategory(item);
    const timeLabel = formatRelativeTime(
      item.notification?.sent_at || item.created_at,
    );

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
        style={[styles.card, !item.is_read && styles.unreadCard]}
      >
        <View style={[styles.categoryIcon, { backgroundColor: meta.badgeBg }]}>
          <AppIcon name={meta.icon} size={20} color={meta.badgeColor} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text
              style={[styles.cardTitle, !item.is_read && styles.unreadTitle]}
              numberOfLines={2}
            >
              {item.notification?.title || 'Notification'}
            </Text>
            <Text style={styles.timeText}>{timeLabel}</Text>
          </View>

          <Text style={styles.cardBody} numberOfLines={3}>
            {item.notification?.body || ''}
          </Text>
        </View>

        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        onPressSearch={onOpenSearch}
        onPressNotifications={() => undefined}
        preferLocalActions
      />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
                : 'All caught up with your latest updates'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'all' && styles.filterPillActive,
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'unread' && styles.filterPillActive,
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'unread' && styles.filterPillTextActive,
              ]}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AdminColors.primaryDark} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.recipient_id}
            renderItem={renderNotificationItem}
            contentContainerStyle={
              notifications.length === 0
                ? styles.emptyContainer
                : styles.listContent
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchNotifications(true)}
                tintColor={AdminColors.primaryDark}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.iconCircle}>
                  <AppIcon
                    name="bell"
                    size={28}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {activeFilter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </Text>
                <Text style={styles.emptyDescription}>
                  {activeFilter === 'unread'
                    ? 'You have read all your notifications. Switch to "All" to view previous history.'
                    : 'Updates about your applications, donations, memberships, and causes will appear here.'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.full,
  },
  markAllText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: AdminColors.primaryDark,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
    paddingRight: 6,
  },
  unreadTitle: {
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AdminColors.accentGold,
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 13,
    color: AdminColors.textSecondary,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: AdminColors.primaryDark,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  emptyDescription: {
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
