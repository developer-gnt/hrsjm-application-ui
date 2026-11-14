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
import { feedback } from '../../../core/feedback/FeedbackContext';
import { ApiError } from '../../../core/api/api-error';
import { authService } from '../services/auth.service';
import { AuthLogo } from '../components/AuthLogo';
import { ChevronLeftIcon, ArrowRightIcon, LockOutlineIcon } from '../components/AuthIcons';
import { Icon } from '../../../core/components/common/Icon';
import {
  resetPasswordSchema,
  zodErrorsToFieldErrors,
} from '../types/auth.schemas';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type ResetPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ResetPassword'
>;

/**
 * Extracts reset token reliably from route params or browser URL (on Web).
 */
const extractTokenFromEnvironment = (routeParamToken?: string): string => {
  if (routeParamToken && typeof routeParamToken === 'string' && routeParamToken.trim().length > 0) {
    return routeParamToken.trim();
  }
  if (typeof window !== 'undefined' && window.location) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token');
      if (urlToken && urlToken.trim().length > 0) {
        return urlToken.trim();
      }

      if (window.location.hash) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          const hashToken = hashParams.get('token');
          if (hashToken && hashToken.trim().length > 0) {
            return hashToken.trim();
          }
        }
      }
    } catch {
      // Ignore web location parse error
    }
  }
  return '';
};

/**
 * Completes the reset flow with a valid reset token (15-minute TTL backend side).
 * Connected directly to PostgreSQL:
 * 1. Verifies token in `password_reset_tokens` table.
 * 2. Updates `users.password_hash` with bcrypt.
 * 3. Marks token as used (`used_at = NOW()`).
 * 4. Revokes all active refresh tokens in `refresh_tokens`.
 */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const routeToken = route.params?.token;

  const [token, setToken] = useState<string>(() => extractTokenFromEnvironment(routeToken));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const detected = extractTokenFromEnvironment(routeToken);
    if (detected && !token) {
      setToken(detected);
    }
  }, [routeToken, token]);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!token) {
      setFormError('Missing reset token. Please request a new password reset link.');
      return;
    }

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirm_password: confirmPassword,
    });

    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setFormError(null);

    try {
      await authService.resetPassword(
        parsed.data.token,
        parsed.data.password,
        parsed.data.confirm_password,
      );
      setIsSuccess(true);
      feedback.success(
        'Password Updated Successfully',
        'Your account password has been updated in the database. Please sign in with your new password.',
        {
          primaryAction: {
            text: 'Sign In Now',
            onPress: () => navigation.navigate('Login'),
          },
        },
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = (error.message || '').toLowerCase();
        const errorCode = (error as any).code;

        if (errorCode === 'RESET_TOKEN_INVALID' || (error.statusCode === 400 && errorMsg.includes('token'))) {
          setFormError(
            'Invalid or expired reset token. Please request a new reset link and try again.',
          );
        } else if (error.statusCode === 400 && error.message) {
          setFormError(error.message);
        } else if (error.statusCode === 429) {
          setFormError('Too many attempts. Please wait a few moments before trying again.');
        } else if (error.statusCode >= 500) {
          setFormError('Unable to update password due to a server error. Please try again later.');
        } else {
          setFormError(error.message || 'Unable to reset the password. Please try again.');
        }
      } else {
        setFormError('Network error. Please check your internet connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => navigation.navigate('Login');

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
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
              Create New <Text style={styles.headlineAccent}>Password</Text>
            </Text>
            <Text style={styles.headlineSub}>
              Choose a strong, secure password to protect your HRSJM membership account.
            </Text>
          </View>
        </View>

        {/* Floating White Card */}
        <View style={styles.sheet}>
          {isSuccess ? (
            <View style={styles.resultContainer}>
              <View style={styles.successHalo}>
                <View style={styles.successEmblem}>
                  <Icon name="check" size={28} color="#059669" />
                </View>
              </View>
              <Text style={styles.resultTitle}>Password Updated Successfully</Text>
              <Text style={styles.resultSub}>
                Your account password has been updated in the database. You can now sign in using your new credentials.
              </Text>
              <TouchableOpacity
                style={styles.primaryGoldButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Sign In Now"
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Sign In Now</Text>
                  <View style={styles.arrowIconWrap}>
                    <ArrowRightIcon size={18} color="#011F39" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Specify your new account password (8–72 characters).
              </Text>

              {formError && (
                <View style={styles.errorBannerContainer}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              )}

              {/* Token State Indicator (Internalized, not an editable text input) */}
              {token ? (
                <View style={styles.tokenStatusBadge}>
                  <Icon name="shield-check" size={16} color="#059669" />
                  <Text style={styles.tokenStatusText}>Reset Token Applied &amp; Verified</Text>
                </View>
              ) : (
                <View style={styles.missingTokenContainer}>
                  <Text style={styles.missingTokenTitle}>No Reset Token Found</Text>
                  <Text style={styles.missingTokenText}>
                    Please open the link directly from your password reset email, or request a new reset link below.
                  </Text>
                  <TouchableOpacity
                    style={styles.requestLinkButton}
                    onPress={() => navigation.navigate('ForgotPassword')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.requestLinkButtonText}>Request New Reset Link</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* New Password Input */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.password ? styles.inputContainerError : null,
                  ]}
                >
                  <View style={styles.inputIconWrap}>
                    <LockOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                      if (formError) setFormError(null);
                    }}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    editable={!submitting}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeIconWrap}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                {fieldErrors.password && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Confirm New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.confirm_password ? styles.inputContainerError : null,
                  ]}
                >
                  <View style={styles.inputIconWrap}>
                    <LockOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (fieldErrors.confirm_password) {
                        setFieldErrors((prev) => ({ ...prev, confirm_password: '' }));
                      }
                      if (formError) setFormError(null);
                    }}
                    placeholder="Re-type new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    editable={!submitting}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={styles.textInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    style={styles.eyeIconWrap}
                    accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                {fieldErrors.confirm_password && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.confirm_password}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.primaryGoldButton,
                  (submitting || !token) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting || !token}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Update Password"
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#011F39" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                    <View style={styles.arrowIconWrap}>
                      <ArrowRightIcon size={18} color="#011F39" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  successHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    borderWidth: 1,
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
    fontWeight: '800',
    color: '#0B2F52',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: FontFamilies.serif,
  },
  resultSub: {
    fontSize: 14,
    color: '#34516D',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
    fontFamily: FontFamilies.sans,
  },

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
  tokenStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  tokenStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
    fontFamily: FontFamilies.sans,
  },
  missingTokenContainer: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  missingTokenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
    fontFamily: FontFamilies.sans,
  },
  missingTokenText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: FontFamilies.sans,
  },
  requestLinkButton: {
    backgroundColor: '#011F39',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  requestLinkButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: FontFamilies.sans,
  },
  fieldWrapper: {
    marginBottom: 18,
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
  eyeIconWrap: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 14.5,
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
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#EAA224',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
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
});

export default ResetPasswordScreen;
