import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, FontFamilies } from '../../../core';
import {
  CalendarDurationIcon,
  GreenCheckIcon,
} from './MembershipIcons';

export interface MembershipPostCardProps {
  id: string;
  postName: string;
  qualification: string;
  fee: string;
  validity: string;
  durationLabel?: string;
  checklistItems: string[];
  kitItems: string[];
  icon: React.ReactNode;
  iconBgColor?: string;
  buttonVariant?: 'navy' | 'green';
  onApply: () => void;
}

export const MembershipPostCard: React.FC<MembershipPostCardProps> = ({
  id,
  postName,
  qualification,
  fee,
  validity,
  durationLabel,
  checklistItems,
  kitItems,
  icon,
  iconBgColor = '#EFF6FF',
  buttonVariant = 'navy',
  onApply,
}) => {
  const isGreenBtn = buttonVariant === 'green';
  const durationText = durationLabel || validity;

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topHeaderRow}>
        <View style={styles.topLeftGroup}>
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            {icon}
          </View>
          <View style={styles.postTitleWrapper}>
            <Text style={styles.postNameText}>{postName}</Text>
            <Text style={styles.qualificationText}>{qualification}</Text>
          </View>
        </View>

        <View style={styles.priceGroup}>
          <Text style={styles.feeText}>{fee}</Text>
          <Text style={styles.validityText}>{validity}</Text>
        </View>
      </View>

      {/* Main Details Body (Two Columns) */}
      <View style={styles.detailsBodyRow}>
        {/* Left Column: Checklist & Duration */}
        <View style={styles.leftColumn}>
          <View style={styles.checklistContainer}>
            {checklistItems.map((item, idx) => (
              <View key={idx} style={styles.checklistItemRow}>
                <View style={styles.checkIconWrapper}>
                  <GreenCheckIcon size={13} color="#059669" />
                </View>
                <Text style={styles.checklistItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Membership Duration Info */}
          <View style={styles.durationRow}>
            <View style={styles.calendarIconWrapper}>
              <CalendarDurationIcon size={14} color="#1E40AF" />
            </View>
            <View style={styles.durationTextWrapper}>
              <Text style={styles.durationLabelText}>Membership Duration</Text>
              <Text style={styles.durationValueText}>{durationText}</Text>
            </View>
          </View>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Right Column: Membership Kit & Apply Button */}
        <View style={styles.rightColumn}>
          <View style={styles.kitHeaderRow}>
            <CalendarDurationIcon size={13} color="#1E40AF" />
            <Text style={styles.kitHeaderText}>Membership Kit</Text>
          </View>

          <View style={styles.kitListContainer}>
            {kitItems.map((item, idx) => (
              <Text key={idx} style={styles.kitItemText} numberOfLines={2}>
                {item}
              </Text>
            ))}
          </View>

          {/* Apply Now Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onApply}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Apply Now for ${postName}`}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 12,
    marginHorizontal: Spacing.sm,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  postTitleWrapper: {
    flex: 1,
  },
  postNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 17,
  },
  qualificationText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
  priceGroup: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  feeText: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.2,
  },
  validityText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
    fontWeight: '500',
  },
  detailsBodyRow: {
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1.1,
    paddingRight: 8,
    justifyContent: 'space-between',
  },
  checklistContainer: {
    gap: 5,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  checkIconWrapper: {
    marginTop: 2,
  },
  checklistItemText: {
    fontSize: 10.5,
    color: '#34516D',
    lineHeight: 14.5,
    flex: 1,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  calendarIconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationTextWrapper: {
    flex: 1,
  },
  durationLabelText: {
    fontSize: 9.5,
    color: '#718096',
    fontWeight: '500',
  },
  durationValueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0B2F52',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#DBE5EE',
    marginHorizontal: 4,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'space-between',
  },
  kitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  kitHeaderText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0B2F52',
  },
  kitListContainer: {
    gap: 3,
    marginBottom: 8,
  },
  kitItemText: {
    fontSize: 10,
    color: '#718096',
    lineHeight: 13.5,
  },
  applyButton: {
    backgroundColor: '#EAA224',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  applyButtonNavy: {
    backgroundColor: '#EAA224',
  },
  applyButtonGreen: {
    backgroundColor: '#EAA224',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
});
