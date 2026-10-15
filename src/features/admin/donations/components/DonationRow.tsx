import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  AppAvatar,
  AppBadge,
  formatDateTime,
} from '../../../../core';
import { Donation, DonationRowModel } from '../types/donations.types';
import { DonationAmount } from './DonationAmount';
import { DonationActions } from './DonationActions';
import {
  DonationStatusBadge,
  donationStatusPresentation,
} from './DonationStatusBadge';

import { inferDonationType } from '../hooks/useDonations';

/**
 * Maps a backend donation entity to the row view-model.
 */
export const toDonationRowModel = (donation: Donation): DonationRowModel => {
  const presentation = donationStatusPresentation(donation.status);
  const [dateText, timeText] = formatDateTime(donation.created_at).split(', ');

  return {
    id: donation.id,
    donorName: donation.donor_name,
    memberCode: null,
    phone: donation.donor_mobile,
    donationTitle: donation.cause,
    donationDescription: donation.remark,
    amount: donation.amount,
    dateText,
    timeText: timeText ?? null,
    statusLabel: presentation.label,
    statusTone: presentation.tone,
    hasReceipt: true,
    donationType: inferDonationType(donation),
    rawStatus: donation.status,
    rawDonation: donation,
  };
};

/** Compact table column metrics for wide (>=420dp) viewports. */
export const TABLE_COL = {
  amount: 46,
  date: 50,
  status: 54,
  receipt: 34,
  dots: 8,
  gutter: 2,
};

interface DonationRowProps {
  row: DonationRowModel;
  /** 'card' = stacked mobile card, 'table' = compact single-line row. */
  variant?: 'card' | 'table';
  onViewDetails?: (row: DonationRowModel) => void;
  onViewReceipt?: (row: DonationRowModel) => void;
  onRefund?: (row: DonationRowModel) => void;
}

/**
 * Donation row — mobile adaptation of the approved reference.
 * Hierarchy: Donor → Amount → Donation details → Date/Time → Status.
 */
export const DonationRow: React.FC<DonationRowProps> = ({
  row,
  variant = 'card',
  onViewDetails,
  onViewReceipt,
  onRefund,
}) => {
  const receiptButton = (
    <TouchableOpacity
      style={variant === 'table' ? styles.receiptButtonSm : styles.receiptButton}
      onPress={() => onViewReceipt?.(row)}
      accessibilityRole="button"
      accessibilityLabel="View receipt"
    >
      <Text style={variant === 'table' ? styles.receiptIconSm : styles.receiptIcon}>
        📄
      </Text>
      <Text
        style={variant === 'table' ? styles.receiptLabelSm : styles.receiptLabel}
      >
        View
      </Text>
    </TouchableOpacity>
  );

  const isCompleted =
    row.rawStatus === 'SUCCESS' || row.statusLabel === 'Completed';

  const menuActions = [
    {
      label: 'View Details',
      onPress: () => onViewDetails?.(row),
    },
    {
      label: 'View Receipt',
      onPress: () => onViewReceipt?.(row),
    },
  ];

  if (isCompleted && onRefund) {
    menuActions.push({
      label: 'Refund Donation',
      onPress: () => onRefund(row),
    });
  }

  const actionMenu = <DonationActions actions={menuActions} />;

  if (variant === 'table') {
    return (
      <View style={styles.tableRow}>
        <View style={styles.tDonor}>
          <AppAvatar name={row.donorName} size={24} />
          <View style={styles.tDonorText}>
            <Text style={styles.tName} numberOfLines={1}>
              {row.donorName}
            </Text>
            {row.memberCode ? (
              <Text style={styles.tMeta} numberOfLines={1}>
                {row.memberCode}
              </Text>
            ) : null}
            {row.phone ? (
              <Text style={styles.tMeta} numberOfLines={1}>
                {row.phone}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.tDetails}>
          <Text style={styles.tTitle} numberOfLines={1}>
            {row.donationTitle}
          </Text>
          {row.donationDescription ? (
            <Text style={styles.tDesc} numberOfLines={2}>
              {row.donationDescription}
            </Text>
          ) : null}
        </View>

        <View style={styles.tAmountCol}>
          <DonationAmount amount={row.amount} style={styles.tAmount} />
        </View>

        <View style={styles.tDateCol}>
          <Text style={styles.tMeta} numberOfLines={1}>
            {row.dateText}
          </Text>
          {row.timeText ? (
            <Text style={styles.tMeta} numberOfLines={1}>
              {row.timeText}
            </Text>
          ) : null}
        </View>

        <View style={styles.tStatusCol}>
          <DonationStatusBadge label={row.statusLabel} tone={row.statusTone} small />
        </View>

        <View style={styles.tReceiptCol}>
          {receiptButton}
        </View>

        <View style={styles.tDotsCol}>
          {actionMenu}
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.topRow}>
        <AppAvatar name={row.donorName} size={46} />
        <View style={styles.donorColumn}>
          <Text style={styles.donorName} numberOfLines={1}>
            {row.donorName}
          </Text>
          {row.memberCode ? (
            <Text style={styles.memberCode} numberOfLines={1}>
              {row.memberCode}
            </Text>
          ) : null}
          {row.phone ? (
            <Text style={styles.secondaryText} numberOfLines={1}>
              {row.phone}
            </Text>
          ) : null}
        </View>
        <DonationAmount amount={row.amount} style={styles.amount} />
      </View>

      <View style={styles.middleRow}>
        <View style={styles.causeColumn}>
          <Text style={styles.causeTitle} numberOfLines={1}>
            {row.donationTitle}
          </Text>
          {row.donationDescription ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {row.donationDescription}
            </Text>
          ) : null}
        </View>
        <View style={styles.dateColumn}>
          <Text style={styles.secondaryText}>{row.dateText}</Text>
          {row.timeText ? (
            <Text style={styles.secondaryText}>{row.timeText}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.bottomRow}>
        <AppBadge
          label={row.statusLabel}
          status={row.statusTone}
          style={styles.statusBadge}
          textStyle={styles.statusText}
        />
        <View style={styles.actionsSpacer} />
        {receiptButton}
        {actionMenu}
      </View>
    </View>
  );
};

/** Column header row for the table variant (wide viewports). */
export const DonationTableHeader: React.FC = () => {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.thCell, styles.thDonor]}>Donor</Text>
      <Text style={[styles.thCell, styles.thDetails]}>Donation Details</Text>
      <Text style={[styles.thCell, styles.thRight, styles.thAmount]}>Amount</Text>
      <Text style={[styles.thCell, styles.thRight, styles.thDate]}>
        Date &amp; Time
      </Text>
      <Text style={[styles.thCell, styles.thStatus]}>Status</Text>
      <Text style={[styles.thCell, styles.thReceipt]}>Receipt</Text>
      <View style={styles.thDots} />
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorColumn: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  donorName: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
  },
  memberCode: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
  },
  secondaryText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  descriptionText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  amount: {
    marginLeft: 'auto',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: Spacing.md,
  },
  causeColumn: {
    flex: 1,
    marginRight: Spacing.md,
  },
  causeTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  dateColumn: {
    alignItems: 'flex-end',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  statusBadge: {
    paddingVertical: 5,
  },
  statusText: {
    textTransform: 'none',
    fontSize: 12,
  },
  actionsSpacer: {
    flex: 1,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.primaryLight,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: 6,
    marginRight: Spacing.sm,
  },
  receiptIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  receiptLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tDonor: {
    flex: 1.05,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: TABLE_COL.gutter,
  },
  tDonorText: {
    flex: 1,
    marginLeft: 4,
  },
  tName: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  tMeta: {
    fontSize: 8.5,
    lineHeight: 11,
    color: AdminColors.textMuted,
  },
  tDetails: {
    flex: 1,
    marginRight: TABLE_COL.gutter,
  },
  tTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  tDesc: {
    fontSize: 8.5,
    lineHeight: 11,
    color: AdminColors.textSecondary,
  },
  tCell: {
    marginRight: TABLE_COL.gutter,
    justifyContent: 'center',
  },
  tCellRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: TABLE_COL.gutter,
  },
  tAmount: {
    fontSize: 10,
  },
  tAmountCol: {
    width: TABLE_COL.amount,
    marginRight: TABLE_COL.gutter,
    justifyContent: 'center',
  },
  tDateCol: {
    width: TABLE_COL.date,
    marginRight: TABLE_COL.gutter,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tStatusCol: {
    width: TABLE_COL.status,
    marginRight: TABLE_COL.gutter,
    justifyContent: 'center',
  },
  tReceiptCol: {
    width: TABLE_COL.receipt,
    marginRight: TABLE_COL.gutter,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tDotsCol: {
    width: TABLE_COL.dots,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.divider,
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginTop: Spacing.sm,
  },
  thCell: {
    fontSize: 8.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginRight: TABLE_COL.gutter,
  },
  thRight: {
    textAlign: 'right',
  },
  thDonor: {
    flex: 1.05,
  },
  thDetails: {
    flex: 1,
  },
  thAmount: {
    width: TABLE_COL.amount,
  },
  thDate: {
    width: TABLE_COL.date,
  },
  thStatus: {
    width: TABLE_COL.status,
  },
  thReceipt: {
    width: TABLE_COL.receipt,
  },
  thDots: {
    width: TABLE_COL.dots,
  },
  receiptButtonSm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  receiptIconSm: {
    fontSize: 7.5,
    marginRight: 2,
  },
  receiptLabelSm: {
    fontSize: 8,
    fontWeight: '600',
    color: AdminColors.primary,
  },
});