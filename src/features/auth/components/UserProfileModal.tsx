import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../core/theme/spacing';
import { useAuthStore } from '../store/authStore';

export const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onViewFullProfile?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
  onSignOut,
  onViewFullProfile,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);

  const fullName = user?.full_name || 'Aman Shaikh';
  const role = user?.roles?.[0]?.name || 'SUPER_ADMIN';
  const email = user?.email || 'admin@hrsjm.org';
  const phone = user?.mobile_number || '+91 98765 43210';
  const status = user?.status || 'ACTIVE';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '15 Jan 2026';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.card,
            { marginBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>User Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar & Main Info */}
            <View style={styles.profileHero}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: user?.avatar || DEFAULT_ADMIN_AVATAR }}
                  style={styles.avatar}
                />
                <View style={styles.statusDot} />
              </View>

              <Text style={styles.name}>{fullName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{role.replace(/_/g, ' ')}</Text>
              </View>
            </View>

            {/* Information Grid */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{phone}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Admin ID</Text>
                <Text style={styles.infoValue}>
                  {user?.id ? user.id.substring(0, 12).toUpperCase() : 'HRSJM-ADM-001'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{joinedDate}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onViewFullProfile ? (
                <TouchableOpacity
                  style={styles.fullProfileButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onViewFullProfile();
                  }}
                >
                  <Text style={styles.fullProfileIcon}>👤</Text>
                  <Text style={styles.fullProfileText}>
                    Open Full Profile & ID Card
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.signOutButton}
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onSignOut();
                }}
              >
                <Text style={styles.signOutIcon}>🚪</Text>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    ...Typography.cardTitle,
    fontSize: 18,
    color: '#0F2C59',
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    color: AdminColors.textSecondary,
    fontWeight: '700',
  },
  profileHero: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    backgroundColor: '#CBD5E1',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  name: {
    ...Typography.screenTitle,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2C59',
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    ...Typography.secondaryMedium,
    color: '#64748B',
    fontSize: 13,
  },
  infoValue: {
    ...Typography.bodyBold,
    color: '#0F2C59',
    fontSize: 13,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },
  actions: {
    marginTop: Spacing.sm,
    gap: 8,
  },
  fullProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  fullProfileIcon: {
    fontSize: 16,
  },
  fullProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  signOutIcon: {
    fontSize: 16,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
