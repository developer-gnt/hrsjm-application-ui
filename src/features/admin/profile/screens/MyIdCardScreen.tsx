/**
 * My ID Card detail page — back button, large card preview, real
 * Download (PDF saved to device storage) and Share (native share sheet
 * with the actual PDF file attached) actions, plus a short information
 * section about the card.
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
import { MyIdCard } from '../components/MyIdCard';
import { ProfileToast, ToastState } from '../components/ProfileToast';
import {
  DownloadIcon,
  ShareIcon,
  BadgeCheckIcon,
  IdCardIcon,
} from '../components/ProfileIcons';
import { useIdCardFiles } from '../hooks/useIdCardFiles';
import { useMembership } from '../../../membership/context/MembershipContext';

export interface MyIdCardScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

export const MyIdCardScreen: React.FC<MyIdCardScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const profile = useProfileStore(state => state.profile);

  const [toastMessage, setToastMessage] = useState<string | ToastState | null>(null);
  const { download, share, busyAction } = useIdCardFiles({
    onMessage: setToastMessage,
    profile,
  });

  const fetchProfile = useProfileStore(state => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const isAllowed = isMember || isAdmin || isSeeker;

  const membershipCtx = useMembership();
  const effectiveMemberId =
    profile.memberId ||
    membershipCtx.activeApplication?.applicationId ||
    (membershipCtx.applications && membershipCtx.applications[0]?.applicationId) ||
    'HRSJM-47611';

  const effectiveMembershipType =
    profile.membershipType ||
    membershipCtx.activeApplication?.membershipType ||
    'Individual Member';

  const cardProfile = {
    ...profile,
    fullName: profile.fullName || profile.accountName || 'Member',
    memberId: effectiveMemberId,
    adminId: profile.adminId || effectiveMemberId,
    membershipType: effectiveMembershipType,
    accountStatus: profile.accountStatus || 'Active',
    validTill: profile.validTill || '31 Dec 2027',
    memberSince: profile.memberSince || '12 Oct 2024',
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('MyProfile');
    }
  };

  // Large preview card, capped so it stays elegant on tablets/web.
  const cardWidth = Math.min(windowWidth - 2 * Spacing.lg, 360);

  return (
    <View style={styles.screen}>
      <AdminHeader
        title="My ID Card"
        showBack={true}
        onBack={handleBack}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + title */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to My Profile"
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back to My Profile</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={styles.titleTextWrap}>
            <Text style={styles.title}>My ID Card</Text>
            <Text style={styles.subtitle}>
              Your membership identification card.
            </Text>
          </View>
          <AppBadge
            label={profile.accountStatus}
            status={profile.accountStatus === 'Active' ? 'ACTIVE' : 'INACTIVE'}
            textStyle={{ textTransform: 'none' }}
          />
        </View>

        {!isAllowed ? (
          <View style={styles.notAllowedCard}>
            <View style={styles.notAllowedIconBox}>
              <IdCardIcon size={36} color={AdminColors.primary} />
            </View>
            <Text style={styles.notAllowedTitle}>ID Card Unavailable</Text>
            <Text style={styles.notAllowedBody}>
              Official HRSJM ID Cards are issued exclusively to active Members, Administrators, and verified Donation Seekers.
            </Text>
            <AppButton
              title="Apply for Membership"
              variant="primary"
              size="md"
              onPress={() => {
                if (onNavigate) {
                  onNavigate('MembershipCategories');
                }
              }}
              style={styles.notAllowedButton}
            />
          </View>
        ) : (
          <>
            {/* Large ID card preview */}
            <View style={styles.cardWrap}>
              <MyIdCard profile={cardProfile} width={cardWidth} />
            </View>

            {/* Actions */}
            <AppButton
              title={
                busyAction === 'download' ? 'Generating PDF...' : 'Download ID Card'
              }
              variant="primary"
              size="lg"
              loading={busyAction === 'download'}
              disabled={busyAction !== null}
              icon={<DownloadIcon color={AdminColors.textOnDark} size={16} />}
              onPress={() => download(cardProfile)}
              style={styles.downloadButton}
            />
            <AppButton
              title={
                busyAction === 'share' ? 'Preparing card…' : 'Share ID Card'
              }
              variant="outline"
              size="lg"
              loading={busyAction === 'share'}
              disabled={busyAction !== null}
              icon={<ShareIcon color={AdminColors.primary} size={16} />}
              onPress={() => share(cardProfile)}
              style={styles.shareButton}
            />

            {/* About section */}
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>About this card</Text>
              <Text style={styles.aboutBody}>
                This digitally issued HRSJM membership card identifies you as a
                registered member of the Human Rights &amp; Social Justice
                Mission. Each card carries a unique member ID and verification
                QR code, and is valid through the validity period shown.
              </Text>
              <View style={styles.aboutRow}>
                <BadgeCheckIcon size={15} />
                <Text style={styles.aboutRowText}>
                  Digitally verifiable via the QR code
                </Text>
              </View>
              <View style={styles.aboutRow}>
                <BadgeCheckIcon size={15} />
                <Text style={styles.aboutRowText}>
                  Issued by HRSJM — {profile.memberSince}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

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
    paddingBottom: Spacing.xxl,
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
  cardWrap: {
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadows.cardMedium,
    borderRadius: BorderRadius.xl,
  },
  downloadButton: {
    minHeight: 50,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  shareButton: {
    minHeight: 50,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.base,
  },
  aboutCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.base,
    ...Shadows.card,
  },
  aboutTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    marginBottom: Spacing.xs,
  },
  aboutBody: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  aboutRowText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  toastHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
    elevation: 20,
  },
  notAllowedCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  notAllowedIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  notAllowedTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    color: AdminColors.primaryDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  notAllowedBody: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  notAllowedButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: BorderRadius.lg,
  },
});

export default MyIdCardScreen;
