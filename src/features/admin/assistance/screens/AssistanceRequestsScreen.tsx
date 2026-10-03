import React, { useState } from 'react';
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
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppEmptyState } from '../../../../core/components/common/AppEmptyState';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { Icon } from '../../../../core/components/common/Icon';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { colors, serif, spacing, typography } from '../../../../core/theme/theme';
import { formatCurrency } from '../../../../core/utils/format';
import type { AppStackParamList, TabsParamList } from '../../../../core/navigation/types';
import { AssistanceFilters } from '../components/AssistanceFilters';
import { ASSISTANCE_TABS } from '../assistance.utils';
import { useAssistance } from '../hooks/useAssistance';
import type { AssistanceStats } from '../hooks/useAssistance';
import { shortRequestId } from '../types/assistance.types';
import type { AssistanceRequest } from '../types/assistance.types';

type TabProps = BottomTabScreenProps<TabsParamList, 'DonationSeekersTab'>;
type NavProp = CompositeNavigationProp<
  TabProps['navigation'],
  NativeStackNavigationProp<AppStackParamList>
>;

// Status chip colours locked to the approved design.
const CHIP_META: Record<
  AssistanceRequest['status'],
  { label: string; bg: string; fg: string }
> = {
  PENDING: { label: 'Pending', bg: colors.goldSoft, fg: colors.goldText },
  UNDER_REVIEW: { label: 'Under Review', bg: colors.goldSoft, fg: colors.goldText },
  APPROVED: { label: 'Approved', bg: colors.greenSoft, fg: colors.active },
  REJECTED: { label: 'Rejected', bg: colors.redSoft, fg: colors.danger },
  CLOSED: { label: 'Closed', bg: '#EDEFF3', fg: colors.textSecondary },
};

const REVIEWABLE: AssistanceRequest['status'][] = ['PENDING', 'UNDER_REVIEW'];

function StatCard({
  bg,
  circle,
  icon,
  value,
  label,
  labelColor,
}: {
  bg: string;
  circle: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  value: number;
  label: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <View style={[styles.statCircle, { backgroundColor: circle }]}>
        <Icon name={icon} size={17} color={colors.white} strokeWidth={2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

function StatsRow({ stats }: { stats: AssistanceStats }) {
  return (
    <View style={styles.statsRow}>
      <StatCard
        bg={colors.primaryLight}
        circle={colors.info}
        icon="users"
        value={stats.total}
        label="Total Requests"
        labelColor={colors.primary}
      />
      <StatCard
        bg={colors.goldSoft}
        circle={colors.warning}
        icon="clock"
        value={stats.underReview}
        label="Under Review"
        labelColor={colors.goldText}
      />
      <StatCard
        bg={colors.greenSoft}
        circle={colors.active}
        icon="check-circle"
        value={stats.approved}
        label="Approved"
        labelColor={colors.active}
      />
      <StatCard
        bg={colors.redSoft}
        circle={colors.danger}
        icon="x-circle"
        value={stats.rejected}
        label="Rejected"
        labelColor={colors.danger}
      />
    </View>
  );
}

function SeekerRow({
  request,
  isLast,
  onPress,
}: {
  request: AssistanceRequest;
  isLast: boolean;
  onPress: () => void;
}) {
  const chip = CHIP_META[request.status];
  const reviewable = REVIEWABLE.includes(request.status);
  const raisedPct =
    request.raised_amount !== undefined && request.requested_amount > 0
      ? Math.min(100, Math.round((request.raised_amount / request.requested_amount) * 100))
      : 0;

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.seekerCell}>
        <AppAvatar name={request.full_name} size={44} />
        <View style={styles.seekerInfo}>
          <Text style={styles.seekerName} numberOfLines={1}>
            {request.full_name}
          </Text>
          <Text style={styles.seekerId}>
            DS{request.id.replace(/-/g, '').slice(0, 11).toUpperCase()}
          </Text>
          <View style={styles.metaLine}>
            <Icon name="person" size={11} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {request.age !== undefined ? `Age: ${request.age} years` : 'Age: —'}
            </Text>
          </View>
          <View style={styles.metaLine}>
            <Icon name="map-pin" size={11} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {request.city ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.causeCell}>
        <Text style={styles.causeTitle} numberOfLines={1}>
          {request.reason}
        </Text>
        <Text style={styles.causeText} numberOfLines={3}>
          {request.description ?? request.reason}
        </Text>
      </View>

      <View style={styles.amountCell}>
        <Text style={styles.amountText}>{formatCurrency(request.requested_amount)}</Text>
        {request.raised_amount !== undefined ? (
          <View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${raisedPct}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {formatCurrency(request.raised_amount)} raised ({raisedPct}%)
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statusCell}>
        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text>
        </View>
        {reviewable ? (
          <TouchableOpacity
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Review request ${shortRequestId(request.id)}`}
            style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`View request ${shortRequestId(request.id)}`}
            style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="More options"
        style={styles.dotsButton}>
        <Icon name="more-vertical" size={16} color={colors.textMuted} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}

export function AssistanceRequestsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const {
    filteredItems,
    stats,
    activeTab,
    searchQuery,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    setSearchQuery,
    setActiveTab,
    refresh,
    loadMore,
    clearFilters,
  } = useAssistance();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [addSeekerVisible, setAddSeekerVisible] = useState(false);

  const canReview = can(user, 'assistance.review');

  const tabs = ASSISTANCE_TABS.map(tab => ({
    ...tab,
    count:
      tab.key === 'ALL'
        ? stats.total
        : tab.key === 'UNDER_REVIEW'
          ? stats.underReview
          : tab.key === 'APPROVED'
            ? stats.approved
            : stats.rejected,
  }));

  const openDetails = (requestId: string) =>
    navigation.navigate('AssistanceDetails', { requestId });

  const renderState = () => {
    if (initialLoading) {
      return (
        <View style={[styles.cardBody, styles.cardBodyPad]}>
          <SkeletonList count={4} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.cardBody}>
          <AppErrorState
            title="Unable to load assistance requests"
            message={error}
            onRetry={refresh}
          />
        </View>
      );
    }
    if (filteredItems.length === 0) {
      return (
        <View style={[styles.cardBody, styles.cardBodyPad]}>
          <AppEmptyState
            title="No Assistance Requests"
            message="There are no requests matching your current filters."
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader />
      <FlatList
        style={styles.list}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <SeekerRow
            request={item}
            isLast={index === filteredItems.length - 1}
            onPress={() => openDetails(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <View style={styles.headerArea}>
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>Donation Seekers</Text>
                  <Text style={styles.subtitle}>
                    Review, verify and manage donation requests.
                  </Text>
                </View>
                {canReview ? (
                  <TouchableOpacity
                    onPress={() => setAddSeekerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Add Seeker"
                    style={styles.addButton}
                    activeOpacity={0.85}>
                    <Icon name="plus" size={18} color={colors.white} strokeWidth={2.4} />
                    <Text style={styles.addButtonText}>Add Seeker</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <StatsRow stats={stats} />

              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Icon name="search" size={19} color={colors.textMuted} strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name, request ID, cause or location..."
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Search donation seekers"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setFiltersVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open filters"
                  style={styles.filtersButton}
                  activeOpacity={0.85}>
                  <Icon name="filter" size={19} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.filtersText}>Filters</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabsRow}>
                {tabs.map(tab => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`${tab.label}${tab.count !== undefined ? `, ${tab.count}` : ''}`}
                      style={[styles.tabPill, active && styles.tabPillActive]}>
                      <Text
                        style={[styles.tabPillText, active && styles.tabPillTextActive]}
                        numberOfLines={1}>
                        {tab.label} ({tab.count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Table head of the list card */}
            <View style={styles.cardHead}>
              <View style={styles.tableHead}>
                <Text style={[styles.tableHeadText, styles.colSeeker]}>Seeker Details</Text>
                <Text style={[styles.tableHeadText, styles.colCause]}>Cause &amp; Description</Text>
                <Text style={[styles.tableHeadText, styles.colAmount]}>Requested Amount</Text>
                <Text style={[styles.tableHeadText, styles.colStatus]}>Status</Text>
                <View style={styles.colDots} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={renderState() ?? undefined}
        ListFooterComponent={
          filteredItems.length > 0 ? (
            <View style={styles.cardFoot}>
              {loadingMore ? <Text style={styles.loadingMore}>Loading more…</Text> : null}
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />

      <AssistanceFilters
        visible={filtersVisible}
        currentTab={activeTab}
        onClose={() => setFiltersVisible(false)}
        onApply={tab => {
          setActiveTab(tab);
          setFiltersVisible(false);
        }}
      />

      {/* The backend POST /assistance-requests creates requests owned by the
          acting user only - there is no admin-created-seeker flow yet
          (reported gap). The design's button is preserved; pressing it shows
          this note instead of an API call that would create bad data. */}
      <AppBottomSheet
        visible={addSeekerVisible}
        title="Add Seeker"
        onClose={() => setAddSeekerVisible(false)}>
        <Text style={styles.addSeekerNote}>
          Creating assistance requests on behalf of seekers is not supported by
          the backend yet. Seekers submit their own requests from their app, and
          they appear here for review.
        </Text>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  list: {
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  headerArea: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...serif,
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.periwinkle,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    gap: 6,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 4,
  },
  statCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...serif,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 1,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
    gap: 6,
  },
  filtersText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
  },
  tabPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  tabPillTextActive: {
    color: colors.white,
  },
  cardHead: {
    marginHorizontal: spacing.lg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: colors.border,
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.tableHeader,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tableHeadText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
  },
  colSeeker: {
    flex: 3.6,
  },
  colCause: {
    flex: 2.9,
  },
  colAmount: {
    flex: 2.2,
  },
  colStatus: {
    flex: 1.9,
  },
  colDots: {
    width: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cardBody: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
  },
  cardBodyPad: {
    paddingVertical: spacing.xl,
  },
  cardFoot: {
    marginHorizontal: spacing.lg,
    height: 10,
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    borderBottomColor: colors.border,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    justifyContent: 'center',
  },
  seekerCell: {
    flex: 3.6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  seekerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  seekerName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.primary,
  },
  seekerId: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  causeCell: {
    flex: 2.9,
    paddingRight: spacing.sm,
  },
  causeTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.primary,
  },
  causeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  amountCell: {
    flex: 2.2,
    paddingRight: spacing.sm,
  },
  amountText: {
    ...serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.divider,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  progressText: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  statusCell: {
    flex: 1.9,
    alignItems: 'flex-start',
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: colors.blueSoft,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 18,
    marginTop: 6,
  },
  viewButtonText: {
    color: colors.viewBlue,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: colors.accentGold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  dotsButton: {
    width: 22,
    paddingLeft: 2,
    paddingVertical: 8,
  },
  loadingMore: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 2,
  },
  addSeekerNote: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

export default AssistanceRequestsScreen;
