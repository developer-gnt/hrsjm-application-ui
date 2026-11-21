import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import {
  X,
  Camera,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from '../../../../core/components/icons';
import { QrCode } from './QrCode';
import type { AdminProfile } from '../types/profile.types';

export interface QrModalProps {
  visible: boolean;
  profile: AdminProfile;
  effectiveId: string;
  onClose: () => void;
  onVerifyThisCard: (token: string) => void;
  onOpenScanner: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  visible,
  profile,
  effectiveId,
  onClose,
  onVerifyThisCard,
  onOpenScanner,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={20} color="#CAA048" />
              </View>
              <View>
                <Text style={styles.title}>Official Member QR Code</Text>
                <Text style={styles.subtitle}>Digital Verification Credential</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close QR modal"
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* QR Display */}
          <View style={styles.body}>
            <View style={styles.qrContainer}>
              <QrCode size={190} data={effectiveId} />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.nameText}>{profile.fullName || profile.accountName || 'Member'}</Text>
              <Text style={styles.typeText}>{profile.membershipType || 'Executive Member'}</Text>
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>ID: {effectiveId}</Text>
              </View>
            </View>

            <Text style={styles.instructionText}>
              Scan this QR code with any device camera or scanner to verify live membership validity in the HRSJM Central Registry.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <AppButton
              title="Verify Live Status Now"
              variant="primary"
              size="md"
              icon={<ShieldCheck size={18} color="#082046" />}
              onPress={() => onVerifyThisCard(effectiveId)}
              style={styles.verifyBtn}
            />

            <AppButton
              title="Open QR Scanner"
              variant="outline"
              size="md"
              icon={<Camera size={18} color="#082046" />}
              onPress={onOpenScanner}
              style={styles.scannerBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 23, 53, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FAF7F0',
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.cardLarge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#031735',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CAA048',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#082046',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#855B14',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: '#CAA048',
    ...Shadows.card,
  },
  infoBox: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#082046',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  idChip: {
    backgroundColor: '#0F2860',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  idChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FAD465',
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    gap: 8,
  },
  verifyBtn: {
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAD465',
  },
  scannerBtn: {
    borderRadius: BorderRadius.lg,
  },
});

export default QrModal;
