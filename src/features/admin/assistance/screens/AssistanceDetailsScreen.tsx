import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatCurrency, formatDateTime } from '../../../../core/utils/format';
import type { AdminStackParamList } from '../../../../core/navigation/types';
import { AssistanceStatusBadge } from '../components/AssistanceStatusBadge';
import ApproveAssistanceModal from '../components/ApproveAssistanceModal';
import RejectAssistanceModal from '../components/RejectAssistanceModal';
import { canReview, statusMeta } from '../assistance.utils';
import { shortRequestId } from '../types/assistance.types';
import { useAssistanceActions } from '../hooks/useAssistanceActions';
import { useAssistanceDetails } from '../hooks/useAssistanceDetails';

type ScreenProps = NativeStackScreenProps<AdminStackParamList, 'AssistanceDetails'>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AppCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </AppCard>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function AssistanceDetailsScreen({ route, navigation }: ScreenProps) {
  const { requestId } = route.params;
  const { user } = useAuth();
  const { request, initialLoading, refreshing, error, refresh, applyUpdate, retry } =
    useAssistanceDetails(requestId);
  const { acting, error: actionError, approve, reject, clearError } = useAssistanceActions();
  const [approveVisible, setApproveVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);

  const handleApprove = async (note?: string) => {
    const updated = await approve(requestId, note);
    if (updated) {
      applyUpdate(updated);
      setApproveVisible(false);
    }
  };

  const handleReject = async (reason: string) => {
    const updated = await reject(requestId, reason);
    if (updated) {
      applyUpdate(updated);
      setRejectVisible(false);
    }
  };

  const renderBody = () => {
    if (initialLoading && !request) {
      return <SkeletonList count={3} />;
    }
    if (error && !request) {
      return <AppErrorState title="Unable to load the assistance request" message={error} onRetry={retry} />;
    }
    if (!request) {
      return null;
    }

    const reviewable = canReview(request.status);
    const canApprove = can(user, 'assistance.approve') && reviewable;
    const canReject = can(user, 'assistance.reject') && reviewable;

    return (
      <View>
        <AppCard style={styles.headerCard}>
          <View style={styles.headerRow}>
            <AppAvatar name={request.fullName} size={52} />
            <View style={styles.headerInfo}>
              <Text style={styles.seekerName}>{request.fullName}</Text>
              <Text style={styles.requestId}>Request {shortRequestId(request.id)}</Text>
            </View>
            <AssistanceStatusBadge status={request.status} />
          </View>
        </AppCard>

        <Section title="Seeker Information">
          <InfoRow label="Full Name" value={request.fullName} />
          <InfoRow label="Mobile" value={request.mobile} />
          <InfoRow label="Email" value={request.email ?? '—'} />
          <InfoRow
            label="Linked Account"
            value={request.owner ? `${request.owner.fullName} (${request.owner.email})` : 'No linked account'}
          />
        </Section>

        <Section title="Request Information">
          <InfoRow label="Submitted" value={formatDateTime(request.createdAt)} />
          <InfoRow label="Last Updated" value={formatDateTime(request.updatedAt)} />
          <InfoRow label="Requested Amount" value={formatCurrency(request.requestedAmount)} />
          {request.reviewedAt ? (
            <InfoRow label="Reviewed" value={formatDateTime(request.reviewedAt)} />
          ) : null}
        </Section>

        <Section title="Cause">
          <Text style={styles.bodyText}>{request.reason}</Text>
        </Section>

        <Section title="Description">
          <Text style={styles.bodyText}>{request.description ?? '—'}</Text>
        </Section>

        <Section title="Supporting Documents">
          <AppButton
            title="View Documents"
            variant="secondary"
            fullWidth
            onPress={() =>
              navigation.navigate('AssistanceDocuments', {
                requestId: request.id,
                seekerName: request.fullName,
              })
            }
          />
        </Section>

        <Section title="Request Timeline">
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotPrimary]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Request submitted</Text>
              <Text style={styles.timelineDate}>{formatDateTime(request.createdAt)}</Text>
            </View>
          </View>
          {request.reviewedAt ? (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Review recorded — {statusMeta(request.status).label}</Text>
                <Text style={styles.timelineDate}>{formatDateTime(request.reviewedAt)}</Text>
                {request.adminRemark ? (
                  <Text style={styles.timelineNote}>{request.adminRemark}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, styles.timelineDotPending]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Awaiting review</Text>
              </View>
            </View>
          )}
        </Section>

        <Section title="Review Actions">
          {canApprove || canReject ? (
            <View style={styles.actionsRow}>
              {canReject ? (
                <View style={styles.actionButton}>
                  <AppButton
                    title="Reject"
                    variant="danger"
                    fullWidth
                    onPress={() => {
                      clearError();
                      setRejectVisible(true);
                    }}
                  />
                </View>
              ) : null}
              {canApprove ? (
                <View style={styles.actionButton}>
                  <AppButton
                    title="Approve"
                    variant="success"
                    fullWidth
                    onPress={() => {
                      clearError();
                      setApproveVisible(true);
                    }}
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.reviewNote}>
              {reviewable
                ? 'You do not have permission to review this request.'
                : `This request has been finalised (${statusMeta(request.status).label}) and can no longer be changed.`}
            </Text>
          )}
        </Section>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Request Details" showBack />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        {renderBody()}
      </ScrollView>

      {request ? (
        <>
          <ApproveAssistanceModal
            visible={approveVisible}
            requesterName={request.fullName}
            loading={acting === 'APPROVE'}
            error={actionError}
            onClose={() => setApproveVisible(false)}
            onConfirm={handleApprove}
          />
          <RejectAssistanceModal
            visible={rejectVisible}
            requesterName={request.fullName}
            loading={acting === 'REJECT'}
            error={actionError}
            onClose={() => setRejectVisible(false)}
            onConfirm={handleReject}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  seekerName: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  requestId: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.md,
  },
  timelineDotPrimary: {
    backgroundColor: colors.primary,
  },
  timelineDotDone: {
    backgroundColor: colors.active,
  },
  timelineDotPending: {
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelineDate: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineNote: {
    ...typography.secondary,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  reviewNote: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default AssistanceDetailsScreen;
