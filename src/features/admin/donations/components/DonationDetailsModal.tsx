import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  AppAvatar,
  AppBadge,
  AppButton,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../core';
import { DonationRowModel } from '../types/donations.types';

interface DonationDetailsModalProps {
  visible: boolean;
  row: DonationRowModel | null;
  onClose: () => void;
  onViewReceipt: (row: DonationRowModel) => void;
  onRefund?: (row: DonationRowModel) => void;
}

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  visible,
  row,
  onClose,
  onViewReceipt,
  onRefund,
}) => {
  if (!row) return null;

  const isCompleted =
    row.rawStatus === 'SUCCESS' || row.statusLabel === 'Completed';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Donation Details</Text>
              <Text style={styles.subtitle}>ID: {row.id}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close details"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.donorCard}>
              <AppAvatar name={row.donorName} size={48} />
              <View style={styles.donorInfo}>
                <Text style={styles.donorName}>{row.donorName}</Text>
                {row.memberCode ? (
                  <Text style={styles.donorMeta}>
                    Member Code: {row.memberCode}
                  </Text>
                ) : null}
                {row.phone ? (
                  <Text style={styles.donorMeta}>Phone: {row.phone}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donation Information</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Cause / Purpose</Text>
                <Text style={styles.rowValueBold}>{row.donationTitle}</Text>
              </View>

              {row.donationDescription ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Notes / Remark</Text>
                  <Text style={styles.rowValue}>{row.donationDescription}</Text>
                </View>
              ) : null}

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Amount</Text>
                <Text style={styles.amountText}>
                  ₹ {row.amount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Date &amp; Time</Text>
                <Text style={styles.rowValue}>
                  {row.dateText} {row.timeText ? `at ${row.timeText}` : ''}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Category</Text>
                <Text style={styles.rowValue}>
                  {row.donationType === 'ONE_TIME'
                    ? 'One-time Donation'
                    : row.donationType === 'RECURRING'
                    ? 'Recurring Donation'
                    : 'Offline Donation'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Status</Text>
                <AppBadge label={row.statusLabel} status={row.statusTone} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              title="Close"
              variant="outline"
              size="md"
              style={styles.actionBtn}
              onPress={onClose}
            />
            <AppButton
              title="View Receipt"
              variant="secondary"
              size="md"
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onViewReceipt(row);
              }}
            />
            {isCompleted && onRefund ? (
              <AppButton
                title="Refund"
                variant="outline"
                size="md"
                style={{ ...styles.actionBtn, ...styles.refundBtn }}
                textStyle={{ color: AdminColors.error }}
                onPress={() => {
                  onClose();
                  onRefund(row);
                }}
              />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  subtitle: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: 2,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    padding: Spacing.xs,
  },
  contentScroll: {
    marginVertical: Spacing.xs,
  },
  donorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  donorInfo: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  donorMeta: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
  },
  sectionTitle: {
    ...Typography.secondaryMedium,
    color: AdminColors.primaryDark,
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  rowLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  rowValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  rowValueBold: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AdminColors.divider,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  refundBtn: {
    borderColor: AdminColors.error,
  },
});
