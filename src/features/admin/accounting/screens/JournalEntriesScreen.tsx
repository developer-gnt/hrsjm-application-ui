import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import {
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
} from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { JournalEntryLinesModal } from '../components/JournalEntryLinesModal';
import { ReverseEntryDialog } from '../components/ReverseEntryDialog';
import type { JournalEntryItem } from '../types/accounting.types';

interface JournalEntriesScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

type StatusTab = 'ALL' | 'POSTED' | 'REVERSED';

const STATUS_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: 'ALL', label: 'All Entries' },
  { key: 'POSTED', label: 'Posted' },
  { key: 'REVERSED', label: 'Reversed' },
];

export const JournalEntriesScreen: React.FC<JournalEntriesScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryItem | null>(null);
  const [linesModalVisible, setLinesModalVisible] = useState(false);
  const [reversingEntry, setReversingEntry] = useState<JournalEntryItem | null>(null);
  const [reverseDialogVisible, setReverseDialogVisible] = useState(false);

  const {
    entries,
    loading,
    error,
    refresh,
    reverseEntry,
  } = useJournalEntries({
    statusFilter,
    search: searchQuery,
  });

  const handleEntryPress = (entry: JournalEntryItem) => {
    setSelectedEntry(entry);
    setLinesModalVisible(true);
  };

  const handleInitiateReverse = (entry: JournalEntryItem) => {
    setReversingEntry(entry);
    setReverseDialogVisible(true);
  };

  const handleConfirmReverse = async (reason: string) => {
    if (!reversingEntry) return;
    try {
      await reverseEntry(reversingEntry.id, reason);
      Alert.alert('Reversal Successful', `Journal entry ${reversingEntry.entry_number} has been reversed.`);
      setReverseDialogVisible(false);
      setReversingEntry(null);
      setLinesModalVisible(false);
    } catch (err: any) {
      Alert.alert('Reversal Failed', err?.message || 'Could not reverse entry.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader
        unreadCount={3}
        onNavigate={(target: string) => {
          if (onNavigate) onNavigate(target);
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <View style={styles.titleRow}>
              {onBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.backBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.backChevron}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.pageTitle}>Journal Entries</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Dual-entry financial vouchers and audit reversal history.
            </Text>
          </View>
        </View>

        {/* Search Bar & Tabs */}
        <View style={styles.filterSection}>
          <AppSearchBar
            placeholder="Search entry number, reference or narration..."
            value={searchQuery}
            onSearch={setSearchQuery}
            containerStyle={styles.searchBar}
          />

          <View style={styles.tabsRow}>
            {STATUS_TABS.map(tab => {
              const isSelected = statusFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabChip, isSelected && styles.tabChipSelected]}
                  onPress={() => setStatusFilter(tab.key)}
                >
                  <Text style={[styles.tabChipText, isSelected && styles.tabChipTextSelected]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* List Content */}
        {loading && entries.length === 0 ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard height={90} borderRadius={8} />
            <SkeletonCard height={90} borderRadius={8} />
            <SkeletonCard height={90} borderRadius={8} />
          </View>
        ) : error ? (
          <AppErrorState
            title="Unable to load journal entries"
            message={error}
            onRetry={refresh}
          />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <JournalEntryCard
                entry={item}
                onPress={handleEntryPress}
                onReversePress={handleInitiateReverse}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="📝"
                  title="No Journal Entries"
                  description={
                    searchQuery
                      ? 'No entries match your search query.'
                      : 'No journal entries found for this status.'
                  }
                />
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor={AdminColors.primary}
                colors={[AdminColors.primary]}
              />
            }
          />
        )}
      </SafeAreaView>

      {/* Entry Lines Inspection Modal */}
      <JournalEntryLinesModal
        visible={linesModalVisible}
        entry={selectedEntry}
        onClose={() => setLinesModalVisible(false)}
        onReverse={handleInitiateReverse}
      />

      {/* Reversal Confirmation Dialog */}
      <ReverseEntryDialog
        visible={reverseDialogVisible}
        entry={reversingEntry}
        onCancel={() => {
          setReverseDialogVisible(false);
          setReversingEntry(null);
        }}
        onConfirm={handleConfirmReverse}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  pageHeaderText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 6,
    paddingRight: 4,
  },
  backChevron: {
    fontSize: 26,
    color: '#0F2C59',
    fontWeight: '300',
    marginTop: -4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipSelected: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  skeletonContainer: {
    padding: Spacing.base,
    gap: 10,
  },
  emptyContainer: {
    padding: Spacing.base,
    alignItems: 'center',
  },
});
