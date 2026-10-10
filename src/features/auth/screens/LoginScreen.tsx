import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextStyle,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../../core/components/common/AppButton';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { feedback } from '../../../core/feedback/FeedbackContext';
import { ApiError } from '../../../core/api/api-error';
import { appPreferences } from '../../../core/storage/app-storage';
import { AuthLogo } from '../components/AuthLogo';
import { LoginForm } from '../components/LoginForm';
import { BiometricButton } from '../components/BiometricButton';
import { useAuthStore } from '../store/authStore';
import { useBiometrics } from '../hooks/useBiometrics';
import { LoginFormData } from '../types/auth.schemas';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * Maps backend auth failures to user-facing messages per the Admin BRD test
 * matrix (TC-ADMIN-002 / TC-ADMIN-003).
 */
const resolveLoginError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'Your account has been deactivated. Contact the HRSJM office.';
    }
    if (error.statusCode === 401) {
      return 'Invalid email or password';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'Unable to login. Please check your connection and try again.';
};

/**
 * Login screen per the approved design. LoginForm owns the field state and
 * exposes its submit through `submitRef`; the screen renders the gold Login
 * button, OR divider, Google notice and biometric unlock.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const signIn = useAuthStore(state => state.signIn);
  const restoreSession = useAuthStore(state => state.restoreSession);
  const {
    isAvailable,
    isEnabled,
    biometryLabel,
    authenticate,
    setEnabled,
  } = useBiometrics();

  const [submitting, setSubmitting] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const submitRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const showBiometricEnablePrompt = useCallback(() => {
    if (!isAvailable || appPreferences.isBiometricEnabled()) {
      return;
    }
    feedback.confirm({
      title: 'Enable Biometric Unlock',
      message: `Would you like to use ${biometryLabel} to quickly unlock the HRSJM app next time?`,
      confirmText: 'Enable',
      cancelText: 'Not Now',
      onConfirm: () => setEnabled(true),
      onCancel: () => setEnabled(false),
    });
  }, [isAvailable, biometryLabel, setEnabled]);

  const handleSubmit = async (values: LoginFormData, rememberMe: boolean) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await signIn(values.identifier, values.password, rememberMe);
      showBiometricEnablePrompt();
      // RootNavigator swaps to the app area on status change.
    } catch (error) {
      setFormError(resolveLoginError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setBiometricBusy(true);
    setFormError(null);
    try {
      const passed = await authenticate();
      if (!passed) {
        setFormError('Biometric authentication cancelled.');
        return;
      }
      const restored = await restoreSession();
      if (!restored) {
        setFormError('Session expired. Please login with your password.');
      }
    } catch {
      setFormError('Unable to restore session. Please login with your password.');
    } finally {
      setBiometricBusy(false);
    }
  };

  const showBiometricButton = isAvailable && isEnabled && !submitting;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.headerBand}>
          <AuthLogo size="lg" variant="light" />
          <Text style={styles.headline}>
            Together for a{'\n'}
            <Text style={styles.headlineAccent}>More Just</Text> Society
          </Text>
          <Text style={styles.headlineSub}>
            Sign in to continue and be a part of our mission for human rights,
            dignity, equality and peace.
          </Text>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please login to your account.
          </Text>

          {formError && <Text style={styles.errorBanner}>{formError}</Text>}

          <LoginForm
            loading={submitting}
            onSubmit={handleSubmit}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
            submitRef={submitRef}
          />

          <AppButton
            title="Login"
            onPress={() => submitRef.current?.()}
            loading={submitting}
            disabled={submitting}
            variant="gold"
            size="lg"
            icon={<Text style={styles.buttonArrow}>→</Text>}
            iconPosition="right"
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton
            title="Continue with Google"
            onPress={() =>
              feedback.info(
                'Coming Soon',
                'Google sign-in integration will be available in the upcoming release.',
              )
            }
            variant="outline"
            size="lg"
            icon={<Text style={styles.googleGlyph}>G</Text>}
            borderColor={AdminColors.border}
          />

          {showBiometricButton && (
            <BiometricButton
              biometryLabel={biometryLabel}
              onPress={handleBiometricUnlock}
              loading={biometricBusy}
            />
          )}

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RegisterIntro')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.headerBg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBand: {
    backgroundColor: AdminColors.headerBg,
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  headline: {
    ...(Typography.screenTitle as TextStyle),
    color: AdminColors.textOnDark,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  headlineAccent: {
    color: AdminColors.accentGold,
  },
  headlineSub: {
    ...(Typography.secondary as TextStyle),
    color: AdminColors.accentGoldLight,
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 300,
  },
  sheet: {
    flex: 1,
    backgroundColor: AdminColors.background,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    borderTopLeftRadius: Spacing.xxl,
    borderTopRightRadius: Spacing.xxl,
  },
  title: {
    ...(Typography.screenTitle as TextStyle),
    color: AdminColors.primaryDark,
  },
  subtitle: {
    ...(Typography.body as TextStyle),
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
  },
  errorBanner: {
    ...(Typography.secondaryMedium as TextStyle),
    color: AdminColors.error,
    backgroundColor: AdminColors.errorLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  buttonArrow: {
    fontSize: 16,
    color: AdminColors.textOnDark,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AdminColors.border,
  },
  dividerText: {
    ...(Typography.secondary as TextStyle),
    color: AdminColors.textMuted,
    marginHorizontal: Spacing.md,
  },
  googleGlyph: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: Spacing.sm,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  signupPrompt: {
    ...(Typography.body as TextStyle),
    color: AdminColors.textSecondary,
  },
  signupLink: {
    ...(Typography.bodyBold as TextStyle),
    color: AdminColors.primary,
  },
});

export default LoginScreen;