import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppCard } from '../../../core/components/common/AppCard';
import { AppButton } from '../../../core/components/common/AppButton';
import { AssistanceStatusBadge } from '../../admin/assistance/components/AssistanceStatusBadge';
import { AddSeekerModal } from '../../admin/assistance/components/AddSeekerModal';
import { AppFeedbackModal } from '../../../core/components/common/AppFeedbackModal';
import { assistanceService } from '../../admin/assistance/services/assistance.service';
import { getApiErrorMessage } from '../../../core/api/client';
import { SeekerTimelineStepper } from '../components/SeekerTimelineStepper';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import type {
  AssistanceRequest,
  CreateAssistanceRequestPayload,
  AssistanceStatus,
} from '../../admin/assistance/types/assistance.types';

type FilterTab = 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface SeekerRequestsScreenProps {
  navigation?: any;
  onApplyPress?: () => void;
  onContactSupport?: (request: AssistanceRequest) => void;
}

export const SeekerRequestsScreen: React.FC<SeekerRequestsScreenProps> = ({
  navigation,
  onApplyPress,
  onContactSupport,
}) => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackConfig, setFeedbackConfig] = useState<{
    visible: boolean;
    tone: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    tone: 'success',
    title: '',
    message: '',
  });

  const loadRequests = async () => {
    try {
      const res = await assistanceService.list({ page: 1, limit: 100 });
      setRequests(res.items || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleCreateRequest = async (payload: CreateAssistanceRequestPayload) => {
    setIsSubmitting(true);
    try {
      await assistanceService.create(payload);
      setIsApplyModalVisible(false);
      setFeedbackConfig({
        visible: true,
        tone: 'success',
        title: 'Application Submitted',
        message: 'Your assistance request has been submitted successfully. Our team will review the details and verify documents.',
      });
      loadRequests();
    } catch (err) {
      setFeedbackConfig({
        visible: true,
        tone: 'error',
        title: 'Submission Failed',
        message: getApiErrorMessage(err, 'Failed to submit assistance application.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Filter tab
      if (activeTab === 'PENDING' && r.status !== 'PENDING') return false;
      if (activeTab === 'UNDER_REVIEW' && r.status !== 'UNDER_REVIEW') return false;
      if (activeTab === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && r.status !== 'REJECTED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const reasonMatch = (r.reason || '').toLowerCase().includes(q);
        const descMatch = (r.description || '').toLowerCase().includes(q);
        return reasonMatch || descMatch;
      }
      return true;
    });
  }, [requests, activeTab, searchQuery]);

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'ALL', label: `All (${requests.length})` },
    { key: 'UNDER_REVIEW', label: 'In Review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Aid Application Tracker"
        subtitle="Track status and timeline of your requests"
        rightAction={
          <TouchableOpacity
            style={styles.headerNewBtn}
            onPress={() => (onApplyPress ? onApplyPress() : setIsApplyModalVisible(true))}
          >
            <Text style={styles.headerNewBtnText}>+ Apply</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests by purpose, cause..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.refId}>
                  ASST-{item.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={styles.reasonTitle}>{item.reason}</Text>
                <Text style={styles.dateText}>
                  Submitted on {new Date(item.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <AssistanceStatusBadge status={item.status} />
            </View>

            {item.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {/* Requested Amount Banner */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Required Aid Amount</Text>
              <Text style={styles.amountValue}>
                ₹{Number(item.requested_amount).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Visual Stepper */}
            <View style={styles.stepperContainer}>
              <SeekerTimelineStepper status={item.status} />
            </View>

            {/* Admin Remarks if rejected or reviewed */}
            {item.admin_remark ? (
              <View
                style={[
                  styles.remarkBox,
                  item.status === 'REJECTED' && styles.remarkBoxRejected,
                ]}
              >
                <Text style={styles.remarkTitle}>Review Feedback:</Text>
                <Text style={styles.remarkText}>{item.admin_remark}</Text>
              </View>
            ) : null}

            {/* Live Campaign notice if approved */}
            {item.status === 'APPROVED' ? (
              <View style={styles.approvedNotice}>
                <Text style={styles.approvedNoticeText}>
                  ✨ This cause is verified and live on the HRSJM public donation portal!
                </Text>
              </View>
            ) : null}

            {/* Bottom Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.queryBtn}
                onPress={() => {
                  if (onContactSupport) {
                    onContactSupport(item);
                  } else if (navigation) {
                    navigation.navigate('SeekerSupport');
                  }
                }}
              >
                <Text style={styles.queryBtnText}>💬 Ask Helpdesk</Text>
              </TouchableOpacity>
            </View>
          </AppCard>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AdminColors.primary} style={{ marginTop: 32 }} />
          ) : (
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Applications Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No applications match your search query.'
                  : activeTab === 'ALL'
                  ? "You haven't submitted any aid applications yet. Tap below to submit a new application."
                  : `No applications with status "${activeTab.replace('_', ' ')}".`}
              </Text>
              <TouchableOpacity
                style={styles.emptyApplyBtn}
                onPress={() => setIsApplyModalVisible(true)}
              >
                <Text style={styles.emptyApplyBtnText}>+ Submit Application</Text>
              </TouchableOpacity>
            </AppCard>
          )
        }
      />

      <AddSeekerModal
        visible={isApplyModalVisible}
        onClose={() => setIsApplyModalVisible(false)}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmitting}
      />

      <AppFeedbackModal
        visible={feedbackConfig.visible}
        tone={feedbackConfig.tone}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        onClose={() => setFeedbackConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerNewBtn: {
    backgroundColor: '#C9A227',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  headerNewBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: Spacing.sm,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0D9488',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  searchRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  listContainer: {
    padding: Spacing.base,
    gap: 14,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  reasonTitle: {
    ...Typography.sectionHeader,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperContainer: {
    marginTop: 6,
    marginBottom: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  remarkBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 8,
  },
  remarkBoxRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  remarkTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  remarkText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  approvedNotice: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 8,
    marginTop: 8,
  },
  approvedNoticeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  queryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  queryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B3F8F',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyApplyBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  emptyApplyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
