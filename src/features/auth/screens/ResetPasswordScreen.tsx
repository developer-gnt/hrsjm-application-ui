import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppButton } from '../../../core/components/common/AppButton';
import { AppInput } from '../../../core/components/common/AppInput';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { ApiError } from '../../../core/api/api-error';
import { authService } from '../services/auth.service';
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
 * Completes the reset flow with a valid reset token (30-minute TTL backend
 * side). On success the backend revokes all refresh tokens, so the user is
 * routed back to the login screen.
 */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const prefillToken = route.params?.token ?? '';

  const [token, setToken] = useState(prefillToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSubmit = async () => {
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
      Alert.alert(
        'Password updated',
        'Your password has been changed. Please login with the new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 400) {
        setFormError(
          'Invalid or expired reset token. Request a new reset link and try again.',
        );
      } else {
        setFormError(
          error instanceof ApiError && error.message
            ? error.message
            : 'Unable to reset the password. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Reset Password"
        showBack
        onBack={() => navigation.navigate('Login')}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Text style={styles.helper}>
          Choose a new password (8–72 characters). This revokes all existing
          sessions for your account.
        </Text>

        {formError && <Text style={styles.errorBanner}>{formError}</Text>}

        <AppInput
          label="Reset token"
          placeholder="Paste the reset token"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting && !prefillToken}
          error={fieldErrors.token}
          returnKeyType="next"
        />

        <AppInput
          label="New password"
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!submitting}
          error={fieldErrors.password}
          returnKeyType="next"
        />

        <AppInput
          label="Confirm new password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!submitting}
          error={fieldErrors.confirm_password}
          returnKeyType="done"
          onSubmitEditing={() => handleSubmit()}
        />

        <AppButton
          title="Update Password"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          size="lg"
          style={styles.actionButton}
        />
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
  actionButton: {
    marginTop: Spacing.sm,
  },
});

export default ResetPasswordScreen;