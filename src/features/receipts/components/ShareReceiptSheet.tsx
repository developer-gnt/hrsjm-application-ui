import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { recentDonationsStore } from '../../donations/services/recent-donations.store';
import { MOCK_DONATION_RECORDS } from '../../donations/data/donations.mock';
import { executeShareReceipt } from '../services/receiptActions.service';
import { Icon } from '../../../core/components/common/Icon';

interface ShareReceiptSheetProps {
  visible: boolean;
  onClose: () => void;
  receiptNo: string;
  pdfFileName?: string;
  pdfFileSize?: string;
}

export function ShareReceiptSheet({
  visible,
  onClose,
  receiptNo,
  pdfFileName = 'HRSJM_Donation_Receipt.pdf',
  pdfFileSize = '245 KB',
}: ShareReceiptSheetProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleShareReceipt = async () => {
    try {
      const record =
        recentDonationsStore.getRecentDonations().find(r => r.receiptNo === receiptNo || r.id === receiptNo) ||
        MOCK_DONATION_RECORDS.find(r => r.receiptNo === receiptNo) || {
          id: receiptNo,
          receiptNo,
          amount: 500,
          donorName: 'Donor',
          cause: 'Donation',
        };
      await executeShareReceipt(record as any);
    } catch (err: any) {
      console.warn('Share receipt error:', err);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Share Receipt</Text>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close share sheet"
                  style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {/* Document Preview Card */}
                <View style={styles.docCard}>
                  <View style={styles.pdfIconWrap}>
                    <Icon name="file-pdf" size={24} color="#E53E3E" />
                  </View>
                  <View style={styles.docInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {pdfFileName}
                    </Text>
                    <Text style={styles.fileMeta}>
                      PDF Document • {pdfFileSize}
                    </Text>
                  </View>
                </View>

                {feedbackMessage ? (
                  <View style={styles.feedbackBanner}>
                    <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                  </View>
                ) : null}

                {/* Share Action */}
                <TouchableOpacity
                  onPress={handleShareReceipt}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Share receipt"
                  style={[styles.optionRow, styles.optionRowLast]}>
                  <View style={[styles.channelIcon, { backgroundColor: '#EBF3FE' }]}>
                    <Icon name="share" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionLabel}>Share Receipt</Text>
                  <Icon name="chevron-right" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Cancel Action */}
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel sharing"
                  style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  pdfIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  feedbackBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  optionsList: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  channelIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  moreLabelWrap: {
    flex: 1,
  },
  optionSubLabel: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default ShareReceiptSheet;
