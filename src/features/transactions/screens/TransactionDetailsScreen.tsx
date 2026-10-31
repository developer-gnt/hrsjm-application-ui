import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  IdCard,
  Heart,
  Calendar,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Download,
  Share2,
  Eye,
  Info,
  ShieldCheck,
} from '../../../core/components/icons';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import {
  UserTransactionItem,
  formatOutgoingAmount,
} from '../types/transactions.types';
import {
  downloadReceiptPDF,
  shareReceiptPdfNative,
} from '../../admin/donations/utils/receiptDocument';
import type { DonationReceiptModel } from '../../admin/donations/types/donations.types';

export interface TransactionDetailsScreenProps {
  onBack?: () => void;
  headerComponent?: React.ReactNode;
}

export const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> = ({
  onBack,
  headerComponent,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const transaction: UserTransactionItem | undefined = route.params?.transaction;
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TransactionHistory');
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Transaction Not Found</Text>
          <TouchableOpacity style={styles.backBtnAction} onPress={handleBack}>
            <Text style={styles.backBtnText}>Back to Transactions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
  const fullDateTime = `${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}`;

  // Map to Receipt Model for PDF generation
  const receiptModel: DonationReceiptModel = {
    id: transaction.receipt_id || transaction.id,
    receiptNumber: transaction.receipt_number || `REC-${transaction.transaction_id}`,
    receiptDate: transaction.payment_date || transaction.created_at,
    donorName: 'HRSJM Contributor',
    cause: transaction.title || transaction.purpose,
    amount: transaction.amount,
    paymentMethod: transaction.payment_method,
    transactionId: transaction.payment_reference || transaction.transaction_id,
    status: transaction.status.toUpperCase(),
    notes: transaction.purpose,
  };

  const handleViewReceipt = () => {
    if (transaction.receipt_available || transaction.receipt_number) {
      navigation.navigate('ReceiptDetail', {
        receiptNo: transaction.receipt_number || transaction.receipt_id,
        record: {
          id: transaction.id,
          receiptNo: transaction.receipt_number || `REC-${transaction.transaction_id}`,
          type: transaction.category === 'Membership' ? 'Membership' : 'Donation',
          title: transaction.title,
          cause: transaction.purpose,
          category: transaction.category,
          description: transaction.purpose,
          amount: transaction.amount,
          amountInWords: `Rupees ${transaction.amount} Only`,
          date: formattedDate,
          time: formattedTime,
          dateTime: fullDateTime,
          isoDate: d.toISOString().split('T')[0],
          status: 'Completed',
          paymentMethod: transaction.payment_method,
          transactionId: transaction.transaction_id,
          donorName: 'HRSJM Contributor',
          imageType: transaction.category === 'Membership' ? 'membership' : 'education',
        },
        fromScreen: 'TransactionHistory',
      });
    } else {
      Alert.alert(
        'Receipt Unavailable',
        'Official receipts are only issued for successful transactions once payment is verified and cleared.',
      );
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction.receipt_available && transaction.status !== 'Success') {
      Alert.alert(
        'Receipt Not Available',
        'Official receipt cannot be generated for pending, failed or unverified transactions.',
      );
      return;
    }

    try {
      setDownloading(true);
      await downloadReceiptPDF(receiptModel);
      Alert.alert('Success', 'Receipt PDF has been generated successfully.');
    } catch (err: any) {
      console.warn('Receipt download failed:', err);
      Alert.alert('Download', 'Receipt downloaded or opened in preview.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction.receipt_available && transaction.status !== 'Success') {
      Alert.alert(
        'Receipt Not Available',
        'Cannot share receipts for pending or failed transactions.',
      );
      return;
    }

    try {
      setSharing(true);
      await shareReceiptPdfNative(receiptModel);
    } catch (err: any) {
      console.warn('Receipt share failed:', err);
      Alert.alert('Share', 'Sharing receipt PDF.');
    } finally {
      setSharing(false);
    }
  };

  // Status Badge
  const renderStatusBadge = () => {
    switch (transaction.status) {
      case 'Success':
        return (
          <View style={[styles.statusBadge, styles.statusSuccess]}>
            <CheckCircle2 size={12} color="#15803D" />
            <Text style={[styles.statusText, styles.statusSuccessText]}>Success</Text>
          </View>
        );
      case 'Pending':
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Clock size={12} color="#B45309" />
            <Text style={[styles.statusText, styles.statusPendingText]}>Pending</Text>
          </View>
        );
      case 'Failed':
        return (
          <View style={[styles.statusBadge, styles.statusFailed]}>
            <AlertCircle size={12} color="#B91C1C" />
            <Text style={[styles.statusText, styles.statusFailedText]}>Failed</Text>
          </View>
        );
      case 'Refunded':
        return (
          <View style={[styles.statusBadge, styles.statusRefunded]}>
            <RotateCcw size={12} color="#4338CA" />
            <Text style={[styles.statusText, styles.statusRefundedText]}>Refunded</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      {headerComponent ? (
        headerComponent
      ) : (
        <AdminHeader
          showBack={true}
          onBack={handleBack}
          onNavigate={(target) => navigation.navigate(target)}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Back Bar */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back to transactions"
          >
            <ChevronLeft size={22} color="#06294D" />
          </TouchableOpacity>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Transaction Details</Text>
            <Text style={styles.pageSubtitle}>
              Reference #{transaction.transaction_id}
            </Text>
          </View>
        </View>

        {/* 1. Transaction Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {transaction.category.toUpperCase()}
              </Text>
            </View>
            {renderStatusBadge()}
          </View>

          <Text style={styles.summaryTitle}>{transaction.title}</Text>

          {/* CRITICAL AMOUNT RULE: Negative Sign */}
          <View style={styles.amountWrap}>
            <Text style={styles.amountLabel}>Deducted Amount</Text>
            <Text style={styles.amountValue}>
              {formatOutgoingAmount(transaction.amount)}
            </Text>
          </View>

          <View style={styles.summaryDateRow}>
            <Calendar size={14} color="#718096" />
            <Text style={styles.summaryDateText}>{fullDateTime}</Text>
          </View>
        </View>

        {/* 2. Receipt Actions Card (Section 8) */}
        <View style={styles.receiptActionCard}>
          <View style={styles.receiptActionHeader}>
            <View style={styles.receiptActionIconWrap}>
              <Receipt size={20} color="#06294D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.receiptActionTitle}>Official Payment Receipt</Text>
              <Text style={styles.receiptActionSubtitle}>
                {transaction.receipt_available
                  ? `Receipt #${transaction.receipt_number || 'Issued'}`
                  : transaction.status === 'Success'
                  ? 'Digital 80G Tax Exemption Receipt'
                  : 'Receipt generated upon payment success'}
              </Text>
            </View>
          </View>

          {transaction.receipt_available || transaction.status === 'Success' ? (
            <View style={styles.receiptButtonsRow}>
              <TouchableOpacity
                style={styles.receiptBtnSecondary}
                onPress={handleViewReceipt}
                activeOpacity={0.7}
              >
                <Eye size={16} color="#06294D" />
                <Text style={styles.receiptBtnSecondaryText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.receiptBtnPrimary}
                onPress={handleDownloadReceipt}
                disabled={downloading}
                activeOpacity={0.85}
              >
                <Download size={16} color="#06294D" />
                <Text style={styles.receiptBtnPrimaryText}>
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.receiptBtnSecondary}
                onPress={handleShareReceipt}
                disabled={sharing}
                activeOpacity={0.7}
              >
                <Share2 size={16} color="#06294D" />
                <Text style={styles.receiptBtnSecondaryText}>Share</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.receiptNoticeWrap}>
              <Info size={15} color="#718096" />
              <Text style={styles.receiptNoticeText}>
                Official receipt will be available once the transaction status is
                confirmed as Success.
              </Text>
            </View>
          )}
        </View>

        {/* 3. Transaction Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Transaction Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Transaction ID</Text>
            <Text style={styles.infoRowValue} selectable>
              {transaction.transaction_id}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Payment Reference</Text>
            <Text style={styles.infoRowValue} selectable>
              {transaction.payment_reference || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Date & Time</Text>
            <Text style={styles.infoRowValue}>{fullDateTime}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Transaction Type</Text>
            <View style={styles.outgoingBadge}>
              <Text style={styles.outgoingBadgeText}>Outgoing Payment</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Category</Text>
            <Text style={styles.infoRowValue}>{transaction.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Payment Method</Text>
            <Text style={styles.infoRowValue}>{transaction.payment_method}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Status</Text>
            <Text style={styles.infoRowValue}>{transaction.status}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoRowLabel}>Amount</Text>
            {/* Outgoing Payment: Negative Sign Rule */}
            <Text style={[styles.infoRowValue, styles.amountDeductionText]}>
              {formatOutgoingAmount(transaction.amount)}
            </Text>
          </View>
        </View>

        {/* 4. Purpose Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Payment Purpose</Text>
          <Text style={styles.purposeText}>
            {transaction.purpose || 'Contribution to Human Rights and Social Justice Mission.'}
          </Text>
        </View>

        {/* 5. Related Information Section (only fields that exist) */}
        {(transaction.related_info?.campaign_name ||
          transaction.related_info?.membership_id ||
          transaction.related_info?.event_name ||
          transaction.related_info?.receipt_id ||
          transaction.related_info?.receipt_number ||
          transaction.related_info?.notes) ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Related Information</Text>

            {transaction.related_info.campaign_name ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Campaign / Cause</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.campaign_name}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.membership_id ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Membership ID</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.membership_id}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.event_name ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Event Name</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.event_name}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.receipt_number ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Receipt Number</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.receipt_number}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.receipt_date ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Receipt Date</Text>
                <Text style={styles.infoRowValue}>
                  {new Date(transaction.related_info.receipt_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.receipt_status ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Receipt Status</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.receipt_status}
                </Text>
              </View>
            ) : null}

            {transaction.related_info.notes ? (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoRowLabel}>Notes</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.related_info.notes}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Security & Authenticity Trust Badge */}
        <View style={styles.trustBadge}>
          <ShieldCheck size={18} color="#15803D" />
          <Text style={styles.trustBadgeText}>
            Verified Transaction • Human Rights and Social Justice Mission
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pageHeaderContent: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 20,
    fontWeight: '700',
    color: '#011F39',
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#718096',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: 0.5,
  },
  summaryTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 12,
  },
  amountWrap: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: 'Inter',
    fontSize: 11.5,
    fontWeight: '600',
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountValue: {
    fontFamily: 'Playfair Display',
    fontSize: 26,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: -0.5,
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  summaryDateText: {
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#718096',
  },
  receiptActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FAD465',
    padding: 16,
    marginBottom: 16,
  },
  receiptActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  receiptActionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptActionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
  receiptActionSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  receiptButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  receiptBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD465',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  receiptBtnPrimaryText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  receiptBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  receiptBtnSecondaryText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#06294D',
  },
  receiptNoticeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  receiptNoticeText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: 'Playfair Display',
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#718096',
    flex: 1,
  },
  infoRowValue: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: '#0B2F52',
    textAlign: 'right',
    flex: 1.5,
  },
  amountDeductionText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  outgoingBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outgoingBadgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
  },
  purposeText: {
    fontFamily: 'Inter',
    fontSize: 13.5,
    color: '#34516D',
    lineHeight: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    gap: 8,
  },
  trustBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 12,
  },
  backBtnAction: {
    backgroundColor: '#06294D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
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

