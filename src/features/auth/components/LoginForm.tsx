import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AppInput } from '../../../core/components/common/AppInput';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';
import {
  LoginFormData,
  loginSchema,
  zodErrorsToFieldErrors,
} from '../types/auth.schemas';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (values: LoginFormData, rememberMe: boolean) => void;
  onForgotPassword: () => void;
  /** Registers the form's submit so a parent-rendered button can trigger it. */
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

/**
 * Login form per the approved design: icon inputs, "Remember me" + Forgot
 * password row. Validation mirrors the backend LoginDto before submit.
 * Field state lives here; the screen renders the submit button.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSubmit,
  onForgotPassword,
  submitRef,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    onSubmit(parsed.data, rememberMe);
  };

  // Keep submitRef.current pointing to the latest handleSubmit
  React.useEffect(() => {
    if (submitRef) {
      submitRef.current = handleSubmit;
    }
  });

  return (
    <View style={styles.form}>
      <AppInput
        placeholder="Email ID / Mobile Number"
        value={identifier}
        onChangeText={setIdentifier}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        error={fieldErrors.identifier}
        leftIcon={<Text style={styles.leadingIcon}>✉️</Text>}
        returnKeyType="next"
        onSubmitEditing={() => handleSubmit()}
      />
      <AppInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
        error={fieldErrors.password}
        leftIcon={<Text style={styles.leadingIcon}>🔒</Text>}
        returnKeyType="done"
        onSubmitEditing={() => handleSubmit()}
      />

      <View style={styles.auxRow}>
        <TouchableOpacity
          onPress={() => setRememberMe(current => !current)}
          style={styles.rememberRow}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View
            style={[styles.checkbox, rememberMe ? styles.checkboxChecked : null]}
          >
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onForgotPassword}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: Spacing.lg,
  },
  leadingIcon: {
    fontSize: 15,
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  checkboxChecked: {
    backgroundColor: AdminColors.accentGold,
    borderColor: AdminColors.accentGold,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  rememberText: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    marginLeft: Spacing.sm,
  },
  forgotText: {
    ...Typography.bodyMedium,
    color: AdminColors.info,
  },
});