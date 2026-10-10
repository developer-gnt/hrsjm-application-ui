import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { BrandColors } from '../../../../core/theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { formatCurrency } from '../../../../core/utils/format';
import {
  Calendar,
  EllipsisVertical,
  Heart,
  MapPin,
  Phone,
} from '../../../../core/components/icons';
import type { AssistanceRequest } from '../types/assistance.types';

interface SeekerRowCardProps {
  request: AssistanceRequest;
  onPress: () => void;
  onReviewPress: () => void;
  onMenuPress?: () => void;
}

export const SeekerRowCard: React.FC<SeekerRowCardProps> = ({
  request,
  onPress,
  onReviewPress,
  onMenuPress,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const isReviewable =
    request.status === 'PENDING' || request.status === 'UNDER_REVIEW';

  const raised = Number(request.raised_amount) || 0;
  const requested = Number(request.requested_amount) || 1;
  const raisedPct = requested > 0 ? Math.min(100, Math.max(0, Math.round((raised / requested) * 100))) : 0;

  const displayId = `DS${request.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  const getStatusBadge = () => {
    switch (request.status) {
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Approved' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' };
      case 'CLOSED':
        return { bg: '#F1F5F9', text: '#475569', label: 'Closed' };
      case 'UNDER_REVIEW':
      case 'PENDING':
      default:
        return { bg: '#FEF3C7', text: '#B45309', label: 'Under Review' };
    }
  };

  const statusInfo = getStatusBadge();

  // WIDE / TABLET LAYOUT (>= 768px)
  if (isWide) {
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, styles.cardWide]}
          onPress={onPress}
          activeOpacity={0.88}
        >
          {/* Seeker Info */}
          <View style={styles.wideSeekerCol}>
            <AppAvatar name={request.full_name} size={42} />
            <View style={styles.wideInfoText}>
              <Text style={styles.seekerName} numberOfLines={1}>
                {request.full_name}
              </Text>
              <Text style={styles.seekerId}>{displayId}</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                📱 {request.mobile} {request.city ? `· 📍 ${request.city}` : ''}
              </Text>
            </View>
          </View>

          {/* Cause & Description */}
          <View style={styles.wideCauseCol}>
            <Text style={styles.causeBadgeText} numberOfLines={1}>
              {request.reason}
            </Text>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {request.description || 'Assistance requested for urgent needs.'}
            </Text>
          </View>

          {/* Amount */}
          <View style={styles.wideAmountCol}>
            <Text style={styles.amountValue}>
              {formatCurrency(request.requested_amount)}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${raisedPct}%` },
                ]}
              />
            </View>
            <Text style={styles.raisedSubText}>
              {formatCurrency(raised)} collected ({raisedPct}%)
            </Text>
          </View>

          {/* Status & Action */}
          <View style={styles.wideStatusCol}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bg },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isReviewable ? styles.reviewBtn : styles.viewBtn,
              ]}
              onPress={onReviewPress}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  isReviewable ? styles.reviewBtnText : styles.viewBtnText,
                ]}
              >
                {isReviewable ? 'Review' : 'View'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={onMenuPress || onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <EllipsisVertical size={18} color="#64748B" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  }

  // PHONE / RESPONSIVE ADAPTIVE CARD (< 768px)
  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={`View assistance request for ${request.full_name}`}
      >
        {/* TOP ROW: Avatar + Seeker Name/ID + Status Badge + Menu */}
        <View style={styles.topRow}>
          <AppAvatar name={request.full_name} size={44} />

          <View style={styles.topInfo}>
            <Text style={styles.seekerName} numberOfLines={1}>
              {request.full_name}
            </Text>
            <View style={styles.idBadgeRow}>
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>{displayId}</Text>
              </View>
              {request.city ? (
                <Text style={styles.cityText} numberOfLines={1}>
                  📍 {request.city}
                </Text>
              ) : (
                <Text style={styles.cityText} numberOfLines={1}>
                  📱 {request.mobile}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statusAndMenu}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bg },
              ]}
            >
              <Text
                style={[styles.statusBadgeText, { color: statusInfo.text }]}
                numberOfLines={1}
              >
                {statusInfo.label}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={onMenuPress || onPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EllipsisVertical size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MIDDLE ROW: Cause & Description Box */}
        <View style={styles.causeBox}>
          <View style={styles.causeHeader}>
            <View style={styles.causeTag}>
              <Text style={styles.causeTagText}>{request.reason}</Text>
            </View>
          </View>
          {request.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {request.description}
            </Text>
          ) : null}
        </View>

        {/* BOTTOM ROW: Financials + Action Button */}
        <View style={styles.bottomRow}>
          <View style={styles.financialSection}>
            <Text style={styles.amountLabel}>REQUESTED AMOUNT</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(request.requested_amount)}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${raisedPct}%` },
                ]}
              />
            </View>
            <Text style={styles.raisedSubText}>
              {formatCurrency(raised)} collected ({raisedPct}%) · Target: {formatCurrency(request.requested_amount)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isReviewable ? styles.reviewBtn : styles.viewBtn,
            ]}
            onPress={onReviewPress}
            activeOpacity={0.82}
          >
            <Text
              style={[
                styles.actionBtnText,
                isReviewable ? styles.reviewBtnText : styles.viewBtnText,
              ]}
            >
              {isReviewable ? 'Review →' : 'View →'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  topInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  seekerName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.2,
  },
  idBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  idChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  idChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  cityText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 1,
  },
  statusAndMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  menuBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  causeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 12,
  },
  causeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  causeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  causeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  descriptionText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16.5,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  financialSection: {
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
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  raisedSubText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 3,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 95,
  },
  reviewBtn: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  viewBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewBtnText: {
    color: '#FFFFFF',
  },
  viewBtnText: {
    color: '#1D4ED8',
  },
  // Wide styles
  wideSeekerCol: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wideInfoText: {
    flex: 1,
  },
  seekerId: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  wideCauseCol: {
    flex: 2.2,
  },
  causeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  wideAmountCol: {
    flex: 1.8,
  },
  wideStatusCol: {
    width: 105,
    alignItems: 'center',
    gap: 6,
  },
});

export default SeekerRowCard;
