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
import { useAuthStore } from '../../../auth/store/authStore';
import {
  navigateToProfileEditPersonal,
  navigateToProfileAdminDetails,
  navigateToProfileIdCard,
  navigateToMembershipApplications,
  navigateToDonations,
} from '../../../../core/navigation/appRouter';
import { useNavigation } from '@react-navigation/native';
import { ProfileSectionCard } from '../components/ProfileSectionCard';
import { ProfileInfoRow } from '../components/ProfileInfoRow';
import { ProfileToast, ToastState } from '../components/ProfileToast';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { EditPersonalInfoModal } from '../components/EditPersonalInfoModal';
import { MyIdCard } from '../components/MyIdCard';
import { Lock, KeyRound, Calendar } from '../../../../core/components/icons';
import {
  PersonIcon,
  MailIcon,
  PhoneIcon,
  IdCardIcon,
  BuildingIcon,
  BadgeCheckIcon,
  ChevronRight,
  DownloadIcon,
  SolidPersonIcon,
  ChevronRightIcon,
} from '../components/ProfileIcons';
import { useIdCardFiles } from '../hooks/useIdCardFiles';

export interface ProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onEditPersonal?: () => void;
  onEditAdminDetails?: () => void;
  onViewIdCard?: () => void;
  onViewMembershipDetails?: () => void;
  onViewStatus?: () => void;
  showIdCard?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigate,
  onEditPersonal,
  onEditAdminDetails,
  onViewIdCard,
  onViewMembershipDetails,
  onViewStatus,
  showIdCard,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const profile = useProfileStore(state => state.profile);
  const updateAvatar = useProfileStore(state => state.updateAvatar);
  const stagedMessage = useProfileStore(state => state.stagedMessage);
  const consumeStagedMessage = useProfileStore(
    state => state.consumeStagedMessage,
  );

  const navigation = useNavigation<any>();
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [editPersonalVisible, setEditPersonalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | ToastState | null>(null);
  const { download, busyAction } = useIdCardFiles({
    onMessage: setToastMessage,
    profile,
  });

  const fetchProfile = useProfileStore(state => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSelectAvatar = async (url: string | null) => {
    await updateAvatar(url);
    setToastMessage({
      message: 'Profile photo updated successfully.',
      variant: 'success',
    });
  };

  // Edit screens stage success messages here before navigating back.
  useEffect(() => {
    if (stagedMessage) {
      const staged = consumeStagedMessage();
      if (staged) {
        setToastMessage({ message: staged, variant: 'success' });
      }
    }
  }, [stagedMessage, consumeStagedMessage]);

  const handleEditPersonal = () => {
    if (onEditPersonal) {
      onEditPersonal();
    } else {
      setEditPersonalVisible(true);
    }
  };

  const handleEditAdminDetails = () => {
    if (onEditAdminDetails) {
      onEditAdminDetails();
    } else if (onNavigate) {
      onNavigate('AdminDetails');
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('AdminDetails');
      } catch {
        // no-op
      }
    }
  };

  const authUser = useAuthStore(state => state.user);
  const authRoleNames = (authUser?.roles ?? []).map(r => (r.name || '').toUpperCase());
  const roleLower = (profile.role || '').toLowerCase();

  const isMember =
    authRoleNames.includes('MEMBER') ||
    roleLower === 'member' ||
    roleLower.includes('member');

  const isAdmin =
    authRoleNames.includes('ADMIN') ||
    authRoleNames.includes('SUPER_ADMIN') ||
    roleLower === 'admin' ||
    roleLower.includes('admin');

  const isSeeker =
    authRoleNames.includes('SEEKER') ||
    authRoleNames.includes('DONATION_SEEKER') ||
    roleLower.includes('seeker') ||
    roleLower.includes('donar seeker') ||
    roleLower.includes('donation seeker');

  // ID Card is available only for Member, Admin, and Donation Seeker.
  // Standard/general users do not have an ID card.
  const isAllowedRoleForIdCard = isMember || isAdmin || isSeeker;
  const canShowIdCard = showIdCard !== undefined ? showIdCard : isAllowedRoleForIdCard;

  const handleMemberDetailsAction = () => {
    if (onViewMembershipDetails) {
      onViewMembershipDetails();
    } else if (onNavigate) {
      onNavigate('MembershipDetails');
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('MembershipDetails');
      } catch {
        // no-op
      }
    }
  };

  const handleViewIdCard = () => {
    if (onViewIdCard) {
      onViewIdCard();
    } else if (onNavigate) {
      onNavigate('MyIdCard');
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('MyIdCard');
      } catch {
        // no-op
      }
    }
  };

  const handleViewStatus = () => {
    if (onViewStatus) {
      onViewStatus();
    } else if (onNavigate) {
      onNavigate('MyApplication');
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('MyApplication');
      } catch {
        // no-op
      }
    }
  };

  // Inline ID card keeps the reference proportions on narrow screens.
  const cardWidth = Math.min(windowWidth - 2 * Spacing.lg - 2 * Spacing.md, 340);

  return (
    <View style={styles.screen}>
      {/* Unified HRSJM Admin Header */}
      <AdminHeader
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          !canShowIdCard && {
            paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xl),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>My Profile</Text>
        <Text style={styles.pageSubtitle}>
          Manage your personal information and account settings.
        </Text>

        {/* Admin summary card with Avatar Pencil Edit */}
        <View style={[styles.summaryCard, { marginTop: Spacing.base }]}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={() => setAvatarPickerVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <AppAvatar
              name={profile.accountName}
              imageUrl={profile.avatar}
              size={50}
            />
            <View style={styles.pencilBadge}>
              <Text style={styles.pencilIcon}>✏️</Text>
            </View>
          </TouchableOpacity>

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
          {canShowIdCard ? (
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
          ) : (
            <TouchableOpacity
              style={styles.myStatusButton}
              onPress={handleViewStatus}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open My Status"
            >
              <SolidPersonIcon size={16} color={AdminColors.primaryDark} />
              <Text style={styles.myStatusButtonText}>My Status</Text>
              <ChevronRightIcon size={14} color={AdminColors.primaryDark} strokeWidth={2.6} />
            </TouchableOpacity>
          )}
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
          />
          <ProfileInfoRow
            icon={<Calendar size={16} color={AdminColors.textSecondary} />}
            label="Date of Birth"
            value={profile.dateOfBirth || 'Not provided'}
            divider={false}
          />
        </ProfileSectionCard>

        {/* Security & Password */}
        <ProfileSectionCard
          icon={<Lock size={18} color={AdminColors.primary} />}
          title="Security & Password"
          backgroundColor={AdminColors.primaryLight}
          onEdit={() => setChangePasswordVisible(true)}
          editLabel="Change"
          style={styles.sectionGap}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setChangePasswordVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Change password"
          >
            <ProfileInfoRow
              icon={<KeyRound size={16} color={AdminColors.textSecondary} />}
              label="Password"
              value="••••••••••••"
              divider={false}
              showValueWithTrailing={true}
              trailing={
                <View style={styles.changePasswordTag}>
                  <Text style={styles.changePasswordTagText}>Change</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </ProfileSectionCard>

        {/* Member details or Admin details based on logged-in role */}
        {isMember ? (
          <ProfileSectionCard
            icon={<IdCardIcon size={18} color={AdminColors.primary} />}
            title="Member Details"
            backgroundColor={AdminColors.primaryLight}
            onEdit={handleMemberDetailsAction}
            editLabel="View"
            style={styles.sectionGap}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleMemberDetailsAction}
              accessibilityRole="button"
              accessibilityLabel="Open Member Details Page"
            >
              <ProfileInfoRow
                icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
                label="Membership Type"
                value={profile.membershipType || 'Individual Member'}
              />
              <ProfileInfoRow
                icon={<IdCardIcon size={16} color={AdminColors.textSecondary} />}
                label="Member ID"
                value={profile.memberId || profile.adminId}
              />
              {profile.memberSince ? (
                <ProfileInfoRow
                  icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
                  label="Member Since"
                  value={profile.memberSince}
                />
              ) : null}
              {profile.validTill ? (
                <ProfileInfoRow
                  icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
                  label="Valid Until"
                  value={profile.validTill}
                />
              ) : null}
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
            </TouchableOpacity>
          </ProfileSectionCard>
        ) : (
          <ProfileSectionCard
            icon={<BuildingIcon size={18} />}
            title={
              isAdmin
                ? 'Admin Details'
                : isSeeker
                ? 'Seeker Details'
                : 'Account Details'
            }
            backgroundColor={AdminColors.primaryLight}
            onEdit={isAdmin ? handleEditAdminDetails : undefined}
            style={styles.sectionGap}
          >
            <ProfileInfoRow
              icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
              label="Role"
              value={profile.role}
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
        )}

        {/* My ID Card section — inline preview of the actual card (Member, Admin, Donation Seeker only) */}
        {canShowIdCard ? (
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
        ) : null}
      </ScrollView>

      {/* Download action — pinned directly above bottom (Member, Admin, Donation Seeker only) */}
      {canShowIdCard ? (
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
      ) : null}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={avatarPickerVisible}
        currentAvatarUrl={profile.avatar}
        onClose={() => setAvatarPickerVisible(false)}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Edit Personal Info Modal */}
      <EditPersonalInfoModal
        visible={editPersonalVisible}
        onClose={() => setEditPersonalVisible(false)}
        onSuccess={() => {
          setEditPersonalVisible(false);
          setToastMessage({
            message: 'Personal information updated successfully.',
            variant: 'success',
          });
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        onSuccess={() => {
          setChangePasswordVisible(false);
          setToastMessage({
            message: 'Password changed successfully.',
            variant: 'success',
          });
        }}
      />

      {/* Floating toast */}
      {toastMessage ? (
        <View style={[styles.toastHost, { top: insets.top + 70 }]}>
          <ProfileToast
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
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
  avatarTouchable: {
    position: 'relative',
  },
  pencilBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  pencilIcon: {
    fontSize: 9.5,
    lineHeight: 11,
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
  myStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 162, 39, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 7.5,
  },
  myStatusButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginHorizontal: 6,
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
    zIndex: 9999,
    elevation: 99,
  },
  changePasswordTag: {
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: AdminColors.primary,
  },
  changePasswordTagText: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: AdminColors.primary,
  },
});

export default ProfileScreen;
