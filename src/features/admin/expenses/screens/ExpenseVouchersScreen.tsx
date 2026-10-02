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
import { useExpenses, useExpenseStats } from '../hooks/useExpenses';
import { ExpenseVoucherCard } from '../components/ExpenseVoucherCard';
import type { VoucherStatus } from '../../accounting/types/accounting.types';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ExpenseVouchersScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.EXPENSE_VOUCHERS
>;

const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'POSTED', label: 'Posted' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

/** Expense voucher list (spec §25/§27). Gate: expense.read (UI-level). */
export const ExpenseVouchersScreen: React.FC<ExpenseVouchersScreenProps> = ({
  navigation,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const status: VoucherStatus | undefined =
    statusFilter === 'ALL' ? undefined : (statusFilter as VoucherStatus);

  const stats = useExpenseStats();
  const expensesQuery = useExpenses({ status, search: debouncedSearch || undefined });
  const vouchers = expensesQuery.data?.pages.flatMap(page => page.items) ?? [];

  const refresh = useCallback(async () => { await expensesQuery.refetch(); }, [expensesQuery]);

  if (!can(PermissionKeys.EXPENSE_READ)) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Expense Vouchers" showBack onBack={() => navigation.goBack()} />
        <PermissionDenied />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Expense Vouchers"
        subtitle="Dr Expense · Cr Bank/Cash"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          can(PermissionKeys.EXPENSE_CREATE) ? (
            <AppButton
              title="+ New"
              size="sm"
              onPress={() => navigation.navigate(AppRoutes.CREATE_EXPENSE_VOUCHER)}
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
          placeholder="Search voucher no., payee, reference…"
          onSearch={setSearch}
        />

        {expensesQuery.isLoading ? (
          <AppLoader fullScreen message="Loading vouchers…" />
        ) : expensesQuery.isError ? (
          <AppErrorState
            title="Unable to load vouchers"
            message="Please check your connection and try again."
            onRetry={refresh}
          />
        ) : vouchers.length === 0 ? (
          <AppEmptyState
            icon="🧾"
            title="No Expense Vouchers"
            description="There are no vouchers matching your current filters."
          />
        ) : (
          <FlatList
            data={vouchers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ExpenseVoucherCard
                voucher={item}
                onPress={() =>
                  navigation.navigate(AppRoutes.EXPENSE_DETAILS, {
                    voucherId: item.id,
                  })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            refreshControl={
              <RefreshControl
                refreshing={expensesQuery.isRefetching}
                onRefresh={refresh}
              />
            }
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (expensesQuery.hasNextPage && !expensesQuery.isFetchingNextPage) {
                void expensesQuery.fetchNextPage();
              }
            }}
            ListFooterComponent={expensesQuery.isFetchingNextPage ? <AppLoader size="small" message="Loading more…" /> : undefined}
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

export default ExpenseVouchersScreen;