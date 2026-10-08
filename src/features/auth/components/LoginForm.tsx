import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';
import {
  LoginFormData,
  loginSchema,
  zodErrorsToFieldErrors,
} from '../types/auth.schemas';
import {
  MailOutlineIcon,
  LockOutlineIcon,
  EyeOutlineIcon,
  EyeSlashOutlineIcon,
  CheckCircleFilledIcon,
} from './AuthIcons';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (values: LoginFormData, rememberMe: boolean) => void;
  onForgotPassword: () => void;
  /** Registers the form's submit so a parent-rendered button can trigger it. */
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

/**
 * Premium Login Form:
 * Clean modern inputs with vector icons, focus state highlights,
 * custom remember-me checkbox, and sleek forgot-password action.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSubmit,
  onForgotPassword,
  submitRef,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<'identifier' | 'password' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const parsed = loginSchema.safeParse({ identifier: identifier.trim(), password });
    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    onSubmit(parsed.data, rememberMe);
  };

  React.useEffect(() => {
    if (submitRef) {
      submitRef.current = handleSubmit;
    }
  });

  return (
    <View style={styles.form}>
      {/* Email / Mobile Input */}
      <View style={styles.fieldWrapper}>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'identifier' && styles.inputContainerFocused,
            Boolean(fieldErrors.identifier) && styles.inputContainerError,
          ]}
        >
          <View style={styles.iconSlot}>
            <MailOutlineIcon
              size={19}
              color={focusedField === 'identifier' ? '#0F2860' : '#64748B'}
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Email ID / Mobile Number"
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={text => {
              setIdentifier(text);
              if (fieldErrors.identifier) {
                setFieldErrors(prev => ({ ...prev, identifier: '' }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onFocus={() => setFocusedField('identifier')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => handleSubmit()}
            accessibilityLabel="Email ID or Mobile Number"
          />
        </View>
        {Boolean(fieldErrors.identifier) && (
          <Text style={styles.errorText}>{fieldErrors.identifier}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.fieldWrapper}>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'password' && styles.inputContainerFocused,
            Boolean(fieldErrors.password) && styles.inputContainerError,
          ]}
        >
          <View style={styles.iconSlot}>
            <LockOutlineIcon
              size={19}
              color={focusedField === 'password' ? '#0F2860' : '#64748B'}
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (fieldErrors.password) {
                setFieldErrors(prev => ({ ...prev, password: '' }));
              }
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit()}
            accessibilityLabel="Password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.eyeSlot}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOutlineIcon size={19} color="#0F2860" />
            ) : (
              <EyeSlashOutlineIcon size={19} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>
        {Boolean(fieldErrors.password) && (
          <Text style={styles.errorText}>{fieldErrors.password}</Text>
        )}
      </View>

      {/* Remember Me & Forgot Password Row */}
      <View style={styles.auxRow}>
        <TouchableOpacity
          onPress={() => setRememberMe(current => !current)}
          style={styles.rememberRow}
          activeOpacity={0.8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          accessibilityLabel="Remember me"
        >
          <View
            style={[
              styles.checkbox,
              rememberMe && styles.checkboxChecked,
            ]}
          >
            {rememberMe && (
              <View style={styles.whiteCheckmark} />
            )}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onForgotPassword}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Forgot Password"
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: Spacing.md,
  },
  fieldWrapper: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: '#EAA224',
    borderWidth: 1.6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  iconSlot: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeSlot: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EAA224',
    borderColor: '#EAA224',
  },
  whiteCheckmark: {
    width: 9,
    height: 5,
    borderLeftWidth: 1.8,
    borderBottomWidth: 1.8,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  rememberText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '500',
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 13.5,
    color: '#0F2860',
    fontWeight: '700',
  },
});

export default LoginForm;