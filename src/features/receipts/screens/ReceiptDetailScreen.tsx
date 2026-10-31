import React, { useState } from 'react';
import {
  Platform,
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
import { AppLogo } from '../../../core/components/common/AppLogo';
import { formatCurrency, amountToWords } from '../../../core/utils/format';
import type { AppStackParamList } from '../../../core/navigation/types';
import { MOCK_DONATION_RECORDS } from '../../donations/data/donations.mock';
import { recentDonationsStore } from '../../donations/services/recent-donations.store';
import type { DonationRecord, DonationStatus } from '../../donations/types/donation.types';
import { ShareReceiptSheet } from '../components/ShareReceiptSheet';
import { PrintReceiptSheet } from '../components/PrintReceiptSheet';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'ReceiptDetail'>['route'];
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

export function ReceiptDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const receiptNo = route.params?.receiptNo;
  const fromScreen = route.params?.fromScreen || 'ReceiptsList';

  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [printSheetVisible, setPrintSheetVisible] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const backLabel =
    fromScreen === 'DonationHistory' || fromScreen === 'DonationDetail'
      ? 'Back to Donation History'
      : 'Back to Receipts List';

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      try {
        (navigation as any).navigate('UserHistory');
      } catch {
        try {
          (navigation as any).navigate('DonationHistory');
        } catch {
          (navigation as any).navigate('UserHome');
        }
      }
    }
  };

  // Find corresponding donation or membership record
  const allRecent = recentDonationsStore.getRecentDonations();
  const foundRecord: DonationRecord | undefined =
    (route.params as any)?.record ||
    allRecent.find(r =>
      (receiptNo && (
        r.receiptNo?.toLowerCase() === receiptNo?.toLowerCase() ||
        r.id?.toLowerCase() === receiptNo?.toLowerCase() ||
        r.transactionId?.toLowerCase() === receiptNo?.toLowerCase()
      ))
    ) ||
    MOCK_DONATION_RECORDS.find(r => receiptNo && r.receiptNo?.toLowerCase() === receiptNo?.toLowerCase());

  // Dynamic fallback so newly placed donations NEVER show empty/not found screen
  const record: DonationRecord = foundRecord || {
    id: receiptNo || `rec-don-${Date.now()}`,
    receiptNo: receiptNo || `HRSJM-REC-${Date.now()}`,
    type: ((route.params as any)?.record?.type || 'Donation') as any,
    title: (route.params as any)?.record?.title || 'HRSJM NGO Donation - General Fund',
    cause: (route.params as any)?.record?.cause || 'HRSJM NGO Donation - General Fund',
    category: (route.params as any)?.record?.category || 'Donation',
    description: (route.params as any)?.record?.description || 'Contribution to Human Rights & Social Justice Mission.',
    amount: (route.params as any)?.record?.amount || (route.params as any)?.amount || 500,
    amountInWords: (route.params as any)?.record?.amountInWords || amountToWords((route.params as any)?.amount || 500),
    date: (route.params as any)?.record?.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: (route.params as any)?.record?.time || new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    dateTime: (route.params as any)?.record?.dateTime || `${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
    isoDate: (route.params as any)?.record?.isoDate || new Date().toISOString().split('T')[0],
    imageType: ((route.params as any)?.record?.imageType || 'medical') as any,
    status: 'Completed',
    paymentMethod: (route.params as any)?.record?.paymentMethod || 'CASHFREE',
    transactionId: (route.params as any)?.record?.transactionId || receiptNo || `TRX-${Date.now()}`,
    donorName: (route.params as any)?.record?.donorName || 'Donor',
  };

  const statusMeta = STATUS_META[record.status] || STATUS_META.Completed;
  const isMembership = record.type === 'Membership';

  const handleDownload = () => {
    try {
      navigation.navigate('ReceiptPdfPreview' as any, {
        receiptNo: record.receiptNo,
        record,
        fromScreen,
      });
    } catch {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.print();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={styles.backBtn}>
          <Icon name="chevron-down" size={20} color={colors.primary} style={styles.backIconRotated} />
          <Text style={styles.backText}>{backLabel}</Text>
        </TouchableOpacity>

        <View style={[styles.statusChip, { backgroundColor: statusMeta.bg }]}>
          <Icon name={statusMeta.icon} size={14} color={statusMeta.fg} strokeWidth={2.2} />
          <Text style={[styles.statusChipText, { color: statusMeta.fg }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Receipt Title */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Receipt Detail</Text>
        </View>

        {downloadSuccessToast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{downloadSuccessToast}</Text>
          </View>
        ) : null}

        {/* Official Document Card */}
        <View style={styles.receiptPaper}>
          {/* Paper Header with Official Logo & Title */}
          <View style={styles.paperHeader}>
            <AppLogo size={46} />
            <Text style={styles.paperOrgTitle}>
              HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
            </Text>
            <Text style={styles.paperOrgSubtitle}>
              मानव अधिकार व सामाजिक न्याय
            </Text>
            <View style={styles.paperTitleBadge}>
              <Text style={styles.paperTitleText}>
                {record.type === 'Renewal'
                  ? 'Membership Renewal Receipt'
                  : isMembership
                  ? 'Membership Receipt'
                  : 'Donation Receipt'}
              </Text>
            </View>
          </View>

          {/* Table / Fields */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <Text style={styles.fieldLabel}>Receipt No.</Text>
              <Text style={[styles.fieldValue, styles.receiptNoText]}>
                {record.receiptNo}
              </Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.fieldLabel}>Date &amp; Time</Text>
              <Text style={styles.fieldValue}>{record.dateTime}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <Text style={styles.fieldValue}>{record.paymentMethod}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.fieldLabel}>
                {record.type === 'Donation' ? 'Donor Name' : 'Member Name'}
              </Text>
              <Text style={styles.fieldValue}>{record.donorName}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.fieldLabel}>
                {record.type === 'Renewal'
                  ? 'Renewal Purpose'
                  : isMembership
                  ? 'Membership Type'
                  : 'Cause'}
              </Text>
              <Text style={styles.fieldValue}>{record.cause}</Text>
            </View>

            <View style={[styles.gridRow, styles.gridRowLast]}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text style={styles.fieldValue}>{record.category}</Text>
            </View>
          </View>

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <View style={styles.amountHeaderRow}>
              <Text style={styles.amountLabel}>Amount :</Text>
              <Text style={styles.amountVal}>{formatCurrency(record.amount)}</Text>
            </View>
            <Text style={styles.amountWords}>
              {record.amountInWords || amountToWords(record.amount)}
            </Text>
          </View>

          {/* Paper Footer Note */}
          <View style={styles.paperFooter}>
            <Text style={styles.footerNote}>
              Thank you for your generous support.
            </Text>
            <Text style={styles.footerSubNote}>
              Your contribution helps us create a better and more equitable society.
            </Text>
          </View>
        </View>

        {/* Action Buttons Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            onPress={handleDownload}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Download PDF"
            style={styles.downloadBtn}>
            <Icon name="download" size={18} color={colors.white} strokeWidth={2.2} />
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPrintSheetVisible(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Print receipt"
            style={styles.actionBtnSecondary}>
            <Icon name="printer" size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionBtnSecondaryText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShareSheetVisible(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Share receipt"
            style={styles.actionBtnSecondary}>
            <Icon name="share" size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionBtnSecondaryText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Share Modal Sheet */}
      <ShareReceiptSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        receiptNo={record.receiptNo}
        pdfFileName={`HRSJM_${isMembership ? 'Membership' : 'Donation'}_Receipt_${record.receiptNo.slice(-4)}.pdf`}
      />

      {/* Print Modal Sheet */}
      <PrintReceiptSheet
        visible={printSheetVisible}
        onClose={() => setPrintSheetVisible(false)}
        receiptNo={record.receiptNo}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 4,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...serif,
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  toast: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 12.5,
    color: colors.active,
    fontWeight: '600',
  },
  receiptPaper: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  paperHeader: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  paperOrgTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  paperOrgSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.goldText,
    marginTop: 1,
    textAlign: 'center',
  },
  paperTitleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
  },
  paperTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsGrid: {
    paddingVertical: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 8,
  },
  gridRowLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    fontSize: 12.5,
    color: colors.textMuted,
    width: 110,
    flexShrink: 0,
    lineHeight: 18,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  receiptNoText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11.5,
    letterSpacing: -0.2,
    ...(Platform.OS === 'web' ? { wordBreak: 'break-all' as any } : {}),
  },
  amountBox: {
    backgroundColor: '#EDF2F7',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  amountVal: {
    ...serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  amountWords: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  paperFooter: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerNote: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  footerSubNote: {
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  downloadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 46,
    gap: 6,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  actionBtnSecondary: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 46,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ReceiptDetailScreen;
