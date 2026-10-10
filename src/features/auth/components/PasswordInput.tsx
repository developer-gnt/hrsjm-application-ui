import React from 'react';
import { AppInput } from '../../../core/components/common/AppInput';
import { TextInputProps } from 'react-native';

interface PasswordInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * Password field with the core AppInput's built-in visibility toggle.
 * Kept as a feature alias so auth forms use one semantic component.
 */
export const PasswordInput: React.FC<PasswordInputProps> = props => (
  <AppInput secureTextEntry autoCapitalize="none" {...props} />
);