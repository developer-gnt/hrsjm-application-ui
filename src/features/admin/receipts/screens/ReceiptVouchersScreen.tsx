import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { AppRoutes } from '../../../../core/constants/routes';
import { useReceipts, useReceiptStats } from '../hooks/useReceipts';
import { ReceiptVoucherCard } from '../components/ReceiptVoucherCard';
import type { VoucherStatus } from '../../accounting/types/accounting.types';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ReceiptVouchersScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.RECEIPT_VOUCHERS
>;

const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'POSTED', label: 'Posted' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

/** Receipt voucher list (spec §28). Gate: receipt_entry.read (UI-level). */
export const ReceiptVouchersScreen: React.FC<ReceiptVouchersScreenProps> = ({
  navigation,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const status: VoucherStatus | undefined =
    statusFilter === 'ALL' ? undefined : (statusFilter as VoucherStatus);

  const stats = useReceiptStats();
  const receiptsQuery = useReceipts({ status, search: debouncedSearch || undefined });
  const vouchers = receiptsQuery.data?.pages.flatMap(page => page.items) ?? [];

  const refresh = useCallback(async () => { await receiptsQuery.refetch(); }, [receiptsQuery]);

  if (!can(PermissionKeys.RECEIPT_ENTRY_READ)) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Receipt Vouchers" showBack onBack={() => navigation.goBack()} />
        <PermissionDenied />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Receipt Vouchers"
        subtitle="Dr Bank/Cash · Cr Income"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          can(PermissionKeys.RECEIPT_ENTRY_CREATE) ? (
            <AppButton
              title="+ New"
              size="sm"
              onPress={() => navigation.navigate(AppRoutes.CREATE_RECEIPT_VOUCHER)}
            />
          ) : undefined
        }
      />

      <View style={styles.body}>
        <AdminFilterTabs
          tabs={STATUS_FILTERS.map(filter => ({
            ...filter,
            count:
              filter.key === 'ALL'
                ? stats.data?.all
                : filter.key === 'POSTED'
                  ? stats.data?.posted
                  : stats.data?.cancelled,
          }))}
          activeKey={statusFilter}
          onChange={setStatusFilter}
        />

        <AppSearchBar
          placeholder="Search voucher no., payer, reference…"
          onSearch={setSearch}
        />

        {receiptsQuery.isLoading ? (
          <AppLoader fullScreen message="Loading vouchers…" />
        ) : receiptsQuery.isError ? (
          <AppErrorState
            title="Unable to load vouchers"
            message="Please check your connection and try again."
            onRetry={refresh}
          />
        ) : vouchers.length === 0 ? (
          <AppEmptyState
            icon="📥"
            title="No Receipt Vouchers"
            description="There are no manual receipt entries matching your filters."
          />
        ) : (
          <FlatList
            data={vouchers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ReceiptVoucherCard
                voucher={item}
                onPress={() =>
                  navigation.navigate(AppRoutes.RECEIPT_DETAILS, {
                    voucherId: item.id,
                  })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            refreshControl={
              <RefreshControl
                refreshing={receiptsQuery.isRefetching}
                onRefresh={refresh}
              />
            }
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (receiptsQuery.hasNextPage && !receiptsQuery.isFetchingNextPage) {
                void receiptsQuery.fetchNextPage();
              }
            }}
            ListFooterComponent={receiptsQuery.isFetchingNextPage ? <AppLoader size="small" message="Loading more…" /> : undefined}
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
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.sm,
  },
});

export default ReceiptVouchersScreen;