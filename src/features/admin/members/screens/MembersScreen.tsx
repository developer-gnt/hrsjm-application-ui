import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { HRSJMHeader } from '../../../../core/components/common/HRSJMHeader';
import { AppBottomNavigation } from '../../../../core/components/common/AppBottomNavigation';
import {
  FileText,
  House,
  LayoutGrid,
  ListFilter,
  MessageSquare,
  SearchX,
  TriangleAlert,
  UsersRound,
} from '../../../../core/components/icons';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Member, MemberSortOption } from '../types';
import { useMembers, MembersPreviewState } from '../hooks/useMembers';
import { MembersPageHeader } from '../components/MembersPageHeader';
import { MemberStats } from '../components/MemberStats';
import { MemberSearchFilterBar } from '../components/MemberSearchFilterBar';
import { MemberStatusTabs } from '../components/MemberStatusTabs';
import { MemberListHeader } from '../components/MemberListHeader';
import { MemberRow } from '../components/MemberRow';
import { MemberFilterSheet } from '../components/MemberFilterSheet';
import { MemberActionsSheet } from '../components/MemberActionsSheet';
import { MembersStateView, MembersLoadingState } from '../components/MembersStateView';

/** Width at/above which the member list renders as an aligned column grid. */
const WIDE_LAYOUT_BREAKPOINT = 700;

const BOTTOM_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: House },
  { key: 'members', label: 'Members', Icon: UsersRound },
  { key: 'applications', label: 'Applications', Icon: FileText },
  { key: 'complaints', label: 'Complaints', Icon: MessageSquare },
  { key: 'more', label: 'More', Icon: LayoutGrid },
];

const PREVIEW_STATES: MembersPreviewState[] = ['default', 'loading', 'empty', 'error'];

interface MembersScreenProps {
  /** Dev/preview override: renders a specific UI state with mock data. */
  previewState?: MembersPreviewState;
}

/**
 * Admin › Members directory (UI-only build, mock data).
 * IA (fixed by the reference design): Header → Page title + Add Member →
 * Statistics → Search + Filters → Status tabs → Member list → Bottom navigation.
 */
export const MembersScreen: React.FC<MembersScreenProps> = ({ previewState }) => {
  const [devPreviewState, setDevPreviewState] = useState<MembersPreviewState | null>(null);
  const effectiveState: MembersPreviewState = previewState ?? devPreviewState ?? 'default';

  const members = useMembers(effectiveState);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [actionsMember, setActionsMember] = useState<Member | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  const someSelected =
    members.selectedIds.size > 0 && members.selectedIds.size < members.filteredMembers.length;

  const handleApplySort = useCallback(
    (sort: MemberSortOption) => members.setSort(sort),
    [members]
  );

  const renderMemberRow = useCallback(
    ({ item }: { item: Member }) => (
      <MemberRow
        member={item}
        selected={members.selectedIds.has(item.id)}
        wide={isWide}
        onToggleSelect={members.toggleMemberSelected}
        onOpenActions={setActionsMember}
      />
    ),
    [members.selectedIds, members.toggleMemberSelected, isWide]
  );

  const renderStateViews = (): React.ReactNode => {
    if (members.isLoading) return null;
    if (members.hasError) {
      return (
        <MembersStateView
          Icon={TriangleAlert}
          tone="danger"
          title="Couldn't load members"
          description="Something went wrong while loading the member directory. Please try again."
          actionTitle="Retry"
          onAction={members.retry}
        />
      );
    }
    if (members.isSearchNoResults) {
      return (
        <MembersStateView
          Icon={SearchX}
          tone="neutral"
          title="No members found"
          description={`No members match "${members.searchQuery.trim()}". Try a different name, member ID, phone or email.`}
          actionTitle="Clear Search"
          onAction={() => members.setSearch('')}
        />
      );
    }
    if (members.isFilterNoResults) {
      return (
        <MembersStateView
          Icon={ListFilter}
          tone="neutral"
          title="Nothing under this filter"
          description="No members match the selected status filter. Try a different filter."
          actionTitle="Clear Filters"
          onAction={() => members.setTab('ALL')}
        />
      );
    }
    if (members.isEmptyList) {
      return (
        <MembersStateView
          Icon={UsersRound}
          tone="navy"
          title="No members yet"
          description="Approved members will appear here once registrations begin."
          actionTitle="Add Member"
        />
      );
    }
    return null;
  };

  const showColumnHeader = isWide && !members.isLoading && !members.hasError;

  const listHeader = (
    <View>
      <View>
        <MembersPageHeader onAddMember={() => undefined} />
        <View style={styles.sectionGap}>
          <MemberStats stats={members.stats} loading={members.isLoading} />
        </View>
        <View style={styles.sectionGap}>
          <MemberSearchFilterBar
            value={members.searchQuery}
            onChange={members.setSearch}
            onOpenFilters={() => setFilterSheetVisible(true)}
            filtersActive={members.sortOption !== 'default'}
          />
        </View>
        <View style={styles.sectionGap}>
          <MemberStatusTabs
            tabs={members.tabCounts}
            activeTab={members.activeTab}
            onSelectTab={members.setTab}
          />
        </View>
      </View>

      {showColumnHeader && (
        <MemberListHeader
          allSelected={members.allSelected}
          someSelected={someSelected}
          onToggleAll={members.toggleSelectAll}
        />
      )}
      {renderStateViews()}
    </View>
  );

  return (
    <View style={styles.screen}>
      <HRSJMHeader notificationCount={3} profileName="Admin User" />

      <FlatList
        data={members.isLoading || members.hasError ? [] : members.filteredMembers}
        keyExtractor={item => item.id}
        renderItem={renderMemberRow}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          members.isLoading ? (
            <View>
              <MembersLoadingState />
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        testID="members-flatlist"
      />

      {__DEV__ && (
        <View style={styles.devStrip}>
          {PREVIEW_STATES.map(state => (
            <StateChip
              key={state}
              label={state === 'default' ? 'Normal' : state.charAt(0).toUpperCase() + state.slice(1)}
              active={effectiveState === state}
              onPress={() => setDevPreviewState(state)}
            />
          ))}
        </View>
      )}

      <AppBottomNavigation items={BOTTOM_NAV_ITEMS} activeKey="members" />

      <MemberFilterSheet
        visible={filterSheetVisible}
        currentSort={members.sortOption}
        onApply={handleApplySort}
        onClose={() => setFilterSheetVisible(false)}
      />
      <MemberActionsSheet member={actionsMember} onClose={() => setActionsMember(null)} />
    </View>
  );
};

/** __DEV__-only chip to preview each required UI state with mock data. */
function StateChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  sectionGap: {
    marginTop: Spacing.base,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl + Spacing.md,
    gap: Spacing.sm + 2,
  },
  devStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 5,
    backgroundColor: 'rgba(7, 29, 58, 0.92)',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  chipActive: {
    backgroundColor: BrandColors.goldSoft,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  chipTextActive: {
    color: BrandColors.navyDeep,
  },
});

export default MembersScreen;
