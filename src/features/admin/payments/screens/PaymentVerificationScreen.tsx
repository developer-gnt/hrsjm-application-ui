import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors, BrandColors } from '../../../../core/theme/colors';
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
        <AdminHeader
          onNavigate={target => navigation.navigate(target as any)}
        />
        <PermissionDenied />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AdminHeader
        onNavigate={target => navigation.navigate(target as any)}
      />

      <View style={styles.body}>
        {/* Page Context Banner */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Payment Verification</Text>
          <Text style={styles.pageSubtitle}>
            Review and approve offline & gateway membership transactions
          </Text>
        </View>

        {/* Modern KPI Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <View style={styles.statTop}>
              <Text style={[styles.statBadgeLabel, { color: '#1E40AF' }]}>TOTAL</Text>
            </View>
            <Text style={[styles.statNumber, { color: '#1E3A8A' }]}>
              {stats.data?.all ?? 0}
            </Text>
            <Text style={styles.statSubText}>All payments</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPending]}>
            <View style={styles.statTop}>
              <Text style={[styles.statBadgeLabel, { color: '#B45309' }]}>PENDING</Text>
            </View>
            <Text style={[styles.statNumber, { color: '#B45309' }]}>
              {stats.data?.pending ?? 0}
            </Text>
            <Text style={styles.statSubText}>Needs review</Text>
          </View>

          <View style={[styles.statCard, styles.statCardVerified]}>
            <View style={styles.statTop}>
              <Text style={[styles.statBadgeLabel, { color: '#047857' }]}>VERIFIED</Text>
            </View>
            <Text style={[styles.statNumber, { color: '#047857' }]}>
              {stats.data?.verified ?? 0}
            </Text>
            <Text style={styles.statSubText}>Approved</Text>
          </View>

          <View style={[styles.statCard, styles.statCardFailed]}>
            <View style={styles.statTop}>
              <Text style={[styles.statBadgeLabel, { color: '#B91C1C' }]}>FAILED</Text>
            </View>
            <Text style={[styles.statNumber, { color: '#B91C1C' }]}>
              {stats.data?.failed ?? 0}
            </Text>
            <Text style={styles.statSubText}>Rejected</Text>
          </View>
        </View>

        {/* Search Bar */}
        <AppSearchBar
          placeholder="Search by member name, transaction ID…"
          onSearch={setSearch}
        />

        {/* Filter Tabs */}
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

        {/* Content List */}
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
              <RefreshControl
                refreshing={paymentsQuery.isRefetching}
                onRefresh={refresh}
                colors={[BrandColors.navy]}
              />
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
    backgroundColor: '#F8FAFC',
  },
  body: {
    flex: 1,
    padding: Spacing.base,
    gap: 12,
  },
  pageHeader: {
    paddingVertical: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardTotal: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statCardPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statCardVerified: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statCardFailed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
    paddingTop: 4,
  },
  separator: {
    height: 10,
  },
  filterHint: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    textAlign: 'center',
    padding: Spacing.md,
  },
});

export default PaymentVerificationScreen;