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

interface DonationReceiptModalProps {
  visible: boolean;
  row: DonationRowModel | null;
  onClose: () => void;
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({
  visible,
  row,
  onClose,
}) => {
  if (!row) return null;

  const receiptNumber = `RCP-DON-${row.id.replace('preview-don-', '').slice(-6).toUpperCase()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.header}>
            <View style={styles.brandingRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoLetter}>H</Text>
              </View>
              <View style={styles.identityCol}>
                <Text style={styles.orgName}>HRSJM</Text>
                <Text style={styles.orgFullName}>
                  HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
                </Text>
                <Text style={styles.orgMotto}>
                  मानव अधिकार · सामाजिक न्याय
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close receipt"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.receiptTitleWrap}>
              <Text style={styles.receiptTitle}>DONATION RECEIPT</Text>
              <Text style={styles.receiptNumber}>Receipt No: {receiptNumber}</Text>
              <Text style={styles.receiptDate}>
                Date: {row.dateText} {row.timeText ? `· ${row.timeText}` : ''}
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>DONOR DETAILS</Text>
              <View style={styles.donorRow}>
                <AppAvatar name={row.donorName} size={40} />
                <View style={styles.donorMeta}>
                  <Text style={styles.donorName}>{row.donorName}</Text>
                  {row.memberCode ? (
                    <Text style={styles.metaText}>
                      Member ID: {row.memberCode}
                    </Text>
                  ) : null}
                  {row.phone ? (
                    <Text style={styles.metaText}>Phone: {row.phone}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>CONTRIBUTION DETAILS</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purpose / Cause</Text>
                <Text style={styles.detailValueBold}>{row.donationTitle}</Text>
              </View>
              {row.donationDescription ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {row.donationDescription}
                  </Text>
                </View>
              ) : null}
              {row.donationType ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Donation Type</Text>
                  <Text style={styles.detailValue}>
                    {row.donationType === 'ONE_TIME'
                      ? 'One-time'
                      : row.donationType === 'RECURRING'
                      ? 'Recurring'
                      : 'Offline'}
                  </Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status</Text>
                <AppBadge
                  label={row.statusLabel}
                  status={row.statusTone}
                  style={styles.badge}
                />
              </View>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
              <Text style={styles.amountValue}>
                {`₹ ${row.amount.toLocaleString('en-IN')}`}
              </Text>
            </View>

            <View style={styles.taxBox}>
              <Text style={styles.taxIcon}>🏛️</Text>
              <Text style={styles.taxText}>
                Eligible for income tax deduction under Section 80G of the IT
                Act. Registration: NGO/80G/HRSJM/2024.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              title="Close"
              variant="outline"
              size="md"
              style={styles.footerButton}
              onPress={onClose}
            />
            <AppButton
              title="Print / Share"
              variant="primary"
              size="md"
              style={styles.footerButton}
              onPress={onClose}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1.5,
    borderColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  identityCol: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  orgFullName: {
    fontSize: 7.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  orgMotto: {
    fontSize: 7.5,
    color: AdminColors.accentGold,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    padding: Spacing.xs,
  },
  contentScroll: {
    marginVertical: Spacing.sm,
  },
  receiptTitleWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.base,
    marginBottom: Spacing.sm,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: AdminColors.primaryDark,
  },
  receiptNumber: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
    marginTop: 2,
  },
  receiptDate: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.base,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.caption,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.4,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorMeta: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  donorName: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  metaText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  detailLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  detailValueBold: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  detailValue: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  badge: {
    paddingVertical: 2,
  },
  amountBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primaryDark,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.accentGoldLight,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.textOnDark,
    marginTop: 2,
  },
  taxBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  taxIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  taxText: {
    ...Typography.caption,
    color: AdminColors.primaryDark,
    flex: 1,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AdminColors.divider,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});
