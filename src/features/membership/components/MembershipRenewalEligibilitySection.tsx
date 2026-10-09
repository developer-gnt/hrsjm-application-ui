import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import {
  BuildingStateIcon,
  CrownLionIcon,
  IndividualMemberIcon,
  LegalCouncilIcon,
  SolidCommunityIcon,
} from './MembershipIcons';
import {
  RENEWAL_ELIGIBILITY_ROWS,
  RenewalEligibilityRow,
} from '../data/renewalEligibilityData';

export const MembershipRenewalEligibilitySection: React.FC = () => {
  const renderRowIcon = (iconType: RenewalEligibilityRow['iconType'], color: string) => {
    switch (iconType) {
      case 'district':
        return <SolidCommunityIcon size={18} color={color} />;
      case 'state':
        return <BuildingStateIcon size={18} color={color} />;
      case 'lion':
        return <CrownLionIcon size={18} color={color} />;
      case 'director':
        return <IndividualMemberIcon size={18} color={color} />;
      case 'council':
      default:
        return <LegalCouncilIcon size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      <Text style={styles.sectionHeading}>Membership Renewal Eligibility</Text>

      {/* Responsive Table Card */}
      <View style={styles.tableCard}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerCell, styles.colJoin]}>IF YOU JOIN</Text>
          <Text style={[styles.headerCell, styles.colQual]}>
            QUALIFICATION{'\n'}REQUIRED
          </Text>
          <Text style={[styles.headerCellGreen, styles.colRenewal]}>
            FREE RENEWAL FOR{'\n'}THE PERIOD OF
          </Text>
        </View>

        {/* Table Rows */}
        {RENEWAL_ELIGIBILITY_ROWS.map((row, idx) => {
          const isLast = idx === RENEWAL_ELIGIBILITY_ROWS.length - 1;

          return (
            <View
              key={row.id}
              style={[styles.tableRow, isLast && styles.tableRowLast]}
            >
              {/* If You Join Column */}
              <View style={[styles.cellContentJoin, styles.colJoin]}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: row.iconBgColor, borderColor: row.iconColor },
                  ]}
                >
                  {renderRowIcon(row.iconType, row.iconColor)}
                </View>
                <Text style={styles.joinText}>{row.ifYouJoin}</Text>
              </View>

              {/* Qualification Column */}
              <View style={[styles.cellCenter, styles.colQual]}>
                <Text style={styles.qualificationText}>{row.qualification}</Text>
              </View>

              {/* Free Renewal Period Column */}
              <View style={[styles.cellCenter, styles.colRenewal]}>
                <Text style={styles.renewalPeriodText}>{row.freeRenewal}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.2,
  },
  headerCellGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  colJoin: {
    flex: 1.7,
  },
  colQual: {
    flex: 1.1,
    textAlign: 'center',
  },
  colRenewal: {
    flex: 1.2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  cellContentJoin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingRight: 4,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  joinText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 14,
    flex: 1,
  },
  cellCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualificationText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },
  renewalPeriodText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
    textAlign: 'center',
  },
});
