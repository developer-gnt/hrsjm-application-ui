import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppCard } from '../../../../core/components/common/AppCard';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
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
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        {/* Top Header: Avatar, Reporter & Status */}
        <View style={styles.topRow}>
          <AppAvatar name={ticket.user?.full_name ?? '—'} size={42} />
          <View style={styles.nameColumn}>
            <Text style={styles.reporter} numberOfLines={1}>
              {ticket.user?.full_name ?? 'Unknown user'}
            </Text>
            <View style={styles.subInfoRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>
                  {shortTicketId(ticket.id)}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {formatDate(ticket.created_at)}
              </Text>
            </View>
          </View>
          <TicketStatusBadge status={ticket.status} />
        </View>

        {/* Subject & Description Snippet */}
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectTag}>SUBJECT / INQUIRY</Text>
          <Text style={styles.subject} numberOfLines={2}>
            {ticket.subject}
          </Text>
        </View>

        {/* Bottom Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              View Ticket & Conversation →
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AppCard>
  );
}

export const TicketCard = React.memo(TicketCardBase);

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nameColumn: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  reporter: {
    ...Typography.sectionHeader,
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  idBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  subjectContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  subjectTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subject: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  actionRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    backgroundColor: '#0F2C59',
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default TicketCard;

