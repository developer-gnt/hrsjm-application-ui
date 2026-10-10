import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import {
  CreditCard,
  FileText,
  CheckCircle2,
  X,
  Plus,
} from '../../../../core/components/icons';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors, BrandColors, Spacing, Typography, BorderRadius } from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import { AppRoutes } from '../../../../core/constants/routes';
import { useExpenses, useExpenseStats } from '../hooks/useExpenses';
import { ExpenseVoucherCard } from '../components/ExpenseVoucherCard';
import type { VoucherStatus, PaymentMethod } from '../../accounting/types/accounting.types';
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

const METHOD_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Methods' },
  { key: 'BANK', label: 'Bank' },
  { key: 'CASH', label: 'Cash' },
  { key: 'UPI', label: 'UPI' },
  { key: 'CHEQUE', label: 'Cheque' },
];

/** Expense voucher list with executive KPI stats, live search, and multi-dimensional filters. */
export const ExpenseVouchersScreen: React.FC<ExpenseVouchersScreenProps> = ({
  navigation,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const status: VoucherStatus | undefined =
    statusFilter === 'ALL' ? undefined : (statusFilter as VoucherStatus);

  const paymentMethod: PaymentMethod | undefined =
    methodFilter === 'ALL' ? undefined : (methodFilter as PaymentMethod);

  const stats = useExpenseStats();
  const expensesQuery = useExpenses({
    status,
    payment_method: paymentMethod,
    search: debouncedSearch || undefined,
  });
  const vouchers = expensesQuery.data?.pages.flatMap(page => page.items) ?? [];
  const totalCount = expensesQuery.data?.pages[0]?.meta.total ?? 0;

  const refresh = useCallback(async () => {
    await Promise.all([expensesQuery.refetch(), stats.refetch()]);
  }, [expensesQuery, stats]);

  if (!can(PermissionKeys.EXPENSE_READ)) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          onNavigate={target => navigation.navigate(target as any)}
        />
        <PermissionDenied />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Page Title & Add Expense CTA */}
      <View style={styles.pageHeader}>
        <View style={styles.titleInfo}>
          <Text style={styles.pageTitle}>Expenses</Text>
          <Text style={styles.pageSubtitle}>
            Record, track and manage organizational expenditure entries.
          </Text>
        </View>

        {can(PermissionKeys.EXPENSE_CREATE) && (
          <TouchableOpacity
            style={styles.addCtaBtn}
            onPress={() => navigation.navigate(AppRoutes.CREATE_EXPENSE_VOUCHER)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Record Expense"
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addCtaText}>Record Expense</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2×2 Executive KPI Metrics Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiRow}>
          <AdminStatCard
            label="Total Expenses"
            value={formatINR(stats.data?.totalAmount ?? 0)}
            tone="danger"
            Icon={CreditCard}
            loading={stats.isLoading}
          />
          <AdminStatCard
            label="Total Records"
            value={stats.data?.all ?? 0}
            tone="navy"
            Icon={FileText}
            loading={stats.isLoading}
          />
        </View>
        <View style={styles.kpiRow}>
          <AdminStatCard
            label="Posted Records"
            value={stats.data?.posted ?? 0}
            tone="success"
            Icon={CheckCircle2}
            loading={stats.isLoading}
          />
          <AdminStatCard
            label="Cancelled"
            value={stats.data?.cancelled ?? 0}
            tone="warning"
            Icon={X}
            loading={stats.isLoading}
          />
        </View>
      </View>

      {/* Search Input Bar */}
      <AppSearchBar
        placeholder="Search by ID, payee, description, reference..."
        onSearch={setSearch}
      />

      {/* Primary Status Filter Tabs */}
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

      {/* Secondary Payment Method Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.methodScroll}
      >
        {METHOD_FILTERS.map(method => {
          const isSelected = methodFilter === method.key;
          return (
            <TouchableOpacity
              key={method.key}
              style={[styles.methodChip, isSelected && styles.methodChipSelected]}
              onPress={() => setMethodFilter(method.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.methodChipText,
                  isSelected && styles.methodChipTextSelected,
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AdminHeader
        onNavigate={target => navigation.navigate(target as any)}
      />

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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={expensesQuery.isRefetching}
            onRefresh={refresh}
            colors={[BrandColors.navy]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (expensesQuery.hasNextPage && !expensesQuery.isFetchingNextPage) {
            void expensesQuery.fetchNextPage();
          }
        }}
        ListFooterComponent={
          expensesQuery.isFetchingNextPage ? (
            <AppLoader size="small" message="Loading more…" />
          ) : undefined
        }
        ListEmptyComponent={
          expensesQuery.isLoading ? (
            <View style={styles.stateWrap}>
              <AppLoader size="small" message="Loading expenses…" />
            </View>
          ) : expensesQuery.isError ? (
            <View style={styles.stateWrap}>
              <AppErrorState
                title="Unable to load expenses"
                message="Please check your connection and try again."
                onRetry={refresh}
              />
            </View>
          ) : vouchers.length === 0 ? (
            <View style={styles.stateWrap}>
              <AppEmptyState
                icon="🧾"
                title="No Expenses Found"
                description={
                  debouncedSearch
                    ? `No expenses match "${debouncedSearch}".`
                    : 'No expense records found matching the selected filters.'
                }
              />
            </View>
          ) : undefined
        }
      />
    </View>
  );
};

const ListSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    gap: 12,
    marginBottom: 8,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 8,
  },
  titleInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  addCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  kpiGrid: {
    gap: Spacing.sm,
    marginBottom: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodChipSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  methodChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  methodChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  separator: {
    height: 10,
  },
  stateWrap: {
    paddingVertical: Spacing.xl,
  },
});

export default ExpenseVouchersScreen;