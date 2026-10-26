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
import { resolveTicketSource, SOURCE_CONFIG } from '../support.utils';

interface TicketCardProps {
  ticket: SupportTicket;
  onPress: () => void;
}

function TicketCardBase({ ticket, onPress }: TicketCardProps) {
  const categoryMatch = ticket.subject.match(/^\[(.*?)\]/);
  const category = categoryMatch ? categoryMatch[1] : 'General';
  const cleanSubject = categoryMatch ? ticket.subject.replace(/^\[.*?\]\s*/, '') : ticket.subject;

  const isUpdated =
    ticket.updated_at &&
    new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime() > 60000;

  const source = resolveTicketSource(ticket);
  const sourceMeta = SOURCE_CONFIG[source];

  return (
    <AppCard style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        {/* Top Header: Avatar, Reporter, Status & Metadata */}
        <View style={styles.topRow}>
          <AppAvatar name={ticket.user?.full_name ?? '—'} size={42} />
          <View style={styles.nameColumn}>
            <View style={styles.nameStatusRow}>
              <Text style={styles.reporter} numberOfLines={1}>
                {ticket.user?.full_name ?? 'Unknown user'}
              </Text>
              <TicketStatusBadge status={ticket.status} />
            </View>
            <View style={styles.subInfoRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>
                  {shortTicketId(ticket.id)}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText} numberOfLines={1} ellipsizeMode="tail">
                  {category}
                </Text>
              </View>
              <View
                style={[
                  styles.sourceBadge,
                  {
                    backgroundColor: sourceMeta.bg,
                    borderColor: sourceMeta.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sourceBadgeText,
                    { color: sourceMeta.text },
                  ]}
                  numberOfLines={1}
                >
                  {sourceMeta.shortLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject & Description Snippet */}
        <View style={styles.subjectContainer}>
          <Text style={styles.subject} numberOfLines={2}>
            {cleanSubject}
          </Text>
        </View>

        {/* Date Metadata & Bottom Action Row */}
        <View style={styles.actionRow}>
          <View style={styles.datesContainer}>
            <Text style={styles.dateText}>
              Submitted {formatDate(ticket.created_at)}
            </Text>
            {isUpdated ? (
              <Text style={styles.updatedDateText}>
                • Updated {formatDate(ticket.updated_at)}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              View Details →
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
    overflow: 'hidden',
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  nameColumn: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reporter: {
    ...Typography.sectionHeader,
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F2C59',
    flex: 1,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
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
    color: '#64748B',
    fontWeight: '500',
  },
  updatedDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
    maxWidth: 135,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338CA',
  },
  sourceBadge: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  subjectContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#EDF2F7',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  datesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    backgroundColor: '#0F2C59',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default TicketCard;

