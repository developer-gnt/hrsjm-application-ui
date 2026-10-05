/**
 * Admin My Profile screen — the existing HRSJM header and bottom
 * navigation wrap the page title, admin summary card, Personal
 * Information card, Admin Details card and the My ID Card section.
 * The Download ID Card button sits directly above the bottom
 * navigation (matching the reference) and generates the real PDF via
 * `useIdCardFiles`.
 */
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import {
  AdminColors,
  AppAvatar,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppBadge } from '../../../../core/components/common/AppBadge';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useProfileStore } from '../profileStore';
import { ProfileSectionCard } from '../components/ProfileSectionCard';
import { ProfileInfoRow } from '../components/ProfileInfoRow';
import { ProfileToast } from '../components/ProfileToast';
import { MyIdCard } from '../components/MyIdCard';
import {
  PersonIcon,
  MailIcon,
  PhoneIcon,
  IdCardIcon,
  BuildingIcon,
  BadgeCheckIcon,
  ChevronRight,
  DownloadIcon,
} from '../components/ProfileIcons';
import { useIdCardFiles } from '../hooks/useIdCardFiles';

export interface ProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onEditPersonal?: () => void;
  onEditAdminDetails?: () => void;
  onViewIdCard?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigate,
  onEditPersonal,
  onEditAdminDetails,
  onViewIdCard,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const profile = useProfileStore(state => state.profile);
  const consumeStagedMessage = useProfileStore(
    state => state.consumeStagedMessage,
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { download, busyAction } = useIdCardFiles({
    onMessage: setToastMessage,
  });

  // Toast auto-dismiss (same 3.5s cadence as the Donations screen).
  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Edit screens stage success messages here before navigating back.
  useEffect(() => {
    const staged = consumeStagedMessage();
    if (staged) {
      setToastMessage(staged);
    }
  }, [consumeStagedMessage]);

  const handleEditPersonal = () => {
    if (onEditPersonal) {
      onEditPersonal();
    } else if (onNavigate) {
      onNavigate('EditPersonalInfo');
    }
  };

  const handleEditAdminDetails = () => {
    if (onEditAdminDetails) {
      onEditAdminDetails();
    } else if (onNavigate) {
      onNavigate('AdminDetails');
    }
  };

  const handleViewIdCard = () => {
    if (onViewIdCard) {
      onViewIdCard();
    } else if (onNavigate) {
      onNavigate('MyIdCard');
    }
  };

  // Inline ID card keeps the reference proportions on narrow screens.
  const cardWidth = Math.min(windowWidth - 2 * Spacing.lg - 2 * Spacing.md, 340);

  return (
    <View style={styles.screen}>
      {/* Unified HRSJM Admin Header */}
      <AdminHeader
        title="My Profile"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>My Profile</Text>
        <Text style={styles.pageSubtitle}>
          Manage your personal information and account settings.
        </Text>

        {/* Admin summary card */}
        <View style={[styles.summaryCard, { marginTop: Spacing.base }]}>
          <AppAvatar name={profile.accountName} size={46} />
          <View style={styles.summaryIdentity}>
            <Text style={styles.summaryName} numberOfLines={1}>
              {profile.accountName}
            </Text>
            <Text style={styles.summaryRole} numberOfLines={1}>
              {profile.role}
            </Text>
            <View style={styles.adminIdBadge}>
              <Text style={styles.adminIdText}>{profile.adminId}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.myIdButton}
            onPress={handleViewIdCard}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open My ID Card"
          >
            <IdCardIcon size={13} color={AdminColors.primaryDark} />
            <Text style={styles.myIdButtonText}>My ID</Text>
            <ChevronRight size={13} color={AdminColors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Personal information */}
        <ProfileSectionCard
          icon={<PersonIcon size={18} />}
          title="Personal Information"
          backgroundColor={AdminColors.primaryLight}
          onEdit={handleEditPersonal}
          style={styles.sectionGap}
        >
          <ProfileInfoRow
            icon={<PersonIcon size={16} color={AdminColors.textSecondary} />}
            label="Full Name"
            value={profile.fullName}
          />
          <ProfileInfoRow
            icon={<MailIcon size={16} color={AdminColors.textSecondary} />}
            label="Email Address"
            value={profile.email}
          />
          <ProfileInfoRow
            icon={<PhoneIcon size={16} color={AdminColors.textSecondary} />}
            label="Phone Number"
            value={profile.phone}
            divider={false}
          />
        </ProfileSectionCard>

        {/* Admin details */}
        <ProfileSectionCard
          icon={<BuildingIcon size={18} />}
          title="Admin Details"
          backgroundColor={AdminColors.primaryLight}
          onEdit={handleEditAdminDetails}
          style={styles.sectionGap}
        >
          <ProfileInfoRow
            icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
            label="Role"
            value={profile.role}
          />
          <ProfileInfoRow
            icon={<PersonIcon size={16} color={AdminColors.textSecondary} />}
            label="Department"
            value={profile.department}
          />
          <ProfileInfoRow
            icon={<BadgeCheckIcon size={16} />}
            label="Account Status"
            value={profile.accountStatus}
            divider={false}
            trailing={
              <AppBadge
                label={profile.accountStatus}
                status={
                  profile.accountStatus === 'Active' ? 'ACTIVE' : 'INACTIVE'
                }
                textStyle={{ textTransform: 'none' }}
              />
            }
          />
        </ProfileSectionCard>

        {/* My ID Card section — inline preview of the actual card */}
        <View style={[styles.sectionGap, styles.idCardSection]}>
          <View style={styles.idCardSectionHeader}>
            <IdCardIcon size={18} />
            <Text style={styles.idCardSectionTitle}>My ID Card</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleViewIdCard}
            accessibilityRole="button"
            accessibilityLabel="Open the full My ID Card page"
            style={styles.idCardWrap}
          >
            <MyIdCard profile={profile} width={cardWidth} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Download action — pinned directly above bottom */}
      <View style={[styles.downloadPanel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton
          title={
            busyAction === 'download' ? 'Generating PDF...' : 'Download ID Card'
          }
          variant="primary"
          size="md"
          loading={busyAction === 'download'}
          disabled={busyAction !== null}
          icon={<DownloadIcon color={AdminColors.textOnDark} />}
          onPress={() => download(profile)}
          style={styles.downloadButton}
        />
      </View>

      {/* Floating toast */}
      {toastMessage ? (
        <View style={[styles.toastHost, { top: insets.top + 70 }]}>
          <ProfileToast message={toastMessage} />
        </View>
      ) : null}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    // Reserve room so cards never hide behind the download panel and
    // bottom navigation.
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: 3,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  summaryIdentity: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  summaryName: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
    fontWeight: '700',
  },
  summaryRole: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 1,
  },
  adminIdBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AdminColors.divider,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: 5,
  },
  adminIdText: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  myIdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.45)',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
  },
  myIdButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginHorizontal: 4,
  },
  sectionGap: {
    marginTop: Spacing.md,
  },
  idCardSection: {
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.35)',
    padding: Spacing.md,
  },
  idCardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  idCardSectionTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    marginLeft: Spacing.sm,
  },
  idCardWrap: {
    alignItems: 'center',
  },
  downloadPanel: {
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  downloadButton: {
    minHeight: 48,
    borderRadius: BorderRadius.lg,
  },
  toastHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
    elevation: 20,
  },
});

export default ProfileScreen;
