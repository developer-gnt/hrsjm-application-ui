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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { feedback } from '../../../core/feedback/FeedbackContext';
import { ApiError } from '../../../core/api/api-error';
import { appPreferences } from '../../../core/storage/app-storage';
import { AuthLogo } from '../components/AuthLogo';
import { LoginForm } from '../components/LoginForm';
import { GoogleGIcon, ArrowRightIcon, LockOutlineIcon } from '../components/AuthIcons';
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
 * Professional, high-end Login Screen:
 * - Responsive safe area inset header preventing any clipping on notched devices
 * - Deep royal navy branding band with official bilingual emblem & golden motto
 * - Modern card container with sleek inputs and vector icons
 * - Radiant gold primary action button with tactile elevation
 * - Crisp, high-contrast Google sign-in and biometric unlock options
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding Section with safe top padding */}
        <View
          style={[
            styles.headerBand,
            { paddingTop: Math.max(insets.top, 16) + 12 },
          ]}
        >
          <AuthLogo size="lg" variant="light" />

          <Text style={styles.headline}>
            Together for a{' '}
            <Text style={styles.headlineAccent}>More Just</Text> Society
          </Text>
          <Text style={styles.headlineSub}>
            Sign in to continue and be a part of our mission for human rights,
            dignity, equality and peace.
          </Text>
        </View>

        {/* Floating White Login Card */}
        <View style={styles.sheet}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please login to your account.
          </Text>

          {formError && (
            <View style={styles.errorBannerContainer}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          <LoginForm
            loading={submitting}
            onSubmit={handleSubmit}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
            submitRef={submitRef}
          />

          {/* Primary Gold Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, submitting && styles.loginButtonDisabled]}
            onPress={() => submitRef.current?.()}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Login"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Login</Text>
                <View style={styles.arrowIconWrap}>
                  <ArrowRightIcon size={16} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerBadge}>
              <Text style={styles.dividerText}>OR</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-in Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() =>
              feedback.info(
                'Coming Soon',
                'Google sign-in integration will be available in an upcoming release.',
              )
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <GoogleGIcon size={20} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Biometric Unlock */}
          {showBiometricButton && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricUnlock}
              disabled={biometricBusy}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Unlock with ${biometryLabel}`}
            >
              {biometricBusy ? (
                <ActivityIndicator size="small" color="#0F2860" />
              ) : (
                <>
                  <LockOutlineIcon size={18} color="#0F2860" />
                  <Text style={styles.biometricButtonText}>
                    Unlock with {biometryLabel}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
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
    backgroundColor: '#0F2860',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBand: {
    backgroundColor: '#0F2860',
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  headlineAccent: {
    color: '#F3BA47',
  },
  headlineSub: {
    fontSize: 13,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 320,
    opacity: 0.9,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
  },
  errorBannerContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#EAA224',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  arrowIconWrap: {
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerBadge: {
    paddingHorizontal: 12,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 50,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D0E1FD',
    borderRadius: 14,
    height: 50,
    marginTop: 12,
    gap: 8,
  },
  biometricButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F2860',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 8,
  },
  signupPrompt: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;