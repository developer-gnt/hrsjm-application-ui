import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppCard } from '../../../core/components/common/AppCard';
import { AppButton } from '../../../core/components/common/AppButton';
import { BrandColors, AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { useAuthStore } from '../../auth/store/authStore';
import { assistanceService } from '../../admin/assistance/services/assistance.service';
import { AssistanceStatusBadge } from '../../admin/assistance/components/AssistanceStatusBadge';
import { AddSeekerModal } from '../../admin/assistance/components/AddSeekerModal';
import { AppFeedbackModal } from '../../../core/components/common/AppFeedbackModal';
import { getApiErrorMessage } from '../../../core/api/client';
import type {
  AssistanceRequest,
  CreateAssistanceRequestPayload,
} from '../../admin/assistance/types/assistance.types';

export const SeekerHomeScreen: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      const res = await assistanceService.list({ page: 1, limit: 50 });
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
        message: 'Your assistance request has been submitted successfully. Our team will review it and publish it as a verified cause once approved.',
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

  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const underReviewCount = requests.filter(
    r => r.status === 'UNDER_REVIEW' || r.status === 'PENDING',
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Donation Assistance Portal" />

      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <AppCard style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>
                Hello, {user?.full_name || 'Friend'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Human Rights and Social Justice Mission — Assistance Portal
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{requests.length}</Text>
                  <Text style={styles.statLabel}>Total Requests</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: '#D97706' }]}>
                    {underReviewCount}
                  </Text>
                  <Text style={styles.statLabel}>Under Review</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: '#059669' }]}>
                    {approvedCount}
                  </Text>
                  <Text style={styles.statLabel}>Approved & Live</Text>
                </View>
              </View>

              <View style={styles.actionBtnRow}>
                <AppButton
                  title="+ Apply for Assistance"
                  variant="primary"
                  onPress={() => setIsApplyModalVisible(true)}
                />
              </View>
            </AppCard>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>My Assistance Requests</Text>
              <Text style={styles.sectionHeaderCount}>{requests.length} total</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <AppCard style={styles.requestCard}>
            <View style={styles.requestCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestReason}>{item.reason}</Text>
                <Text style={styles.requestDate}>
                  Submitted on {new Date(item.created_at).toLocaleDateString('en-IN')}
                </Text>
              </View>
              <AssistanceStatusBadge status={item.status} />
            </View>

            {item.description ? (
              <Text style={styles.requestDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.requestFooter}>
              <Text style={styles.requestAmountLabel}>Requested Amount</Text>
              <Text style={styles.requestAmountVal}>
                ₹{Number(item.requested_amount).toLocaleString('en-IN')}
              </Text>
            </View>
            {item.status === 'APPROVED' ? (
              <View style={styles.liveNotice}>
                <Text style={styles.liveNoticeText}>
                  ✨ Published as a verified cause on the Causes page!
                </Text>
              </View>
            ) : null}
          </AppCard>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AdminColors.primary} style={{ marginTop: 24 }} />
          ) : (
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Assistance Requests Yet</Text>
              <Text style={styles.emptyBody}>
                You haven't submitted any assistance requests. Tap below to submit a new application.
              </Text>
              <TouchableOpacity
                style={styles.applyNowBtn}
                onPress={() => setIsApplyModalVisible(true)}
              >
                <Text style={styles.applyNowBtnText}>Submit New Application</Text>
              </TouchableOpacity>
            </AppCard>
          )
        }
        ListFooterComponent={
          <View style={styles.actionContainer}>
            <AppButton
              title="Log Out"
              variant="outline"
              onPress={signOut}
            />
          </View>
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
  container: {
    padding: Spacing.base,
    gap: 12,
  },
  welcomeCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  welcomeTitle: {
    ...Typography.screenTitle,
    color: '#B45309',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionBtnRow: {
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
  },
  sectionHeaderCount: {
    fontSize: 13,
    color: '#64748B',
  },
  requestCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestReason: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  requestDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  requestDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  requestAmountLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  requestAmountVal: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  liveNotice: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveNoticeText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  applyNowBtn: {
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  applyNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
});

export default SeekerHomeScreen;
