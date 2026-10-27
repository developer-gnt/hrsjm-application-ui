import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing, FontFamilies } from '../../../core';
import { RenewalQuotePayload } from '../../payments/types/payment.types';

interface MembershipArrearsCardProps {
  quote: RenewalQuotePayload;
}

export const MembershipArrearsCard: React.FC<MembershipArrearsCardProps> = ({ quote }) => {
  if (!quote || !quote.is_overdue || !quote.periods || quote.periods.length === 0) {
    return null;
  }

  return (
    <View style={styles.cardContainer} accessibilityRole="region" accessibilityLabel="Membership Arrears Breakdown">
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerIconBox}>
          <Text style={styles.headerIcon}>⏱️</Text>
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Outstanding Renewal Arrears</Text>
          <Text style={styles.headerSubtitle}>
            {quote.unpaid_periods_count} unpaid annual renewal period{quote.unpaid_periods_count > 1 ? 's' : ''} detected
          </Text>
        </View>
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueBadgeText}>Overdue</Text>
        </View>
      </View>

      {/* Itemized Breakdown Table */}
      <View style={styles.breakdownTable}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderColLeft}>Renewal Sequence / Period</Text>
          <Text style={styles.tableHeaderColRight}>Annual Fee</Text>
        </View>

        {quote.periods.map((period, index) => (
          <View
            key={period.sequence}
            style={[
              styles.tableRow,
              index % 2 === 1 && styles.tableRowAlt,
              index === quote.periods.length - 1 && styles.tableRowLast,
            ]}
          >
            <View style={styles.periodCol}>
              <View style={styles.sequenceBadge}>
                <Text style={styles.sequenceBadgeText}>Yr {period.sequence}</Text>
              </View>
              <View style={styles.periodDatesCol}>
                <Text style={styles.periodLabelText}>{period.label}</Text>
                <Text style={styles.periodDatesText}>
                  {period.period_start} → {period.period_end}
                </Text>
              </View>
            </View>
            <Text style={styles.periodFeeText}>₹{period.fee.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>

      {/* Summary Totals */}
      <View style={styles.totalsBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Outstanding Renewal Fees</Text>
          <Text style={styles.summaryValue}>₹{quote.renewal_subtotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Platform Fee</Text>
          <Text style={styles.summaryValue}>₹{(quote.platform_fee || 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxes / Surcharges</Text>
          <Text style={styles.summaryValue}>₹{(quote.taxes || 0).toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLabel}>Total Amount Payable</Text>
          <Text style={styles.totalPayableValue}>₹{quote.total_payable.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Notice Explanation Banner */}
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeIcon}>ℹ️</Text>
        <Text style={styles.noticeText}>
          {quote.explanation ||
            `Previous unpaid renewal fees are included in this payment per NGO policy. Membership validity will be updated upon payment.`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 19,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  overdueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  breakdownTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F2860',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableHeaderColLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAD465',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableHeaderColRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAD465',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  periodCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sequenceBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  sequenceBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  periodDatesCol: {
    flex: 1,
  },
  periodLabelText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  periodDatesText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  periodFeeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    marginLeft: 8,
  },
  totalsBox: {
    marginTop: Spacing.sm,
    backgroundColor: '#FAF7F0',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  totalPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalPayableLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  totalPayableValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: Spacing.sm,
    gap: 8,
  },
  noticeIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
    fontWeight: '500',
  },
});
