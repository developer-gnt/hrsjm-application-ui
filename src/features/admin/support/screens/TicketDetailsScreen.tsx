import React, { useMemo, useState } from 'react';
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
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDateTime } from '../../../../core/utils/format';
import { feedback } from '../../../../core/feedback/FeedbackContext';
import type { AppStackParamList } from '../../../../core/navigation/types';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import TicketStatusModal from '../components/TicketStatusModal';
import TicketAttachments from '../components/TicketAttachments';
import { resolveTicketSource, SOURCE_CONFIG, ticketStatusMeta } from '../support.utils';
import { canTransition, shortTicketId } from '../types/support.types';
import { useTicketActions } from '../hooks/useTicketActions';
import { useTicketDetails } from '../hooks/useTicketDetails';

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'TicketDetails'>;
type ModalAction = 'START_REVIEW' | 'RESOLVE' | 'CLOSE';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <AppCard>{children}</AppCard>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.infoValue}>{value}</Text>
      ) : (
        <View style={styles.infoValueWrap}>{value}</View>
      )}
    </View>
  );
}

function parseTicketDescription(rawDescription?: string) {
  const text = (rawDescription || '').trim();
  if (!text) {
    return {
      complainantMeta: null,
      concernDetails: '',
      hasStructuredSubmission: false,
    };
  }

  if (
    text.includes('Complainant Information:') ||
    text.includes('--- Verified Documents') ||
    text.includes('Details of Concern:') ||
    text.includes('Verified Document Attachments:')
  ) {
    const lines = text.split('\n');
    const complainantMeta: Array<{ label: string; value: string }> = [];
    let concernText = '';
    let readingSection: 'complainant' | 'concern' | 'ignore' | 'none' = 'none';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^Complainant Information:/i.test(line)) {
        readingSection = 'complainant';
        continue;
      }
      if (/^Details of Concern:/i.test(line)) {
        readingSection = 'concern';
        continue;
      }
      if (
        /^--- Verified Documents/i.test(line) ||
        /^Verified Document Attachments:/i.test(line)
      ) {
        readingSection = 'ignore';
        continue;
      }

      if (readingSection === 'complainant') {
        const match = /^-\s*([^:]+)\s*:\s*(.+)$/.exec(line);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          if (key.toLowerCase() !== 'source') {
            complainantMeta.push({ label: key, value: val });
          }
        }
      } else if (readingSection === 'concern') {
        concernText += rawLine + '\n';
      }
    }

    return {
      complainantMeta: complainantMeta.length > 0 ? complainantMeta : null,
      concernDetails: concernText.trim() || text,
      hasStructuredSubmission: true,
    };
  }

  return {
    complainantMeta: null,
    concernDetails: text,
    hasStructuredSubmission: false,
  };
}

export function TicketDetailsScreen({ route, navigation }: ScreenProps) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const { ticket, initialLoading, refreshing, error, retry, refresh, applyUpdate } =
    useTicketDetails(ticketId);
  const { startReview, resolve, close, acting, error: actionError, clearError } =
    useTicketActions();
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleConfirm = async (note?: string) => {
    if (!modalAction) {
      return;
    }
    const run =
      modalAction === 'START_REVIEW'
        ? startReview(ticketId, note)
        : modalAction === 'RESOLVE'
          ? resolve(ticketId, note)
          : close(ticketId, note);
    const result = await run;
    if (result.ok && ticket) {
      const newStatus =
        modalAction === 'START_REVIEW'
          ? 'UNDER_REVIEW'
          : modalAction === 'RESOLVE'
            ? 'RESOLVED'
            : 'CLOSED';
      applyUpdate({
        ...ticket,
        status: newStatus,
        resolved_at: modalAction === 'RESOLVE' ? new Date().toISOString() : ticket.resolved_at,
      });
      setModalAction(null);
      feedback.success(
        'Action Completed & Email Sent',
        `Ticket #${shortTicketId(ticket.id)} marked as ${ticketStatusMeta(newStatus).label}. An official email notification has been dispatched to the complainant.`,
      );
    } else if (!result.ok && result.error) {
      feedback.error('Update Failed', result.error);
    }
  };

  const parsedDesc = useMemo(
    () => parseTicketDescription(ticket?.description),
    [ticket?.description],
  );

  const renderBody = () => {
    if (initialLoading && !ticket) {
      return <SkeletonList count={3} />;
    }
    if (error && !ticket) {
      return <AppErrorState title="Unable to load the support ticket" message={error} onRetry={retry} />;
    }
    if (!ticket) {
      return null;
    }

    const canManage = can(user, 'support.manage');
    const canStartReview = canManage && canTransition(ticket.status, 'UNDER_REVIEW');
    const canResolve = canManage && canTransition(ticket.status, 'RESOLVED');
    const canClose = canManage && canTransition(ticket.status, 'CLOSED');
    const hasActions = canStartReview || canResolve || canClose;
    const sourceKey = resolveTicketSource(ticket);
    const sourceMeta = SOURCE_CONFIG[sourceKey];

    return (
      <View>
        <AppCard style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={styles.subject}>{ticket.subject}</Text>
              <Text style={styles.ticketId}>Ticket {shortTicketId(ticket.id)}</Text>
            </View>
            <TicketStatusBadge status={ticket.status} />
          </View>
        </AppCard>

        {parsedDesc.complainantMeta ? (
          <Section title="Complainant Information">
            {parsedDesc.complainantMeta.map((item, idx) => (
              <InfoRow key={idx} label={item.label} value={item.value} />
            ))}
          </Section>
        ) : (
          <Section title="Reporter">
            <View style={styles.reporterRow}>
              <AppAvatar name={ticket.user?.full_name ?? '—'} size={44} />
              <View style={styles.reporterInfo}>
                <Text style={styles.reporterName}>{ticket.user?.full_name ?? 'Unknown user'}</Text>
                <Text style={styles.reporterMeta}>{ticket.user?.email ?? '—'}</Text>
              </View>
            </View>
          </Section>
        )}

        <Section title="Ticket Information">
          <InfoRow
            label="Source"
            value={
              <View
                style={[
                  styles.sourceBadge,
                  { backgroundColor: sourceMeta.bg, borderColor: sourceMeta.border },
                ]}
              >
                <Text style={[styles.sourceBadgeText, { color: sourceMeta.text }]}>
                  {sourceMeta.label}
                </Text>
              </View>
            }
          />
          <InfoRow label="Submitted" value={formatDateTime(ticket.created_at)} />
          <InfoRow label="Last Updated" value={formatDateTime(ticket.updated_at)} />
          {ticket.resolved_at ? (
            <InfoRow
              label="Resolved"
              value={
                ticket.resolved_by_user
                  ? `${formatDateTime(ticket.resolved_at)} by ${ticket.resolved_by_user.full_name}`
                  : formatDateTime(ticket.resolved_at)
              }
            />
          ) : null}
        </Section>

        <Section title="Details of Concern">
          <Text style={styles.bodyText}>
            {parsedDesc.concernDetails || 'No details provided'}
          </Text>
        </Section>

        <Section title="Attachments">
          <TicketAttachments ticketId={ticket.id} description={ticket.description} />
        </Section>

        <Section title="Actions">
          {hasActions ? (
            <View style={styles.actionsWrap}>
              {canStartReview ? (
                <AppButton
                  title="Start Review"
                  variant="secondary"
                  fullWidth
                  onPress={() => {
                    clearError();
                    setModalAction('START_REVIEW');
                  }}
                />
              ) : null}
              {canResolve ? (
                <AppButton
                  title="Resolve"
                  variant="success"
                  fullWidth
                  onPress={() => {
                    clearError();
                    setModalAction('RESOLVE');
                  }}
                />
              ) : null}
              {canClose ? (
                <AppButton
                  title="Close Ticket"
                  variant="danger"
                  fullWidth
                  onPress={() => {
                    clearError();
                    setModalAction('CLOSE');
                  }}
                />
              ) : null}
            </View>
          ) : (
            <Text style={styles.actionNote}>
              {canManage
                ? `This ticket is closed and can no longer be changed.`
                : `Current status: ${ticketStatusMeta(ticket.status).label}. You do not have permission to manage this ticket.`}
            </Text>
          )}
        </Section>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader title="Ticket Details" showBack onBack={() => navigation.goBack()} />
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

      {modalAction ? (
        <TicketStatusModal
          visible
          action={modalAction}
          loading={acting === modalAction}
          error={actionError}
          onClose={() => setModalAction(null)}
          onConfirm={handleConfirm}
        />
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
    paddingBottom: 160,
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
    marginRight: spacing.md,
  },
  subject: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  ticketId: {
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
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  reporterName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reporterMeta: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  infoValueWrap: {
    flex: 2,
    alignItems: 'flex-end',
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsWrap: {
    gap: spacing.sm,
  },
  actionNote: {
    ...typography.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});

export default TicketDetailsScreen;
