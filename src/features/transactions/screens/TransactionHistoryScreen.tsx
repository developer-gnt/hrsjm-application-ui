import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  Filter,
  X,
  HeartHandshake,
  Receipt,
} from '../../../core/components/icons';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import { transactionsService } from '../services/transactions.service';
import {
  TransactionCategoryCode,
  TransactionStatusCode,
  UserTransactionItem,
  UserTransactionsSummary,
} from '../types/transactions.types';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionSummaryCards } from '../components/TransactionSummaryCards';
import {
  FilterState,
  TransactionFilterSheet,
} from '../components/TransactionFilterSheet';

const PRIMARY_TABS: { label: string; value: TransactionCategoryCode }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Membership', value: 'MEMBERSHIP' },
  { label: 'Donation', value: 'DONATION' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Other', value: 'OTHER' },
];

export interface TransactionHistoryScreenProps {
  onBack?: () => void;
  headerComponent?: React.ReactNode;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  onBack,
  headerComponent,
}) => {
  const navigation = useNavigation<any>();

  // State
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategoryCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState<FilterState>({
    category: 'ALL',
    status: 'ALL',
    fromDate: undefined,
    toDate: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<UserTransactionItem[]>([]);
  const [summary, setSummary] = useState<UserTransactionsSummary>({
    total_amount_paid: 0,
    total_transactions: 0,
    successful_count: 0,
    pending_count: 0,
    failed_count: 0,
    refunded_count: 0,
  });

  // Fetch transactions from backend
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const effectiveCategory =
        selectedCategory !== 'ALL'
          ? selectedCategory
          : secondaryFilters.category !== 'ALL'
          ? secondaryFilters.category
          : undefined;

      const res = await transactionsService.getMyTransactions({
        category: effectiveCategory,
        status: secondaryFilters.status !== 'ALL' ? secondaryFilters.status : undefined,
        search: searchQuery.trim() || undefined,
        fromDate: secondaryFilters.fromDate,
        toDate: secondaryFilters.toDate,
        page: 1,
        limit: 100,
      });

      setTransactions(res.items || []);
      setSummary(res.summary);
    } catch (err) {
      console.warn('Error loading transactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, secondaryFilters, searchQuery]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MemberHome');
    }
  };

  const handleSelectTransaction = (transaction: UserTransactionItem) => {
    navigation.navigate('TransactionDetails', {
      transactionId: transaction.id,
      transaction,
    });
  };

  // Compute active filters count
  const activeFiltersCount =
    (secondaryFilters.status !== 'ALL' ? 1 : 0) +
    (secondaryFilters.fromDate ? 1 : 0) +
    (secondaryFilters.toDate ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* App Top Bar */}
      {headerComponent ? (
        headerComponent
      ) : (
        <AdminHeader
          showBack={true}
          onBack={handleBack}
          onNavigate={(target) => navigation.navigate(target)}
        />
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handleSelectTransaction}
          />
        )}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#06294D', '#FAD465']}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Screen Page Header */}
            <View style={styles.pageHeader}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ChevronLeft size={22} color="#06294D" />
              </TouchableOpacity>
              <View style={styles.pageHeaderContent}>
                <Text style={styles.pageTitle}>Transaction History</Text>
                <Text style={styles.pageSubtitle}>
                  Your payments and contributions to HRSJM.
                </Text>
              </View>
            </View>

            {/* Information Card (Section 4 Wireframe) */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconCircle}>
                <HeartHandshake size={20} color="#C9971A" />
              </View>
              <Text style={styles.infoCardText}>
                Your support helps us continue human rights and social justice
                initiatives. Thank you for being a part of HRSJM.
              </Text>
            </View>

            {/* Summary Cards: Total Amount Paid & Total Transactions */}
            <TransactionSummaryCards summary={summary} />

            {/* Primary Category Filter Tabs */}
            <View style={styles.primaryTabsContainer}>
              {PRIMARY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[styles.primaryTab, isActive && styles.primaryTabActive]}
                    onPress={() => setSelectedCategory(tab.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.primaryTabText,
                        isActive && styles.primaryTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search and Additional Filter Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={18} color="#718096" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by transaction ID, purpose, or amount..."
                  placeholderTextColor="#718096"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearBtn}
                  >
                    <X size={16} color="#718096" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  activeFiltersCount > 0 && styles.filterBtnActive,
                ]}
                onPress={() => setFilterSheetVisible(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
              >
                <Filter
                  size={18}
                  color={activeFiltersCount > 0 ? '#06294D' : '#34516D'}
                />
                {activeFiltersCount > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            {/* Transaction List Section Heading */}
            <View style={styles.listSectionHeader}>
              <Text style={styles.listSectionTitle}>All Payments</Text>
              <Text style={styles.listSectionCount}>
                {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Receipt size={36} color="#C9971A" />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || activeFiltersCount > 0
                  ? 'No payments match your active search or filter criteria. Try resetting filters.'
                  : 'You have not made any payments or contributions yet. Every payment to HRSJM will be recorded here.'}
              </Text>
            </View>
          ) : undefined
        }
      />

      {/* Filter Modal Sheet */}
      <TransactionFilterSheet
        visible={filterSheetVisible}
        filters={secondaryFilters}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(f) => setSecondaryFilters(f)}
        onReset={() =>
          setSecondaryFilters({
            category: 'ALL',
            status: 'ALL',
            fromDate: undefined,
            toDate: undefined,
          })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pageHeaderContent: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 22,
    fontWeight: '700',
    color: '#011F39',
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  /** Information Card: Ivory & subtle Gold */
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FAD465',
    borderLeftWidth: 4,
    borderLeftColor: '#E9B82E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#34516D',
    lineHeight: 18,
  },
  primaryTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  primaryTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  primaryTabActive: {
    backgroundColor: '#06294D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryTabText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  primaryTabTextActive: {
    color: '#FAD465',
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0B2F52',
    fontFamily: 'Inter',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#FAD465',
    borderColor: '#E9B82E',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#06294D',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  listSectionTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
  },
  listSectionCount: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#718096',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 18,
    fontWeight: '700',
    color: '#011F39',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
  },
});
