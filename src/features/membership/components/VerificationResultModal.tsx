import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../core';
import { AppBadge } from '../../../core/components/common/AppBadge';
import { AppButton } from '../../../core/components/common/AppButton';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  X,
  RefreshCw,
  Camera,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Clock,
} from '../../../core/components/icons';
import type { MemberVerificationData, CardValidityStatus } from '../services/memberVerificationService';
import { Barcode } from '../../admin/profile/components/Barcode';

export interface VerificationResultModalProps {
  visible: boolean;
  data: MemberVerificationData | null;
  loading?: boolean;
  onClose: () => void;
  onScanAnother: () => void;
  onRetry: () => void;
}

export const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
  visible,
  data,
  loading = false,
  onClose,
  onScanAnother,
  onRetry,
}) => {
  if (!visible || !data) {
    return null;
  }

  const validity: CardValidityStatus = data.cardValidity || 'INVALID';

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
          subtitle: data.message || 'No matching active member found for this verification code.',
          color: '#BE123C',
          bg: '#FFF1F2',
          border: '#FECDD3',
          icon: <ShieldAlert size={24} color="#BE123C" strokeWidth={2.5} />,
        };
    }
  };

  const statusConfig = getStatusBadge();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Drag Handle & Close */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeft}>
              <View style={styles.headerSealWrap}>
                <ShieldCheck size={20} color="#CAA048" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Central Verification Registry</Text>
                <Text style={styles.headerSubtitle}>Real-time Database Record</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close verification"
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                <Text style={styles.statusSubtitle}>
                  {statusConfig.subtitle}
                </Text>
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
                  <Text style={styles.idBadgeText}>{data.memberId || '—'}</Text>
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
                      ? 'INACTIVE'
                      : 'PENDING'
                  }
                  textStyle={{ textTransform: 'none' }}
                />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Renewal Status</Text>
                <View
                  style={[
                    styles.renewalBadge,
                    {
                      backgroundColor:
                        data.renewalStatus === 'RENEWAL_REQUIRED' || data.renewalStatus === 'EXPIRED'
                          ? '#FEF2F2'
                          : '#EFF6FF',
                      borderColor:
                        data.renewalStatus === 'RENEWAL_REQUIRED' || data.renewalStatus === 'EXPIRED'
                          ? '#FECACA'
                          : '#BFDBFE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.renewalBadgeText,
                      {
                        color:
                          data.renewalStatus === 'RENEWAL_REQUIRED' || data.renewalStatus === 'EXPIRED'
                            ? '#DC2626'
                            : '#1D4ED8',
                      },
                    ]}
                  >
                    {data.renewalStatus || 'CURRENT'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Card Validity</Text>
                <View
                  style={[
                    styles.validityPill,
                    {
                      backgroundColor:
                        validity === 'VALID'
                          ? '#D1FAE5'
                          : validity === 'EXPIRED'
                          ? '#FEF3C7'
                          : validity === 'SUSPENDED'
                          ? '#FEE2E2'
                          : '#FFE4E6',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.validityPillText,
                      {
                        color:
                          validity === 'VALID'
                            ? '#065F46'
                            : validity === 'EXPIRED'
                            ? '#92400E'
                            : validity === 'SUSPENDED'
                            ? '#991B1B'
                            : '#9F1239',
                      },
                    ]}
                  >
                    {validity}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Expiry Date */}
              <View style={styles.infoRow}>
                <View style={styles.labelWithIcon}>
                  <Calendar size={14} color="#64748B" />
                  <Text style={styles.infoLabel}>Valid Till</Text>
                </View>
                <Text style={styles.infoValue}>{data.expiryDate || 'Lifetime'}</Text>
              </View>

              {/* Joining Date */}
              {data.joiningDate ? (
                <View style={styles.infoRow}>
                  <View style={styles.labelWithIcon}>
                    <Clock size={14} color="#64748B" />
                    <Text style={styles.infoLabel}>Member Since</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {new Date(data.joiningDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Embedded Code 128 Barcode */}
            {validity !== 'INVALID' && data.memberId ? (
              <View style={styles.barcodeSection}>
                <Text style={styles.barcodeTitle}>Accredited Code 128 Machine Barcode</Text>
                <View style={styles.barcodeBox}>
                  <Barcode
                    value={data.memberId}
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

            {/* Live Timestamp Stamp */}
            <View style={styles.verifiedStampBox}>
              <Text style={styles.stampText}>
                Verified live from central database on{' '}
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}{' '}
                · Official Credential
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerActions}>
            <AppButton
              title="Scan Another Card"
              variant="primary"
              size="lg"
              icon={<Camera size={18} color="#082046" />}
              onPress={onScanAnother}
              style={styles.actionButtonPrimary}
            />
            <View style={styles.secondaryActionsRow}>
              <AppButton
                title={loading ? 'Refreshing...' : 'Retry Verification'}
                variant="outline"
                size="md"
                loading={loading}
                icon={<RefreshCw size={15} color="#082046" />}
                onPress={onRetry}
                style={styles.actionButtonSecondary}
              />
              <AppButton
                title="Done"
                variant="outline"
                size="md"
                onPress={onClose}
                style={styles.actionButtonDone}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 23, 53, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FAF7F0',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
    ...Shadows.cardLarge,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSealWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#031735',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CAA048',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#082046',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#855B14',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingVertical: Spacing.base,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: 12,
  },
  statusIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusSubtitle: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.base,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#082046',
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
    paddingVertical: 5,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  infoValueBold: {
    fontSize: 13.5,
    color: '#082046',
    fontWeight: '800',
  },
  idBadgeWrap: {
    backgroundColor: '#0F2860',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FAD465',
    letterSpacing: 0.5,
  },
  renewalBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  renewalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  validityPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  validityPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  barcodeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    alignItems: 'center',
    ...Shadows.card,
  },
  barcodeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  barcodeBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  verifiedStampBox: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.xs,
  },
  stampText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: Spacing.xs,
  },
  actionButtonPrimary: {
    borderRadius: BorderRadius.lg,
    minHeight: 48,
    backgroundColor: '#FAD465',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonSecondary: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    minHeight: 42,
  },
  actionButtonDone: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    minHeight: 42,
  },
});

export default VerificationResultModal;
