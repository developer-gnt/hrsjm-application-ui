import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppCard } from '../../../../core/components/common/AppCard';
import { AdminColors, BrandColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatDate, formatCurrency } from '../../../../core/utils/format';
import { shortRequestId } from '../types/assistance.types';
import type { AssistanceRequest } from '../types/assistance.types';
import { AssistanceStatusBadge } from './AssistanceStatusBadge';

interface AssistanceCardProps {
  request: AssistanceRequest;
  onPress: () => void;
}

function AssistanceCardBase({ request, onPress }: AssistanceCardProps) {
  const isReviewable = request.status === 'PENDING' || request.status === 'UNDER_REVIEW';
  const raisedPct =
    request.raised_amount !== undefined && request.requested_amount > 0
      ? Math.min(100, Math.round((request.raised_amount / request.requested_amount) * 100))
      : 0;

  return (
    <AppCard style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        {/* Top Header: Avatar, Name, Seeker ID & Status */}
        <View style={styles.topRow}>
          <AppAvatar name={request.full_name} size={42} />
          <View style={styles.nameColumn}>
            <Text style={styles.name} numberOfLines={1}>
              {request.full_name}
            </Text>
            <View style={styles.subInfoRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>
                  {shortRequestId(request.id)}
                </Text>
              </View>
              {request.city ? (
                <Text style={styles.locationText} numberOfLines={1}>
                  📍 {request.city}
                </Text>
              ) : null}
              {request.age !== undefined ? (
                <Text style={styles.ageText}>
                  👤 {request.age} yrs
                </Text>
              ) : null}
            </View>
          </View>
          <AssistanceStatusBadge status={request.status} />
        </View>

        {/* Reason / Cause Section */}
        <View style={styles.causeContainer}>
          <View style={styles.causeHeader}>
            <Text style={styles.causeTag}>CAUSE / REASON</Text>
            <Text style={styles.dateText}>
              {formatDate(request.created_at)}
            </Text>
          </View>
          <Text style={styles.reasonText} numberOfLines={1}>
            {request.reason}
          </Text>
          {request.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {request.description}
            </Text>
          ) : null}
        </View>

        {/* Financial & Progress Block */}
        <View style={styles.financialRow}>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>REQUESTED AMOUNT</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(request.requested_amount)}
            </Text>
          </View>
          {request.raised_amount !== undefined && request.raised_amount > 0 ? (
            <View style={styles.raisedBlock}>
              <Text style={styles.raisedLabel}>RAISED</Text>
              <Text style={styles.raisedValue}>
                {formatCurrency(request.raised_amount)} ({raisedPct}%)
              </Text>
            </View>
          ) : null}
        </View>

        {request.raised_amount !== undefined && request.raised_amount > 0 ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${raisedPct}%` }]} />
          </View>
        ) : null}

        {/* Bottom Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, isReviewable ? styles.reviewButton : styles.viewButton]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionButtonText, isReviewable ? styles.reviewButtonText : styles.viewButtonText]}>
              {isReviewable ? 'Review Application →' : 'View Full Details →'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AppCard>
  );
}

export const AssistanceCard = React.memo(AssistanceCardBase);

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
  name: {
    ...Typography.sectionHeader,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2C59',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  locationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  ageText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  causeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  causeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  causeTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 1,
  },
  raisedBlock: {
    alignItems: 'flex-end',
  },
  raisedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  raisedValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    marginTop: 1,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  actionRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButton: {
    backgroundColor: '#0F2C59',
  },
  viewButton: {
    backgroundColor: '#F1F5F9',
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reviewButtonText: {
    color: '#FFFFFF',
  },
  viewButtonText: {
    color: '#334155',
  },
});

export default AssistanceCard;

