import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../../../../core/api/client';
import { API_ENDPOINTS } from '../../../../core/api/endpoints';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../../../core/theme';
import { emailSchema } from '../../../../core/utils/validators';
import { AppIcon } from '../../components';
import { ContactInput } from './ContactInput';
import { CONTACT_SUBJECT_OPTIONS } from '../data/contact-content';
import type { ContactFormErrors } from '../types/contact.types';

interface ContactFormProps {
  /** Called with the field values once validation and submission succeed. */
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

interface SubmittedConfirmation {
  referenceId: string;
  name: string;
  email: string;
  subject: string;
}

const EMPTY_VALUES: FormValues = { name: '', email: '', subject: '', message: '' };

export const ContactForm: React.FC<ContactFormProps> = ({ onValidSubmit }) => {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedConfirmation, setSubmittedConfirmation] = useState<SubmittedConfirmation | null>(null);

  const setValue = (key: keyof FormValues, text: string) => {
    setValues(prev => ({ ...prev, [key]: text }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const validate = (): ContactFormErrors => {
    const next: ContactFormErrors = {};
    if (!values.name.trim()) {
      next.name = 'Full name is required';
    }
    const emailCheck = emailSchema.safeParse(values.email.trim());
    if (!emailCheck.success) {
      next.email = emailCheck.error.issues[0]?.message ?? 'Valid email is required';
    }
    if (!values.subject.trim()) {
      next.subject = 'Please select a subject';
    }
    if (!values.message.trim()) {
      next.message = 'Please write your message';
    }
    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.CONTACT, {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });

      const responseData = (res as any)?.data?.data || (res as any)?.data || (res as any);
      const refId =
        responseData?.inquiryRef ||
        responseData?.ticketId ||
        `HRSJM-MSG-${Date.now().toString(36).slice(-6).toUpperCase()}`;

      setSubmittedConfirmation({
        referenceId: refId,
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
      });

      onValidSubmit?.(values);
      setValues(EMPTY_VALUES);
      setSubjectMenuOpen(false);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to deliver your message. Please check your connection and try again.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSubject = (subject: string) => {
    setValue('subject', subject);
    setSubjectMenuOpen(false);
  };

  if (submittedConfirmation) {
    return (
      <View style={styles.confirmationCard}>
        <View style={styles.successIconCircle}>
          <AppIcon name="shield-check" size={34} color={AdminColors.primary} />
        </View>

        <Text style={styles.successHeading}>Message Sent Successfully!</Text>

        <View style={styles.refBadge}>
          <Text style={styles.refLabel}>REFERENCE ID</Text>
          <Text style={styles.refCode}>{submittedConfirmation.referenceId}</Text>
        </View>

        <Text style={styles.successMessage}>
          Thank you for reaching out,{' '}
          <Text style={styles.boldText}>{submittedConfirmation.name}</Text>!
        </Text>

        <Text style={styles.successSubtext}>
          Your inquiry regarding{' '}
          <Text style={styles.boldText}>"{submittedConfirmation.subject}"</Text> has
          been recorded and forwarded to our Administrative team.
        </Text>

        <View style={styles.emailNoticeRow}>
          <AppIcon name="email" size={16} color={AdminColors.primary} />
          <Text style={styles.emailNoticeText}>
            A confirmation has been sent to{' '}
            <Text style={styles.boldText}>{submittedConfirmation.email}</Text>. We
            usually respond within 24–48 hours.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sendAnotherButton}
          onPress={() => setSubmittedConfirmation(null)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send another message"
        >
          <Text style={styles.sendAnotherText}>Send Another Message</Text>
          <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.formContainer}>
      {submitError && (
        <View style={styles.errorBanner}>
          <AppIcon name="close" size={14} color={AdminColors.error} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      )}

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

      {/* Subject Dropdown Field */}
      <View style={styles.subjectFieldWrapper}>
        <ContactInput
          icon="message"
          placeholder="Subject *"
          value={values.subject}
          dropdown
          dropdownOpen={subjectMenuOpen}
          onDropdownPress={() => setSubjectMenuOpen(prev => !prev)}
          error={errors.subject}
        />

        {subjectMenuOpen && (
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderTitle}>Select Subject</Text>
              <TouchableOpacity
                onPress={() => setSubjectMenuOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close subject menu"
              >
                <AppIcon name="close" size={14} color={AdminColors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {CONTACT_SUBJECT_OPTIONS.map(option => {
                const isSelected = values.subject === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      isSelected && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => selectSubject(option)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <AppIcon name="check" size={15} color={AdminColors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.belowDropdown}>
        <ContactInput
          icon="message"
          placeholder="Your Message *"
          value={values.message}
          onChangeText={text => setValue('message', text)}
          error={errors.message}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color={AdminColors.primaryDark} />
              <Text style={styles.sendLabel}>Sending Message...</Text>
            </>
          ) : (
            <>
              <AppIcon name="send" size={16} color={AdminColors.primaryDark} />
              <Text style={styles.sendLabel}>Send Message</Text>
              <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    position: 'relative',
    zIndex: 50,
  },
  subjectFieldWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    ...Shadows.cardMedium,
    zIndex: 9999,
    elevation: 25,
    overflow: 'hidden',
    maxHeight: 260,
  },
  dropdownScroll: {
    maxHeight: 220,
    backgroundColor: '#FFFFFF',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: AdminColors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  dropdownHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    backgroundColor: '#FFFFFF',
  },
  dropdownOptionSelected: {
    backgroundColor: AdminColors.accentGoldLight,
  },
  dropdownOptionText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: AdminColors.primaryDark,
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: AdminColors.primary,
  },
  belowDropdown: {
    zIndex: 1,
    position: 'relative',
  },
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
  sendButtonDisabled: {
    opacity: 0.75,
  },
  sendLabel: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  errorBannerText: {
    fontSize: 12,
    color: AdminColors.error,
    fontWeight: '500',
    flex: 1,
  },
  confirmationCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  refBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: Spacing.xs,
  },
  refLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: 0.5,
  },
  refCode: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    fontFamily: 'monospace',
  },
  successMessage: {
    fontSize: 13.5,
    lineHeight: 19,
    color: AdminColors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  successSubtext: {
    fontSize: 12.5,
    lineHeight: 18,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  boldText: {
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  emailNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.base,
    padding: Spacing.sm + 2,
    marginVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  emailNoticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: AdminColors.textSecondary,
  },
  sendAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  sendAnotherText: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});
