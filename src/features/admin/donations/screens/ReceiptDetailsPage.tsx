import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { DonationReceiptModel } from '../types/donations.types';
import { donationsService } from '../services/donations.service';
import { getPreviewReceipt } from '../services/donations.preview';
import { donationStatusPresentation } from '../components/DonationStatusBadge';
import { DonationsTopBar } from '../components/DonationsTopBar';
import { navigateToDonations } from '../navigation';
import {
  buildReceiptHtml,
  downloadReceiptPDF,
  downloadReceiptPdfNative,
  generateReceiptPdf,
  isWebEnvironment,
  printReceiptDocument,
  receiptFileName,
  saveReceiptBlob,
  shareReceiptPdfNative,
} from '../utils/receiptDocument';

interface ReceiptDetailsPageProps {
  /** Donation whose receipt should be rendered (from the route). */
  donationId: string;
}

const formatAmount = (amount: number): string =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

/**
 * Monochrome vector-style action icons drawn with views so they render
 * identically on every platform (text glyphs/emoji render differently
 * per device font).
 */
const DownloadIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.iconDownload}>
    <Text style={[styles.iconDownloadArrow, { color }]}>↓</Text>
    <View style={[styles.iconDownloadTray, { borderColor: color }]} />
  </View>
);

const ShareIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.iconShare}>
    <View style={[styles.iconShareNode, { backgroundColor: color, top: 0, left: 0 }]} />
    <View style={[styles.iconShareNode, { backgroundColor: color, bottom: 0, left: 0 }]} />
    <View style={[styles.iconShareNode, { backgroundColor: color, top: 3, right: 0 }]} />
    <View style={[styles.iconShareLine, { backgroundColor: color, top: 4, left: 5, transform: [{ rotate: '-27deg' }] }]} />
    <View style={[styles.iconShareLine, { backgroundColor: color, bottom: 4, left: 5, transform: [{ rotate: '27deg' }] }]} />
  </View>
);

const PrintIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.iconPrint}>
    <View style={[styles.iconPrintPaper, { borderColor: color }]} />
    <View style={[styles.iconPrintBody, { backgroundColor: color }]}>
      <View style={styles.iconPrintSlot} />
    </View>
  </View>
);

/**
 * Receipt Details page — opened from the donation list "View" button
 * instead of the old receipt popup. Renders the selected donation's
 * receipt, collapsible donation information, download/share/print
 * actions and the closing thank-you card.
 */
export const ReceiptDetailsPage: React.FC<ReceiptDetailsPageProps> = ({
  donationId,
}) => {
  const [receipt, setReceipt] = useState<DonationReceiptModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
      const [infoExpanded, setInfoExpanded] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
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
        // API unreachable — fall back to the preview dataset so the
        // page stays fully functional in visual development.
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
    navigateToDonations();
  };

  const getReceiptFileName = (): string =>
    receipt ? receiptFileName(receipt) : 'HRSJM-Donation-Receipt.pdf';

  const getReceiptSummary = (): string =>
    receipt
      ? [
          `HRSJM Donation Receipt ${receipt.receiptNumber}`,
          `Donor: ${receipt.donorName}`,
          `Amount: ${formatAmount(receipt.amount)}`,
          `Date: ${formatDateTime(receipt.receiptDate)}`,
          `Payment: ${receipt.paymentMethod}`,
        ].join('\n')
      : '';

  const handleDownload = async () => {
    if (!receipt || pendingAction) return;
    console.log('DOWNLOAD BUTTON CLICKED');
    setPendingAction('download');
    setActionMessage(null);
    try {
      console.log('Download receipt started');
      if (Platform.OS !== 'web' || !isWebEnvironment()) {
        // ── Native mobile (Android / iOS) ────────────────────────────────
        // Generate the real PDF on-device and save it to storage
        // (Android: Downloads folder; iOS: documents + native preview).
        // This never opens the share sheet — that is the Share button.
        console.log('Selected donation:', receipt);
        const result = await downloadReceiptPdfNative(receipt);
        console.log('Native download finished:', result);
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
        // ── Web browser ──────────────────────────────────────────────────
        const result = await downloadReceiptPDF(receipt);
        if (result === 'downloaded') {
          setActionMessage('Receipt PDF downloaded.');
        } else if (result === 'opened') {
          setActionMessage(
            'Your browser does not allow direct file saving. The receipt has been opened so you can save it.',
          );
        }
        // 'shared' (iOS save-to-files via share sheet) and 'cancelled' are silent.
      }
    } catch (error) {
      console.error('Receipt download error:', error);
      setActionMessage('Unable to download the receipt PDF. Please try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleShare = async () => {
    if (!receipt || pendingAction) return;
    console.log('SHARE BUTTON CLICKED');
    console.log('SHARE HANDLER STARTED');
    setPendingAction('share');
    setActionMessage(null);
    try {
      if (Platform.OS !== 'web' || !isWebEnvironment()) {
        // ── Native mobile (Android / iOS) ────────────────────────────────
        // Generate the real PDF and hand the actual FILE to the native
        // share sheet (via react-native-share's FileProvider). WhatsApp
        // and every other target app receives the PDF document itself —
        // never receipt text. The Download button is untouched.
        console.log('Selected donation:', receipt);
        setShareStage('generating');
        const result = await shareReceiptPdfNative(receipt);
        console.log('Native share finished:', result);
        // 'cancelled' (user backed out of the share sheet) is silent —
        // a cancel is a normal user action, not an error.
        return;
      }

      // ── Web browser ──────────────────────────────────────────────────────
      const web: any =
        typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      const nav: any = web.navigator;
      const fileName = getReceiptFileName();

      setShareStage('generating');
      const pdf = await generateReceiptPdf(receipt);
      const blob = pdf.output('blob');

      // Try native Web Share API with file support first (mobile Chrome,
      // mobile Safari on web, some desktop Chrome versions).
      if (
        nav?.share &&
        typeof nav.canShare === 'function' &&
        typeof web.File === 'function'
      ) {
        const file = new web.File([blob], fileName, {
          type: 'application/pdf',
        });
        if (nav.canShare({ files: [file] })) {
          setShareStage('sharing');
          try {
            await nav.share({
              files: [file],
              title: 'HRSJM Donation Receipt',
            });
            // Shared successfully (or user cancelled — both are silent).
            return;
          } catch (shareError: any) {
            if (
              shareError?.name === 'AbortError' ||
              shareError?.name === 'NotAllowedError'
            ) {
              return; // User cancelled — normal, no error message.
            }
            // File share was rejected by the browser — fall through to the
            // fallback modal so the user can pick another sharing method.
          }
        }
      }

      // ── Desktop / browser without file-share support ──────────────────
      // Open the share-options modal so the user can choose HOW to share.
      // IMPORTANT: do NOT call saveReceiptBlob here — that downloads, which
      // is the Download button's job, not the Share button's.
      setShareFallbackVisible(true);
    } catch (error: any) {
      console.error('Share Receipt error:', error);
      setActionMessage(
        error?.message === 'Sharing the PDF is not supported on this device.'
          ? error.message
          : 'Unable to share the receipt PDF. Please try again.',
      );
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
        // ── Native mobile (Android / iOS) ────────────────────────────────
        // Printing is not available on native without Expo APIs.
        // Offer the user the option to share the receipt text so they
        // can paste it into an email, WhatsApp, etc. and print from there.
        setActionMessage(
          'Direct printing is not available in the app. Use the Share button to send the receipt and print from another app.',
        );
        return;
      }

      // ── Web browser ──────────────────────────────────────────────────────
      const opened = printReceiptDocument(buildReceiptHtml(receipt));
      if (opened) {
        setActionMessage(null); // Print dialog has been triggered.
      } else {
        // Browser blocked popups / iframe print — hand the user the PDF
        // so they can print or save it from the viewer.
        const result = await downloadReceiptPDF(receipt);
        setActionMessage(
          result === 'cancelled'
            ? null
            : 'Printing is unavailable in this browser. The receipt PDF has been prepared so you can print or save it.',
        );
      }
    } catch {
      setActionMessage('Unable to open the print dialog. Please try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const shareFallbackOptions = [
    {
      label: 'Copy Receipt Link',
      icon: '🔗',
      action: async () => {
        const nav: any =
          typeof globalThis !== 'undefined'
            ? (globalThis as any).navigator
            : undefined;
        const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        const link = web.location?.href ?? '';
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(link);
          setActionMessage('Receipt link copied.');
        } else {
          setActionMessage(link || 'Unable to copy the link.');
        }
      },
    },
    {
      label: 'Copy Receipt Information',
      icon: '📋',
      action: async () => {
        const nav: any =
          typeof globalThis !== 'undefined'
            ? (globalThis as any).navigator
            : undefined;
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(getReceiptSummary());
          setActionMessage('Receipt information copied.');
        } else {
          setActionMessage(getReceiptSummary());
        }
      },
    },
  ];

  const renderInfoRow = (
    label: string,
    value: string | null | undefined,
    emphasize?: boolean,
  ) => (
    <View key={label} style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, emphasize && styles.infoValueStrong]}
      >
        {value || '—'}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Shared HRSJM admin header (same top bar as the Donations screen) */}
      <DonationsTopBar
        paddingTop={insets.top}
        onMenuPress={() => setActionMessage('Menu')}
        onBellPress={() => setActionMessage('You have 3 notifications')}
        onProfilePress={() => setActionMessage('Admin Profile')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + panelHeight + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to Donation"
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back to Donation</Text>
        </TouchableOpacity>

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
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoLetter}>H</Text>
                </View>
                <View style={styles.brandText}>
                  <Text style={styles.orgName}>HRSJM</Text>
                  <Text style={styles.orgFull}>
                    HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
                  </Text>
                  <Text style={styles.orgMotto}>मानव अधिकार • सामाजिक न्याय</Text>
                </View>
              </View>

              <Text style={styles.receiptTitle}>DONATION RECEIPT</Text>

              <View style={styles.receiptMetaRow}>
                <View style={styles.receiptMetaItem}>
                  <Text style={styles.receiptMetaLabel}>Receipt No.</Text>
                  <Text style={styles.receiptMetaValue}>
                    {receipt.receiptNumber}
                  </Text>
                </View>
                <View style={styles.receiptMetaItemRight}>
                  <Text style={styles.receiptMetaLabel}>Date</Text>
                  <Text style={styles.receiptMetaValue}>
                    {formatDateTime(receipt.receiptDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View>
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
                  {infoExpanded ? '⌃' : '⌄'}
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

      {/* Fixed bottom action panel — always visible while the receipt
          content scrolls (moved, not duplicated). */}
      {!isLoading && !hasError && receipt ? (
        <View
          style={styles.bottomBarHost}
          onLayout={event => setPanelHeight(event.nativeEvent.layout.height)}
        >
          <View
            style={[
              styles.bottomPanel,
              { paddingBottom: insets.bottom + Spacing.sm },
            ]}
          >
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
              icon={<DownloadIcon color={AdminColors.textOnDark} />}
              onPress={handleDownload}
              style={styles.primaryAction}
            />
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
                icon={<ShareIcon color={AdminColors.primary} />}
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
                icon={<PrintIcon color={AdminColors.primary} />}
                onPress={handlePrint}
                style={styles.secondaryAction}
              />
            </View>

            {actionMessage ? (
              <Text style={styles.actionMessage}>{actionMessage}</Text>
            ) : null}

            {/* Thank you card — temporarily commented out, keep for later */}
            {/* <View style={[styles.thankYouCard, styles.thankYouInPanel]}>
              <Text style={styles.thankYouTitle}>
                Thank you for your generous support!
              </Text>
              <Text style={styles.thankYouBody}>
                Your contribution helps us in our mission for human rights and
                social justice.
              </Text>
            </View> */}
          </View>
        </View>
      ) : null}

      {/* Desktop share fallback — only shown when the device has no
          native share sheet. */}
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
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
  },
  backChevron: {
    fontSize: 22,
    fontWeight: '700',
    color: AdminColors.primary,
    marginRight: 4,
  },
  backText: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  titleTextWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  subtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: 3,
  },
  statusBadge: {
    marginTop: 4,
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
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 2,
    borderColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  brandText: {
    alignItems: 'flex-start',
  },
  orgName: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  orgFull: {
    fontSize: 9,
    fontWeight: '700',
    color: AdminColors.primary,
    letterSpacing: 0.3,
  },
  orgMotto: {
    fontSize: 10,
    color: AdminColors.accentGold,
  },
  receiptTitle: {
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1,
    color: AdminColors.primary,
    marginBottom: Spacing.sm,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  receiptMetaItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  receiptMetaItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  receiptMetaLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  receiptMetaValue: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: AdminColors.divider,
    marginVertical: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  sectionChevron: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  sectionBody: {
    paddingBottom: Spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: AdminColors.divider,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  infoLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  infoValue: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    flex: 1.3,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  infoValueStrong: {
    color: AdminColors.primaryDark,
    fontWeight: '800',
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
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
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  thankYouInPanel: {
    marginTop: Spacing.xs,
    marginBottom: 0,
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
    backgroundColor: AdminColors.cardSurface,
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
  secondaryActionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xs,
  },
  iconDownload: {
    width: 16,
    height: 16,
    alignItems: 'center',
    marginRight: 6,
  },
  iconDownloadArrow: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
  },
  iconDownloadTray: {
    width: 12,
    height: 6,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 1,
  },
  iconShare: {
    width: 17,
    height: 14,
    marginRight: 6,
  },
  iconShareNode: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconShareLine: {
    position: 'absolute',
    width: 8,
    height: 1.5,
  },
  iconPrint: {
    width: 16,
    height: 15,
    alignItems: 'center',
    marginRight: 6,
  },
  iconPrintPaper: {
    width: 10,
    height: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  iconPrintBody: {
    width: 16,
    height: 9,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPrintSlot: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  actionMessage: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  thankYouCard: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  thankYouTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    textAlign: 'center',
  },
  thankYouBody: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});