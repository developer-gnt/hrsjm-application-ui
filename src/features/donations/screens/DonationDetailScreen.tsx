import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { formatCurrency } from '../../../core/utils/format';
import type { AppStackParamList } from '../../../core/navigation/types';
import { MOCK_DONATION_RECORDS } from '../data/donations.mock';
import type { DonationStatus } from '../types/donation.types';
import { CauseHeroBanner } from '../components/CauseHeroBanner';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'DonationDetail'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

const STATUS_META: Record<
  DonationStatus,
  { label: string; bg: string; fg: string; icon: 'check-circle' | 'clock' | 'x-circle' }
> = {
  Completed: {
    label: 'Completed',
    bg: colors.greenSoft,
    fg: colors.active,
    icon: 'check-circle',
  },
  Pending: {
    label: 'Pending',
    bg: colors.goldSoft,
    fg: colors.goldText,
    icon: 'clock',
  },
  Failed: {
    label: 'Failed',
    bg: colors.redSoft,
    fg: colors.danger,
    icon: 'x-circle',
  },
};

export function DonationDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const donationId = route.params?.donationId;

  const donation = MOCK_DONATION_RECORDS.find(item => item.id === donationId) || MOCK_DONATION_RECORDS[0];
  const statusMeta = STATUS_META[donation.status] || STATUS_META.Completed;

  const handleViewReceipt = () => {
    navigation.navigate('ReceiptDetail', {
      receiptNo: donation.receiptNo,
      fromScreen: 'DonationDetail',
    });
  };

  const handlePrint = () => {
    // Navigates to receipt detail with print intent or opens print sheet
    navigation.navigate('ReceiptDetail', {
      receiptNo: donation.receiptNo,
      fromScreen: 'DonationDetail',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Back Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back to Donation History"
          style={styles.backBtn}>
          <Icon name="chevron-down" size={18} color={colors.primary} style={styles.backIconRotated} />
          <Text style={styles.backText}>Back to Donation History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Screen Title & Status Pill Row */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Donation Detail</Text>
          <View style={[styles.statusChip, { backgroundColor: statusMeta.bg }]}>
            <Icon name={statusMeta.icon} size={13} color={statusMeta.fg} strokeWidth={2.5} />
            <Text style={[styles.statusChipText, { color: statusMeta.fg }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        {/* Cause Hero Image Banner */}
        <CauseHeroBanner
          type={donation.imageType}
          title={donation.title}
          imageUrl={donation.imageUrl}
          categoryLabel={donation.category || donation.cause}
        />

        {/* Cause Title & Short Description */}
        <View style={styles.causeSection}>
          <Text style={styles.causeTitle}>{donation.title}</Text>
          <Text style={styles.causeDesc}>{donation.description}</Text>
        </View>

        {/* Amount and Date Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountText}>{formatCurrency(donation.amount)}</Text>
          <Text style={styles.dateText}>{donation.dateTime}</Text>
        </View>

        {/* Donation Information Grid / Table */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Donation Information</Text>

          <View style={styles.infoTable}>
            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Cause</Text>
              <Text style={styles.rowValue}>{donation.cause}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Category</Text>
              <Text style={styles.rowValue}>{donation.category}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Payment Method</Text>
              <Text style={styles.rowValue}>{donation.paymentMethod}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Transaction ID</Text>
              <Text style={styles.rowValue}>{donation.transactionId}</Text>
            </View>

            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.rowLabel}>Receipt No.</Text>
              <Text style={[styles.rowValue, styles.receiptValue]}>
                {donation.receiptNo}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            onPress={handleViewReceipt}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="View Donation Receipt"
            style={styles.primaryBtn}>
            <Icon name="file-text" size={19} color="#0F2860" strokeWidth={2.2} />
            <Text style={styles.primaryBtnText}>View Donation Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePrint}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Print receipt"
            style={styles.secondaryBtn}>
            <Icon name="printer" size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.secondaryBtnText}>Print</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.card,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  backIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  backText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  causeSection: {
    marginTop: spacing.md + 2,
  },
  causeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1B3B8C',
    lineHeight: 25,
  },
  causeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  amountSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  amountText: {
    ...serif,
    fontSize: 26,
    fontWeight: '800',
    color: '#1B3B8C',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: '#F3F6FD',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2EAF8',
    marginBottom: spacing.xl,
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1B3B8C',
    marginBottom: spacing.sm,
  },
  infoTable: {
    borderTopWidth: 1,
    borderTopColor: '#E2EAF8',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  tableRowLast: {
    paddingBottom: 2,
  },
  rowLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B3B8C',
    flex: 1.6,
    textAlign: 'right',
  },
  receiptValue: {
    color: '#1B3B8C',
    fontWeight: '700',
  },
  actionsWrap: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A623',
    borderRadius: radius.md,
    minHeight: 48,
    gap: 8,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D4DEF0',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1B3B8C',
  },
});

export default DonationDetailScreen;
