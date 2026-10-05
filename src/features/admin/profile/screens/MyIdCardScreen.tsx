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
import { MyIdCard } from '../components/MyIdCard';
import { ProfileToast } from '../components/ProfileToast';
import {
  DownloadIcon,
  ShareIcon,
  BadgeCheckIcon,
} from '../components/ProfileIcons';
import { useIdCardFiles } from '../hooks/useIdCardFiles';

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { download, share, busyAction } = useIdCardFiles({
    onMessage: setToastMessage,
  });

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

        {/* Large ID card preview */}
        <View style={styles.cardWrap}>
          <MyIdCard profile={profile} width={cardWidth} />
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
          onPress={() => download(profile)}
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
          onPress={() => share(profile)}
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
      </ScrollView>

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
});

export default MyIdCardScreen;
