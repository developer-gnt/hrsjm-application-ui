import React from 'react';
import { StyleSheet, StatusBar, View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppButton } from '../../../core/components/common/AppButton';
import { AppCard } from '../../../core/components/common/AppCard';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { AuthLogo } from '../components/AuthLogo';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type RegisterIntroScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'RegisterIntro'
>;

const BENEFITS = [
  { icon: '👥', text: 'Become a member' },
  { icon: '❤️', text: 'Support our work through donations' },
  { icon: '📋', text: 'File a complaint and get help' },
  { icon: '📅', text: 'Stay updated on events & activities' },
  { icon: '📣', text: 'Be part of a stronger community' },
];

/**
 * "New to HRSJM?" marketing screen between Login and the registration form.
 */
export const RegisterIntroScreen: React.FC<RegisterIntroScreenProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" />
      <AppHeader title="Create Account" showBack onBack={() => navigation.navigate('Login')} />
      <View style={styles.body}>
        <AuthLogo size="lg" variant="dark" />
        <Text style={styles.title}>New to HRSJM?</Text>
        <Text style={styles.subtitle}>
          Create an account and join our movement for a fairer, more equal
          society.
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map(benefit => (
            <View style={styles.benefitRow} key={benefit.text}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>{benefit.icon}</Text>
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        <AppButton
          title="Create an Account"
          onPress={() => navigation.navigate('Register')}
          size="lg"
          icon={<Text style={styles.buttonArrow}>→</Text>}
          iconPosition="right"
          style={styles.createButton}
        />

        <AppCard
          onPress={() => navigation.navigate('Login')}
          variant="flat"
          style={styles.memberCard}
        >
          <View style={styles.memberCardRow}>
            <View style={styles.memberCardIcon}>
              <Text style={styles.memberCardIconText}>💡</Text>
            </View>
            <View style={styles.memberCardTextContainer}>
              <Text style={styles.memberCardTitle}>Already a member?</Text>
              <Text style={styles.memberCardText}>
                Login to access your member dashboard, membership details,
                renew your membership and more.
              </Text>
            </View>
            <Text style={styles.memberCardChevron}>›</Text>
          </View>
        </AppCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  body: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.screenTitle,
    color: AdminColors.primaryDark,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  subtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  benefits: {
    marginTop: Spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitIconText: {
    fontSize: 16,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  createButton: {
    marginTop: Spacing.lg,
  },
  buttonArrow: {
    fontSize: 16,
    color: AdminColors.textOnDark,
  },
  memberCard: {
    marginTop: Spacing.lg,
  },
  memberCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCardIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memberCardIconText: {
    fontSize: 16,
  },
  memberCardTextContainer: {
    flex: 1,
  },
  memberCardTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
  },
  memberCardText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  memberCardChevron: {
    fontSize: 22,
    color: AdminColors.textMuted,
    marginLeft: Spacing.sm,
  },
});

export default RegisterIntroScreen;