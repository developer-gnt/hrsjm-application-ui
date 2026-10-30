import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberHeader } from '../components/MemberHeader';
import { CauseCard } from '../components/CauseCard';
import { GlobalPaymentModal, PaymentPayload } from '../../payments';
import { MemberCause, CauseCategoryKey } from '../types/causes.types';
import { causesService } from '../services/causes.service';
import { FontFamilies } from '../../../core/theme';
import {
  Banknote,
  Filter,
  Heart,
  HeartHandshake,
  Search,
  SearchX,
  Target,
  TriangleAlert,
  Users,
  X,
} from '../../../core/components/icons';

interface FilterTabItem {
  key: CauseCategoryKey;
  label: string;
  icon?: string;
}

const CATEGORY_TABS: FilterTabItem[] = [
  { key: 'all', label: 'All Causes' },
  { key: 'active', label: 'Active' },
  { key: 'education', label: 'Education' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'relief', label: 'Relief' },
  { key: 'women', label: 'Women' },
  { key: 'environment', label: 'Environment' },
];

interface MemberCauseListScreenProps {
  onViewCauseDetails?: (cause: MemberCause) => void;
  onDonateCause?: (cause: MemberCause) => void;
  hideHeader?: boolean;
}

export const MemberCauseListScreen: React.FC<MemberCauseListScreenProps> = ({
  onViewCauseDetails,
  onDonateCause,
  hideHeader = false,
}) => {
  const insets = useSafeAreaInsets();

  const [causes, setCauses] = useState<MemberCause[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CauseCategoryKey>('all');
  const [selectedCauseForDonation, setSelectedCauseForDonation] = useState<MemberCause | null>(null);

  const loadCausesData = async () => {
    try {
      setHasError(false);
      const data = await causesService.getCauses();
      setCauses(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCausesData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCausesData();
  };

  const kpiStats = useMemo(() => {
    const totalCauses = causes.length;
    const activeCauses = causes.filter(c => c.status === 'active').length;
    const totalTarget = causes.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
    const totalRaised = causes.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const totalBeneficiaries = causes.reduce((sum, c) => sum + (c.beneficiariesCount || 0), 0);
    const totalDonors = causes.reduce((sum, c) => sum + (c.donorCount || 0), 0);
    const percentage =
      totalTarget > 0 ? Math.min(100, Math.round((totalRaised / totalTarget) * 100)) : 0;

    const formatLakh = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    };

    return {
      totalCauses,
      activeCauses,
      totalTarget,
      totalRaised,
      totalRaisedFormatted: formatLakh(totalRaised),
      totalTargetFormatted: formatLakh(totalTarget),
      totalBeneficiaries: totalBeneficiaries.toLocaleString('en-IN'),
      totalDonors: totalDonors.toLocaleString('en-IN'),
      percentage,
    };
  }, [causes]);

  // Filter causes by tab and search
  const filteredCauses = useMemo(() => {
    return causes.filter(cause => {
      // Tab category filter
      if (activeTab === 'active' && cause.status !== 'active') {
        return false;
      }
      if (
        activeTab !== 'all' &&
        activeTab !== 'active' &&
        cause.categoryKey !== activeTab
      ) {
        return false;
      }

      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = cause.title.toLowerCase().includes(q);
        const matchCategory = cause.category.toLowerCase().includes(q);
        const matchLocation = cause.location.toLowerCase().includes(q);
        return matchTitle || matchCategory || matchLocation;
      }

      return true;
    });
  }, [causes, activeTab, searchQuery]);

  const handleDonatePress = (cause: MemberCause) => {
    const isCompleted = cause.status === 'closed' || cause.raisedAmount >= cause.targetAmount;
    if (isCompleted) {
      Alert.alert(
        'Goal Already Reached',
        `Thank you for your generous support! "${cause.title}" has already met its 100% collection goal of ₹${cause.targetAmount.toLocaleString('en-IN')}.`,
      );
      return;
    }
    setSelectedCauseForDonation(cause);
    onDonateCause?.(cause);
  };

  const renderHeaderComponent = () => (
    <View style={styles.listHeaderArea}>
      {/* Page Title & Tagline */}
      <View style={styles.titleSection}>
        <Text style={styles.pageMainTitle}>Causes</Text>
        <Text style={styles.pageSubtitle}>
          Discover and support causes that make a difference.
        </Text>
      </View>

      {/* Modern 2:2 KPI Impact Grid */}
      <View style={styles.kpiGridContainer}>
        {/* Card 1: Active Causes */}
        <View style={styles.kpiGridCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Target size={18} color="#1E3A8A" strokeWidth={2} />
          </View>
          <View style={styles.kpiContentCol}>
            <Text style={styles.kpiGridValue}>{kpiStats.activeCauses}</Text>
            <Text style={styles.kpiGridLabel} numberOfLines={1}>Active Causes</Text>
          </View>
        </View>

        {/* Card 2: Funds Raised */}
        <View style={styles.kpiGridCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Banknote size={18} color="#059669" strokeWidth={2} />
          </View>
          <View style={styles.kpiContentCol}>
            <Text style={[styles.kpiGridValue, { color: '#059669' }]}>
              {kpiStats.totalRaisedFormatted}
            </Text>
            <Text style={styles.kpiGridLabel} numberOfLines={1}>Funds Raised</Text>
          </View>
        </View>

        {/* Card 3: Lives Impacted */}
        <View style={styles.kpiGridCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Users size={18} color="#D97706" strokeWidth={2} />
          </View>
          <View style={styles.kpiContentCol}>
            <Text style={[styles.kpiGridValue, { color: '#D97706' }]}>
              {kpiStats.totalBeneficiaries}
            </Text>
            <Text style={styles.kpiGridLabel} numberOfLines={1}>Lives Impacted</Text>
          </View>
        </View>

        {/* Card 4: Supporters */}
        <View style={styles.kpiGridCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Heart size={18} color="#DC2626" strokeWidth={2} />
          </View>
          <View style={styles.kpiContentCol}>
            <Text style={[styles.kpiGridValue, { color: '#DC2626' }]}>
              {kpiStats.totalDonors}
            </Text>
            <Text style={styles.kpiGridLabel} numberOfLines={1}>Supporters</Text>
          </View>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#64748B" strokeWidth={2} style={styles.searchIconSvg} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, category or location..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              activeOpacity={0.7}
            >
              <X size={14} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            // Cycle to next tab or reset
            if (activeTab !== 'all') setActiveTab('all');
            else setActiveTab('active');
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Filter causes"
        >
          <Text style={styles.filterIcon}>⚡</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrolling Category Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsScroll}
      >
        {CATEGORY_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.categoryTab,
                isActive && styles.categoryTabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  isActive && styles.categoryTabTextActive,
                ]}
              >
                {tab.icon ? `${tab.icon} ` : ''}
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.listSectionTitleRow}>
        <Text style={styles.listSectionTitle}>
          {activeTab === 'all'
            ? 'All Social Initiatives'
            : `${CATEGORY_TABS.find(t => t.key === activeTab)?.label} Causes`}
        </Text>
        <Text style={styles.listCountBadge}>
          {filteredCauses.length} {filteredCauses.length === 1 ? 'cause' : 'causes'}
        </Text>
      </View>
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2].map(k => (
        <View key={k} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLineTitle} />
            <View style={styles.skeletonLineMeta} />
            <View style={styles.skeletonLineProgress} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <SearchX size={40} color="#94A3B8" strokeWidth={1.5} style={{ marginBottom: 12 }} />
      <Text style={styles.emptyTitle}>No causes found</Text>
      <Text style={styles.emptyDesc}>
        {searchQuery.trim()
          ? `No causes matching "${searchQuery}". Try a different keyword.`
          : 'No causes match the selected filter category.'}
      </Text>
      <TouchableOpacity
        style={styles.resetFiltersBtn}
        onPress={() => {
          setSearchQuery('');
          setActiveTab('all');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.resetFiltersBtnText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <TriangleAlert size={40} color="#DC2626" strokeWidth={1.5} style={{ marginBottom: 12 }} />
      <Text style={styles.emptyTitle}>Couldn't load causes</Text>
      <Text style={styles.emptyDesc}>
        Something went wrong while loading causes. Please check your internet connection.
      </Text>
      <TouchableOpacity
        style={styles.resetFiltersBtn}
        onPress={loadCausesData}
        activeOpacity={0.7}
      >
        <Text style={styles.resetFiltersBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Authenticated Member Header */}
      {!hideHeader && <MemberHeader />}

      {hasError ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredCauses}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeaderComponent}
          ListEmptyComponent={isLoading ? renderSkeletonLoader : renderEmptyState}
          renderItem={({ item }) => (
            <CauseCard
              cause={item}
              onViewDetails={c => onViewCauseDetails?.(c)}
              onDonate={handleDonatePress}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#06294D"
              colors={['#06294D']}
            />
          }
        />
      )}

      {/* Global Payment Gateway Modal */}
      <GlobalPaymentModal
        visible={Boolean(selectedCauseForDonation)}
        payload={
          selectedCauseForDonation
            ? {
                purpose: 'donation',
                title: selectedCauseForDonation.title,
                category: selectedCauseForDonation.category,
                location: selectedCauseForDonation.location,
                imageUrl: selectedCauseForDonation.imageUrl,
                amount: Math.min(
                  2000,
                  Math.max(
                    50,
                    selectedCauseForDonation.targetAmount - selectedCauseForDonation.raisedAmount > 0
                      ? selectedCauseForDonation.targetAmount - selectedCauseForDonation.raisedAmount
                      : 2000,
                  ),
                ),
                entityId: selectedCauseForDonation.id,
                targetAmount: selectedCauseForDonation.targetAmount,
                raisedAmount: selectedCauseForDonation.raisedAmount,
                maxAllowedAmount: Math.max(
                  0,
                  selectedCauseForDonation.targetAmount - selectedCauseForDonation.raisedAmount,
                ),
              }
            : null
        }
        onClose={() => setSelectedCauseForDonation(null)}
        onSuccess={(receipt) => {
          const donatedAmount = receipt?.amount || 2000;
          if (selectedCauseForDonation) {
            causesService.recordDonation(
              selectedCauseForDonation.id || selectedCauseForDonation.title,
              donatedAmount,
              receipt?.paymentId,
            );
            // Instantly reflect in local cause state
            setCauses(prevCauses =>
              prevCauses.map(c => {
                if (
                  c.id === selectedCauseForDonation.id ||
                  c.title.toLowerCase().trim() === selectedCauseForDonation.title.toLowerCase().trim()
                ) {
                  const updatedRaised = Math.min(c.targetAmount, c.raisedAmount + donatedAmount);
                  return {
                    ...c,
                    raisedAmount: updatedRaised,
                    donorCount: c.donorCount + 1,
                    status: updatedRaised >= c.targetAmount ? 'closed' : c.status,
                  };
                }
                return c;
              }),
            );
          }
          loadCausesData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    flexGrow: 1,
  },
  listHeaderArea: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pageMainTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 24,
    fontWeight: '800',
    color: '#0B2F52',
    lineHeight: 30,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#34516D',
    marginTop: 2,
  },
  kpiGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 10,
    marginBottom: 16,
  },
  kpiGridCard: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGridIcon: {
    fontSize: 16,
  },
  kpiContentCol: {
    flex: 1,
  },
  kpiGridValue: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2F52',
    lineHeight: 20,
  },
  kpiGridLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIconSvg: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 16,
  },
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEF3FC',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  categoryTabActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  categoryTabText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#06294D',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  listSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listSectionTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2F52',
  },
  listCountBadge: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#718096',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  resetFiltersBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FAD465',
  },
  resetFiltersBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  skeletonContent: {
    padding: 16,
    gap: 10,
  },
  skeletonLineTitle: {
    height: 16,
    width: '75%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonLineMeta: {
    height: 12,
    width: '45%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  skeletonLineProgress: {
    height: 8,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
});
