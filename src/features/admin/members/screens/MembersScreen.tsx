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
import { useNavigation } from '@react-navigation/native';
import { AppRoutes } from '../../../../core/constants/routes';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppBottomNavigation } from '../../../../core/components/common/AppBottomNavigation';
import { AppPagination } from '../../../../core/components';
import {
  AppFeedbackModal,
  FeedbackTone,
  FeedbackAction,
} from '../../../../core/components/common/AppFeedbackModal';
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
import { MembersPageHeader } from '../components/MembersPageHeader';
import { MemberStats } from '../components/MemberStats';
import { MemberSearchFilterBar } from '../components/MemberSearchFilterBar';
import { MemberStatusTabs } from '../components/MemberStatusTabs';
import { MemberListHeader } from '../components/MemberListHeader';
import { MemberRow } from '../components/MemberRow';
import { MemberFilterSheet } from '../components/MemberFilterSheet';
import { MemberActionsSheet, type MenuAnchor } from '../components/MemberActionsSheet';
import { MembersStateView, MembersLoadingState } from '../components/MembersStateView';
import { AddMemberModal } from '../components/AddMemberModal';
import { AddMemberScreen } from './AddMemberScreen';
import { EditMemberModal } from '../components/EditMemberModal';
import { MemberProfileModal } from '../components/MemberProfileModal';
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  MembersPreviewState,
} from '../hooks/useMembers';
import type {
  CreateMemberPayload,
  UpdateMemberPayload,
} from '../services/members.service';

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
  onViewApplications?: () => void;
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
  onViewApplications,
}) => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  const handleViewApplications = useCallback(() => {
    if (onViewApplications) {
      onViewApplications();
    } else if (navigation?.navigate) {
      navigation.navigate(AppRoutes.MEMBERSHIP_APPLICATIONS);
    }
  }, [onViewApplications, navigation]);

  const handleBottomNavPress = useCallback(
    (key: string) => {
      if (onNavigate) {
        onNavigate(key);
        return;
      }
      if (navigation?.navigate) {
        if (key === 'dashboard') navigation.navigate(AppRoutes.ADMIN_DASHBOARD_TAB);
        else if (key === 'members') navigation.navigate(AppRoutes.MEMBERS_DIRECTORY);
        else if (key === 'applications') navigation.navigate(AppRoutes.ADMIN_APPLICATIONS_TAB);
        else if (key === 'complaints') navigation.navigate(AppRoutes.ADMIN_COMPLAINTS_TAB);
        else if (key === 'more') navigation.navigate(AppRoutes.ADMIN_MORE_TAB);
      }
    },
    [onNavigate, navigation]
  );

  const effectiveState: MembersPreviewState = previewState ?? 'default';
  const members = useMembers(effectiveState);
  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [actionsMember, setActionsMember] = useState<Member | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isAddMemberView, setIsAddMemberView] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginatedMembers = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return members.filteredMembers.slice(startIndex, startIndex + pageSize);
  }, [members.filteredMembers, page, pageSize]);

  // Reset to page 1 on search or tab changes
  React.useEffect(() => {
    setPage(1);
  }, [members.searchQuery, members.activeTab, members.sortOption]);

  // Professional Feedback Modal State
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    tone: FeedbackTone;
    title: string;
    message: string;
    badgeText?: string;
    primaryAction?: FeedbackAction;
    secondaryAction?: FeedbackAction;
  }>({
    visible: false,
    tone: 'success',
    title: '',
    message: '',
  });

  const showFeedback = useCallback(
    (config: Omit<typeof feedback, 'visible'>) => {
      setFeedback({ ...config, visible: true });
    },
    []
  );

  const closeFeedback = useCallback(() => {
    setFeedback((prev) => ({ ...prev, visible: false }));
  }, []);

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
        showFeedback({
          tone: 'success',
          title: 'Member Added',
          message: `${payload.full_name} has been successfully registered into the directory.`,
          badgeText: 'REGISTERED',
          primaryAction: { text: 'Great, Done' },
        });
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add member. Please verify the information and try again.';
        showFeedback({
          tone: 'error',
          title: 'Registration Failed',
          message: errorMsg,
          badgeText: 'FAILED',
          primaryAction: { text: 'Try Again' },
        });
        throw err;
      }
    },
    [createMemberMutation, showFeedback]
  );

  const handleUpdateMember = useCallback(
    async (id: string, payload: UpdateMemberPayload) => {
      try {
        await updateMemberMutation.mutateAsync({ id, payload });
        showFeedback({
          tone: 'success',
          title: 'Member Updated',
          message: 'Member details have been updated successfully.',
          badgeText: 'UPDATED',
          primaryAction: { text: 'Done' },
        });
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to update member information.';
        showFeedback({
          tone: 'error',
          title: 'Update Failed',
          message: errorMsg,
          badgeText: 'ERROR',
          primaryAction: { text: 'Dismiss' },
        });
        throw err;
      }
    },
    [updateMemberMutation, showFeedback]
  );

  const handleMemberAction = useCallback(
    (key: string, member: Member) => {
      if (key === 'deactivate') {
        showFeedback({
          tone: 'warning',
          title: 'Suspend Member',
          message: `Are you sure you want to suspend ${member.name}'s membership account?`,
          badgeText: 'SUSPENSION',
          secondaryAction: { text: 'Cancel' },
          primaryAction: {
            text: 'Suspend Account',
            variant: 'destructive',
            onPress: async () => {
              try {
                await members.handleUpdateStatus(member.id, 'SUSPENDED');
                showFeedback({
                  tone: 'success',
                  title: 'Member Suspended',
                  message: `${member.name} has been suspended.`,
                  badgeText: 'SUSPENDED',
                });
              } catch (e: any) {
                showFeedback({
                  tone: 'error',
                  title: 'Action Failed',
                  message: e?.message || 'Failed to update member status.',
                });
              }
            },
          },
        });
      } else if (key === 'activate') {
        showFeedback({
          tone: 'info',
          title: 'Activate Member',
          message: `Are you sure you want to restore and activate ${member.name}'s membership?`,
          badgeText: 'ACTIVATION',
          secondaryAction: { text: 'Cancel' },
          primaryAction: {
            text: 'Activate Account',
            onPress: async () => {
              try {
                await members.handleUpdateStatus(member.id, 'ACTIVE');
                showFeedback({
                  tone: 'success',
                  title: 'Member Activated',
                  message: `${member.name} has been successfully activated.`,
                  badgeText: 'ACTIVE',
                });
              } catch (e: any) {
                showFeedback({
                  tone: 'error',
                  title: 'Action Failed',
                  message: e?.message || 'Failed to activate member.',
                });
              }
            },
          },
        });
      } else if (key === 'view') {
        setViewMember(member);
      } else if (key === 'edit') {
        setEditMember(member);
      } else if (key === 'reset-password') {
        showFeedback({
          tone: 'info',
          title: 'Reset Password',
          message: `A secure password reset link will be sent to ${member.email || member.phone}.`,
          badgeText: 'SECURITY',
          primaryAction: { text: 'Send Link' },
        });
      }
    },
    [members, showFeedback]
  );

  const isSelectionMode = members.selectedIds.size > 0;

  const handleOpenActions = useCallback((member: Member, anchor?: MenuAnchor) => {
    setActionsMember(member);
    setMenuAnchor(anchor ?? null);
  }, []);

  const renderMemberRow = useCallback(
    ({ item }: { item: Member }) => (
      <MemberRow
        member={item}
        selected={members.selectedIds.has(item.id)}
        selectionMode={isSelectionMode}
        wide={isWide}
        onToggleSelect={members.toggleMemberSelected}
        onLongPress={members.toggleMemberSelected}
        onOpenActions={handleOpenActions}
      />
    ),
    [members.selectedIds, isSelectionMode, members.toggleMemberSelected, isWide, handleOpenActions]
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
          onAction={() => setIsAddMemberView(true)}
        />
      );
    }
    return null;
  };

  const showColumnHeader = isWide && !members.isLoading && !members.hasError;

  const listHeader = (
    <View>
      <View>
        <MembersPageHeader
          onAddMember={() => setIsAddMemberView(true)}
          onViewApplications={handleViewApplications}
        />
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

      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionCount}>
            {members.selectedIds.size} Selected
          </Text>
          <View style={styles.selectionActions}>
            <Pressable
              onPress={members.toggleSelectAll}
              style={styles.selectionBtn}
              hitSlop={6}
            >
              <Text style={styles.selectionBtnText}>
                {members.allSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>
            <Pressable
              onPress={members.clearSelection}
              style={[styles.selectionBtn, styles.selectionCancelBtn]}
              hitSlop={6}
            >
              <Text style={styles.selectionCancelText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}

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

  if (isAddMemberView) {
    return (
      <View style={styles.screen}>
        <AddMemberScreen
          onBack={() => setIsAddMemberView(false)}
          onSubmit={async (payload) => {
            try {
              await handleAddMember(payload);
              setIsAddMemberView(false);
            } catch {
              // Errors are presented via handleAddMember feedback modal
            }
          }}
          isSubmitting={createMemberMutation.isPending}
          onNavigate={onNavigate}
        />
        <AppFeedbackModal
          visible={feedback.visible}
          tone={feedback.tone}
          title={feedback.title}
          message={feedback.message}
          badgeText={feedback.badgeText}
          primaryAction={feedback.primaryAction}
          secondaryAction={feedback.secondaryAction}
          onClose={closeFeedback}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AdminHeader unreadCount={3} onNavigate={onNavigate} />

      <FlatList
        data={members.isLoading || members.hasError ? [] : paginatedMembers}
        keyExtractor={item => item.id}
        renderItem={renderMemberRow}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          members.isLoading ? (
            <View>
              <MembersLoadingState />
            </View>
          ) : members.filteredMembers.length > 0 ? (
            <AppPagination
              currentPage={page}
              totalItems={members.filteredMembers.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="members"
            />
          ) : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={members.isLoading}
            onRefresh={members.retry}
            colors={['#000000', '#0F172A']}
            tintColor="#000000"
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
          onItemPress={handleBottomNavPress}
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
        anchor={menuAnchor}
        onClose={() => {
          setActionsMember(null);
          setMenuAnchor(null);
        }}
        onSelectAction={handleMemberAction}
      />

      <EditMemberModal
        visible={Boolean(editMember)}
        member={editMember}
        onClose={() => setEditMember(null)}
        onSubmit={handleUpdateMember}
        isSubmitting={updateMemberMutation.isPending}
      />

      <MemberProfileModal
        visible={Boolean(viewMember)}
        member={viewMember}
        onClose={() => setViewMember(null)}
        onEdit={(m) => {
          setViewMember(null);
          setEditMember(m);
        }}
        onToggleStatus={(m) => {
          handleMemberAction(
            m.status === 'ACTIVE' ? 'deactivate' : 'activate',
            m
          );
        }}
      />

      <AppFeedbackModal
        visible={feedback.visible}
        tone={feedback.tone}
        title={feedback.title}
        message={feedback.message}
        badgeText={feedback.badgeText}
        primaryAction={feedback.primaryAction}
        secondaryAction={feedback.secondaryAction}
        onClose={closeFeedback}
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
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: Spacing.base,
  },
  selectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
  },
  selectionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.navy,
  },
  selectionCancelBtn: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  selectionCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MembersScreen;
