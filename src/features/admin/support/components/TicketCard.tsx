import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDate } from '../../../../core/utils/format';
import { shortTicketId } from '../types/support.types';
import type { SupportTicket } from '../types/support.types';
import { TicketStatusBadge } from './TicketStatusBadge';

interface TicketCardProps {
  ticket: SupportTicket;
  onPress: () => void;
}

function TicketCardBase({ ticket, onPress }: TicketCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <AppAvatar name={ticket.user?.full_name ?? '—'} />
        <View style={styles.nameColumn}>
          <Text style={styles.subject} numberOfLines={2}>
            {ticket.subject}
          </Text>
          <Text style={styles.reporter} numberOfLines={1}>
            {ticket.user?.full_name ?? 'Unknown user'}
          </Text>
        </View>
        <TicketStatusBadge status={ticket.status} />
      </View>

      <View style={styles.metaBlock}>
        <Text style={styles.metaLine}>
          Ticket <Text style={styles.metaStrong}>{shortTicketId(ticket.id)}</Text>
        </Text>
        <Text style={styles.metaLine}>Submitted: {formatDate(ticket.created_at)}</Text>
        {ticket.resolved_at ? (
          <Text style={styles.metaLine}>Resolved: {formatDate(ticket.resolved_at)}</Text>
        ) : null}
      </View>

      <AppButton title="View Details" onPress={onPress} variant="secondary" fullWidth />
    </AppCard>
  );
}

export const TicketCard = React.memo(TicketCardBase);

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nameColumn: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  subject: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  reporter: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaBlock: {
    marginBottom: spacing.md,
    gap: 4,
  },
  metaLine: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaStrong: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default TicketCard;
