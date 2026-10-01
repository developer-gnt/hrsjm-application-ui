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
import { formatDateTime } from '../../../../core/utils/format';
import type { AdminStackParamList } from '../../../../core/navigation/types';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import TicketStatusModal from '../components/TicketStatusModal';
import TicketAttachments from '../components/TicketAttachments';
import { ticketStatusMeta } from '../support.utils';
import { canTransition, shortTicketId } from '../types/support.types';
import { useTicketActions } from '../hooks/useTicketActions';
import { useTicketDetails } from '../hooks/useTicketDetails';

type ScreenProps = NativeStackScreenProps<AdminStackParamList, 'TicketDetails'>;
type ModalAction = 'START_REVIEW' | 'RESOLVE' | 'CLOSE';

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

export function TicketDetailsScreen({ route, navigation }: ScreenProps) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const { ticket, initialLoading, refreshing, error, refresh, applyUpdate, retry } =
    useTicketDetails(ticketId);
  const { acting, error: actionError, startReview, resolve, close, clearError } =
    useTicketActions();
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleConfirm = async (note?: string) => {
    if (!modalAction) {
      return;
    }
    const run =
      modalAction === 'START_REVIEW'
        ? startReview(ticketId)
        : modalAction === 'RESOLVE'
          ? resolve(ticketId, note)
          : close(ticketId, note);
    const result = await run;
    if (result.ok && ticket) {
      // Reflect the transition locally; useTicketDetails refreshes on focus.
      applyUpdate({
        ...ticket,
        status:
          modalAction === 'START_REVIEW'
            ? 'UNDER_REVIEW'
            : modalAction === 'RESOLVE'
              ? 'RESOLVED'
              : 'CLOSED',
        resolved_at: modalAction === 'RESOLVE' ? new Date().toISOString() : ticket.resolved_at,
      });
      setModalAction(null);
    }
  };

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

        <Section title="Reporter">
          <View style={styles.reporterRow}>
            <AppAvatar name={ticket.user?.full_name ?? '—'} size={44} />
            <View style={styles.reporterInfo}>
              <Text style={styles.reporterName}>{ticket.user?.full_name ?? 'Unknown user'}</Text>
              <Text style={styles.reporterMeta}>{ticket.user?.email ?? '—'}</Text>
            </View>
          </View>
        </Section>

        <Section title="Ticket Information">
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

        <Section title="Description">
          <Text style={styles.bodyText}>{ticket.description}</Text>
        </Section>

        <Section title="Attachments">
          <TicketAttachments ticketId={ticket.id} />
        </Section>

        <Section title="Conversation">
          <Text style={styles.conversationNote}>
            Reply to the reporter in the ticket chat.
          </Text>
          <AppButton
            title="Open Chat"
            variant="secondary"
            fullWidth
            onPress={() =>
              navigation.navigate('TicketChat', {
                ticketId: ticket.id,
                subject: ticket.subject,
              })
            }
          />
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
      <AppHeader title="Ticket Details" showBack />
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
  conversationNote: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionsWrap: {
    gap: spacing.md,
  },
  actionNote: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default TicketDetailsScreen;
