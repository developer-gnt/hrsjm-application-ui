import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CreditCard, CheckCircle2 } from '../../../core/components/icons';
import { UserTransactionsSummary } from '../types/transactions.types';

export interface TransactionSummaryCardsProps {
  summary: UserTransactionsSummary;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  summary,
}) => {
  const formattedTotalPaid = `₹${(summary.total_amount_paid || 0).toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      {/* Total Amount Paid Card */}
      <View style={[styles.card, styles.paidCard]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardLabel}>Total Amount Paid</Text>
          <View style={styles.iconCircle}>
            <CreditCard size={16} color="#06294D" />
          </View>
        </View>
        <Text style={styles.amountValue}>{formattedTotalPaid}</Text>
        <Text style={styles.cardSub}>Successful payments only</Text>
      </View>

      {/* Total Transactions Card */}
      <View style={[styles.card, styles.countCard]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardLabel}>Total Transactions</Text>
          <View style={[styles.iconCircle, styles.iconCircleGold]}>
            <CheckCircle2 size={16} color="#C9971A" />
          </View>
        </View>
        <Text style={styles.countValue}>{summary.total_transactions || 0}</Text>
        <Text style={styles.cardSub}>Completed payments</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  paidCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#06294D',
  },
  countCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E9B82E',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  iconCircleGold: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FAD465',
  },
  amountValue: {
    fontFamily: 'Playfair Display',
    fontSize: 20,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 2,
  },
  countValue: {
    fontFamily: 'Playfair Display',
    fontSize: 20,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#A0AEC0',
  },
});

