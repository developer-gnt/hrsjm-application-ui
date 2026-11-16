import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../core';
import { AppBadge } from '../../../core/components/common/AppBadge';
import { AppButton } from '../../../core/components/common/AppButton';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Camera,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Search,
} from '../../../core/components/icons';
import {
  memberVerificationService,
  type MemberVerificationData,
  type CardValidityStatus,
} from '../services/memberVerificationService';
import { LiveQrScannerModal } from '../components/LiveQrScannerModal';
import { Barcode } from '../../admin/profile/components/Barcode';

export interface MemberVerificationScreenProps {
  initialToken?: string;
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

export const MemberVerificationScreen: React.FC<MemberVerificationScreenProps> = ({
  initialToken,
  onBack,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const [currentToken, setCurrentToken] = useState(initialToken || '');
  const [inputToken, setInputToken] = useState(initialToken || '');
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [data, setData] = useState<MemberVerificationData | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const performVerification = useCallback(async (tokenToVerify: string) => {
    const clean = tokenToVerify.trim();
    if (!clean) return;
    setLoading(true);
    try {
      const result = await memberVerificationService.verifyMember(clean);
      setData(result);
    } catch {
      setData({
        cardValidity: 'INVALID',
        isAuthentic: false,
        memberId: clean,
        membershipStatus: 'INVALID',
        renewalStatus: 'EXPIRED',
        verifiedAt: new Date().toISOString(),
        message: 'Network error or unable to reach verification registry.',
        rawScannedPayload: clean,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialToken) {
      performVerification(initialToken);
    }
  }, [initialToken, performVerification]);

  const handleManualSearch = () => {
    if (inputToken.trim()) {
      setCurrentToken(inputToken.trim());
      performVerification(inputToken.trim());
    }
  };

  const validity: CardValidityStatus = data?.cardValidity || 'INVALID';

  const getStatusBadge = () => {
    switch (validity) {
      case 'VALID':
        return {
          title: 'OFFICIALLY VALID & ACTIVE',
          subtitle: 'Verified authentic credential in central HRSJM registry.',
          color: '#059669',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          icon: <CheckCircle2 size={24} color="#059669" strokeWidth={2.5} />,
        };
      case 'EXPIRED':
        return {
          title: 'MEMBERSHIP EXPIRED',
          subtitle: 'Card validity has lapsed. Renewal is required to reactivate privileges.',
          color: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
          icon: <AlertTriangle size={24} color="#D97706" strokeWidth={2.5} />,
        };
      case 'SUSPENDED':
        return {
          title: 'MEMBERSHIP SUSPENDED',
          subtitle: 'This membership card has been temporarily revoked or suspended by administration.',
          color: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          icon: <ShieldX size={24} color="#DC2626" strokeWidth={2.5} />,
        };
      case 'PENDING':
        return {
          title: 'MEMBERSHIP PENDING APPROVAL',
          subtitle: 'Application is undergoing verification and committee review.',
          color: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          icon: <Clock size={24} color="#2563EB" strokeWidth={2.5} />,
        };
      default:
        return {
          title: 'INVALID OR UNREGISTERED',
          subtitle: data?.message || 'No matching active member found for this verification code.',
          color: '#BE123C',
          bg: '#FFF1F2',
          border: '#FECDD3',
          icon: <ShieldAlert size={24} color="#BE123C" strokeWidth={2.5} />,
        };
    }
  };

  const statusConfig = getStatusBadge();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={22} color="#082046" />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Central Member Registry</Text>
          <Text style={styles.headerSubtitle}>Real-time Verification Portal</Text>
        </View>
        <View style={styles.headerBadge}>
          <ShieldCheck size={18} color="#CAA048" />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Token Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Member ID (e.g. ADMIN529, HRSJM-00049)"
            placeholderTextColor="#94A3B8"
            value={inputToken}
            onChangeText={setInputToken}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleManualSearch}
            accessibilityRole="button"
            accessibilityLabel="Verify entered code"
          >
            <Search size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scanLauncherButton}
            onPress={() => setShowScanner(true)}
            accessibilityRole="button"
            accessibilityLabel="Open live camera scanner"
          >
            <Camera size={18} color="#082046" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#082046" />
            <Text style={styles.loadingText}>Fetching database record...</Text>
          </View>
        ) : data ? (
          <>
            {/* Status Banner */}
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor: statusConfig.bg,
                  borderColor: statusConfig.border,
                },
              ]}
            >
              <View style={styles.statusIconWrap}>{statusConfig.icon}</View>
              <View style={styles.statusTextWrap}>
                <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
                  {statusConfig.title}
                </Text>
                <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
              </View>
            </View>

            {/* Member Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.cardHeaderRow}>
                <User size={18} color="#082046" />
                <Text style={styles.cardHeaderTitle}>Membership Credentials</Text>
              </View>

              <View style={styles.divider} />

              {/* Member Name */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Name</Text>
                <Text style={styles.infoValueBold}>{data.memberName || '—'}</Text>
              </View>

              {/* Member ID */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member ID / Code</Text>
                <View style={styles.idBadgeWrap}>
                  <Text style={styles.idBadgeText}>{data.memberId || currentToken || '—'}</Text>
                </View>
              </View>

              {/* Membership Type */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Membership Type</Text>
                <Text style={styles.infoValue}>{data.membershipType || 'Executive Member'}</Text>
              </View>

              <View style={styles.divider} />

              {/* Independent Status Indicators */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Membership Status</Text>
                <AppBadge
                  label={data.membershipStatus || 'ACTIVE'}
                  status={
                    data.membershipStatus === 'ACTIVE'
                      ? 'ACTIVE'
                      : data.membershipStatus === 'SUSPENDED'
                      ? 'REJECTED'
                      : 'INACTIVE'
                  }
                  textStyle={{ textTransform: 'none' }}
                />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Renewal Status</Text>
                <AppBadge
                  label={data.renewalStatus || 'ACTIVE'}
                  status={
                    data.renewalStatus === 'ACTIVE'
                      ? 'ACTIVE'
                      : data.renewalStatus === 'PENDING'
                      ? 'PENDING'
                      : 'INACTIVE'
                  }
                  textStyle={{ textTransform: 'none' }}
                />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Card Validity</Text>
                <View
                  style={[
                    styles.validityBadge,
                    {
                      backgroundColor: statusConfig.bg,
                      borderColor: statusConfig.border,
                    },
                  ]}
                >
                  <Text style={[styles.validityBadgeText, { color: statusConfig.color }]}>
                    {validity}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Validity Period */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Card Expiry Date</Text>
                <View style={styles.rowInline}>
                  <Calendar size={14} color="#64748B" style={styles.inlineIcon} />
                  <Text style={styles.infoValue}>{data.validTill || '31 Dec 2027'}</Text>
                </View>
              </View>

              {data.memberSince ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <View style={styles.rowInline}>
                    <CreditCard size={14} color="#64748B" style={styles.inlineIcon} />
                    <Text style={styles.infoValue}>{data.memberSince}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Embedded Code 128 Machine Barcode */}
            {validity !== 'INVALID' && (data.memberId || currentToken) ? (
              <View style={styles.barcodeCard}>
                <Text style={styles.barcodeLabel}>Accredited Code 128 Machine Barcode</Text>
                <View style={styles.barcodeInner}>
                  <Barcode
                    value={data.memberId || currentToken}
                    width={220}
                    height={42}
                    showText={true}
                    fontSize={11}
                    lineColor="#011F39"
                    backgroundColor="#FFFFFF"
                  />
                </View>
              </View>
            ) : null}

            {/* Official Verification Seal Footer */}
            <View style={styles.sealFooter}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.sealFooterText}>
                Verified via central database at{' '}
                {new Date(data.verifiedAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <ShieldCheck size={40} color="#CAA048" />
            </View>
            <Text style={styles.emptyTitle}>Verify Official HRSJM Member</Text>
            <Text style={styles.emptySubtitle}>
              Scan an ID card QR / barcode with the camera or enter a member identifier above to retrieve the live database verification status.
            </Text>
            <AppButton
              title="Open Live Scanner"
              variant="primary"
              size="lg"
              icon={<Camera size={18} color="#082046" />}
              onPress={() => setShowScanner(true)}
              style={styles.emptyButton}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <AppButton
            title="Scan Another Card"
            variant="primary"
            size="lg"
            icon={<Camera size={18} color="#082046" />}
            onPress={() => setShowScanner(true)}
            style={styles.primaryAction}
          />
          {currentToken ? (
            <AppButton
              title="Refresh Verification"
              variant="outline"
              size="lg"
              icon={<RefreshCw size={16} color="#082046" />}
              onPress={() => performVerification(currentToken)}
              style={styles.secondaryAction}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Live QR / Barcode Scanner Modal */}
      <LiveQrScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={async (scannedToken) => {
          setShowScanner(false);
          setCurrentToken(scannedToken);
          setInputToken(scannedToken);
          await performVerification(scannedToken);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    fontWeight: '800',
    color: '#082046',
  },
  headerSubtitle: {
    ...Typography.secondary,
    fontSize: 12,
    color: '#64748B',
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#0F172A',
    paddingHorizontal: Spacing.xs,
  },
  searchButton: {
    backgroundColor: '#082046',
    borderRadius: BorderRadius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  scanLauncherButton: {
    backgroundColor: '#FAD465',
    borderRadius: BorderRadius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: '#64748B',
    marginTop: Spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  statusIconWrap: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusSubtitle: {
    ...Typography.secondary,
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 17,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.base,
    ...Shadows.cardMedium,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  cardHeaderTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: '#082046',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  infoLabel: {
    ...Typography.secondaryMedium,
    color: '#64748B',
    fontSize: 13,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '600',
  },
  infoValueBold: {
    ...Typography.bodyBold,
    color: '#082046',
    fontSize: 15,
  },
  idBadgeWrap: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idBadgeText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 13,
    color: '#082046',
    letterSpacing: 0.5,
  },
  validityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  validityBadgeText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    marginRight: 6,
  },
  sealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 6,
    marginBottom: Spacing.base,
  },
  barcodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.base,
    alignItems: 'center',
    ...Shadows.card,
  },
  barcodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  barcodeInner: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  sealFooterText: {
    ...Typography.secondary,
    color: '#065F46',
    fontSize: 11.5,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.base,
    ...Shadows.cardMedium,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.screenTitle,
    fontSize: 17,
    color: '#082046',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: BorderRadius.lg,
  },
  buttonGroup: {
    gap: Spacing.sm,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAD465',
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: BorderRadius.lg,
  },
});

export default MemberVerificationScreen;
