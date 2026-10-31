import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminColors } from '../../../core/theme/colors';
import { Typography, FontFamilies } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { ApiError } from '../../../core/api/api-error';
import { authService } from '../services/auth.service';
import { AuthLogo } from '../components/AuthLogo';
import { ChevronLeftIcon, ArrowRightIcon, MailOutlineIcon } from '../components/AuthIcons';
import { Icon } from '../../../core/components/common/Icon';
import {
  forgotPasswordSchema,
  zodErrorsToFieldErrors,
} from '../types/auth.schemas';
import { ForgotPasswordResult } from '../types/auth.types';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

/**
 * Requests a password reset for an identifier (email or mobile).
 * Connected directly to the backend database (POST /auth/forgot-password).
 * Generates and stores a secure SHA-256 token in `password_reset_tokens` table.
 */
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSubmit = async () => {
    const parsed = forgotPasswordSchema.safeParse({ identifier });
    if (!parsed.success) {
      setFieldError(
        zodErrorsToFieldErrors(parsed.error).identifier ?? 'Invalid email or mobile number',
      );
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await authService.forgotPassword(parsed.data.identifier);
      setResult(response);
    } catch (error) {
      setFormError(
        error instanceof ApiError && error.message
          ? error.message
          : 'Unable to submit the request. Please check your network and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goBackToLogin = () => navigation.navigate('Login');

  const continueToReset = () => {
    if (result?.reset_token) {
      navigation.replace('ResetPassword', { token: result.reset_token });
    }
  };

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
        keyboardDismissMode="on-drag"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Band */}
        <View
          style={[
            styles.headerBand,
            { paddingTop: Math.max(insets.top, 16) + 12 },
          ]}
        >
          {/* Back Navigation Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBackToLogin}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeftIcon size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.brandingWrap}>
            <AuthLogo size="md" variant="light" />
            <Text style={styles.headline}>
              Account <Text style={styles.headlineAccent}>Recovery</Text>
            </Text>
            <Text style={styles.headlineSub}>
              Verify your credentials to receive a secure database-backed password reset token.
            </Text>
          </View>
        </View>

        {/* Floating White Card */}
        <View style={styles.sheet}>
          {result ? (
            <View style={styles.resultContainer}>
              {/* Success Emblem */}
              <View style={styles.successHalo}>
                <View style={styles.successEmblem}>
                  <Icon name="check-circle" size={32} color="#059669" strokeWidth={2.4} />
                </View>
              </View>

              <Text style={styles.resultTitle}>Check Your Email</Text>
              <Text style={styles.resultSub}>
                If an account is associated with this email address, we have sent a secure
                password reset link to your inbox.
              </Text>

              <View style={styles.infoAlertCard}>
                <View style={styles.infoAlertHeader}>
                  <Icon name="clock" size={16} color="#D97706" />
                  <Text style={styles.infoAlertLabel}>LINK EXPIRES IN 15 MINUTES</Text>
                </View>
                <Text style={styles.infoAlertText}>
                  Please click the link in your email to open the dedicated Reset Password webpage.
                  Check your spam/junk folder if you don't see it within a couple of minutes.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryGoldButton}
                onPress={goBackToLogin}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Back to Sign In"
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Back to Sign In</Text>
                  <View style={styles.arrowIconWrap}>
                    <ArrowRightIcon size={18} color="#011F39" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email address below. We'll send you
                a secure link to reset your password.
              </Text>

              {formError && (
                <View style={styles.errorBannerContainer}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              )}

              {/* Input Field */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Registered Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldError ? styles.inputContainerError : null,
                  ]}
                >
                  <View style={styles.inputIconWrap}>
                    <MailOutlineIcon size={19} color="#64748B" />
                  </View>
                  <TextInput
                    value={identifier}
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (fieldError) setFieldError(null);
                    }}
                    placeholder="e.g. member@hrsjm.org"
                    placeholderTextColor="#94A3B8"
                    editable={!submitting}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={styles.textInput}
                  />
                </View>
                {fieldError && (
                  <Text style={styles.fieldErrorText}>{fieldError}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.primaryGoldButton,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Send Reset Request"
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#011F39" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Send Reset Request</Text>
                    <View style={styles.arrowIconWrap}>
                      <ArrowRightIcon size={18} color="#011F39" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.footerNote}>
                <Text style={styles.footerNoteText}>
                  Remember your password?{' '}
                  <Text style={styles.footerLink} onPress={goBackToLogin}>
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#011F39',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#011F39',
  },
  headerBand: {
    backgroundColor: '#011F39',
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: FontFamilies.sans,
  },
  brandingWrap: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: FontFamilies.serif,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  headlineAccent: {
    color: '#FAD465',
    fontStyle: 'italic',
  },
  headlineSub: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginTop: 8,
    fontFamily: FontFamilies.sans,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 460,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#011F39',
    fontFamily: FontFamilies.serif,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    fontFamily: FontFamilies.sans,
    marginBottom: 24,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    fontFamily: FontFamilies.sans,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputContainerError: {
    borderColor: AdminColors.error,
    backgroundColor: '#FEF2F2',
  },
  inputIconWrap: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    fontFamily: FontFamilies.sans,
  },
  fieldErrorText: {
    fontSize: 12,
    color: AdminColors.error,
    marginTop: 6,
    fontFamily: FontFamilies.sans,
  },
  primaryGoldButton: {
    backgroundColor: '#EAA224',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#011F39',
    letterSpacing: 0.3,
    fontFamily: FontFamilies.sans,
  },
  arrowIconWrap: {
    marginLeft: 8,
  },
  footerNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: FontFamilies.sans,
  },
  footerLink: {
    color: '#011F39',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorBannerContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: AdminColors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  errorBannerText: {
    fontSize: 13,
    color: AdminColors.error,
    fontFamily: FontFamilies.sans,
  },
  infoAlertCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginVertical: 16,
    width: '100%',
  },
  infoAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoAlertLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  infoAlertText: {
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  successEmblem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#011F39',
    fontFamily: FontFamilies.serif,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    fontFamily: FontFamilies.sans,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  devTokenCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  devTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  devTokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.8,
    marginLeft: 6,
    fontFamily: FontFamilies.sans,
  },
  devTokenValue: {
    fontSize: 13,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    color: '#78350F',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  devTokenNote: {
    fontSize: 11.5,
    color: '#92400E',
    fontFamily: FontFamilies.sans,
    lineHeight: 16,
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: FontFamilies.sans,
  },
});

export default ForgotPasswordScreen;