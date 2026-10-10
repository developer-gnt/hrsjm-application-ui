import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { emailSchema } from '../../../../core/utils/validators';
import { AppIcon } from '../../components';
import { ContactInput } from './ContactInput';
import { CONTACT_SUBJECT_OPTIONS } from '../data/contact-content';
import type { ContactFormErrors } from '../types/contact.types';

interface ContactFormProps {
  /** Called with the field values once validation passes (UI phase only). */
  onValidSubmit?: (values: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => void;
}

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_VALUES: FormValues = { name: '', email: '', subject: '', message: '' };

/**
 * Reference-locked "Send Us a Message" form. UI-only: basic client-side
 * validation (required fields + email format via the shared zod schema);
 * submission intentionally does NOT reach any backend and never claims a
 * message was sent.
 */
export const ContactForm: React.FC<ContactFormProps> = ({ onValidSubmit }) => {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const setValue = (key: keyof FormValues, text: string) => {
    setValues(prev => ({ ...prev, [key]: text }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): ContactFormErrors => {
    const next: ContactFormErrors = {};
    if (!values.name.trim()) {
      next.name = 'Full name is required';
    }
    const emailCheck = emailSchema.safeParse(values.email.trim());
    if (!emailCheck.success) {
      next.email = emailCheck.error.issues[0]?.message ?? 'Email is required';
    }
    if (!values.subject.trim()) {
      next.subject = 'Please select a subject';
    }
    if (!values.message.trim()) {
      next.message = 'Please write your message';
    }
    return next;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    // UI PHASE ONLY: no backend call. Never claims a message was sent.
    Alert.alert(
      'Preview only',
      'Form submission connects to the HRSJM backend in an upcoming phase.',
    );
    onValidSubmit?.(values);
    setValues(EMPTY_VALUES);
  };

  const openSubjectDropdown = () => {
    Alert.alert(
      'Select a subject',
      undefined,
      [
        ...CONTACT_SUBJECT_OPTIONS.map(option => ({
          text: option,
          onPress: () => setValue('subject', option),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  return (
    <View>
      <ContactInput
        icon="user"
        placeholder="Full Name *"
        value={values.name}
        onChangeText={text => setValue('name', text)}
        error={errors.name}
      />
      <ContactInput
        icon="email"
        placeholder="Email Address *"
        value={values.email}
        onChangeText={text => setValue('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ContactInput
        icon="message"
        placeholder="Subject *"
        value={values.subject}
        dropdown
        onDropdownPress={openSubjectDropdown}
        error={errors.subject}
      />
      <ContactInput
        icon="message"
        placeholder="Your Message *"
        value={values.message}
        onChangeText={text => setValue('message', text)}
        error={errors.message}
        multiline
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <AppIcon name="send" size={16} color={AdminColors.primaryDark} />
        <Text style={styles.sendLabel}>Send Message</Text>
        <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base + 2,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  sendLabel: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});
