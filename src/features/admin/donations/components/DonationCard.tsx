import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { AppCard, Spacing } from '../../../../core';
import { DonationRowModel } from '../types/donations.types';
import { DonationRow } from './DonationRow';

interface DonationCardProps {
  row: DonationRowModel;
  onViewDetails?: (row: DonationRowModel) => void;
  onViewReceipt?: (row: DonationRowModel) => void;
  onRefund?: (row: DonationRowModel) => void;
  style?: ViewStyle;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  row,
  onViewDetails,
  onViewReceipt,
  onRefund,
  style,
}) => {
  return (
    <AppCard padding="base" style={style ? { ...styles.card, ...style } : styles.card}>
      <DonationRow
        row={row}
        onViewDetails={onViewDetails}
        onViewReceipt={onViewReceipt}
        onRefund={onRefund}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
});