import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { formatCurrency } from '../../../../core/utils/format';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  EllipsisVertical,
  Heart,
  MapPin,
  Phone,
  TriangleAlert,
  Users,
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
  const raisedPct =
    requested > 0
      ? Math.min(100, Math.max(0, Math.round((raised / requested) * 100)))
      : 0;
  const remaining = Math.max(0, requested - raised);
  const donorCount = Number(request.donor_count) || 0;

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: raisedPct,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [raisedPct]);

  const displayId = `DS${request.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  // Category Theme
  const getCategoryMeta = () => {
    const text = `${(request.reason || '').toLowerCase()} ${(request.description || '').toLowerCase()}`;
    if (
      text.includes('med') ||
      text.includes('hosp') ||
      text.includes('surg') ||
      text.includes('health') ||
      text.includes('doctor')
    ) {
      return {
        icon: '🏥',
        name: 'Healthcare',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: '#1D4ED8',
      };
    }
    if (
      text.includes('edu') ||
      text.includes('school') ||
      text.includes('college') ||
      text.includes('fee') ||
      text.includes('student')
    ) {
      return {
        icon: '📚',
        name: 'Education',
        bg: '#EEF2FF',
        border: '#C7D2FE',
        text: '#4338CA',
      };
    }
    if (
      text.includes('food') ||
      text.includes('ration') ||
      text.includes('relief') ||
      text.includes('flood') ||
      text.includes('disaster')
    ) {
      return {
        icon: '🍲',
        name: 'Relief & Aid',
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#B45309',
      };
    }
    if (
      text.includes('wom') ||
      text.includes('girl') ||
      text.includes('mother') ||
      text.includes('widow')
    ) {
      return {
        icon: '👩‍👧',
        name: 'Women Welfare',
        bg: '#FDF2F8',
        border: '#FBCFE8',
        text: '#BE185D',
      };
    }
    return {
      icon: '🤝',
      name: 'Social Support',
      bg: '#F8FAFC',
      border: '#E2E8F0',
      text: '#334155',
    };
  };

  const catMeta = getCategoryMeta();

  // Status Meta
  const getStatusBadge = () => {
    switch (request.status) {
      case 'APPROVED':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
          dot: '#10B981',
          label: 'Approved',
        };
      case 'REJECTED':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#DC2626',
          dot: '#EF4444',
          label: 'Rejected',
        };
      case 'CLOSED':
        return {
          bg: '#F1F5F9',
          border: '#E2E8F0',
          text: '#475569',
          dot: '#64748B',
          label: 'Goal Met',
        };
      case 'UNDER_REVIEW':
      case 'PENDING':
      default:
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          dot: '#F59E0B',
          label: 'In Review',
        };
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
          activeOpacity={0.9}
        >
          {/* Seeker Info */}
          <View style={styles.wideSeekerCol}>
            <View style={styles.avatarWrap}>
              <AppAvatar name={request.full_name} size={46} />
            </View>
            <View style={styles.wideInfoText}>
              <Text style={styles.seekerName} numberOfLines={1}>
                {request.full_name}
              </Text>
              <View style={styles.idBadgeRow}>
                <View style={styles.idChip}>
                  <Text style={styles.idChipText}>{displayId}</Text>
                </View>
                {request.mobile ? (
                  <Text style={styles.metaSubText} numberOfLines={1}>
                    📱 {request.mobile}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Cause & Description */}
          <View style={styles.wideCauseCol}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: catMeta.bg, borderColor: catMeta.border },
              ]}
            >
              <Text style={styles.categoryPillIcon}>{catMeta.icon}</Text>
              <Text style={[styles.categoryPillText, { color: catMeta.text }]}>
                {request.reason || catMeta.name}
              </Text>
            </View>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {request.description || 'Assistance requested for urgent verified needs.'}
            </Text>
          </View>

          {/* Amount */}
          <View style={styles.wideAmountCol}>
            <View style={styles.amountHeaderRow}>
              <Text style={styles.amountValue}>
                {formatCurrency(request.requested_amount)}
              </Text>
              <View style={styles.pctBadge}>
                <Text style={styles.pctBadgeText}>{raisedPct}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: raisedPct >= 100 ? '#10B981' : '#2563EB',
                  },
                ]}
              />
            </View>
            <Text style={styles.raisedSubText}>
              {formatCurrency(raised)} raised · {formatCurrency(remaining)} left
            </Text>
          </View>

          {/* Status & Action */}
          <View style={styles.wideStatusCol}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusInfo.dot }]}
              />
              <Text
                style={[styles.statusBadgeText, { color: statusInfo.text }]}
              >
                {statusInfo.label}
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
                {isReviewable ? 'Review' : 'View →'}
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
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`View assistance request for ${request.full_name}`}
      >
        {/* TOP ROW: Avatar + Seeker Info + Status Badge + Menu */}
        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            <AppAvatar name={request.full_name} size={46} />
          </View>

          <View style={styles.topInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.seekerName} numberOfLines={1}>
                {request.full_name}
              </Text>
            </View>
            <View style={styles.idBadgeRow}>
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>{displayId}</Text>
              </View>
              {request.mobile ? (
                <View style={styles.metaChip}>
                  <Phone size={11} color="#64748B" />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    {request.mobile.slice(0, 5)}...
                  </Text>
                </View>
              ) : null}
              {request.city ? (
                <View style={styles.metaChip}>
                  <MapPin size={11} color="#64748B" />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    {request.city}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.statusAndMenu}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusInfo.dot }]}
              />
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

        {/* MIDDLE ROW: Cause Category Pill + Case Details */}
        <View style={styles.causeBox}>
          <View style={styles.causeTagRow}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: catMeta.bg, borderColor: catMeta.border },
              ]}
            >
              <Text style={styles.categoryPillIcon}>{catMeta.icon}</Text>
              <Text style={[styles.categoryPillText, { color: catMeta.text }]}>
                {request.reason || catMeta.name}
              </Text>
            </View>
            {donorCount > 0 ? (
              <View style={styles.donorPill}>
                <Users size={11} color="#059669" />
                <Text style={styles.donorPillText}>
                  {donorCount} {donorCount === 1 ? 'Donor' : 'Donors'}
                </Text>
              </View>
            ) : null}
          </View>
          {request.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {request.description}
            </Text>
          ) : null}
        </View>

        {/* BOTTOM ROW: Financials + Animated Progress + Action Button */}
        <View style={styles.financialContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricColLeft}>
              <Text style={styles.amountLabel}>REQUESTED AMOUNT</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(request.requested_amount)}
              </Text>
            </View>
            <View style={styles.metricColRight}>
              <Text style={styles.raisedAmountLabel}>RAISED SO FAR</Text>
              <View style={styles.raisedAmountValueRow}>
                <Text style={styles.raisedAmountValue}>
                  {formatCurrency(raised)}
                </Text>
                <View style={styles.pctBadge}>
                  <Text style={styles.pctBadgeText}>{raisedPct}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Animated Multi-Tone Progress Track */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: raisedPct >= 100 ? '#10B981' : '#2563EB',
                },
              ]}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.raisedSubText}>
              {raisedPct >= 100
                ? '🎉 100% Target Met'
                : `${formatCurrency(remaining)} needed to reach goal`}
            </Text>

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
                {isReviewable ? 'Review' : 'View'}
              </Text>
              <ArrowUpRight
                size={14}
                color={isReviewable ? '#FFFFFF' : '#1D4ED8'}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarWrap: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  topInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seekerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  idBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  idChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  metaChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statusAndMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  causeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 12,
  },
  causeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  categoryPillIcon: {
    fontSize: 12,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  donorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  donorPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  descriptionText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
  },
  financialContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  metricColLeft: {
    flex: 1,
  },
  metricColRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  amountValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  raisedAmountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  raisedAmountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  raisedAmountValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  pctBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pctBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  raisedSubText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8.5,
    borderRadius: 10,
  },
  reviewBtn: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnText: {
    fontSize: 12.5,
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
    flex: 2.4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wideInfoText: {
    flex: 1,
  },
  wideCauseCol: {
    flex: 2.2,
    gap: 6,
  },
  wideAmountCol: {
    flex: 2.2,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  wideStatusCol: {
    width: 115,
    alignItems: 'center',
    gap: 8,
  },
});

export default SeekerRowCard;
