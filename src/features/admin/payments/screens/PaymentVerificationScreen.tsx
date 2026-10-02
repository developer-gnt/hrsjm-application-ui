import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
import { AppRoutes } from '../../../../core/constants/routes';
import { usePayments, usePaymentStats } from '../hooks/usePayments';
import { PaymentCard } from '../components/PaymentCard';
import type { PaymentStatus } from '../types/payments.types';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type PaymentVerificationScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.PAYMENT_VERIFICATION
>;

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'SUCCESS', label: 'Verified' },
  { key: 'FAILED', label: 'Failed' },
  { key: 'REFUNDED', label: 'Refunded' },
];

/** Payment verification queue (spec §22/§24). Gate: payment.read (UI-level). */
export const PaymentVerificationScreen: React.FC<
  PaymentVerificationScreenProps
> = ({ navigation }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const status: PaymentStatus | undefined =
    statusFilter === 'ALL' ? undefined : (statusFilter as PaymentStatus);

  const stats = usePaymentStats();
  const paymentsQuery = usePayments({ status, search: debouncedSearch || undefined });
  const payments = paymentsQuery.data?.pages.flatMap(page => page.items) ?? [];
  const totalCount = paymentsQuery.data?.pages[0]?.meta.total ?? 0;

  const refresh = useCallback(async () => { await paymentsQuery.refetch(); }, [paymentsQuery]);

  if (!can(PermissionKeys.PAYMENT_READ)) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Payment Verification" showBack onBack={() => navigation.goBack()} />
        <PermissionDenied />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Payment Verification"
        subtitle="Offline & gateway membership payments"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.data?.all ?? 0, tint: styles.statNeutral },
            { label: 'Pending', value: stats.data?.pending ?? 0, tint: styles.statPending },
            { label: 'Verified', value: stats.data?.verified ?? 0, tint: styles.statVerified },
            { label: 'Failed', value: stats.data?.failed ?? 0, tint: styles.statFailed },
          ].map(stat => (
            <View key={stat.label} style={[styles.statChip, stat.tint]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <AppSearchBar
          placeholder="Search by name, transaction ID…"
          onSearch={setSearch}
        />

        <AdminFilterTabs
          tabs={STATUS_FILTERS.map(filter => ({
            ...filter,
            count:
              filter.key === 'ALL'
                ? stats.data?.all
                : filter.key === 'PENDING'
                  ? stats.data?.pending
                  : filter.key === 'SUCCESS'
                    ? stats.data?.verified
                    : filter.key === 'FAILED'
                      ? stats.data?.failed
                      : undefined,
          }))}
          activeKey={statusFilter}
          onChange={setStatusFilter}
        />

        {paymentsQuery.isLoading ? (
          <AppLoader fullScreen message="Loading payments…" />
        ) : paymentsQuery.isError ? (
          <AppErrorState
            title="Unable to load payments"
            message="Please check your connection and try again."
            onRetry={refresh}
          />
        ) : payments.length === 0 ? (
          <AppEmptyState
            icon="💳"
            title="No Payments Found"
            description="There are no payments matching your current filters."
          />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <PaymentCard
                payment={item}
                onPress={() =>
                  navigation.navigate(AppRoutes.PAYMENT_DETAILS, {
                    paymentId: item.id,
                  })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            refreshControl={
              <RefreshControl refreshing={paymentsQuery.isRefetching} onRefresh={refresh} />
            }
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (paymentsQuery.hasNextPage && !paymentsQuery.isFetchingNextPage) {
                void paymentsQuery.fetchNextPage();
              }
            }}
            ListFooterComponent={paymentsQuery.isFetchingNextPage ? <AppLoader size="small" message="Loading more…" /> : undefined}
            ListEmptyComponent={
              debouncedSearch ? (
                <Text style={styles.filterHint}>
                  No results for "{debouncedSearch}" ({totalCount} total payments).
                </Text>
              ) : undefined
            }
          />
        )}
      </View>
    </View>
  );
};

const ListSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  body: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flex: 1,
    borderRadius: 10,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNeutral: {
    backgroundColor: AdminColors.infoLight,
  },
  statPending: {
    backgroundColor: AdminColors.warningLight,
  },
  statVerified: {
    backgroundColor: AdminColors.successLight,
  },
  statFailed: {
    backgroundColor: AdminColors.errorLight,
  },
  statValue: {
    ...Typography.metric,
    color: AdminColors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.sm,
  },
  filterHint: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    textAlign: 'center',
    padding: Spacing.md,
  },
});

export default PaymentVerificationScreen;