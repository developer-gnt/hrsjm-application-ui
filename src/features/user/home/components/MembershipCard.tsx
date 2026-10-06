import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';
import type { MembershipPreview } from '../types/home.types';

interface MembershipCardProps {
  membership: MembershipPreview;
  onViewCard?: () => void;
}

/**
 * Reference-locked navy membership card: official HRSJM logo lockup, member
 * name, member ID, validity, QR block, "HRSJM MEMBERSHIP CARD" label and the
 * "View Membership Card →" action. The QR block is a decorative vector
 * placeholder until the backend issues real member QR codes.
 */
export const MembershipCard: React.FC<MembershipCardProps> = ({
  membership,
  onViewCard,
}) => (
  <View style={styles.card}>
    <View style={styles.splash} />

    <View style={styles.topRow}>
      {/* Official lockup on a white plate so it stays legible on navy. */}
      <HrsjmLogoMark height={40} variant="onDark" />
      <View style={styles.qrBlock}>
        <AppIcon name="qr" size={50} color={AdminColors.primaryDark} />
      </View>
    </View>

    <View style={styles.details}>
      <Text style={styles.memberName} numberOfLines={1}>
        {membership.memberName}
      </Text>
      <Text style={styles.detailLine} numberOfLines={1}>
        Member ID: {membership.memberId}
      </Text>
      <Text style={styles.detailLine} numberOfLines={1}>
        Valid Till: {membership.validTill}
      </Text>
    </View>

    <View style={styles.bottomRow}>
      <Text style={styles.cardLabel}>HRSJM MEMBERSHIP CARD</Text>
      <TouchableOpacity
        style={styles.viewCard}
        onPress={onViewCard}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="View membership card"
      >
        <Text style={styles.viewCardText}>View Membership Card</Text>
        <AppIcon name="arrow-right" size={13} color={AdminColors.textOnDark} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.primaryDark,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.base,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  splash: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 9999,
    backgroundColor: AdminColors.accentGold,
    opacity: 0.12,
    top: -60,
    right: -40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  details: {
    marginTop: Spacing.md,
  },
  memberName: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '600',
    color: AdminColors.textOnDark,
  },
  detailLine: {
    fontSize: 11,
    lineHeight: 15,
    color: AdminColors.textOnDark,
    opacity: 0.78,
    marginTop: 4,
  },
  qrBlock: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  cardLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: AdminColors.accentGold,
    flexShrink: 1,
  },
  viewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  viewCardText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
    color: AdminColors.textOnDark,
    marginRight: 5,
  },
});
