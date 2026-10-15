import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AdminColors, Typography } from '../../../../core';

interface DonationSummaryProps {
  /** Total records reported by the backend pagination meta. */
  total?: number;
  /** Active status tab label, if any. */
  statusLabel?: string | null;
  /** Active search term, if any. */
  search?: string | null;
}

/** One-line summary of the current donation list result set. */
export const DonationSummary: React.FC<DonationSummaryProps> = ({
  total,
  statusLabel,
  search,
}) => {
  if (total === undefined) {
    return null;
  }

  const parts: string[] = [
    `${total} ${total === 1 ? 'donation' : 'donations'}`,
  ];
  if (statusLabel) {
    parts.push(statusLabel);
  }
  if (search) {
    parts.push(`"${search}"`);
  }

  return <Text style={styles.text}>{parts.join('  ·  ')}</Text>;
};

const styles = StyleSheet.create({
  text: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
  },
});