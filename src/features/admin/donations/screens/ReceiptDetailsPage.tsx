import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AdminColors,
  AppBadge,
  AppButton,
  AppErrorState,
  BorderRadius,
  Spacing,
  Typography,
  formatDateTime,
} from '../../../../core';
import { Download, Share2, Printer, Copy, Check, Mail } from '../../../../core/components/icons';
import { DonationReceiptModel } from '../types/donations.types';
import { donationsService } from '../services/donations.service';
import { getPreviewReceipt } from '../services/donations.preview';
import { donationStatusPresentation } from '../components/DonationStatusBadge';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import {
  buildReceiptHtml,
  downloadReceiptPDF,
  downloadReceiptPdfNative,
  generateReceiptPdf,
  generateReceiptPdfDirect,
  isWebEnvironment,
  printReceiptDocument,
  receiptFileName,
  saveReceiptBlob,
  shareReceiptPdfNative,
} from '../utils/receiptDocument';

export interface ReceiptDetailsPageProps {
  /** Donation whose receipt should be rendered (from the route). */
  donationId: string;
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

const LOGO_SOURCE = require('../../../../assets/logo/logo.png');

const formatAmount = (amount: number): string =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

/**
 * Receipt Details page — renders the selected donation's official
 * receipt, donor breakdown, collapsible donation information,
 * vector outline actions for download, share, and print.
 */
export const ReceiptDetailsPage: React.FC<ReceiptDetailsPageProps> = ({
  donationId,
  onBack,
  onNavigate,
}) => {
  const [receipt, setReceipt] = useState<DonationReceiptModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(160);
  const [pendingAction, setPendingAction] = useState<
    'download' | 'share' | 'print' | null
  >(null);
  const [shareStage, setShareStage] = useState<
    'generating' | 'sharing' | null
  >(null);
  const [shareFallbackVisible, setShareFallbackVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);
    setReceipt(null);
    setActionMessage(null);

    donationsService
      .getReceiptByDonationId(donationId)
      .then(data => {
        if (active) setReceipt(data);
      })
      .catch(() => {
        // Fall back to preview dataset so visual preview remains functional
        const preview = getPreviewReceipt(donationId);
        if (active) {
          if (preview) {
            setReceipt(preview);
          } else {
            setHasError(true);
          }
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [donationId]);

  const presentation = useMemo(
    () =>
      receipt
        ? donationStatusPresentation(receipt.status)
        : { label: '', tone: 'DEFAULT' as const },
    [receipt],
  );

  const donorRows: Array<[string, string | null | undefined]> = receipt
    ? [
        ['Donor Name', receipt.donorName],
        ['Member ID', receipt.memberCode],
        ['Phone', receipt.donorMobile],
        ['Donation Type', receipt.cause],
        ['Amount', formatAmount(receipt.amount)],
        ['Payment Method', receipt.paymentMethod],
        ['Transaction ID', receipt.transactionId],
      ]
    : [];

  const infoRows: Array<[string, string | null | undefined]> = receipt
    ? [
        ['Donation ID', receipt.id],
        ['Receipt No.', receipt.receiptNumber],
        ['Date & Time', formatDateTime(receipt.receiptDate)],
        ['Amount', formatAmount(receipt.amount)],
        ['Donation Type', receipt.cause],
        ['Payment Method', receipt.paymentMethod],
        ['Transaction ID', receipt.transactionId],
      ]
    : [];

  const handleBack = () => {
    onBack?.();
  };

  const getReceiptFileName = (): string =>
    receipt ? receiptFileName(receipt) : 'HRSJM-Donation-Receipt.pdf';

  const getReceiptSummary = (): string =>
    receipt
      ? [
          `*HUMAN RIGHTS & SOCIAL JUSTICE MISSION (HRSJM)*`,
          `*Donation Receipt:* ${receipt.receiptNumber}`,
          `--------------------------------`,
          `*Donor Name:* ${receipt.donorName}`,
          receipt.memberCode ? `*Member ID:* ${receipt.memberCode}` : null,
          receipt.donorMobile ? `*Phone:* ${receipt.donorMobile}` : null,
          `*Donation Cause:* ${receipt.cause}`,
          `*Amount:* ${formatAmount(receipt.amount)}`,
          `*Date:* ${formatDateTime(receipt.receiptDate)}`,
          `*Payment Method:* ${receipt.paymentMethod}`,
          receipt.transactionId ? `*Transaction ID:* ${receipt.transactionId}` : null,
          `--------------------------------`,
          `Eligible for income tax deduction under Section 80G of the IT Act.`,
          `Registration: NGO/80G/HRSJM/2024`,
          `Thank you for supporting Human Rights & Social Justice Mission!`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

  const handleDownload = async () => {
    if (!receipt || pendingAction) return;
    setPendingAction('download');
    setActionMessage(null);
    try {
      if (Platform.OS !== 'web' || !isWebEnvironment()) {
        const result = await downloadReceiptPdfNative(receipt);
        if (result === 'downloaded') {
          setActionMessage(
            'Receipt PDF saved to your device downloads folder.',
          );
        } else {
          setActionMessage(
            'Receipt PDF opened. Use the save option in the preview to keep it on your device.',
          );
        }
      } else {
        const result = await downloadReceiptPDF(receipt);
        if (result === 'downloaded') {
          setActionMessage('Receipt PDF downloaded.');
        } else if (result === 'opened') {
          setActionMessage(
            'Your browser does not allow direct file saving. The receipt has been opened so you can save it.',
          );
        }
      }
    } catch (error: any) {
      console.error('Receipt download error:', error);
      setActionMessage(error?.message || 'Unable to download the receipt PDF. Please try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleShare = async () => {
    if (!receipt || pendingAction) return;
    setPendingAction('share');
    setActionMessage(null);
    try {
      if (Platform.OS !== 'web' || !isWebEnvironment()) {
        setShareStage('generating');
        await shareReceiptPdfNative(receipt);
        return;
      }

      // Web browser share flow
      const web: any =
        typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      const nav: any = web.navigator;
      const fileName = getReceiptFileName();

      setShareStage('generating');
      let pdf: any;
      try {
        pdf = await generateReceiptPdfDirect(receipt);
      } catch {
        pdf = await generateReceiptPdf(receipt);
      }
      const blob = pdf.output('blob');

      // 1. Try native Web Share API with file first
      if (
        nav?.share &&
        typeof nav.canShare === 'function' &&
        typeof web.File === 'function'
      ) {
        try {
          const file = new web.File([blob], fileName, {
            type: 'application/pdf',
          });
          if (nav.canShare({ files: [file] })) {
            setShareStage('sharing');
            await nav.share({
              files: [file],
              title: `HRSJM Donation Receipt ${receipt.receiptNumber}`,
              text: `Donation Receipt from Human Rights & Social Justice Mission for ${receipt.donorName}. Amount: ${formatAmount(receipt.amount)}`,
            });
            setActionMessage('Receipt shared successfully.');
            return;
          }
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            return;
          }
        }
      }

      // 2. Try native Web Share API with text & link
      if (nav?.share) {
        try {
          setShareStage('sharing');
          await nav.share({
            title: `HRSJM Donation Receipt ${receipt.receiptNumber}`,
            text: getReceiptSummary(),
            url: web.location?.href || undefined,
          });
          setActionMessage('Receipt shared successfully.');
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            return;
          }
        }
      }

      // 3. Fallback modal
      setShareFallbackVisible(true);
    } catch (error: any) {
      console.error('Share Receipt error:', error);
      setShareFallbackVisible(true);
    } finally {
      setPendingAction(null);
      setShareStage(null);
    }
  };

  const handlePrint = async () => {
    if (!receipt || pendingAction) return;
    setPendingAction('print');
    setActionMessage(null);
    try {
      if (Platform.OS !== 'web' || !isWebEnvironment()) {
        setActionMessage(
          'Direct printing is not available in the mobile view. Use the Share button to send the receipt and print.',
        );
        return;
      }

      const web: any =
        typeof globalThis !== 'undefined' ? (globalThis as any) : {};

      // 1. Try printing via printable HTML representation
      try {
        const html = buildReceiptHtml(receipt);
        const printed = printReceiptDocument(html);
        if (printed) {
          setActionMessage('Print dialog opened.');
          return;
        }
      } catch (printErr) {
        console.warn('HTML print failed, falling back to PDF print', printErr);
      }

      // 2. Fallback: generate PDF blob and open print dialog
      let pdf: any;
      try {
        pdf = await generateReceiptPdfDirect(receipt);
      } catch {
        pdf = await generateReceiptPdf(receipt);
      }
      const blob = pdf.output('blob');
      const blobUrl = web.URL?.createObjectURL?.(blob);

      if (blobUrl && web.window) {
        const printWindow = web.window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus?.();
          setTimeout(() => {
            try {
              printWindow.print?.();
            } catch {}
          }, 600);
          setActionMessage('Print dialog opened.');
          return;
        }
      }

      // 3. If popup blocked, download directly
      saveReceiptBlob(blob, getReceiptFileName());
      setActionMessage('Receipt PDF downloaded. Open the file to print.');
    } catch (error: any) {
      console.error('Print Receipt error:', error);
      setActionMessage(error?.message || 'Unable to print the receipt.');
    } finally {
      setPendingAction(null);
    }
  };

  const shareFallbackOptions = [
    {
      label: 'Share via WhatsApp',
      icon: '💬',
      action: async () => {
        const text = encodeURIComponent(getReceiptSummary());
        const url = `https://api.whatsapp.com/send?text=${text}`;
        const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        if (web.window) {
          web.window.open(url, '_blank');
          setActionMessage('Opening WhatsApp...');
        }
      },
    },
    {
      label: 'Share via Email',
      icon: '✉️',
      action: async () => {
        const subject = encodeURIComponent(
          `HRSJM Donation Receipt ${receipt?.receiptNumber || ''}`,
        );
        const body = encodeURIComponent(getReceiptSummary());
        const mailto = `mailto:?subject=${subject}&body=${body}`;
        const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        if (web.window) {
          web.window.location.href = mailto;
          setActionMessage('Opening Email client...');
        }
      },
    },
    {
      label: 'Copy Receipt Link',
      icon: '🔗',
      action: async () => {
        const nav: any =
          typeof globalThis !== 'undefined'
            ? (globalThis as any).navigator
            : undefined;
        const web: any =
          typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        const link = web.location?.href ?? '';
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(link);
          setActionMessage('Receipt link copied to clipboard.');
        } else {
          setActionMessage(link || 'Unable to copy the link.');
        }
      },
    },
    {
      label: 'Copy Receipt Details',
      icon: '📋',
      action: async () => {
        const nav: any =
          typeof globalThis !== 'undefined'
            ? (globalThis as any).navigator
            : undefined;
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(getReceiptSummary());
          setActionMessage('Receipt details copied to clipboard.');
        } else {
          setActionMessage(getReceiptSummary());
        }
      },
    },
    {
      label: 'Download PDF',
      icon: '📥',
      action: async () => {
        await handleDownload();
      },
    },
  ];

  const renderInfoRow = (
    label: string,
    value: string | null | undefined,
    isAmount?: boolean,
  ) => {
    if (isAmount) {
      return (
        <View key={label} style={styles.infoRowAmount}>
          <Text style={styles.infoLabelAmount}>{label}</Text>
          <Text style={styles.infoValueAmount}>{value || '₹0'}</Text>
        </View>
      );
    }

    return (
      <View key={label} style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Top Header bar with single, official back arrow button */}
      <AdminHeader
        showBack={Boolean(onBack)}
        onBack={handleBack}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (panelHeight || 160) + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row with aligned status badge */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextWrap}>
            <Text style={styles.title}>Receipt Details</Text>
            <Text style={styles.subtitle}>
              View receipt information and download or share.
            </Text>
          </View>
          {receipt ? (
            <AppBadge
              label={presentation.label}
              status={presentation.tone}
              style={styles.statusBadge}
            />
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={AdminColors.primary} />
            <Text style={styles.stateText}>Loading receipt…</Text>
          </View>
        ) : hasError || !receipt ? (
          <View style={styles.stateCard}>
            <AppErrorState
              title="Unable to load receipt."
              message="The selected donation could not be found. Please go back and try again."
              onRetry={handleBack}
              retryTitle="Back to Donation"
            />
          </View>
        ) : (
          <>
            {/* Donation receipt card */}
            <View style={styles.receiptCard}>
              {/* Brand Header */}
              <View style={styles.brandRow}>
                <Image
                  source={LOGO_SOURCE}
                  style={styles.logoImage}
                  resizeMode="contain"
                  accessibilityLabel="HRSJM Logo"
                />
                <View style={styles.brandText}>
                  <Text style={styles.orgName}>HRSJM</Text>
                  <Text style={styles.orgFull}>
                    HUMAN RIGHTS & SOCIAL JUSTICE MISSION
                  </Text>
                  <Text style={styles.orgMotto}>मानव अधिकार • सामाजिक न्याय</Text>
                </View>
              </View>

              {/* Receipt Title */}
              <View style={styles.receiptTitleContainer}>
                <Text style={styles.receiptTitle}>DONATION RECEIPT</Text>
              </View>

              {/* Metadata Row */}
              <View style={styles.receiptMetaRow}>
                <View style={styles.receiptMetaItem}>
                  <Text style={styles.receiptMetaLabel}>Receipt No.</Text>
                  <Text style={styles.receiptMetaValueMono}>
                    {receipt.receiptNumber}
                  </Text>
                </View>
                <View style={styles.receiptMetaItemRight}>
                  <Text style={styles.receiptMetaLabel}>Date & Time</Text>
                  <Text style={styles.receiptMetaValue}>
                    {formatDateTime(receipt.receiptDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Donor Data Rows */}
              <View style={styles.rowsContainer}>
                {donorRows.map(([label, value]) =>
                  renderInfoRow(label, value, label === 'Amount'),
                )}
              </View>
            </View>

            {/* Donation information (collapsible) */}
            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeaderRow}
                onPress={() => setInfoExpanded(expanded => !expanded)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: infoExpanded }}
                accessibilityLabel="Toggle donation information"
              >
                <Text style={styles.sectionTitle}>Donation Information</Text>
                <Text style={styles.sectionChevron}>
                  {infoExpanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {infoExpanded ? (
                <View style={styles.sectionBody}>
                  <View style={styles.sectionDivider} />
                  {infoRows.map(([label, value]) =>
                    renderInfoRow(label, value, label === 'Amount'),
                  )}
                </View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>

      {/* Fixed bottom action panel with crisp Lucide outline icons */}
      {!isLoading && !hasError && receipt ? (
        <View
          style={styles.bottomBarHost}
          onLayout={event => {
            const h = event.nativeEvent.layout.height;
            if (h > 0) setPanelHeight(h);
          }}
        >
          <View
            style={[
              styles.bottomPanel,
              { paddingBottom: insets.bottom + Spacing.sm },
            ]}
          >
            {/* Primary Action: Download PDF */}
            <AppButton
              title={
                pendingAction === 'download'
                  ? 'Generating PDF...'
                  : 'Download Receipt (PDF)'
              }
              variant="primary"
              size="md"
              loading={pendingAction === 'download'}
              disabled={pendingAction !== null}
              icon={<Download size={18} color={AdminColors.primaryDark} strokeWidth={2.2} />}
              onPress={handleDownload}
              style={styles.primaryAction}
            />

            {/* Secondary Actions: Share & Print */}
            <View style={styles.secondaryActionsRow}>
              <AppButton
                title={
                  pendingAction === 'share'
                    ? shareStage === 'generating'
                      ? 'Preparing Receipt...'
                      : 'Sharing...'
                    : 'Share Receipt'
                }
                variant="outline"
                size="md"
                loading={pendingAction === 'share'}
                disabled={pendingAction !== null}
                icon={<Share2 size={17} color={AdminColors.primary} strokeWidth={2} />}
                onPress={handleShare}
                style={styles.secondaryAction}
              />
              <AppButton
                title={
                  pendingAction === 'print'
                    ? 'Preparing Print...'
                    : 'Print Receipt'
                }
                variant="outline"
                size="md"
                loading={pendingAction === 'print'}
                disabled={pendingAction !== null}
                icon={<Printer size={17} color={AdminColors.primary} strokeWidth={2} />}
                onPress={handlePrint}
                style={styles.secondaryAction}
              />
            </View>

            {actionMessage ? (
              <Text style={styles.actionMessage}>{actionMessage}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Desktop share fallback modal */}
      <Modal
        visible={shareFallbackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareFallbackVisible(false)}
      >
        <Pressable
          style={styles.fallbackOverlay}
          onPress={() => setShareFallbackVisible(false)}
        >
          <Pressable style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>Share Receipt</Text>
            <Text style={styles.fallbackSubtitle}>
              Share this receipt using one of the options below.
            </Text>
            {shareFallbackOptions.map(option => (
              <TouchableOpacity
                key={option.label}
                style={styles.fallbackOption}
                onPress={async () => {
                  setShareFallbackVisible(false);
                  try {
                    await option.action();
                  } catch {
                    setActionMessage(
                      'Unable to complete the share. Please try again.',
                    );
                  }
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={option.label}
              >
                <Text style={styles.fallbackOptionIcon}>{option.icon}</Text>
                <Text style={styles.fallbackOptionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <AppButton
              title="Close"
              variant="outline"
              size="md"
              onPress={() => setShareFallbackVisible(false)}
              style={styles.fallbackCloseButton}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
    paddingHorizontal: 2,
  },
  titleTextWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: AdminColors.textSecondary,
    marginTop: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  stateCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  stateText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    shadowColor: '#0A3A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: Spacing.sm,
  },
  brandText: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  orgName: {
    fontSize: 19,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: 0.5,
  },
  orgFull: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AdminColors.primary,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  orgMotto: {
    fontSize: 10.5,
    fontWeight: '600',
    color: AdminColors.accentGold,
    marginTop: 1,
  },
  receiptTitleContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
  receiptTitle: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: AdminColors.primary,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  receiptMetaItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  receiptMetaItemRight: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  receiptMetaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptMetaValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
  },
  receiptMetaValueMono: {
    fontSize: 13.5,
    color: AdminColors.primary,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.sm,
  },
  rowsContainer: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  infoLabelAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1.4,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  infoValueAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532D',
    textAlign: 'right',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    shadowColor: '#0A3A6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  sectionChevron: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  sectionBody: {
    paddingBottom: Spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.xs,
  },
  bottomBarHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 10,
  },
  bottomPanel: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 10,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs + 2,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: BorderRadius.lg,
  },
  actionMessage: {
    ...Typography.caption,
    fontSize: 12,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  fallbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fallbackTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
  },
  fallbackSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  fallbackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  fallbackOptionIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  fallbackOptionLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.primaryDark,
  },
  fallbackCloseButton: {
    minHeight: 44,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
});
