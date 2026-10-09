import React, { useState } from 'react';
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
import { AppLogo } from '../../../core/components/common/AppLogo';
import { formatCurrency } from '../../../core/utils/format';
import type { AppStackParamList } from '../../../core/navigation/types';
import { MOCK_DONATION_RECORDS } from '../../donations/data/donations.mock';
import { ShareReceiptSheet } from '../components/ShareReceiptSheet';
import { PrintReceiptSheet } from '../components/PrintReceiptSheet';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'ReceiptPdfPreview'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function ReceiptPdfPreviewScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const receiptNo = route.params?.receiptNo;

  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [printSheetVisible, setPrintSheetVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const record =
    MOCK_DONATION_RECORDS.find(r => r.receiptNo === receiptNo) ||
    MOCK_DONATION_RECORDS[0];

  const fileName = `HRSJM_${record.type}_Receipt.pdf`;

  const handleDownload = () => {
    setToastMessage(`Simulated: Downloaded ${fileName} to device`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar with actions */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <Icon name="chevron-down" size={22} color={colors.primary} style={styles.backIconRotated} />
        </TouchableOpacity>

        <Text style={styles.pdfTitle} numberOfLines={1}>
          {fileName}
        </Text>

        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={handleDownload}
            accessibilityRole="button"
            accessibilityLabel="Download PDF"
            style={styles.iconBtn}>
            <Icon name="download" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPrintSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Print PDF"
            style={styles.iconBtn}>
            <Icon name="printer" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShareSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Share PDF"
            style={styles.iconBtn}>
            <Icon name="share" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {toastMessage ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* PDF Document Canvas */}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pdfPage}>
          {/* Certificate Border */}
          <View style={styles.innerBorder}>
            {/* Watermark Emblem Placeholder */}
            <View style={styles.watermark}>
              <Icon name="file-text" size={140} color="rgba(27, 59, 140, 0.03)" />
            </View>

            {/* Header */}
            <View style={styles.pdfHeader}>
              <AppLogo size={52} />
              <Text style={styles.orgMainTitle}>
                HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
              </Text>
              <Text style={styles.orgHindiTitle}>
                मानव अधिकार व सामाजिक न्याय
              </Text>
              <View style={styles.goldDivider} />
              <Text style={styles.docTitle}>
                {record.type === 'Membership'
                  ? 'Membership Receipt'
                  : 'Donation Receipt'}
              </Text>
            </View>

            {/* Receipt Key Metadata Grid */}
            <View style={styles.metaGrid}>
              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Receipt No.</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={[styles.pdfValue, styles.boldValue]}>
                  {record.receiptNo}
                </Text>
              </View>

              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Date</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={styles.pdfValue}>{record.dateTime}</Text>
              </View>

              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Donor Name</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={styles.pdfValue}>{record.donorName}</Text>
              </View>

              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Cause</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={styles.pdfValue}>{record.cause}</Text>
              </View>

              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Category</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={styles.pdfValue}>{record.category}</Text>
              </View>

              <View style={styles.pdfRow}>
                <Text style={styles.pdfLabel}>Payment Method</Text>
                <Text style={styles.pdfColon}>:</Text>
                <Text style={styles.pdfValue}>{record.paymentMethod}</Text>
              </View>
            </View>

            {/* Amount Box */}
            <View style={styles.pdfAmountBox}>
              <View style={styles.pdfAmountRow}>
                <Text style={styles.amountPrompt}>Amount :</Text>
                <Text style={styles.pdfAmountNumber}>
                  {formatCurrency(record.amount)}
                </Text>
              </View>
              <Text style={styles.pdfAmountWords}>
                {record.amountInWords || 'Two Thousand Five Hundred Rupees Only'}
              </Text>
            </View>

            {/* Footer & Gratitude */}
            <View style={styles.pdfFooter}>
              <Text style={styles.gratitudeText}>
                Thank you for your generous support.
              </Text>
              <Text style={styles.gratitudeSubText}>
                Your contribution helps us create a better and more equitable society.
              </Text>
              <View style={styles.stampBox}>
                <Text style={styles.stampText}>OFFICIAL RECEIPT VERIFIED</Text>
                <Text style={styles.stampOrg}>HRSJM NATIONAL SECRETARIAT</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Share Sheet */}
      <ShareReceiptSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        receiptNo={record.receiptNo}
        pdfFileName={fileName}
      />

      {/* Print Sheet */}
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
    backgroundColor: '#0E1A38',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    padding: 6,
  },
  backIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  pdfTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  toastWrap: {
    backgroundColor: colors.greenSoft,
    padding: spacing.sm,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 12,
    color: colors.active,
    fontWeight: '700',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#334155',
  },
  canvasContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    alignItems: 'center',
  },
  pdfPage: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  innerBorder: {
    borderWidth: 1.5,
    borderColor: '#C08A00',
    borderRadius: 6,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    opacity: 0.6,
  },
  pdfHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orgMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
    textAlign: 'center',
  },
  orgHindiTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.goldText,
    marginTop: 2,
    textAlign: 'center',
  },
  goldDivider: {
    width: 60,
    height: 2,
    backgroundColor: colors.accentGold,
    marginTop: 8,
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  metaGrid: {
    paddingVertical: spacing.sm,
    gap: 8,
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfLabel: {
    width: 110,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pdfColon: {
    width: 14,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pdfValue: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  boldValue: {
    fontWeight: '700',
    color: colors.primary,
  },
  pdfAmountBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E2D9CC',
    borderRadius: 8,
    padding: 12,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  pdfAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  pdfAmountNumber: {
    ...serif,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  pdfAmountWords: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 4,
  },
  pdfFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  gratitudeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gratitudeSubText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  stampBox: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(35, 164, 95, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  stampText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.active,
    letterSpacing: 0.6,
  },
  stampOrg: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
});

export default ReceiptPdfPreviewScreen;
