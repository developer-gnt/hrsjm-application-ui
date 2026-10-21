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
  User,
  TrendingUp,
} from '../../../../core/components/icons';
import { PermissionDenied } from '../../../../core/permissions/permission.guard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors, BrandColors, Spacing, BorderRadius } from '../../../../core/theme';
import { AppRoutes } from '../../../../core/constants/routes';
import { useReceiptsPaginated, useReceiptStats } from '../hooks/useReceipts';
import { ReceiptVoucherCard } from '../components/ReceiptVoucherCard';
import { AppPagination } from '../../../../core/components';
import { classifyReceipt } from '../utils/receiptClassification';
import type { PaymentMethod } from '../../accounting/types/accounting.types';
import type { MoreStackParamList } from '../../../../app/navigation/NavigationTypes';

type ReceiptVouchersScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  typeof AppRoutes.RECEIPT_VOUCHERS
>;

const METHOD_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Methods' },
  { key: 'BANK', label: 'Bank' },
  { key: 'UPI', label: 'UPI' },
  { key: 'CASH', label: 'Cash' },
  { key: 'CHEQUE', label: 'Cheque' },
];

export const ReceiptVouchersScreen: React.FC<ReceiptVouchersScreenProps> = ({
  navigation,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debouncedSearch = useDebouncedValue(search);

  const paymentMethod: PaymentMethod | undefined =
    methodFilter === 'ALL' ? undefined : (methodFilter as PaymentMethod);

  const stats = useReceiptStats();
  const receiptsQuery = useReceiptsPaginated({
    payment_method: paymentMethod,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });
  const vouchers = receiptsQuery.data?.items ?? [];
  const totalCount = receiptsQuery.data?.meta?.total ?? 0;

  const refresh = useCallback(async () => {
    await Promise.all([receiptsQuery.refetch(), stats.refetch()]);
  }, [receiptsQuery, stats]);

  // Classify all vouchers to compute dynamic category counts and filtering
  const classifiedItems = useMemo(() => {
    return vouchers.map(v => ({ voucher: v, classified: classifyReceipt(v) }));
  }, [vouchers]);

  const categoryCounts = useMemo(() => {
    let all = vouchers.length;
    let causeDonations = 0;
    let membership = 0;
    let otherIncome = 0;

    classifiedItems.forEach(({ classified }) => {
      if (classified.category === 'CAUSE_DONATION') {
        causeDonations++;
      } else if (
        classified.category === 'NEW_MEMBERSHIP' ||
        classified.category === 'RENEW_MEMBERSHIP'
      ) {
        membership++;
      } else {
        otherIncome++;
      }
    });

    return { all, causeDonations, membership, otherIncome };
  }, [vouchers.length, classifiedItems]);

  const displayedVouchers = useMemo(() => {
    if (categoryFilter === 'ALL') return vouchers;
    return classifiedItems
      .filter(({ classified }) => {
        if (categoryFilter === 'CAUSE_DONATIONS') {
          return classified.category === 'CAUSE_DONATION';
        }
        if (categoryFilter === 'MEMBERSHIP') {
          return (
            classified.category === 'NEW_MEMBERSHIP' ||
            classified.category === 'RENEW_MEMBERSHIP'
          );
        }
        if (categoryFilter === 'OTHER_INCOME') {
          return (
            classified.category === 'OTHER_INCOME' ||
            classified.category === 'GENERAL_DONATION'
          );
        }
        return true;
      })
      .map(item => item.voucher);
  }, [categoryFilter, vouchers, classifiedItems]);

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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Page Title & Add Receipt CTA */}
      <View style={styles.pageHeader}>
        <View style={styles.titleInfo}>
          <Text style={styles.pageTitle}>Receipts</Text>
          <Text style={styles.pageSubtitle}>
            Manage all income receipts
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
            <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addCtaText}>Record Income</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar + Filter Action Button matching Mockup */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search receipt no., payer, cause..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterActionBtn,
            (categoryFilter !== 'ALL' || methodFilter !== 'ALL' || search.length > 0) &&
              styles.filterActionBtnActive,
          ]}
          onPress={() => {
            if (categoryFilter !== 'ALL' || methodFilter !== 'ALL' || search.length > 0) {
              setCategoryFilter('ALL');
              setMethodFilter('ALL');
              setSearch('');
            }
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Reset or toggle filters"
        >
          <SlidersHorizontal
            size={18}
            color={
              categoryFilter !== 'ALL' || methodFilter !== 'ALL' || search.length > 0
                ? '#2563EB'
                : '#475569'
            }
          />
        </TouchableOpacity>
      </View>

      {/* 2×2 Category KPI Breakdown Grid matching Global Theme */}
      <View style={styles.kpiGrid2x2}>
        {/* Row 1: All & Cause Donations */}
        <View style={styles.kpiRow2x2}>
          {/* All Tab */}
          <TouchableOpacity
            style={[
              styles.catCard2x2,
              categoryFilter === 'ALL' ? styles.catCardAllActive : styles.catCardAll,
            ]}
            onPress={() => setCategoryFilter('ALL')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`All Receipts: ${categoryCounts.all}`}
          >
            <View style={styles.catCardTopRow}>
              <View
                style={[
                  styles.catCardIconWrap,
                  categoryFilter === 'ALL'
                    ? styles.catCardIconWrapAllActive
                    : styles.catCardIconWrapAll,
                ]}
              >
                <FileText
                  size={16}
                  color={categoryFilter === 'ALL' ? '#FFFFFF' : BrandColors.navy}
                />
              </View>
              <View
                style={[
                  styles.catCardBadge,
                  categoryFilter === 'ALL'
                    ? styles.catCardBadgeAllActive
                    : styles.catCardBadgeAll,
                ]}
              >
                <Text
                  style={[
                    styles.catCardBadgeText,
                    categoryFilter === 'ALL'
                      ? styles.catCardBadgeTextActive
                      : styles.catCardBadgeTextAll,
                  ]}
                >
                  {categoryCounts.all}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.catCardTitle,
                categoryFilter === 'ALL'
                  ? styles.catCardTitleActive
                  : styles.catCardTitleAll,
              ]}
              numberOfLines={1}
            >
              All Receipts
            </Text>
          </TouchableOpacity>

          {/* Cause Donations Tab */}
          <TouchableOpacity
            style={[
              styles.catCard2x2,
              categoryFilter === 'CAUSE_DONATIONS'
                ? styles.catCardCauseActive
                : styles.catCardCause,
            ]}
            onPress={() => setCategoryFilter('CAUSE_DONATIONS')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Cause Donations: ${categoryCounts.causeDonations}`}
          >
            <View style={styles.catCardTopRow}>
              <View
                style={[
                  styles.catCardIconWrap,
                  categoryFilter === 'CAUSE_DONATIONS'
                    ? styles.catCardIconWrapCauseActive
                    : styles.catCardIconWrapCause,
                ]}
              >
                <Heart
                  size={16}
                  color={
                    categoryFilter === 'CAUSE_DONATIONS'
                      ? '#FFFFFF'
                      : BrandColors.goldDark
                  }
                />
              </View>
              <View
                style={[
                  styles.catCardBadge,
                  categoryFilter === 'CAUSE_DONATIONS'
                    ? styles.catCardBadgeActive
                    : styles.catCardBadgeCause,
                ]}
              >
                <Text
                  style={[
                    styles.catCardBadgeText,
                    categoryFilter === 'CAUSE_DONATIONS'
                      ? styles.catCardBadgeTextActive
                      : styles.catCardBadgeTextCause,
                  ]}
                >
                  {categoryCounts.causeDonations}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.catCardTitle,
                categoryFilter === 'CAUSE_DONATIONS'
                  ? styles.catCardTitleActive
                  : styles.catCardTitleCause,
              ]}
              numberOfLines={1}
            >
              Cause Donations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Membership & Other Income */}
        <View style={styles.kpiRow2x2}>
          {/* Membership Tab */}
          <TouchableOpacity
            style={[
              styles.catCard2x2,
              categoryFilter === 'MEMBERSHIP'
                ? styles.catCardMemberActive
                : styles.catCardMember,
            ]}
            onPress={() => setCategoryFilter('MEMBERSHIP')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Membership: ${categoryCounts.membership}`}
          >
            <View style={styles.catCardTopRow}>
              <View
                style={[
                  styles.catCardIconWrap,
                  categoryFilter === 'MEMBERSHIP'
                    ? styles.catCardIconWrapMemberActive
                    : styles.catCardIconWrapMember,
                ]}
              >
                <User
                  size={16}
                  color={categoryFilter === 'MEMBERSHIP' ? '#FFFFFF' : '#2563EB'}
                />
              </View>
              <View
                style={[
                  styles.catCardBadge,
                  categoryFilter === 'MEMBERSHIP'
                    ? styles.catCardBadgeActive
                    : styles.catCardBadgeMember,
                ]}
              >
                <Text
                  style={[
                    styles.catCardBadgeText,
                    categoryFilter === 'MEMBERSHIP'
                      ? styles.catCardBadgeTextActive
                      : styles.catCardBadgeTextMember,
                  ]}
                >
                  {categoryCounts.membership}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.catCardTitle,
                categoryFilter === 'MEMBERSHIP'
                  ? styles.catCardTitleActive
                  : styles.catCardTitleMember,
              ]}
              numberOfLines={1}
            >
              Membership
            </Text>
          </TouchableOpacity>

          {/* Other Income Tab */}
          <TouchableOpacity
            style={[
              styles.catCard2x2,
              categoryFilter === 'OTHER_INCOME'
                ? styles.catCardOtherActive
                : styles.catCardOther,
            ]}
            onPress={() => setCategoryFilter('OTHER_INCOME')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Other Income: ${categoryCounts.otherIncome}`}
          >
            <View style={styles.catCardTopRow}>
              <View
                style={[
                  styles.catCardIconWrap,
                  categoryFilter === 'OTHER_INCOME'
                    ? styles.catCardIconWrapOtherActive
                    : styles.catCardIconWrapOther,
                ]}
              >
                <TrendingUp
                  size={16}
                  color={
                    categoryFilter === 'OTHER_INCOME'
                      ? '#FFFFFF'
                      : AdminColors.accentPurple
                  }
                />
              </View>
              <View
                style={[
                  styles.catCardBadge,
                  categoryFilter === 'OTHER_INCOME'
                    ? styles.catCardBadgeActive
                    : styles.catCardBadgeOther,
                ]}
              >
                <Text
                  style={[
                    styles.catCardBadgeText,
                    categoryFilter === 'OTHER_INCOME'
                      ? styles.catCardBadgeTextActive
                      : styles.catCardBadgeTextOther,
                  ]}
                >
                  {categoryCounts.otherIncome}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.catCardTitle,
                categoryFilter === 'OTHER_INCOME'
                  ? styles.catCardTitleActive
                  : styles.catCardTitleOther,
              ]}
              numberOfLines={1}
            >
              Other Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Method Filter Chips */}
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
              <AppLoader size="small" message="Loading receipts…" />
            </View>
          ) : receiptsQuery.isError ? (
            <View style={styles.stateWrap}>
              <AppErrorState
                title="Unable to load receipts"
                message="Please check your connection and try again."
                onRetry={refresh}
              />
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <AppEmptyState
                icon="📥"
                title="No Income Receipts"
                description={
                  debouncedSearch
                    ? `No receipts match "${debouncedSearch}".`
                    : 'No receipt entries found matching the selected filters.'
                }
              />
            </View>
          )
        }
      />
    </View>
  );
};

const ListSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  addCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BrandColors.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
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
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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
  kpiGrid2x2: {
    gap: 10,
  },
  kpiRow2x2: {
    flexDirection: 'row',
    gap: 10,
  },
  catCard2x2: {
    flex: 1,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  catCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCardBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  catCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: -0.1,
  },
  // All Receipts Card (Navy Global Theme)
  catCardAll: {
    backgroundColor: BrandColors.softBlue,
    borderColor: '#D4E2F7',
  },
  catCardAllActive: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  catCardIconWrapAll: {
    backgroundColor: '#D9E6F9',
  },
  catCardIconWrapAllActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  catCardTitleAll: {
    color: BrandColors.navy,
  },
  catCardTitleActive: {
    color: '#FFFFFF',
  },
  catCardBadgeAll: {
    backgroundColor: '#D9E6F9',
  },
  catCardBadgeAllActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  catCardBadgeTextAll: {
    color: BrandColors.navy,
  },
  catCardBadgeTextActive: {
    color: '#FFFFFF',
  },
  // Cause Donations Card (Gold Global Theme)
  catCardCause: {
    backgroundColor: BrandColors.goldSoft,
    borderColor: '#FDE68A',
  },
  catCardCauseActive: {
    backgroundColor: BrandColors.goldDark,
    borderColor: BrandColors.goldDark,
  },
  catCardIconWrapCause: {
    backgroundColor: '#FEF3C7',
  },
  catCardIconWrapCauseActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  catCardTitleCause: {
    color: BrandColors.goldDark,
  },
  catCardBadgeCause: {
    backgroundColor: '#FEF3C7',
  },
  catCardBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  catCardBadgeTextCause: {
    color: BrandColors.goldDark,
  },
  // Membership Card (Blue / Info Global Theme)
  catCardMember: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  catCardMemberActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catCardIconWrapMember: {
    backgroundColor: '#DBEAFE',
  },
  catCardIconWrapMemberActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  catCardTitleMember: {
    color: '#2563EB',
  },
  catCardBadgeMember: {
    backgroundColor: '#DBEAFE',
  },
  catCardBadgeTextMember: {
    color: '#2563EB',
  },
  // Other Income Card (Purple Accent Theme)
  catCardOther: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  catCardOtherActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  catCardIconWrapOther: {
    backgroundColor: '#EDE9FE',
  },
  catCardIconWrapOtherActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  catCardTitleOther: {
    color: '#7C3AED',
  },
  catCardBadgeOther: {
    backgroundColor: '#EDE9FE',
  },
  catCardBadgeTextOther: {
    color: '#7C3AED',
  },
  // Methods
  methodScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  methodChip: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
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