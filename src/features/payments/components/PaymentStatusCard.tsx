import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PaymentStage, PaymentReceiptDetails } from '../types/payment.types';

export interface PaymentStatusCardProps {
  stage: PaymentStage;
  receipt?: PaymentReceiptDetails | null;
  errorMessage?: string | null;
  reconcileAttempt?: number;
  onRetry?: () => void;
  onViewReceipt?: () => void;
  onDone?: () => void;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  stage,
  receipt,
  errorMessage,
  reconcileAttempt = 0,
  onRetry,
  onViewReceipt,
  onDone,
}) => {
  if (stage === 'processing') {
    return (
      <View style={styles.card}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
        </View>
        <Text style={styles.title}>Securing Payment Session</Text>
        <Text style={styles.subtitle}>
          Connecting to Cashfree Payment Gateway. Please do not close or refresh this screen.
        </Text>
        <View style={styles.securityTag}>
          <Text style={styles.securityTagText}>🔒 256-Bit SSL Encrypted Transaction</Text>
        </View>
      </View>
    );
  }

  if (stage === 'reconciling') {
    return (
      <View style={styles.card}>
        <View style={styles.reconcileIconBox}>
          <Text style={styles.reconcileIcon}>⏳</Text>
        </View>
        <Text style={styles.title}>Reconciling with Bank</Text>
        <Text style={styles.subtitle}>
          Your payment was submitted. We are confirming the transaction receipt with Cashfree & your bank...
        </Text>
        {reconcileAttempt > 0 && (
          <View style={styles.attemptBadge}>
            <Text style={styles.attemptText}>Verification sync (Attempt {reconcileAttempt}/5)</Text>
          </View>
        )}
        <ActivityIndicator size="small" color="#0F2860" style={{ marginTop: 14 }} />
      </View>
    );
  }

  if (stage === 'success' && receipt) {
    return (
      <View style={[styles.card, styles.successCard]}>
        <View style={styles.successIconBox}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Payment Verified & Received</Text>
        <Text style={styles.amountText}>₹{receipt.amount.toLocaleString('en-IN')}</Text>

        <View style={styles.receiptMetaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Receipt No:</Text>
            <Text style={styles.metaValue}>{receipt.receiptNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Order ID:</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{receipt.orderId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date & Time:</Text>
            <Text style={styles.metaValue}>{receipt.date}, {receipt.time}</Text>
          </View>
          {receipt.is80GEligible && (
            <View style={styles.taxBadgeRow}>
              <Text style={styles.taxBadgeText}>⭐ 80G Tax Exemption Certificate Generated</Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          {onViewReceipt && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={onViewReceipt} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>View Receipt</Text>
            </TouchableOpacity>
          )}
          {onDone && (
            <TouchableOpacity style={styles.primaryBtn} onPress={onDone} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (stage === 'failed') {
    return (
      <View style={[styles.card, styles.failedCard]}>
        <View style={styles.failedIconBox}>
          <Text style={styles.failedIcon}>✕</Text>
        </View>
        <Text style={styles.failedTitle}>Payment Incomplete or Declined</Text>
        <Text style={styles.subtitle}>
          {errorMessage || 'The payment could not be confirmed. If money was debited, it will be automatically reconciled.'}
        </Text>

        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  failedCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reconcileIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reconcileIcon: {
    fontSize: 28,
  },
  successIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  failedIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  failedIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 4,
  },
  failedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  amountText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F2860',
    marginVertical: 8,
  },
  securityTag: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  attemptBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  attemptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  receiptMetaBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    maxWidth: '65%',
  },
  taxBadgeRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  taxBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0F2860',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#0F2860',
    fontWeight: '600',
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#0F2860',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
