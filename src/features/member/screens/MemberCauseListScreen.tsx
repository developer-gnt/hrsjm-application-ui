import React, { useEffect, useMemo, useState } from 'react';
import {
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
import { MemberDonationModal } from '../components/MemberDonationModal';
import { MemberCause, CauseCategoryKey } from '../types/causes.types';
import { causesService } from '../services/causes.service';

interface FilterTabItem {
  key: CauseCategoryKey;
  label: string;
  icon?: string;
}

const CATEGORY_TABS: FilterTabItem[] = [
  { key: 'all', label: 'All Causes' },
  { key: 'active', label: 'Active', icon: '✨' },
  { key: 'education', label: 'Education', icon: '📚' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'relief', label: 'Relief', icon: '🍲' },
  { key: 'women', label: 'Women', icon: '👩‍🏫' },
  { key: 'environment', label: 'Environment', icon: '🌱' },
];

interface MemberCauseListScreenProps {
  onViewCauseDetails?: (cause: MemberCause) => void;
  onDonateCause?: (cause: MemberCause) => void;
}

export const MemberCauseListScreen: React.FC<MemberCauseListScreenProps> = ({
  onViewCauseDetails,
  onDonateCause,
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
    if (onDonateCause) {
      onDonateCause(cause);
    } else {
      setSelectedCauseForDonation(cause);
    }
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

      {/* Sleek Executive Mission Impact Card */}
      <View style={styles.heroImpactCard}>
        {/* Top Header: Badge & Live Indicator */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>HRSJM MISSION IMPACT</Text>
          </View>
          <View style={styles.liveIndicatorPill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveIndicatorText}>Live</Text>
          </View>
        </View>

        {/* Primary Metric: Funds Raised & Target */}
        <View style={styles.heroMainMetricRow}>
          <View>
            <Text style={styles.heroRaisedAmount}>{kpiStats.totalRaisedFormatted}</Text>
            <Text style={styles.heroRaisedSub}>
              Raised of <Text style={styles.heroTargetHighlight}>{kpiStats.totalTargetFormatted}</Text> Goal
            </Text>
          </View>
          <View style={styles.heroPercentBox}>
            <Text style={styles.heroPercentText}>{kpiStats.percentage}%</Text>
            <Text style={styles.heroPercentSub}>Funded</Text>
          </View>
        </View>

        {/* Sleek Golden Progress Bar */}
        <View style={styles.heroProgressTrack}>
          <View
            style={[
              styles.heroProgressFill,
              { width: `${Math.max(5, kpiStats.percentage)}%` },
            ]}
          />
        </View>

        {/* 3-Column Compact Stats Row */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCol}>
            <Text style={styles.heroStatValue}>{kpiStats.activeCauses}</Text>
            <Text style={styles.heroStatLabel}>Active Causes</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatCol}>
            <Text style={styles.heroStatValue}>{kpiStats.totalBeneficiaries}+</Text>
            <Text style={styles.heroStatLabel}>Beneficiaries</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatCol}>
            <Text style={styles.heroStatValue}>{kpiStats.totalDonors}+</Text>
            <Text style={styles.heroStatLabel}>Supporters</Text>
          </View>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
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
              <Text style={styles.clearSearchText}>✕</Text>
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
      <Text style={styles.emptyIcon}>🔍</Text>
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
      <Text style={styles.emptyIcon}>⚠️</Text>
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
      <MemberHeader />

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
              tintColor="#1B3F8F"
              colors={['#1B3F8F']}
            />
          }
        />
      )}

      {/* Donation Modal Sheet */}
      <MemberDonationModal
        visible={Boolean(selectedCauseForDonation)}
        cause={selectedCauseForDonation}
        onClose={() => setSelectedCauseForDonation(null)}
        onSuccess={() => {
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
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
  },
  pageSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  heroImpactCard: {
    marginHorizontal: 16,
    backgroundColor: '#0F2860',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(201, 162, 39, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.35)',
  },
  heroBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.6,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveIndicatorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#34D399',
  },
  heroMainMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  heroRaisedAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroRaisedSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  heroTargetHighlight: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  heroPercentBox: {
    alignItems: 'flex-end',
  },
  heroPercentText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#FBBF24',
    lineHeight: 24,
  },
  heroPercentSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#94A3B8',
  },
  heroProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
  searchIcon: {
    fontSize: 14,
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
    backgroundColor: '#1B3F8F',
    borderColor: '#1B3F8F',
  },
  categoryTabText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
  },
  listCountBadge: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  resetFiltersBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1B3F8F',
  },
  resetFiltersBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
