import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppButton } from '../../../core/components/common/AppButton';
import { AppInput } from '../../../core/components/common/AppInput';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../core/theme/spacing';
import { ApiError } from '../../../core/api/api-error';
import {
  ACCOUNT_TYPE_OPTIONS,
  AccountTypeKey,
} from '../types/auth.schemas';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const STEPS = ['Personal Details', 'Account & Security', 'Complete'] as const;

/**
 * Registration form. Three steps (the mockup's "Verification" step needs an
 * OTP backend that doesn't exist yet): personal details → account type &
 * password → complete. Submitting calls POST /auth/register which returns a
 * token pair; the session activates when the user taps Continue on Complete.
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const register = useAuthStore(state => state.register);
  const completeRegistration = useAuthStore(state => state.completeRegistration);

  const [step, setStep] = useState(0);

  // Step 0 — personal details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Step 1 — account & security
  const [accountTypeKey, setAccountTypeKey] = useState<AccountTypeKey>('GENERAL_USER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
    } else if (step === 1) {
      setStep(0);
    }
  };

  const validateStep0 = (): boolean => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors.full_name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      errors.mobile_number = 'Enter a valid 10-digit mobile number';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
    else if (!/[A-Z]/.test(password)) errors.password = 'Password must contain an uppercase letter';
    else if (!/[a-z]/.test(password)) errors.password = 'Password must contain a lowercase letter';
    else if (!/[0-9]/.test(password)) errors.password = 'Password must contain a number';
    if (confirmPassword !== password) errors.confirm_password = 'Passwords do not match';
    if (!acceptsTerms) errors.accepts_terms = 'Please accept the Terms & Conditions';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    setFormError(null);
    if (step === 0) {
      if (validateStep0()) {
        setStep(1);
      }
      return;
    }
    if (step === 1) {
      if (!validateStep1()) {
        return;
      }
      setSubmitting(true);
      try {
        const role_name = ACCOUNT_TYPE_OPTIONS.find(o => o.key === accountTypeKey)?.role_name;
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          mobile_number: mobile.trim(),
          password,
          confirm_password: confirmPassword,
          ...(role_name ? { role_name } : {}),
        });
        setStep(2);
      } catch (error) {
        if (error instanceof ApiError && error.errors && !Array.isArray(error.errors)) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(error.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]),
            ),
          );
        }
        setFormError(
          error instanceof ApiError && error.statusCode === 409
            ? 'An account with this mobile number or email already exists. Try logging in instead.'
            : error instanceof ApiError && error.message
              ? error.message
              : 'Unable to create the account. Please try again.',
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFinish = () => {
    completeRegistration();
    Alert.alert('Welcome to HRSJM 🎉', 'Your account is ready.');
  };

  const passwordChecks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', pass: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', pass: /[a-z]/.test(password) },
    { label: 'One number (0–9)', pass: /[0-9]/.test(password) },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <AppHeader
        title="Create Your Account"
        showBack={step < 2}
        onBack={goBack}
        variant="white"
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {step < 2 && (
          <StepStepper current={step} />
        )}

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSubtitle}>
              Fill in your details to create an account.
            </Text>

            <AppInput
              label="Full Name"
              required
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              editable={!submitting}
              error={fieldErrors.full_name}
              leftIcon={<Text style={styles.leadingIcon}>👤</Text>}
            />
            <AppInput
              label="Email Address"
              required
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              error={fieldErrors.email}
              leftIcon={<Text style={styles.leadingIcon}>✉️</Text>}
            />
            <AppInput
              label="Mobile Number"
              required
              placeholder="10-digit mobile number"
              value={mobile}
              onChangeText={text => setMobile(text.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              editable={!submitting}
              error={fieldErrors.mobile_number}
              leftIcon={<Text style={styles.leadingIcon}>📞</Text>}
              helperText="Indian numbers only (+91)"
            />

            <AppButton
              title="Continue"
              onPress={() => {
                handleContinue();
              }}
              variant="gold"
              size="lg"
              icon={<Text style={styles.buttonArrow}>→</Text>}
              iconPosition="right"
              style={styles.actionButton}
            />
            <SignUpHint onLogin={() => navigation.navigate('Login')} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Type</Text>
            <Text style={styles.sectionSubtitle}>
              Please select the option that best describes you.
            </Text>

            <View style={styles.typeGrid}>
              {ACCOUNT_TYPE_OPTIONS.map(option => {
                const selected = accountTypeKey === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setAccountTypeKey(option.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.typeCard,
                      selected ? styles.typeCardSelected : null,
                    ]}
                  >
                    {selected && (
                      <View style={styles.typeCheck}>
                        <Text style={styles.typeCheckText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.typeIcon}>{option.icon}</Text>
                    <Text style={styles.typeLabel}>{option.label}</Text>
                    <Text style={styles.typeDescription}>{option.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Create Password</Text>
            <Text style={styles.sectionSubtitle}>
              Use a strong password to keep your account secure.
            </Text>

            <AppInput
              label="Password"
              required
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!submitting}
              error={fieldErrors.password}
              leftIcon={<Text style={styles.leadingIcon}>🔒</Text>}
            />
            <View style={styles.checklist}>
              <Text style={styles.checklistTitle}>Password must contain:</Text>
              {passwordChecks.map(check => (
                <View style={styles.checklistRow} key={check.label}>
                  <View
                    style={[
                      styles.checklistDot,
                      check.pass ? styles.checklistDotPass : null,
                    ]}
                  >
                    {check.pass && <Text style={styles.checklistTick}>✓</Text>}
                  </View>
                  <Text style={styles.checklistText}>{check.label}</Text>
                </View>
              ))}
            </View>

            <AppInput
              label="Confirm Password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!submitting}
              error={fieldErrors.confirm_password}
              leftIcon={<Text style={styles.leadingIcon}>🔒</Text>}
            />

            <TouchableOpacity
              onPress={() => setAcceptsTerms(current => !current)}
              style={styles.termsRow}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptsTerms ? styles.checkboxChecked : null,
                  fieldErrors.accepts_terms ? styles.checkboxError : null,
                ]}
              >
                {acceptsTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text> of HRSJM.
              </Text>
            </TouchableOpacity>
            {fieldErrors.accepts_terms ? (
              <Text style={styles.fieldError}>{fieldErrors.accepts_terms}</Text>
            ) : null}

            {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

            <AppButton
              title="Create Account"
              onPress={() => {
                handleContinue();
              }}
              variant="gold"
              size="lg"
              loading={submitting}
              disabled={submitting}
              icon={<Text style={styles.buttonArrow}>→</Text>}
              iconPosition="right"
              style={styles.actionButton}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.completeContainer}>
            <View style={styles.completeIcon}>
              <Text style={styles.completeIconText}>✓</Text>
            </View>
            <Text style={styles.completeTitle}>Account Created!</Text>
            <Text style={styles.completeText}>
              Welcome to HRSJM, {fullName.trim()}. Your account is ready —
              explore the mission, and welcome aboard.
            </Text>
            <AppButton
              title="Continue"
              onPress={handleFinish}
              variant="gold"
              size="lg"
              icon={<Text style={styles.buttonArrow}>→</Text>}
              iconPosition="right"
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const StepStepper: React.FC<{ current: number }> = ({ current }) => (
  <View style={styles.stepper}>
    {STEPS.map((label, index) => (
      <View style={styles.stepItem} key={label}>
        <View
          style={[
            styles.stepCircle,
            index <= current ? styles.stepCircleActive : null,
          ]}
        >
          <Text style={styles.stepCircleText}>{index + 1}</Text>
        </View>
        <Text
          style={[
            styles.stepLabel,
            index <= current ? styles.stepLabelActive : null,
          ]}
        >
          {label}
        </Text>
        {index < STEPS.length - 1 && <View style={styles.stepConnector} />}
      </View>
    ))}
  </View>
);

const SignUpHint: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <View style={styles.signupRow}>
    <Text style={styles.signupPrompt}>Already have an account? </Text>
    <TouchableOpacity onPress={onLogin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={styles.signupLink}>Login</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  section: {
    padding: Spacing.xl,
  },
  leadingIcon: {
    fontSize: 15,
  },
  sectionTitle: {
    ...Typography.screenTitle,
    color: AdminColors.primaryDark,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    marginTop: Spacing.lg,
  },
  buttonArrow: {
    fontSize: 16,
    color: AdminColors.textOnDark,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  typeCard: {
    width: '48.5%' as unknown as number,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 120,
    ...Shadows.card,
  },
  typeCardSelected: {
    borderColor: AdminColors.accentGold,
    backgroundColor: AdminColors.accentGoldLight,
  },
  typeCheck: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCheckText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeLabel: {
    ...Typography.cardTitle,
    color: AdminColors.primaryDark,
    marginTop: Spacing.sm,
  },
  typeDescription: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  checklist: {
    marginBottom: Spacing.md,
  },
  checklistTitle: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  checklistDot: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checklistDotPass: {
    backgroundColor: AdminColors.success,
    borderColor: AdminColors.success,
  },
  checklistTick: {
    fontSize: 9,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  checklistText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: AdminColors.accentGold,
    borderColor: AdminColors.accentGold,
  },
  checkboxError: {
    borderColor: AdminColors.error,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  termsText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: AdminColors.info,
    fontWeight: '500',
  },
  fieldError: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },
  errorBanner: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
    backgroundColor: AdminColors.errorLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  signupPrompt: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
  signupLink: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completeIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeIconText: {
    fontSize: 34,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  completeTitle: {
    ...Typography.screenTitle,
    color: AdminColors.primaryDark,
    marginTop: Spacing.lg,
  },
  completeText: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: AdminColors.accentGold,
    borderColor: AdminColors.accentGold,
  },
  stepCircleText: {
    ...Typography.badge,
    color: AdminColors.textOnDark,
  },
  stepLabel: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  stepLabelActive: {
    color: AdminColors.primaryDark,
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 14,
    left: '50%' as unknown as number,
    right: '-50%' as unknown as number,
    height: 1.5,
    backgroundColor: AdminColors.border,
  },
});

export default RegisterScreen;