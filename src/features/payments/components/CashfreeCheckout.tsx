import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PaymentPayload, PaymentReceiptDetails } from '../types/payment.types';
import { useCashfreePayment } from '../hooks/useCashfreePayment';
import { PaymentStatusCard } from './PaymentStatusCard';

export interface CashfreeCheckoutProps {
  payload: PaymentPayload;
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
  onClose?: () => void;
  onViewReceipt?: (receipt: PaymentReceiptDetails) => void;
}

export const CashfreeCheckout: React.FC<CashfreeCheckoutProps> = ({
  payload,
  onSuccess,
  onClose,
  onViewReceipt,
}) => {
  const {
    stage,
    receipt,
    errorMessage,
    reconcileAttempt,
    startCashfreePayment,
    resetPayment,
  } = useCashfreePayment({
    onSuccess,
    onClose,
  });

  const handlePayNow = () => {
    startCashfreePayment(payload);
  };

  if (stage !== 'amount_selection' && stage !== 'checkout') {
    return (
      <PaymentStatusCard
        stage={stage}
        receipt={receipt}
        errorMessage={errorMessage}
        reconcileAttempt={reconcileAttempt}
        onRetry={resetPayment}
        onViewReceipt={() => receipt && onViewReceipt?.(receipt)}
        onDone={onClose}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>SECURE CHECKOUT</Text>
        <Text style={styles.poweredBy}>Powered by Cashfree Payments 🛡️</Text>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Purpose:</Text>
          <Text style={styles.val} numberOfLines={1}>{payload.title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Donor / Member:</Text>
          <Text style={styles.val}>{payload.donorName || 'HRSJM Supporter'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Payable:</Text>
          <Text style={styles.totalVal}>₹{payload.amount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.payBtn}
        activeOpacity={0.88}
        onPress={handlePayNow}
      >
        <Text style={styles.payBtnText}>
          Proceed to Pay ₹{payload.amount.toLocaleString('en-IN')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.securityFooter}>
        UPI, NetBanking, Debit/Credit Cards, and Wallets supported.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 4,
  },
  poweredBy: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2860',
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
  },
  val: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    maxWidth: '60%',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },
  payBtn: {
    backgroundColor: '#0F2860',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  securityFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
  },
});
