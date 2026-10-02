import React, { useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';
import { appPreferences } from '../../../core/storage/app-storage';
import { AuthLogo } from '../components/AuthLogo';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

/**
 * Boot decision screen: token validation & initial route determination.
 * - First launch (no onboarding) → Onboarding
 * - Stored session → POST /auth/refresh restore; success → app, failure → Login
 * - Nothing stored → Login
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Guard against double runs (mount + re-render races) during boot.
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) {
      return;
    }
    didRun.current = true;

    const decide = async () => {
      if (!appPreferences.isOnboardingCompleted()) {
        navigation.replace('Onboarding');
        return;
      }

      const restored = await useAuthStore.getState().restoreSession();
      if (!restored) {
        navigation.replace('Login');
      }
      // On success RootNavigator swaps to the authenticated area and this
      // screen unmounts; no navigation needed here.
    };

    decide();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuthLogo size="lg" />
      <Text style={styles.version}>HRSJM Admin • v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.headerBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  version: {
    ...Typography.caption,
    color: AdminColors.accentGoldLight,
    marginTop: Spacing.xxl,
  },
});