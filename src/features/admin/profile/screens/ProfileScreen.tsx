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
  FontFamilies,
} from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppBadge } from '../../../../core/components/common/AppBadge';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useProfileStore } from '../profileStore';
import { AdminProfile } from '../types/profile.types';
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
import { Lock, KeyRound, Calendar, BadgeCheck } from '../../../../core/components/icons';
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
import { useMembership } from '../../../membership/context/MembershipContext';
import { ApplicationStatusStepper } from '../../../membership/components/stepper';

export interface ProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onEditPersonal?: () => void;
  onEditAdminDetails?: () => void;
  onViewIdCard?: () => void;
  onViewMembershipDetails?: () => void;
  onViewStatus?: () => void;
  onJoinMembership?: () => void;
  showIdCard?: boolean;
  headerComponent?: React.ReactNode;
  /** When true, forces member profile mode (never shows Join Membership button, shows My Status instead). */
  isMemberProfile?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigate,
  onEditPersonal,
  onEditAdminDetails,
  onViewIdCard,
  onViewMembershipDetails,
  onViewStatus,
  onJoinMembership,
  showIdCard,
  headerComponent,
  isMemberProfile,
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

  const isApproved =
    profile.membershipStatus === 'Approved' ||
    profile.membershipStatus === 'Active';

  const isMember =
    (authRoleNames.includes('MEMBER') || roleLower === 'member') && isApproved;

  const isMemberContext = Boolean(
    isMemberProfile !== undefined
      ? isMemberProfile
      : (roleLower === 'member' || authRoleNames.includes('MEMBER'))
  );

  const isPlainUser =
    !isMemberContext &&
    (authRoleNames.includes('USER') ||
      roleLower === 'user' ||
      (!isAdmin && !isSeeker && !isApproved));

  // ID Card is available for Approved Members, Admins, Donation Seekers, or Member Profile context.
  // Standard/general users and applicants whose membership is not approved NEVER have an ID card.
  const isAllowedRoleForIdCard = (isMember || isAdmin || isSeeker || isMemberContext) && !isPlainUser;
  const canShowIdCard = showIdCard !== undefined ? (showIdCard && !isPlainUser) : isAllowedRoleForIdCard;

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

  const membershipCtx = useMembership();
  const hasApplied =
    Boolean(
      profile.hasAppliedMembership ||
      membershipCtx.hasApplied ||
      membershipCtx.activeApplication ||
      (membershipCtx.applications && membershipCtx.applications.length > 0)
    );

  const currentAppStatus =
    profile.membershipStatus ||
    membershipCtx.activeApplication?.status ||
    (membershipCtx.applications[0]?.status) ||
    'Applied';

  const effectiveMemberId =
    profile.memberId ||
    membershipCtx.activeApplication?.applicationId ||
    (membershipCtx.applications && membershipCtx.applications[0]?.applicationId) ||
    'HRSJM-47611';

  const effectiveMembershipType =
    profile.membershipType ||
    membershipCtx.activeApplication?.membershipType ||
    'Individual Member';

  const cardProfile: AdminProfile = {
    ...profile,
    fullName: profile.fullName || profile.accountName || 'Member',
    memberId: effectiveMemberId,
    adminId: profile.adminId || effectiveMemberId,
    membershipType: effectiveMembershipType,
    accountStatus: profile.accountStatus || 'Active',
    validTill: profile.validTill || '31 Dec 2027',
    memberSince: profile.memberSince || '12 Oct 2024',
  };

  const rejectionReason =
    profile.rejectionReason ||
    membershipCtx.activeApplication?.rejectionReason ||
    (membershipCtx.applications[0]?.rejectionReason) ||
    'Incomplete documents';

  const handleJoinMembership = () => {
    if (onJoinMembership) {
      onJoinMembership();
    } else if (onNavigate) {
      onNavigate('MembershipCategories');
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('MembershipCategories');
      } catch {
        // no-op
      }
    }
  };

  // Inline ID card keeps the reference proportions on narrow screens.
  const cardWidth = Math.min(windowWidth - 2 * Spacing.lg - 2 * Spacing.base, 336);

  return (
    <View style={styles.screen}>
      {headerComponent ? (
        headerComponent
      ) : (
        <AdminHeader
          showBack={Boolean(onBack)}
          onBack={onBack}
          onNavigate={onNavigate}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          (!canShowIdCard || isMemberContext) && {
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
            {canShowIdCard && Boolean(profile.adminId) ? (
              <View style={styles.adminIdBadge}>
                <Text style={styles.adminIdText}>{profile.adminId}</Text>
              </View>
            ) : null}
          </View>
          {isMemberContext ? null : canShowIdCard ? (
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
          ) : hasApplied ? (
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
          ) : (
            <TouchableOpacity
              style={styles.joinMembershipButton}
              onPress={handleJoinMembership}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Join Membership"
            >
              <Text style={styles.joinMembershipIcon}>✦</Text>
              <Text style={styles.joinMembershipButtonText}>Join Membership</Text>
              <ChevronRightIcon size={14} color="#0F2860" strokeWidth={2.6} />
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

        {/* Application Status Card for User who has applied or in member profile */}
        {(hasApplied || isMemberContext) ? (
          <ProfileSectionCard
            icon={<BadgeCheckIcon size={18} color="#0F2860" />}
            title="Application Status"
            backgroundColor={AdminColors.primaryLight}
            onEdit={handleViewStatus}
            editLabel="View Details"
            style={styles.sectionGap}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleViewStatus}
              accessibilityRole="button"
              accessibilityLabel="Open Application Status"
            >
              <ProfileInfoRow
                icon={<BuildingIcon size={16} color={AdminColors.textSecondary} />}
                label="Application Type"
                value={effectiveMembershipType}
              />
              <ProfileInfoRow
                icon={<IdCardIcon size={16} color={AdminColors.textSecondary} />}
                label="Application ID"
                value={effectiveMemberId}
              />
              <ProfileInfoRow
                icon={<Calendar size={16} color={AdminColors.textSecondary} />}
                label="Status"
                value={currentAppStatus}
                divider={isMemberContext || Boolean(currentAppStatus === 'Rejected')}
                trailing={
                  <View
                    style={[
                      styles.statusPillBadge,
                      currentAppStatus === 'Approved'
                        ? styles.statusPillApproved
                        : currentAppStatus === 'Rejected'
                          ? styles.statusPillRejected
                          : currentAppStatus === 'Under Review'
                            ? styles.statusPillReview
                            : styles.statusPillApplied,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        currentAppStatus === 'Approved'
                          ? styles.statusPillTextApproved
                          : currentAppStatus === 'Rejected'
                            ? styles.statusPillTextRejected
                            : currentAppStatus === 'Under Review'
                              ? styles.statusPillTextReview
                              : styles.statusPillTextApplied,
                      ]}
                    >
                      {currentAppStatus}
                    </Text>
                  </View>
                }
              />
              {currentAppStatus === 'Rejected' ? (
                <View style={styles.rejectionNoticeBox}>
                  <Text style={styles.rejectionNoticeLabel}>Reason for Rejection:</Text>
                  <Text style={styles.rejectionNoticeText}>{rejectionReason}</Text>
                  <TouchableOpacity
                    style={styles.profileReapplyButton}
                    onPress={() => {
                      membershipCtx.reapply();
                      if (onJoinMembership) {
                        onJoinMembership();
                      } else if (onNavigate) {
                        onNavigate('MembershipCategories');
                      } else if (navigation?.navigate) {
                        navigation.navigate('MembershipCategories');
                      }
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Re-apply for Membership"
                  >
                    <Text style={styles.profileReapplyButtonText}>Re-apply for Membership</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Inline ID card of the member in this section */}
            {isMemberContext ? (
              <View style={styles.inlineIdCardSection}>
                <View style={styles.inlineIdCardHeader}>
                  <View style={styles.inlineIdCardHeaderLeft}>
                    <IdCardIcon size={16} color="#0F2860" />
                    <Text style={styles.inlineIdCardTitle}>Member ID Card</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleViewIdCard}
                    style={styles.inlineIdCardViewLink}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="View full ID Card"
                  >
                    <Text style={styles.inlineIdCardViewText}>Full View</Text>
                    <ChevronRight size={13} color="#0F2860" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={handleViewIdCard}
                  accessibilityRole="button"
                  accessibilityLabel="Open the full My ID Card page"
                  style={styles.inlineIdCardWrapper}
                >
                  <MyIdCard profile={cardProfile} width={cardWidth} />
                </TouchableOpacity>

                <View style={styles.inlineDownloadWrap}>
                  <AppButton
                    title={
                      busyAction === 'download' ? 'Generating PDF...' : 'Download ID Card'
                    }
                    variant="primary"
                    size="sm"
                    loading={busyAction === 'download'}
                    disabled={busyAction !== null}
                    icon={<DownloadIcon color={AdminColors.primaryDark} />}
                    onPress={() => download(cardProfile)}
                    style={styles.inlineDownloadButton}
                  />
                </View>
              </View>
            ) : null}
          </ProfileSectionCard>
        ) : null}

        {/* Join Membership Banner Card for User who has NOT applied */}
        {!canShowIdCard && !hasApplied && !isMemberContext ? (
          <View style={[styles.sectionGap, styles.joinMembershipCard]}>
            <View style={styles.joinMembershipCardHeader}>
              <View style={styles.joinMembershipIconCircle}>
                <BadgeCheck size={22} color="#D97706" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.joinMembershipCardTitle}>Become an Official Member</Text>
                <Text style={styles.joinMembershipCardSubtitle}>
                  Apply for membership to receive your official ID card, voting rights, and exclusive member benefits.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.joinMembershipActionBtn}
              onPress={handleJoinMembership}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Join Membership Now"
            >
              <Text style={styles.joinMembershipActionBtnText}>Explore Membership Categories</Text>
              <ChevronRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* My ID Card section — inline preview of the actual card (Admin, Donation Seeker only when NOT in member profile) */}
        {canShowIdCard && !isMemberContext ? (
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

      {/* Download action — pinned directly above bottom (Admin, Donation Seeker only when NOT in member profile) */}
      {canShowIdCard && !isMemberContext ? (
        <View style={[styles.downloadPanel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <AppButton
            title={
              busyAction === 'download' ? 'Generating PDF...' : 'Download ID Card'
            }
            variant="primary"
            size="md"
            loading={busyAction === 'download'}
            disabled={busyAction !== null}
            icon={<DownloadIcon color={AdminColors.primaryDark} />}
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
    fontFamily: FontFamilies.serif,
    fontSize: 28,
    fontWeight: '700',
    color: AdminColors.textPrimary,
  },
  pageSubtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: 3,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.card,
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
    backgroundColor: '#011F39',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
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
    fontFamily: FontFamilies.serif,
    fontSize: 18,
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
    backgroundColor: '#EDF2F7',
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
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FAD465',
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
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#FAD465',
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
  joinMembershipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderWidth: 1.5,
    borderColor: '#DBE5EE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7.5,
  },
  joinMembershipIcon: {
    fontSize: 13,
    color: '#06294D',
    marginRight: 4,
  },
  joinMembershipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
    marginRight: 4,
  },
  joinMembershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: Spacing.md,
    ...Shadows.card,
  },
  joinMembershipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 12,
  },
  joinMembershipIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinMembershipCardTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 2,
  },
  joinMembershipCardSubtitle: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  joinMembershipActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD465',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.button,
    gap: 8,
  },
  joinMembershipActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  statusPillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillReview: {
    backgroundColor: '#FEF6E7',
  },
  statusPillApplied: {
    backgroundColor: '#EDF2F7',
  },
  statusPillApproved: {
    backgroundColor: '#EAF7EE',
  },
  statusPillRejected: {
    backgroundColor: '#FDEEEF',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPillTextReview: {
    color: '#D97706',
  },
  statusPillTextApplied: {
    color: '#06294D',
  },
  statusPillTextApproved: {
    color: '#16A34A',
  },
  statusPillTextRejected: {
    color: '#DC2626',
  },
  rejectionNoticeBox: {
    backgroundColor: '#FDEEEF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 8,
  },
  rejectionNoticeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 2,
  },
  rejectionNoticeText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  profileReapplyButton: {
    backgroundColor: '#1B3F8F',
    borderRadius: BorderRadius.md,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  profileReapplyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
  inlineIdCardSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
  },
  inlineIdCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inlineIdCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineIdCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  inlineIdCardViewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  inlineIdCardViewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2860',
  },
  inlineIdCardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  inlineDownloadWrap: {
    marginTop: 12,
    marginBottom: 4,
  },
  inlineDownloadButton: {
    minHeight: 40,
    borderRadius: BorderRadius.button,
  },
});

export default ProfileScreen;
