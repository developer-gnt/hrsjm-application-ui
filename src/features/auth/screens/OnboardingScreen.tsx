import React, { useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../core/theme/spacing';
import { AppButton } from '../../../core/components/common/AppButton';
import { appPreferences } from '../../../core/storage/app-storage';
import { AuthLogo } from '../components/AuthLogo';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type OnboardingScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Onboarding'
>;


const SLIDES = [
  {
    icon: '👥',
    title: 'Community at a Glance',
    description:
      'Track members, expiring memberships and activity from one executive dashboard.',
  },
  {
    icon: '✅',
    title: 'Verify Payments & Receipts',
    description:
      'Confirm offline and gateway payments, then issue receipts in a few taps.',
  },
  {
    icon: '📊',
    title: 'Accounting & Reports',
    description:
      'Double-entry ledgers, journal entries and financial reports — always in balance.',
  },
];

/**
 * Three-slide first-launch onboarding. Completion flag persists in MMKV so
 * the splash routes straight to login on subsequent launches.
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const complete = () => {
    appPreferences.setOnboardingCompleted(true);
    navigation.replace('Login');
  };

  const next = () => (isLast ? complete() : setIndex(current => current + 1));
  const skip = () => complete();

  const slide = SLIDES[index];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity onPress={skip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.carousel}>
        <View style={styles.card}>
          <Text style={styles.icon}>{slide.icon}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <AppButton
        title={isLast ? 'Get Started' : 'Next'}
        onPress={next}
        variant="gold"
        size="lg"
        style={styles.nextButton}
      />

      <View style={styles.footer}>
        <AuthLogo size="sm" showWordmark={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.headerBg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  skip: {
    ...Typography.bodyMedium,
    color: AdminColors.accentGoldLight,
    textAlign: 'right',
    paddingHorizontal: Spacing.xl,
  },
  carousel: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadows.cardMedium,
  },
  icon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.screenTitle,
    color: AdminColors.primary,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.textMuted,
    marginHorizontal: Spacing.xs / 2,
    opacity: 0.4,
  },
  dotActive: {
    backgroundColor: AdminColors.accentGold,
    width: 20,
    opacity: 1,
  },
  nextButton: {
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    minHeight: 52,
    marginHorizontal: Spacing.xl,
  },
  nextButtonText: {
    ...Typography.button,
    color: AdminColors.textOnDark,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});