import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { AppFeedbackModal } from '../../../../core/components/common/AppFeedbackModal';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { BrandColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { getApiErrorMessage } from '../../../../core/api/client';
import { SeekerRowCard } from '../components/SeekerRowCard';
import { SeekerDetailsModal } from '../components/SeekerDetailsModal';
import { AssistanceFilters } from '../components/AssistanceFilters';
import { AssistanceStatsRow } from '../components/AssistanceStats';
import { AddSeekerModal } from '../components/AddSeekerModal';
import { ASSISTANCE_TABS, type AssistanceTabKey } from '../assistance.utils';
import {
  useAssistance,
  useUpdateAssistanceStatus,
} from '../hooks/useAssistance';
import type {
  AssistanceRequest,
  CreateAssistanceRequestPayload,
  UpdateAssistanceStatusBody,
} from '../types/assistance.types';
import { AppEmptyState, AppErrorState } from '../../../../core';

export function AssistanceRequestsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const { user } = useAuth();
  const {
    filteredItems,
    stats,
    statsLoading,
    activeTab,
    searchQuery,
    filterState,
    initialLoading,
    refreshing,
    error,
    setSearchQuery,
    setActiveTab,
    applyFilters,
    refresh,
    clearFilters,
    createRequest,
  } = useAssistance();

  const updateStatusMutation = useUpdateAssistanceStatus();

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [addSeekerVisible, setAddSeekerVisible] = useState(false);
  const [isSubmittingSeeker, setIsSubmittingSeeker] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


  const [feedbackConfig, setFeedbackConfig] = useState<{
    visible: boolean;
    tone: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    badgeText?: string;
  }>({
    visible: false,
    tone: 'success',
    title: '',
    message: '',
  });

  const canReview = can(user, 'assistance.review');

  const tabs: Array<{ key: AssistanceTabKey; label: string; count: number }> = [
    { key: 'ALL', label: 'All', count: stats.total },
    { key: 'UNDER_REVIEW', label: 'Under Review', count: stats.underReview },
    { key: 'APPROVED', label: 'Approved', count: stats.approved },
    { key: 'REJECTED', label: 'Rejected', count: stats.rejected },
  ];

  const handleOpenDetails = (request: AssistanceRequest) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };

  const handleUpdateStatus = async (
    id: string,
    body: UpdateAssistanceStatusBody,
  ) => {
    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({ id, body });
      setDetailsModalVisible(false);
      setFeedbackConfig({
        visible: true,
        tone: 'success',
        title: 'Status Updated',
        message: `Application status has been changed to ${body.status.replace('_', ' ')}.`,
        badgeText: 'UPDATED',
      });
      refresh();
    } catch (err: any) {
      setFeedbackConfig({
        visible: true,
        tone: 'error',
        title: 'Update Failed',
        message: getApiErrorMessage(
          err,
          'Failed to update assistance request status.',
        ),
        badgeText: 'ERROR',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateSeekerSubmit = async (
    payload: CreateAssistanceRequestPayload,
  ) => {
    setIsSubmittingSeeker(true);
    try {
      const created = await createRequest(payload);
      setAddSeekerVisible(false);
      setFeedbackConfig({
        visible: true,
        tone: 'success',
        title: 'Assistance Request Created',
        message: `Successfully registered assistance request for ${created.full_name || payload.full_name} (₹${payload.requested_amount.toLocaleString('en-IN')}). The case is placed under review.`,
        badgeText: 'CASE RECORDED',
      });
    } catch (err: any) {
      setFeedbackConfig({
        visible: true,
        tone: 'error',
        title: 'Creation Failed',
        message: getApiErrorMessage(
          err,
          'Unable to submit assistance request. Please verify mobile number and details.',
        ),
        badgeText: 'ERROR',
      });
    } finally {
      setIsSubmittingSeeker(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AdminHeader />

      <FlatList
        style={styles.list}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SeekerRowCard
            request={item}
            onPress={() => handleOpenDetails(item)}
            onReviewPress={() => handleOpenDetails(item)}
            onMenuPress={() => handleOpenDetails(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BrandColors.navy}
            colors={[BrandColors.navy]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Top Title & Add Seeker CTA */}
            <View style={styles.headerArea}>
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.pageTitle}>Donation Seekers</Text>
                  <Text style={styles.pageSubtitle}>
                    Review, verify and manage donation requests.
                  </Text>
                </View>
                {canReview ? (
                  <TouchableOpacity
                    onPress={() => setAddSeekerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Add Seeker"
                    style={styles.addButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addButtonPlus}>+</Text>
                    <Text style={styles.addButtonText}>Add Seeker</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* 4-Column Executive KPI Cards */}
            <AssistanceStatsRow stats={stats} loading={statsLoading} />

            {/* Search & Filter Bar matching requested UI */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <AppSearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, request ID, cause or location..."
                />
              </View>
              <TouchableOpacity
                onPress={() => setFiltersVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                style={styles.filtersButton}
                activeOpacity={0.85}
              >
                <Text style={styles.filterIcon}>⚙️</Text>
                <Text style={styles.filtersText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Clean Custom Status Filter Tabs with smooth horizontal scrolling */}
            <View style={styles.tabsContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={tabs}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.tabsScrollContent}
                renderItem={({ item: tab }) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.tabPill,
                        isActive ? styles.tabPillActive : styles.tabPillInactive,
                      ]}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tabLabel,
                          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                        ]}
                      >
                        {tab.label} ({tab.count})
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Table Column Headers (Only for wide screens / tablets) */}
            {isWide ? (
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderText, styles.colSeeker]}>
                  Seeker Details
                </Text>
                <Text style={[styles.tableHeaderText, styles.colCause]}>
                  Cause & Description
                </Text>
                <Text style={[styles.tableHeaderText, styles.colAmount]}>
                  Requested Amount
                </Text>
                <Text style={[styles.tableHeaderText, styles.colStatus]}>
                  Status
                </Text>
              </View>
            ) : null}
          </View>
        }

        ListEmptyComponent={
          initialLoading ? (
            <SkeletonList count={4} />
          ) : error ? (
            <AppErrorState
              title="Unable to load assistance requests"
              message={error}
              onRetry={refresh}
            />
          ) : (
            <AppEmptyState
              title="No Assistance Requests"
              message="There are no requests matching your current filters."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          )
        }
        contentContainerStyle={styles.listContent}
      />

      <AssistanceFilters
        visible={filtersVisible}
        filters={filterState}
        onClose={() => setFiltersVisible(false)}
        onApply={newFilters => {
          applyFilters(newFilters);
          setFiltersVisible(false);
        }}
        onReset={() => {
          clearFilters();
          setFiltersVisible(false);
        }}
      />


      <AddSeekerModal
        visible={addSeekerVisible}
        onClose={() => setAddSeekerVisible(false)}
        onSubmit={handleCreateSeekerSubmit}
        isSubmitting={isSubmittingSeeker}
      />

      <SeekerDetailsModal
        visible={detailsModalVisible}
        request={selectedRequest}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedRequest(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />

      <AppFeedbackModal
        visible={feedbackConfig.visible}
        tone={feedbackConfig.tone}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        badgeText={feedbackConfig.badgeText}
        onClose={() =>
          setFeedbackConfig(prev => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xxl * 2,
  },
  headerArea: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 24,
    color: '#0F2C59',
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F2C59',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addButtonPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: BorderRadius.lg,
  },
  filterIcon: {
    fontSize: 13,
  },
  filtersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  tabsContainer: {
    marginBottom: Spacing.md,
  },
  tabsScrollContent: {
    paddingHorizontal: Spacing.sm,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#0F2C59',
    shadowColor: '#0F2C59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tabPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabLabelInactive: {
    color: '#0F2C59',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: 0.4,
  },
  colSeeker: {
    flex: 2.4,
  },
  colCause: {
    flex: 2.2,
    paddingHorizontal: 4,
  },
  colAmount: {
    flex: 1.8,
    paddingHorizontal: 4,
  },
  colStatus: {
    width: 95,
    textAlign: 'center',
  },
});


export default AssistanceRequestsScreen;

