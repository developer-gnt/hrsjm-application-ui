import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { DisplayMembershipStatus } from '../hooks/useMembershipDetailsData';

interface MemberSummaryCardProps {
  membershipType: string;
  memberId: string;
  joinDate: string;
  validTill: string;
  status: DisplayMembershipStatus;
  onPress?: () => void;
}

export const MemberSummaryCard: React.FC<MemberSummaryCardProps> = ({
  membershipType,
  memberId,
  joinDate,
  validTill,
  status,
  onPress,
}) => {
  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'Active':
        return {
          container: styles.badgeActive,
          text: styles.badgeTextActive,
        };
      case 'Under Review':
        return {
          container: styles.badgeReview,
          text: styles.badgeTextReview,
        };
      case 'Rejected':
        return {
          container: styles.badgeRejected,
          text: styles.badgeTextRejected,
        };
      default:
        return {
          container: styles.badgeDefault,
          text: styles.badgeTextDefault,
        };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      accessibilityRole="region"
      accessibilityLabel={`Membership Summary for ${membershipType}, Status: ${status}`}
    >
      <View style={styles.cardContent}>
        {/* Left ID Badge Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.idCardOuter}>
            <View style={styles.idCardAvatar} />
            <View style={styles.idCardLines}>
              <View style={styles.idCardLineLong} />
              <View style={styles.idCardLineShort} />
            </View>
          </View>
        </View>

        {/* Middle Info Column */}
        <View style={styles.infoColumn}>
          {/* Top Row: Type + Status Badge */}
          <View style={styles.typeHeaderRow}>
            <Text style={styles.typeTitle} numberOfLines={1}>
              {membershipType}
            </Text>
            <View style={[styles.statusBadge, badgeStyle.container]}>
              <Text style={[styles.statusText, badgeStyle.text]}>{status}</Text>
            </View>
          </View>

          {/* Details Rows */}
          <View style={styles.detailsList}>
            <Text style={styles.detailText} numberOfLines={1}>
              <Text style={styles.detailLabel}>Member ID: </Text>
              <Text style={styles.detailValue}>{memberId}</Text>
            </Text>

            <Text style={styles.detailText} numberOfLines={1}>
              <Text style={styles.detailLabel}>Joined on: </Text>
              <Text style={styles.detailValue}>{joinDate}</Text>
            </Text>

            <Text style={styles.detailText} numberOfLines={1}>
              <Text style={styles.detailLabel}>Valid till: </Text>
              <Text style={styles.detailValue}>{validTill}</Text>
            </Text>
          </View>
        </View>

        {/* Right Chevron */}
        <View style={styles.chevronContainer}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginHorizontal: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E8ECF2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: -22,
    marginBottom: Spacing.md,
    zIndex: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF6E5',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  idCardOuter: {
    width: 25,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: '#0A204C',
    padding: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  idCardAvatar: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0A204C',
  },
  idCardLines: {
    flex: 1,
    marginLeft: 3,
    gap: 2,
  },
  idCardLineLong: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#0A204C',
    borderRadius: 0.75,
  },
  idCardLineShort: {
    width: '60%',
    height: 1.5,
    backgroundColor: '#0A204C',
    borderRadius: 0.75,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  typeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0A1E4A',
    flexShrink: 1,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  badgeActive: {
    backgroundColor: '#E6F8ED',
  },
  badgeTextActive: {
    color: '#16A34A',
  },
  badgeReview: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextReview: {
    color: '#B45309',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextRejected: {
    color: '#DC2626',
  },
  badgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  badgeTextDefault: {
    color: '#64748B',
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  detailsList: {
    gap: 2,
  },
  detailText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  detailLabel: {
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    color: '#334155',
    fontWeight: '600',
  },
  chevronContainer: {
    marginLeft: 6,
    paddingLeft: 2,
  },
  chevronText: {
    fontSize: 22,
    fontWeight: '400',
    color: '#94A3B8',
    lineHeight: 24,
  },
});
