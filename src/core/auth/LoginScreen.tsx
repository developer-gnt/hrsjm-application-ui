import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../components/common/AppButton';
import { AppInput } from '../components/common/AppInput';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from './AuthContext';
import { colors, spacing, typography } from '../theme/theme';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !validate()) {
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await signIn(email, password);
      // Passwords are never logged; state carries only the session user.
    } catch (error) {
      setErrors({
        form: getApiErrorMessage(error, 'Login failed. Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>HRSJM</Text>
          <Text style={styles.title}>Admin Sign In</Text>
          <Text style={styles.subtitle}>
            Sign in with your HRSJM admin account to continue.
          </Text>

          {errors.form ? (
            <View style={styles.formError} accessibilityRole="alert">
              <Text style={styles.formErrorText}>{errors.form}</Text>
            </View>
          ) : null}

          <AppInput
            label="Email"
            required
            value={email}
            onChangeText={text => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <AppInput
            label="Password"
            required
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry
            autoComplete="password"
            error={errors.password}
          />

          <AppButton
            title="Sign In"
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
            accessibilityLabel="Sign in"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  brand: {
    ...typography.metric,
    color: colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  formError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  formErrorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
});

export default LoginScreen;
