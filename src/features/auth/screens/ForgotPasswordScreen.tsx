import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppButton } from '../../../core/components/common/AppButton';
import { AppCard } from '../../../core/components/common/AppCard';
import { AppInput } from '../../../core/components/common/AppInput';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { ApiError } from '../../../core/api/api-error';
import { authService } from '../services/auth.service';
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
 * Requests a password reset for an identifier. Delivery channel is TBC in the
 * backend; outside production the reset token is returned and surfaced here
 * (dev-only convenience) with a shortcut into the reset form.
 */
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
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
        zodErrorsToFieldErrors(parsed.error).identifier ?? 'Invalid input',
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
          : 'Unable to submit the request. Please try again.',
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
    <View style={styles.flex}>
      <AppHeader
        title="Forgot Password"
        showBack
        onBack={goBackToLogin}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {result ? (
          <View style={styles.body}>
            <AppCard variant="elevated">
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Request submitted</Text>
              <Text style={styles.bodyText}>
                If this account exists, reset instructions will be delivered via
                ({result.delivered_mechanism}).
              </Text>
              {result.reset_token ? (
                <>
                  <View style={styles.devNote}>
                    <Text style={styles.devNoteLabel}>DEV RESET TOKEN</Text>
                    <Text style={styles.devNoteValue} selectable>
                      {result.reset_token}
                    </Text>
                  </View>
                  <AppButton
                    title="Continue to Reset Password"
                    onPress={continueToReset}
                    style={styles.actionButton}
                  />
                </>
              ) : null}
              <AppButton
                title="Back to Login"
                onPress={goBackToLogin}
                variant="outline"
                style={styles.actionButton}
              />
            </AppCard>
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={styles.helper}>
              Enter your registered mobile number or email and we will send
              password reset instructions.
            </Text>

            {formError && <Text style={styles.errorBanner}>{formError}</Text>}

            <AppInput
              label="Mobile number or email"
              placeholder="Enter your mobile number or email"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              error={fieldError ?? undefined}
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
            />

            <AppButton
              title="Send Reset Request"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              size="lg"
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  body: {
    flex: 1,
  },
  helper: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
    backgroundColor: AdminColors.errorLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontSize: 44,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.screenTitle,
    color: AdminColors.textPrimary,
    textAlign: 'center',
  },
  bodyText: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  devNote: {
    backgroundColor: AdminColors.warningLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  devNoteLabel: {
    ...Typography.badge,
    color: AdminColors.warning,
    letterSpacing: 1,
  },
  devNoteValue: {
    ...Typography.secondary,
    color: AdminColors.textPrimary,
    marginTop: Spacing.xs,
  },
  actionButton: {
    marginTop: Spacing.lg,
  },
});

export default ForgotPasswordScreen;