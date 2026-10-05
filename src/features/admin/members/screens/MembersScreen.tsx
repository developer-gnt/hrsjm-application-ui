import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
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
import { useMembers, useCreateMember, MembersPreviewState } from '../hooks/useMembers';
import { MembersPageHeader } from '../components/MembersPageHeader';
import { MemberStats } from '../components/MemberStats';
import { MemberSearchFilterBar } from '../components/MemberSearchFilterBar';
import { MemberStatusTabs } from '../components/MemberStatusTabs';
import { MemberListHeader } from '../components/MemberListHeader';
import { MemberRow } from '../components/MemberRow';
import { MemberFilterSheet } from '../components/MemberFilterSheet';
import { MemberActionsSheet } from '../components/MemberActionsSheet';
import { MembersStateView, MembersLoadingState } from '../components/MembersStateView';
import { AddMemberModal } from '../components/AddMemberModal';
import type { CreateMemberPayload } from '../services/members.service';

/** Width at/above which the member list renders as an aligned column grid. */
const WIDE_LAYOUT_BREAKPOINT = 700;

const BOTTOM_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: House },
  { key: 'members', label: 'Members', Icon: UsersRound },
  { key: 'applications', label: 'Applications', Icon: FileText },
  { key: 'complaints', label: 'Complaints', Icon: MessageSquare },
  { key: 'more', label: 'More', Icon: LayoutGrid },
];

interface MembersScreenProps {
  /** Dev/preview override: renders a specific UI state with mock data. */
  previewState?: MembersPreviewState;
  showBottomNav?: boolean;
  onNavigate?: (target: string) => void;
}

/**
 * Admin › Members directory.
 * IA: Header → Page title + Add Member →
 * Statistics → Search + Filters → Status tabs → Member list → Bottom navigation.
 */
export const MembersScreen: React.FC<MembersScreenProps> = ({
  previewState,
  showBottomNav = false,
  onNavigate,
}) => {
  const effectiveState: MembersPreviewState = previewState ?? 'default';

  const members = useMembers(effectiveState);
  const createMemberMutation = useCreateMember();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [actionsMember, setActionsMember] = useState<Member | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  const someSelected =
    members.selectedIds.size > 0 && members.selectedIds.size < members.filteredMembers.length;

  const handleApplySort = useCallback(
    (sort: MemberSortOption) => members.setSort(sort),
    [members]
  );

  const handleAddMember = useCallback(
    async (payload: CreateMemberPayload) => {
      try {
        await createMemberMutation.mutateAsync(payload);
        Alert.alert(
          'Member Added',
          `${payload.full_name} has been successfully registered.`
        );
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add member. Please verify the information and try again.';
        Alert.alert('Registration Failed', errorMsg);
        throw err;
      }
    },
    [createMemberMutation]
  );

  const handleMemberAction = useCallback(
    (key: string, member: Member) => {
      if (key === 'deactivate') {
        Alert.alert(
          'Suspend Member',
          `Are you sure you want to suspend ${member.name}'s membership?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Suspend',
              style: 'destructive',
              onPress: async () => {
                try {
                  await members.handleUpdateStatus(member.id, 'SUSPENDED');
                  Alert.alert('Success', `${member.name} has been suspended.`);
                } catch (e: any) {
                  Alert.alert('Error', e?.message || 'Failed to update member status.');
                }
              },
            },
          ]
        );
      } else if (key === 'activate') {
        Alert.alert(
          'Activate Member',
          `Are you sure you want to restore and activate ${member.name}'s membership?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Activate',
              onPress: async () => {
                try {
                  await members.handleUpdateStatus(member.id, 'ACTIVE');
                  Alert.alert('Success', `${member.name} has been activated.`);
                } catch (e: any) {
                  Alert.alert('Error', e?.message || 'Failed to activate member.');
                }
              },
            },
          ]
        );
      } else if (key === 'view') {
        Alert.alert(
          'Member Profile',
          `Name: ${member.name}\nID: ${member.membershipId}\nPhone: ${member.phone}\nEmail: ${member.email}\nStatus: ${member.status}\nJoined: ${new Date(member.joinedDate).toLocaleDateString()}`
        );
      } else if (key === 'reset-password') {
        Alert.alert(
          'Reset Password',
          `A password reset link will be sent to ${member.email || member.phone}.`,
          [{ text: 'OK' }]
        );
      }
    },
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
          onAction={() => setAddModalVisible(true)}
        />
      );
    }
    return null;
  };

  const showColumnHeader = isWide && !members.isLoading && !members.hasError;

  const listHeader = (
    <View>
      <View>
        <MembersPageHeader onAddMember={() => setAddModalVisible(true)} />
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
      <AdminHeader unreadCount={3} onNavigate={onNavigate} />

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
        refreshControl={
          <RefreshControl
            refreshing={members.isLoading}
            onRefresh={members.retry}
            colors={[BrandColors.goldSoft, BrandColors.navyDeep]}
            tintColor={BrandColors.navyDeep}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        testID="members-flatlist"
      />

      {showBottomNav && (
        <AppBottomNavigation
          items={BOTTOM_NAV_ITEMS}
          activeKey="members"
          onItemPress={onNavigate}
        />
      )}

      <AddMemberModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddMember}
        isSubmitting={createMemberMutation.isPending}
      />

      <MemberFilterSheet
        visible={filterSheetVisible}
        currentSort={members.sortOption}
        onApply={handleApplySort}
        onClose={() => setFilterSheetVisible(false)}
      />
      <MemberActionsSheet
        member={actionsMember}
        onClose={() => setActionsMember(null)}
        onSelectAction={handleMemberAction}
      />
    </View>
  );
};

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
});

export default MembersScreen;
