import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { getDynamicRenewalPlan, RenewalPlanOption } from '../data/renewalPlansData';

interface RenewalPlanSectionProps {
  plan?: RenewalPlanOption;
  selectedPlanId?: string;
  onSelectPlan?: (plan: RenewalPlanOption) => void;
  sequenceNumber?: number;
}

export const RenewalPlanSection: React.FC<RenewalPlanSectionProps> = ({
  plan,
  selectedPlanId,
  onSelectPlan,
  sequenceNumber = 1,
}) => {
  const activePlan = plan || getDynamicRenewalPlan(sequenceNumber);

  return (
    <View style={styles.container}>
      {/* Header Row: Heading + Equal-fee Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.headingText}>Renewal Plan</Text>
        <View style={styles.equalFeeBadge}>
          <Text style={styles.equalFeeText}>Renewal fee is equal for all members</Text>
        </View>
      </View>

      {/* Plan Selection Cards - Displays Only the Single Applicable Plan */}
      <View style={styles.plansContainer}>
        <View
          style={[
            styles.planCard,
            styles.planCardSelected,
          ]}
          accessible={true}
          accessibilityLabel={`${activePlan.label}, ${activePlan.price}, ${activePlan.badge}`}
        >
          {/* Active Confirmed Checkmark (Replaces redundant multiple radio options) */}
          <View style={styles.activeCheckCircle}>
            <Text style={styles.activeCheckIcon}>✓</Text>
          </View>

          {/* Calendar Icon Badge */}
          <View style={[styles.calendarBadge, { borderColor: activePlan.themeColor }]}>
            {/* Top Binder Pins */}
            <View style={styles.binderPinsRow}>
              <View style={[styles.binderPin, { backgroundColor: activePlan.themeColor }]} />
              <View style={[styles.binderPin, { backgroundColor: activePlan.themeColor }]} />
            </View>
            {/* Calendar Header */}
            <View style={[styles.calendarHeader, { backgroundColor: activePlan.themeColor }]} />
            {/* Year Content */}
            <View style={styles.calendarBody}>
              <Text style={[styles.calendarYearText, { color: activePlan.themeColor }]}>
                {activePlan.yearNumber}
              </Text>
              <Text style={styles.calendarSubText}>YEAR</Text>
            </View>
          </View>

          {/* Middle Group: Title & Duration */}
          <View style={styles.planInfoGroup}>
            <Text style={styles.planTitleText}>{activePlan.label}</Text>
            <Text style={styles.planDurationText}>{activePlan.duration}</Text>
          </View>

          {/* Right Group: Price & Savings Badge */}
          <View style={styles.priceGroup}>
            <Text style={styles.priceText}>{activePlan.price}</Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>{activePlan.badge}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headingText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: -0.2,
  },
  equalFeeBadge: {
    backgroundColor: '#DC2626',
    borderRadius: BorderRadius.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  equalFeeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  plansContainer: {
    gap: 7,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  planCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  activeCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  activeCheckIcon: {
    color: '#FAD465',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: '#1E40AF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E40AF',
  },
  calendarBadge: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 10,
    alignItems: 'center',
  },
  binderPinsRow: {
    position: 'absolute',
    top: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 20,
    zIndex: 2,
  },
  binderPin: {
    width: 3,
    height: 4,
    borderRadius: 1,
  },
  calendarHeader: {
    width: '100%',
    height: 6,
  },
  calendarBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },
  calendarYearText: {
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  calendarSubText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 9,
  },
  planInfoGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  planTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 16,
  },
  planDurationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  priceGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 18,
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  savingsBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
});
