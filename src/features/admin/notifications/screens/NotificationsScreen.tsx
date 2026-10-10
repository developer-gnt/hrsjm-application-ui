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

export function NotificationsScreen() {
  const navigation = useNavigation();
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

  const handleOpen = (item: NotificationItem) => {
    // Deep links require structured backend payloads (confirmed contract has
    // none - reported gap), so opening marks the notification read only.
    // markRead resolves to a boolean and never rejects.
    markRead(item).then(() => undefined);
  };

  const handleMarkAllRead = () => {
    // markAllRead resolves to a boolean and never rejects.
    markAllRead().then(() => undefined);
  };

  const tabs = VIEWS.map(view => ({
    ...view,
    count: view.key === 'UNREAD' ? unreadCount : undefined,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Notifications"
        showBack={navigation.canGoBack()}
        onBack={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
      />
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
        ListHeaderComponent={
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
        }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerArea: {
    marginBottom: spacing.md,
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
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
