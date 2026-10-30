import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDateTime } from '../../../../core/utils/format';
import { AppRoutes } from '../../../../core/constants/routes';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationItem } from '../types/notifications.types';
import { AppEmptyState, AppErrorState } from '../../../../core';

const VIEWS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
] as const;

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.notification.title}${item.is_read ? '' : ', unread'}`}
      style={[styles.row, !item.is_read && styles.rowUnread]}>
      {!item.is_read ? <View style={styles.unreadDot} /> : null}
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, !item.is_read && styles.rowTitleUnread]}>
          {item.notification.title}
        </Text>
        <Text style={styles.rowBodyText} numberOfLines={2}>
          {item.notification.body}
        </Text>
        <Text style={styles.rowTime}>{formatDateTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export interface NotificationsScreenProps {
  onBack?: () => void;
}

export function NotificationsScreen({ onBack: onBackProp }: NotificationsScreenProps = {}) {
  const navigation = useNavigation<any>();
  const {
    items,
    unreadCount,
    activeView,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    setView,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleOpen = async (item: NotificationItem) => {
    // 1. Mark as read on backend & update unread badge
    await markRead(item);

    // 2. Intelligent deep-link routing based on notification content
    const title = (item.notification?.title || '').toLowerCase();
    const body = (item.notification?.body || '').toLowerCase();
    const fullText = `${title} ${body}`;

    // A. Support Tickets / Complaints
    if (fullText.includes('ticket') || fullText.includes('complaint') || fullText.includes('grievance')) {
      try {
        navigation.navigate(AppRoutes.SUPPORT_TICKETS);
        return;
      } catch {}
      try {
        navigation.navigate('SupportTickets');
        return;
      } catch {}
      try {
        navigation.navigate('MemberComplaint');
        return;
      } catch {}
    }

    // B. Membership Approval / Application
    if (fullText.includes('membership') || fullText.includes('member') || fullText.includes('application')) {
      try {
        navigation.navigate('MembershipDetails');
        return;
      } catch {}
      try {
        navigation.navigate('MemberProfile');
        return;
      } catch {}
      try {
        navigation.navigate(AppRoutes.MEMBERSHIP_APPLICATIONS);
        return;
      } catch {}
    }

    // C. Donations / Receipts
    if (fullText.includes('donation') || fullText.includes('receipt')) {
      try {
        navigation.navigate('MemberReceipts');
        return;
      } catch {}
      try {
        navigation.navigate('Receipts');
        return;
      } catch {}
      try {
        navigation.navigate(AppRoutes.DONATIONS);
        return;
      } catch {}
    }

    // D. Events
    if (fullText.includes('event')) {
      try {
        navigation.navigate('MemberEvents');
        return;
      } catch {}
      try {
        navigation.navigate(AppRoutes.EVENTS);
        return;
      } catch {}
    }

    // E. Causes / Relief Assistance
    if (fullText.includes('cause') || fullText.includes('relief') || fullText.includes('assistance')) {
      try {
        navigation.navigate('MemberCauses');
        return;
      } catch {}
      try {
        navigation.navigate('Causes');
        return;
      } catch {}
    }
  };

  const handleMarkAllRead = () => {
    // markAllRead resolves to a boolean and never rejects.
    markAllRead().then(() => undefined);
  };

  const tabs = VIEWS.map(view => ({
    ...view,
    count: view.key === 'UNREAD' ? unreadCount : undefined,
  }));

  const canShowBack = Boolean(onBackProp || (navigation?.canGoBack && navigation.canGoBack()));
  const handleBack = () => {
    if (onBackProp) {
      onBackProp();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.safe}>
      <AdminHeader
        title="Notifications"
        showBack={canShowBack}
        onBack={handleBack}
        hideNotifications
      />
      <View style={styles.headerArea}>
        <View style={styles.tabsRow}>
          <View style={styles.tabs}>
            <AdminFilterTabs tabs={tabs} activeKey={activeView} onSelect={setView} />
          </View>
          <AppButton
            title="Mark all read"
            variant="ghost"
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
          />
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.recipient_id}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => handleOpen(item)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          initialLoading ? (
            <SkeletonList count={4} />
          ) : error ? (
            <AppErrorState title="Unable to load notifications" message={error} onRetry={refresh} />
          ) : (
            <AppEmptyState
              title={activeView === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications'}
              message={
                activeView === 'UNREAD'
                  ? 'You are all caught up.'
                  : 'Notifications will appear here when something needs your attention.'
              }
            />
          )
        }
        ListFooterComponent={
          loadingMore ? <Text style={styles.loadingMore}>Loading more…</Text> : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.emptyList,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabs: {
    flex: 1,
    marginRight: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl * 2,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rowUnread: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowTitleUnread: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowBodyText: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowTime: {
    ...typography.badge,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  loadingMore: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
});

export default NotificationsScreen;
