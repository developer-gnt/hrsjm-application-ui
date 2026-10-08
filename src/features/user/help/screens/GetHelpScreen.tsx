import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../../../core/components';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { HelpActionCard, type HelpActionCardItem } from '../components/HelpActionCard';

const HELP_HERO_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');

const HELP_ACTIONS: HelpActionCardItem[] = [
  {
    id: 'complaint',
    title: 'File a Complaint',
    description: 'Report a violation or seek help from our team.',
    icon: 'file-text',
  },
  {
    id: 'talk',
    title: 'Talk to Us',
    description: 'Speak with our support team for immediate guidance.',
    icon: 'phone',
  },
  {
    id: 'legal',
    title: 'Request Legal Support',
    description: 'Get guidance on your legal rights and options.',
    icon: 'scale',
  },
  {
    id: 'community',
    title: 'Community Support',
    description: 'Connect with support groups and resources.',
    icon: 'users',
  },
];

const HOW_IT_WORKS = [
  { id: 'submit', title: 'Submit Your Complaint', description: 'Fill in the form with your details.' },
  { id: 'review', title: 'Our Team Reviews', description: 'We verify and assess your case.' },
  { id: 'support', title: 'Get Support', description: 'We connect you with the right resources and guidance.' },
];

export interface GetHelpScreenProps {
  onBack?: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenContact?: () => void;
  onOpenFileComplaint?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
}

export const GetHelpScreen: React.FC<GetHelpScreenProps> = ({
  onBack,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenContact,
  onOpenFileComplaint,
  onOpenEvents,
  onOpenNews,
}) => {
  const insets = useSafeAreaInsets();

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `${feature} is part of an upcoming phase.`);
  };

  const handleActionPress = (action: HelpActionCardItem) => {
    if (action.id === 'complaint') {
      onOpenFileComplaint?.();
      return;
    }

    const messageMap: Record<string, string> = {
      talk: 'Speak with our support team for immediate guidance.',
      legal: 'Our legal support guidance is available to help you understand your options.',
      community: 'Connect with support groups and local resources through HRSJM.',
    };

    Alert.alert(action.title, messageMap[action.id] ?? 'This action will be connected in a later phase.');
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
      return;
    }
    if (tab.id === 'about') {
      onOpenAbout?.();
      return;
    }
    if (tab.id === 'rights') {
      onOpenRights?.();
      return;
    }
    if (tab.id === 'contact') {
      onOpenContact?.();
      return;
    }
    if (tab.id === 'events') {
      onOpenEvents?.();
      return;
    }
    if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              if (onBack) {
                onBack();
                return;
              }
              onOpenHome?.();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <HrsjmLogoMark height={38} />
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => showComingSoon('Search')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <AppIcon name="search" size={20} color={AdminColors.primaryDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => showComingSoon('Notifications')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <AppIcon name="bell" size={20} color={AdminColors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Get <Text style={styles.heroTitleAccent}>Help</Text>
            </Text>
            <Text style={styles.heroDescription}>
              If you are facing a human rights violation or need support, we are here to help. Your voice matters.
            </Text>
          </View>

          <View style={styles.heroImageWrap}>
            <Image source={HELP_HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.actionsGrid}>
          {HELP_ACTIONS.map(action => (
            <View key={action.id} style={styles.gridCard}>
              <HelpActionCard item={action} onPress={() => handleActionPress(action)} />
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>How It Works</Text>
          <View style={styles.stepsRow}>
            {HOW_IT_WORKS.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {index < HOW_IT_WORKS.length - 1 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyIconWrap}>
            <AppIcon name="shield-check" size={22} color={AdminColors.primaryDark} />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Your information is safe with us.</Text>
            <Text style={styles.privacyDescription}>
              We maintain confidentiality and protect your privacy.
            </Text>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <AppButton
            title="File a Complaint Now  →"
            onPress={() => onOpenFileComplaint?.()}
            variant="gold"
            size="lg"
            style={styles.ctaButton}
            textStyle={{ color: AdminColors.primaryDark }}
          />
        </View>
      </ScrollView>

      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  header: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  hero: {
    marginTop: Spacing.md,
    backgroundColor: AdminColors.primaryDark,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    minHeight: 210,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: Spacing.sm,
  },
  heroTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 32,
    fontWeight: '700',
    color: AdminColors.textOnDark,
    lineHeight: 36,
  },
  heroTitleAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    color: AdminColors.textOnDark,
    opacity: 0.9,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  heroImageWrap: {
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 120,
    height: 160,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  gridCard: {
    width: '48%',
  },
  sectionBlock: {
    marginTop: Spacing.xl,
  },
  sectionHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 24,
    color: AdminColors.primaryDark,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    minWidth: 0,
    paddingHorizontal: Spacing.xs,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  stepTitle: {
    marginTop: Spacing.xs,
    textAlign: 'center',
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 15,
  },
  stepDescription: {
    marginTop: Spacing.xs,
    textAlign: 'center',
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  stepConnector: {
    position: 'absolute',
    right: -10,
    top: 14,
    width: 18,
    height: 2,
    backgroundColor: AdminColors.border,
  },
  privacyCard: {
    marginTop: Spacing.xl,
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#F1D58A',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  privacyTextWrap: {
    flex: 1,
  },
  privacyTitle: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyDescription: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  ctaWrap: {
    marginTop: Spacing.xl,
  },
  ctaButton: {
    borderRadius: BorderRadius.xl,
    minHeight: 52,
  },
});
