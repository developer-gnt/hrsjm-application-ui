import React, { useState, useSyncExternalStore } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { StatusTabKey, SupportTicket, DateFilter } from '../types/ticket.types';
import { supportTicketsStore } from '../services/supportTicketsStore';
import { SupportTicketsHeader } from '../components/SupportTicketsHeader';
import { SupportSummaryCards } from '../components/SupportSummaryCards';
import { SupportSearchBar } from '../components/SupportSearchBar';
import { SupportStatusTabs } from '../components/SupportStatusTabs';
import { SupportTicketCard } from '../components/SupportTicketCard';
import { SupportEmptyState } from '../components/SupportEmptyState';
import { SupportFilterModal, formatDisplayDate } from '../components/SupportFilterModal';
import { SupportTicketDetailsModal } from '../components/SupportTicketDetailsModal';
import { SupportBottomNav } from '../components/SupportBottomNav';
import { PlusIcon } from '../components/SupportIcons';

interface SupportTicketsScreenProps {
  initialTicketId?: string;
  onCreateTicketPress?: () => void;
  onViewTicketDetails?: (ticket: SupportTicket) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const SupportTicketsScreen: React.FC<SupportTicketsScreenProps> = ({
  initialTicketId,
  onCreateTicketPress,
  onViewTicketDetails,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const [statusTab, setStatusTab] = useState<StatusTabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<SupportTicket | null>(() => {
    if (initialTicketId) {
      return supportTicketsStore.getTicketById(initialTicketId) || null;
    }
    return null;
  });

  // Subscribe to store updates with useSyncExternalStore
  useSyncExternalStore(
    supportTicketsStore.subscribe,
    supportTicketsStore.getSnapshot,
    supportTicketsStore.getSnapshot
  );

  const stats = supportTicketsStore.getStats();

  const filteredTickets = supportTicketsStore.getTickets({
    statusTab,
    searchQuery,
    dateFilter,
  });

  const handleTicketPress = (ticket: SupportTicket) => {
    if (onViewTicketDetails) {
      onViewTicketDetails(ticket);
    }
    setSelectedTicketForDetails(ticket);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter(null);
    setStatusTab('all');
  };

  const activeFilterCount = (dateFilter ? 1 : 0);

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <SupportTicketsHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Title Row: Title, Subtitle & Prominent Create Ticket Button */}
          <View style={styles.titleRow}>
            <View style={styles.titleTextColumn}>
              <Text style={styles.pageTitle}>Support Tickets</Text>
              <Text style={styles.pageSubtitle}>
                Raise and track your support requests.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createTicketButton}
              onPress={onCreateTicketPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Create Support Ticket"
            >
              <PlusIcon size={14} color="#FFFFFF" />
              <Text style={styles.createTicketButtonText}>Create Ticket</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Summary Cards (Total Tickets, Open, Resolved, Closed) */}
          <SupportSummaryCards
            stats={stats}
            activeTab={statusTab}
            onCardPress={tab => setStatusTab(tab)}
          />

          {/* Search Bar & Filters Button */}
          <SupportSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            onFilterPress={() => setFilterModalVisible(true)}
            activeFilterCount={activeFilterCount}
          />

          {/* Status Tabs Pills (All, Open, In Progress, Resolved, Closed) */}
          <SupportStatusTabs
            activeTab={statusTab}
            onTabChange={setStatusTab}
            stats={stats}
          />

          {/* Filter notice if date filter applied */}
          {dateFilter && (
            <View style={styles.filterChipRow}>
              <Text style={styles.filterChipLabel}>
                Filtered by date:{' '}
                <Text style={styles.filterChipValue}>
                  {dateFilter.mode === 'single'
                    ? formatDisplayDate(dateFilter.singleDate)
                    : `${formatDisplayDate(dateFilter.fromDate)} — ${formatDisplayDate(dateFilter.toDate)}`}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => setDateFilter(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear date filter"
              >
                <Text style={styles.filterChipClear}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ticket Cards List */}
          {filteredTickets.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredTickets.map(ticket => (
                <SupportTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={handleTicketPress}
                  onViewDetails={handleTicketPress}
                />
              ))}
            </View>
          ) : stats.total === 0 ? (
            <SupportEmptyState
              type="empty"
              onCreateTicket={onCreateTicketPress}
            />
          ) : (
            <SupportEmptyState
              type="no-results"
              searchQuery={searchQuery}
              onClearFilters={handleClearFilters}
            />
          )}
        </View>
      </ScrollView>

      {/* Date Filter Modal */}
      <SupportFilterModal
        visible={filterModalVisible}
        dateFilter={dateFilter}
        onClose={() => setFilterModalVisible(false)}
        onApply={setDateFilter}
        onReset={() => setDateFilter(null)}
      />

      {/* Ticket Details Modal */}
      <SupportTicketDetailsModal
        visible={!!selectedTicketForDetails}
        ticket={selectedTicketForDetails}
        onClose={() => setSelectedTicketForDetails(null)}
      />

      {/* Bottom Navigation with Support highlighted */}
      <View style={styles.bottomNavHost}>
        <SupportBottomNav
          bottomInset={insets.bottom}
          activeKey="support"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  titleTextColumn: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  createTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    gap: 6,
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  createTicketButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  filterChipLabel: {
    fontSize: 12,
    color: '#1E3A8A',
  },
  filterChipValue: {
    fontWeight: '700',
  },
  filterChipClear: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '800',
    paddingLeft: 8,
  },
  listContainer: {
    marginTop: 2,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
