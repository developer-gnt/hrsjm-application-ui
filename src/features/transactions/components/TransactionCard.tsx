import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  IdCard,
  Heart,
  Calendar,
  Receipt,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
} from '../../../core/components/icons';
import {
  UserTransactionItem,
  formatOutgoingAmount,
} from '../types/transactions.types';

export interface TransactionCardProps {
  transaction: UserTransactionItem;
  onPress: (transaction: UserTransactionItem) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  // Format Date and Time
  const d = new Date(transaction.payment_date || transaction.created_at);
  const formattedDate = !isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';
  const formattedTime = !isNaN(d.getTime())
    ? d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  // Category Icon & Color
  const renderCategoryIcon = () => {
    switch (transaction.category) {
      case 'Membership':
        return (
          <View style={[styles.iconContainer, styles.iconMembership]}>
            <IdCard size={20} color="#06294D" />
          </View>
        );
      case 'Donation':
        return (
          <View style={[styles.iconContainer, styles.iconDonation]}>
            <Heart size={20} color="#C9971A" />
          </View>
        );
      case 'Events':
        return (
          <View style={[styles.iconContainer, styles.iconEvents]}>
            <Calendar size={20} color="#123F68" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, styles.iconOther]}>
            <Receipt size={20} color="#34516D" />
          </View>
        );
    }
  };

  // Status Badge
  const renderStatusBadge = () => {
    switch (transaction.status) {
      case 'Success':
        return (
          <View style={[styles.statusBadge, styles.statusSuccess]}>
            <CheckCircle2 size={11} color="#15803D" />
            <Text style={[styles.statusText, styles.statusSuccessText]}>Success</Text>
          </View>
        );
      case 'Pending':
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Clock size={11} color="#B45309" />
            <Text style={[styles.statusText, styles.statusPendingText]}>Pending</Text>
          </View>
        );
      case 'Failed':
        return (
          <View style={[styles.statusBadge, styles.statusFailed]}>
            <AlertCircle size={11} color="#B91C1C" />
            <Text style={[styles.statusText, styles.statusFailedText]}>Failed</Text>
          </View>
        );
      case 'Refunded':
        return (
          <View style={[styles.statusBadge, styles.statusRefunded]}>
            <RotateCcw size={11} color="#4338CA" />
            <Text style={[styles.statusText, styles.statusRefundedText]}>Refunded</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.transaction_id}, ${transaction.title}`}
    >
      <View style={styles.cardHeaderRow}>
        {renderCategoryIcon()}

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {transaction.title}
            </Text>
            {/* Outgoing Payment: Always Negative Sign Rule */}
            <Text style={styles.amountNegative}>
              {formatOutgoingAmount(transaction.amount)}
            </Text>
          </View>

          <View style={styles.subtitleRow}>
            <Text style={styles.dateText}>
              {formattedDate}{formattedTime ? ` • ${formattedTime}` : ''}
            </Text>
            {renderStatusBadge()}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel} numberOfLines={1}>
              {transaction.payment_method} • ID: {transaction.transaction_id}
            </Text>
            <View style={styles.chevronWrapper}>
              <ChevronRight size={16} color="#718096" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconMembership: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#E9B82E',
  },
  iconDonation: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FAD465',
  },
  iconEvents: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  iconOther: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2F52',
    marginRight: 8,
  },
  /** CRITICAL: Negative amount deduction styling */
  amountNegative: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: -0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#718096',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 11.5,
    color: '#64748B',
    marginRight: 8,
  },
  chevronWrapper: {
    paddingLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3.5,
  },
  statusText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusSuccessText: {
    color: '#15803D',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    color: '#B45309',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusFailedText: {
    color: '#B91C1C',
  },
  statusRefunded: {
    backgroundColor: '#E0E7FF',
  },
  statusRefundedText: {
    color: '#4338CA',
  },
});

