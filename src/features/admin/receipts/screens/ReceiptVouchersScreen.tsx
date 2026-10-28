import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  FileText,
  Heart,
  TrendingUp,
  UserCheck,
} from '../../../../core/components/icons';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import {
  AdminColors,
  BrandColors,
  Spacing,
  BorderRadius,
  Typography,
  FontFamilies,
  Shadows,
} from '../../../../core/theme';
import { formatINR } from '../../../../core/utils';
import { AppRoutes } from '../../../../core/constants/routes';
import { useReceiptsPaginated, useReceiptStats } from '../hooks/useReceipts';
import { ReceiptVoucherCard } from '../components/ReceiptVoucherCard';
import { IncomeFilterModal, IncomeFiltersState } from '../components/IncomeFilterModal';
import { AppPagination } from '../../../../core/components';
import { classifyReceipt } from '../utils/receiptClassification';
import type { PaymentMethod } from '../../accounting/types/accounting.types';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ReceiptVouchersScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.RECEIPT_VOUCHERS
>;

export const ReceiptVouchersScreen: React.FC<ReceiptVouchersScreenProps> = ({
  navigation,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const paymentMethod: PaymentMethod | undefined =
    methodFilter === 'ALL' ? undefined : (methodFilter as PaymentMethod);

  const stats = useReceiptStats();
  const receiptsQuery = useReceiptsPaginated({
    payment_method: paymentMethod,
    search: debouncedSearch || undefined,
    page: 1,
    limit: 100,
  });
  const vouchers = receiptsQuery.data?.items ?? [];
  const totalCount = receiptsQuery.data?.meta?.total ?? 0;

  const refresh = useCallback(async () => {
    await Promise.all([receiptsQuery.refetch(), stats.refetch()]);
  }, [receiptsQuery, stats]);

  // Classify all vouchers to compute dynamic category counts and rich filtering
  const classifiedItems = useMemo(() => {
    return vouchers.map(v => ({ voucher: v, classified: classifyReceipt(v) }));
  }, [vouchers]);

  // Compute breakdown counts and total amounts across streams
  const categoryCounts = useMemo(() => {
    const all = vouchers.length;
    let allAmount = 0;
    let ngoDonations = 0;
    let ngoAmount = 0;
    let causeDonations = 0;
    let causeAmount = 0;
    let membership = 0;
    let membershipAmount = 0;
    let renewals = 0;
    let renewalsAmount = 0;
    let otherIncome = 0;
    let otherAmount = 0;

    classifiedItems.forEach(({ voucher, classified }) => {
      const amt = Number(voucher.amount) || 0;
      const isNotCancelled = voucher.status !== 'CANCELLED';
      if (isNotCancelled) {
        allAmount += amt;
      }

      if (classified.category === 'CAUSE_DONATION') {
        causeDonations++;
        if (isNotCancelled) causeAmount += amt;
      } else if (
        classified.category === 'NGO_DONATION' ||
        classified.category === 'GENERAL_DONATION'
      ) {
        ngoDonations++;
        if (isNotCancelled) ngoAmount += amt;
      } else if (
        classified.category === 'MEMBERSHIP_PAYMENT' ||
        classified.category === 'NEW_MEMBERSHIP'
      ) {
        membership++;
        if (isNotCancelled) membershipAmount += amt;
      } else if (
        classified.category === 'RENEWAL_PAYMENT' ||
        classified.category === 'RENEW_MEMBERSHIP'
      ) {
        renewals++;
        if (isNotCancelled) renewalsAmount += amt;
      } else {
        otherIncome++;
        if (isNotCancelled) otherAmount += amt;
      }
    });

    return {
      all,
      allAmount,
      ngoDonations,
      ngoAmount,
      causeDonations,
      causeAmount,
      membership,
      membershipAmount,
      renewals,
      renewalsAmount,
      membershipAndRenewals: membership + renewals,
      membershipAndRenewalsAmount: membershipAmount + renewalsAmount,
      otherIncome,
      otherAmount,
    };
  }, [vouchers.length, classifiedItems]);

  // Instant real-time multi-criteria filtering across category, source, method, status and search
  const displayedVouchers = useMemo(() => {
    return classifiedItems
      .filter(({ voucher, classified }) => {
        // 1. Category / Income Type
        if (categoryFilter !== 'ALL') {
          if (categoryFilter === 'NGO_DONATION') {
            if (
              classified.category !== 'NGO_DONATION' &&
              classified.category !== 'GENERAL_DONATION'
            ) {
              return false;
            }
          } else if (
            categoryFilter === 'CAUSE_DONATION' ||
            categoryFilter === 'CAUSE_DONATIONS'
          ) {
            if (classified.category !== 'CAUSE_DONATION') return false;
          } else if (categoryFilter === 'MEMBERSHIP') {
            if (
              classified.category !== 'MEMBERSHIP_PAYMENT' &&
              classified.category !== 'NEW_MEMBERSHIP' &&
              classified.category !== 'RENEWAL_PAYMENT' &&
              classified.category !== 'RENEW_MEMBERSHIP'
            ) {
              return false;
            }
          } else if (categoryFilter === 'MEMBERSHIP_PAYMENT') {
            if (
              classified.category !== 'MEMBERSHIP_PAYMENT' &&
              classified.category !== 'NEW_MEMBERSHIP'
            ) {
              return false;
            }
          } else if (categoryFilter === 'RENEWAL_PAYMENT') {
            if (
              classified.category !== 'RENEWAL_PAYMENT' &&
              classified.category !== 'RENEW_MEMBERSHIP'
            ) {
              return false;
            }
          } else if (categoryFilter === 'OTHER_INCOME') {
            if (classified.category !== 'OTHER_INCOME') return false;
          }
        }

        // 2. Source Channel
        if (sourceFilter !== 'ALL') {
          if (classified.sourceKey !== sourceFilter) return false;
        }

        // 3. Payment Method
        if (methodFilter !== 'ALL') {
          const rawMethod = String(voucher.payment_method || '').toUpperCase();
          if (
            methodFilter === 'UPI' &&
            !rawMethod.includes('UPI') &&
            !rawMethod.includes('CASHFREE') &&
            !rawMethod.includes('ONLINE')
          ) {
            return false;
          }
          if (
            methodFilter === 'BANK' &&
            !rawMethod.includes('BANK') &&
            !rawMethod.includes('TRANSFER')
          ) {
            return false;
          }
          if (methodFilter === 'CASH' && rawMethod !== 'CASH') return false;
          if (methodFilter === 'CHEQUE' && rawMethod !== 'CHEQUE') return false;
          if (methodFilter === 'CARD' && rawMethod !== 'CARD') return false;
        }

        // 4. Status
        if (statusFilter !== 'ALL') {
          if (voucher.status !== statusFilter) return false;
        }

        // 5. Search query (matches voucher number, payer name, contact, cause, category, source, reference, description)
        if (search.trim().length > 0) {
          const q = search.trim().toLowerCase();
          const voucherNo = (voucher.voucher_number || '').toLowerCase();
          const receivedFrom = (voucher.received_from || '').toLowerCase();
          const payerName = (classified.payerName || '').toLowerCase();
          const payerContact = (classified.payerContact || '').toLowerCase();
          const cause = (classified.sourceHighlightValue || '').toLowerCase();
          const categoryLabel = (classified.categoryLabel || '').toLowerCase();
          const sourceLabel = (classified.sourceLabel || '').toLowerCase();
          const sourceBadge = (classified.sourceBadgeText || '').toLowerCase();
          const refNo = (voucher.reference_number || '').toLowerCase();
          const desc = (voucher.description || '').toLowerCase();
          const method = (voucher.payment_method || '').toLowerCase();

          const matches =
            voucherNo.includes(q) ||
            receivedFrom.includes(q) ||
            payerName.includes(q) ||
            payerContact.includes(q) ||
            cause.includes(q) ||
            categoryLabel.includes(q) ||
            sourceLabel.includes(q) ||
            sourceBadge.includes(q) ||
            refNo.includes(q) ||
            desc.includes(q) ||
            method.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .map(item => item.voucher);
  }, [
    classifiedItems,
    categoryFilter,
    sourceFilter,
    methodFilter,
    statusFilter,
    search,
  ]);

  const isFilterActive =
    categoryFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    methodFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const resetAllFilters = () => {
    setCategoryFilter('ALL');
    setSourceFilter('ALL');
    setMethodFilter('ALL');
    setStatusFilter('ALL');
    setSearch('');
    setPage(1);
  };

  const handleApplyModalFilters = (applied: IncomeFiltersState) => {
    setCategoryFilter(applied.incomeType);
    setSourceFilter(applied.source);
    setMethodFilter(applied.paymentMethod);
    setStatusFilter(applied.status);
    setPage(1);
  };

  if (!can(PermissionKeys.RECEIPT_ENTRY_READ)) {
    return (
      <View style={styles.flex}>
        <AdminHeader
          onNavigate={target => navigation.navigate(target as any)}
        />
        <PermissionDenied />
      </View>
    );
  }

  const QUICK_TABS = [
    { key: 'ALL', label: `All (${categoryCounts.all})` },
    { key: 'NGO_DONATION', label: `NGO Donations (${categoryCounts.ngoDonations})` },
    { key: 'CAUSE_DONATION', label: `Cause Donations (${categoryCounts.causeDonations})` },
    { key: 'MEMBERSHIP', label: `Membership (${categoryCounts.membership})` },
    { key: 'RENEWAL_PAYMENT', label: `Renewals (${categoryCounts.renewals})` },
    { key: 'OTHER_INCOME', label: `Other (${categoryCounts.otherIncome})` },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Page Title & Add Income CTA */}
      <View style={styles.pageHeader}>
        <View style={styles.titleInfo}>
          <Text style={styles.pageTitle}>Income</Text>
          <Text style={styles.pageSubtitle}>
            Manage and track all income transactions
          </Text>
        </View>

        {can(PermissionKeys.RECEIPT_ENTRY_CREATE) && (
          <TouchableOpacity
            style={styles.addCtaBtn}
            onPress={() => navigation.navigate(AppRoutes.CREATE_RECEIPT_VOUCHER)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Record Income"
          >
            <Plus size={15} color="#011F39" strokeWidth={2.5} />
            <Text style={styles.addCtaText}>Record Income</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2×2 Executive KPI Cards matching Reference Design (Image 1) */}
      <View style={styles.kpiGrid2x2}>
        {/* Row 1: Total Income & NGO Donations */}
        <View style={styles.kpiRow2x2}>
          {/* Card 1: Total Income (Navy Tone) */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              styles.kpiCardNavy,
              categoryFilter === 'ALL' && styles.kpiCardActive,
            ]}
            onPress={() => {
              setCategoryFilter('ALL');
              setPage(1);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Total Income: ${formatINR(categoryCounts.allAmount, { noDecimals: true })}`}
          >
            <View style={[styles.kpiIconBadge, styles.kpiIconBadgeNavy]}>
              <FileText size={18} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {formatINR(categoryCounts.allAmount, { noDecimals: true })}
            </Text>
            <Text style={[styles.kpiLabel, styles.kpiLabelNavy]} numberOfLines={1}>
              Total Income ({categoryCounts.all})
            </Text>
          </TouchableOpacity>

          {/* Card 2: NGO Donations (Warning / Amber Tone) */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              styles.kpiCardWarning,
              categoryFilter === 'NGO_DONATION' && styles.kpiCardActive,
            ]}
            onPress={() => {
              setCategoryFilter(categoryFilter === 'NGO_DONATION' ? 'ALL' : 'NGO_DONATION');
              setPage(1);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`NGO Donations: ${formatINR(categoryCounts.ngoAmount, { noDecimals: true })}`}
          >
            <View style={[styles.kpiIconBadge, styles.kpiIconBadgeWarning]}>
              <Heart size={18} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {formatINR(categoryCounts.ngoAmount, { noDecimals: true })}
            </Text>
            <Text style={[styles.kpiLabel, styles.kpiLabelWarning]} numberOfLines={1}>
              NGO Donations ({categoryCounts.ngoDonations})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Cause Donations & Membership & Renewals */}
        <View style={styles.kpiRow2x2}>
          {/* Card 3: Cause Donations (Success / Green Tone) */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              styles.kpiCardSuccess,
              categoryFilter === 'CAUSE_DONATION' && styles.kpiCardActive,
            ]}
            onPress={() => {
              setCategoryFilter(categoryFilter === 'CAUSE_DONATION' ? 'ALL' : 'CAUSE_DONATION');
              setPage(1);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Cause Donations: ${formatINR(categoryCounts.causeAmount, { noDecimals: true })}`}
          >
            <View style={[styles.kpiIconBadge, styles.kpiIconBadgeSuccess]}>
              <TrendingUp size={18} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {formatINR(categoryCounts.causeAmount, { noDecimals: true })}
            </Text>
            <Text style={[styles.kpiLabel, styles.kpiLabelSuccess]} numberOfLines={1}>
              Cause Donations ({categoryCounts.causeDonations})
            </Text>
          </TouchableOpacity>

          {/* Card 4: Membership & Renewal (Purple / Accent Tone) */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              styles.kpiCardPurple,
              categoryFilter === 'MEMBERSHIP' && styles.kpiCardActive,
            ]}
            onPress={() => {
              setCategoryFilter(categoryFilter === 'MEMBERSHIP' ? 'ALL' : 'MEMBERSHIP');
              setPage(1);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Membership & Renewals: ${formatINR(categoryCounts.membershipAndRenewalsAmount, { noDecimals: true })}`}
          >
            <View style={[styles.kpiIconBadge, styles.kpiIconBadgePurple]}>
              <UserCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1}>
              {formatINR(categoryCounts.membershipAndRenewalsAmount, { noDecimals: true })}
            </Text>
            <Text style={[styles.kpiLabel, styles.kpiLabelPurple]} numberOfLines={1}>
              Membership ({categoryCounts.membershipAndRenewals})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar + Filter Action Button matching Image 1 & Image 2 */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search receipt no., payer, cause, source..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={text => {
              setSearch(text);
              setPage(1);
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                setPage(1);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Clear search"
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterActionBtn,
            isFilterActive && styles.filterActionBtnActive,
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open income filters"
        >
          <SlidersHorizontal
            size={18}
            color={isFilterActive ? '#2563EB' : '#475569'}
          />
          {isFilterActive && <View style={styles.filterActiveDot} />}
        </TouchableOpacity>
      </View>

      {/* Clean Custom Quick Filter Tabs matching Image 1 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {QUICK_TABS.map(tab => {
          const isActive = categoryFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => {
                setCategoryFilter(tab.key);
                setPage(1);
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${tab.label}`}
            >
              <Text
                style={[styles.tabPillText, isActive && styles.tabPillTextActive]}
              >
                {tab.label}
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
        data={displayedVouchers}
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={receiptsQuery.isRefetching}
            onRefresh={refresh}
            colors={[BrandColors.navy]}
          />
        }
        ListFooterComponent={
          totalCount > 0 ? (
            <AppPagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="receipts"
            />
          ) : undefined
        }
        ListEmptyComponent={
          receiptsQuery.isLoading ? (
            <View style={styles.stateWrap}>
              <AppLoader size="small" message="Loading income transactions…" />
            </View>
          ) : receiptsQuery.isError ? (
            <View style={styles.stateWrap}>
              <AppErrorState
                title="Unable to load income"
                message="Please check your connection and try again."
                onRetry={refresh}
              />
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <AppEmptyState
                icon="📥"
                title="No Income Found"
                description={
                  debouncedSearch
                    ? `No transactions match "${debouncedSearch}".`
                    : 'No income transactions match the selected criteria.'
                }
                actionLabel={isFilterActive || search.length > 0 ? 'Reset Filters' : undefined}
                onAction={isFilterActive || search.length > 0 ? resetAllFilters : undefined}
              />
            </View>
          )
        }
      />

      {/* Multi-Criteria Filter Bottom Sheet Modal */}
      <IncomeFilterModal
        visible={filterModalVisible}
        filters={{
          incomeType: categoryFilter,
          source: sourceFilter,
          paymentMethod: methodFilter,
          status: statusFilter,
        }}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyModalFilters}
        onReset={resetAllFilters}
      />
    </View>
  );
};

const ListSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  headerContainer: {
    gap: 12,
    marginBottom: 10,
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
    fontFamily: FontFamilies.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 12.5,
    color: '#34516D',
    marginTop: 2,
  },
  addCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAD465',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: BorderRadius.button,
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  addCtaText: {
    ...Typography.button,
    color: '#011F39',
    fontWeight: '700',
    fontSize: 12.5,
  },

  // 2×2 Executive KPI Grid matching Image 1
  kpiGrid2x2: {
    gap: 10,
  },
  kpiRow2x2: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.card,
  },
  kpiCardActive: {
    borderColor: BrandColors.navy,
  },
  kpiCardNavy: {
    backgroundColor: '#EDF2F7',
  },
  kpiCardWarning: {
    backgroundColor: '#FEF6E7',
  },
  kpiCardSuccess: {
    backgroundColor: '#EAF7EE',
  },
  kpiCardPurple: {
    backgroundColor: '#F5F3FF',
  },

  // Top-left circular badge matching Image 1
  kpiIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiIconBadgeNavy: {
    backgroundColor: '#011F39',
  },
  kpiIconBadgeWarning: {
    backgroundColor: '#D97706',
  },
  kpiIconBadgeSuccess: {
    backgroundColor: '#16A34A',
  },
  kpiIconBadgePurple: {
    backgroundColor: '#7C3AED',
  },

  // Large bold number matching Image 1
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2F52',
    letterSpacing: -0.3,
  },

  // Descriptive label underneath number
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  kpiLabelNavy: {
    color: '#06294D',
  },
  kpiLabelWarning: {
    color: '#B45309',
  },
  kpiLabelSuccess: {
    color: '#15803D',
  },
  kpiLabelPurple: {
    color: '#6D28D9',
  },

  // Search Bar + Filter Action Button
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0B2F52',
    paddingVertical: 0,
  },
  filterActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  filterActionBtnActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2563EB',
  },

  // Quick Filter Tabs matching Image 1
  tabsScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },

  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  separator: {
    height: 12,
  },
  stateWrap: {
    paddingVertical: Spacing.xl,
  },
});

export default ReceiptVouchersScreen;