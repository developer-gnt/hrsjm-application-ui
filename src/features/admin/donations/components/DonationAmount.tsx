import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { AdminColors, Typography, formatINR } from '../../../../core';

interface DonationAmountProps {
  amount: number;
  style?: TextStyle;
}

/** Prominent donation amount — always uses the shared INR formatter. */
export const DonationAmount: React.FC<DonationAmountProps> = ({ amount, style }) => {
  return (
    <Text style={[styles.amount, style]} numberOfLines={1}>
      {formatINR(amount, { noDecimals: true })}
    </Text>
  );
};

const styles = StyleSheet.create({
  amount: {
    ...Typography.metric,
    color: AdminColors.primaryDark,
  },
});