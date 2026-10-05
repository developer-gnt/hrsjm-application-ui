import React, { useMemo, useState } from 'react';
import {
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
  SkeletonCard,
} from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useLedger } from '../hooks/useLedger';
import { LedgerSummaryCard } from '../components/LedgerSummaryCard';
import { LedgerTransactionRow } from '../components/LedgerTransactionRow';

interface GeneralLedgerScreenProps {
  accountId?: string;
  accountName?: string;
  accountCode?: string | null;
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

type DatePreset = 'THIS_MONTH' | 'LAST_QUARTER' | 'THIS_FY';

export const GeneralLedgerScreen: React.FC<GeneralLedgerScreenProps> = ({
  accountId,
  accountName: initialAccountName,
  accountCode: initialAccountCode,
  onBack,
  onNavigate,
}) => {
  const [datePreset, setDatePreset] = useState<DatePreset>('THIS_MONTH');

  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    if (datePreset === 'THIS_MONTH') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { fromDate: from, toDate: to };
    } else if (datePreset === 'LAST_QUARTER') {
      const from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { fromDate: from, toDate: to };
    } else {
      // Indian Financial Year: April 1 to March 31
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const from = `${currentYear}-04-01`;
      const to = `${currentYear + 1}-03-31`;
      return { fromDate: from, toDate: to };
    }
  }, [datePreset]);

  const {
    transactions,
    summary,
    account,
    loading,
    error,
    refresh,
  } = useLedger({
    accountId,
    fromDate,
    toDate,
  });

  const displayAccountName = account?.account_name || initialAccountName;
  const displayAccountCode = account?.account_code || initialAccountCode;

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
              <Text style={styles.pageTitle}>
                {accountId ? 'Account Ledger' : 'General Ledger'}
              </Text>
            </View>
            <Text style={styles.pageSubtitle}>
              {accountId
                ? 'Running balance and transaction trail for this specific account.'
                : 'Master organizational ledger book with opening and running balances.'}
            </Text>
          </View>
        </View>

        {/* Date Presets */}
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={[styles.presetChip, datePreset === 'THIS_MONTH' && styles.presetChipSelected]}
            onPress={() => setDatePreset('THIS_MONTH')}
          >
            <Text style={[styles.presetText, datePreset === 'THIS_MONTH' && styles.presetTextSelected]}>
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetChip, datePreset === 'LAST_QUARTER' && styles.presetChipSelected]}
            onPress={() => setDatePreset('LAST_QUARTER')}
          >
            <Text style={[styles.presetText, datePreset === 'LAST_QUARTER' && styles.presetTextSelected]}>
              Last 3 Months
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetChip, datePreset === 'THIS_FY' && styles.presetChipSelected]}
            onPress={() => setDatePreset('THIS_FY')}
          >
            <Text style={[styles.presetText, datePreset === 'THIS_FY' && styles.presetTextSelected]}>
              Financial Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        {loading && transactions.length === 0 ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard height={140} borderRadius={12} />
            <SkeletonCard height={80} borderRadius={8} />
            <SkeletonCard height={80} borderRadius={8} />
          </View>
        ) : error ? (
          <AppErrorState
            title="Unable to load ledger"
            message={error}
            onRetry={refresh}
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => `${item.entry_id}-${item.id}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <LedgerSummaryCard
                summary={summary}
                accountName={displayAccountName}
                accountCode={displayAccountCode}
              />
            }
            renderItem={({ item }) => <LedgerTransactionRow transaction={item} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="📖"
                  title="No Ledger Transactions"
                  description="No journal entries posted for this period."
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
  presetsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: 8,
    marginBottom: 4,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipSelected: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  presetTextSelected: {
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
