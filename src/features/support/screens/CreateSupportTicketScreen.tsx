import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { TicketAttachment, TicketDraft } from '../types/ticket.types';
import { supportTicketsStore } from '../services/supportTicketsStore';
import { SupportTicketsHeader } from '../components/SupportTicketsHeader';
import { SupportProgressStepper } from '../components/SupportProgressStepper';
import { SupportCategorySelector } from '../components/SupportCategorySelector';
import { SupportAttachmentUploader } from '../components/SupportAttachmentUploader';
import { SupportBottomNav } from '../components/SupportBottomNav';

interface CreateSupportTicketScreenProps {
  onBack?: () => void;
  onCancel?: () => void;
  onNext?: (draft: TicketDraft) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const CreateSupportTicketScreen: React.FC<CreateSupportTicketScreenProps> = ({
  onBack,
  onCancel,
  onNext,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const existingDraft = supportTicketsStore.getDraft();

  const [category, setCategory] = useState<string>(existingDraft.category || '');
  const [subject, setSubject] = useState<string>(existingDraft.subject || '');
  const [description, setDescription] = useState<string>(existingDraft.description || '');
  const [attachments, setAttachments] = useState<TicketAttachment[]>(existingDraft.attachments || []);

  // Validation errors
  const [categoryError, setCategoryError] = useState<string | undefined>(undefined);
  const [subjectError, setSubjectError] = useState<string | undefined>(undefined);
  const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);

  const handleCategoryChange = (selected: string) => {
    setCategory(selected);
    setCategoryError(undefined);
    supportTicketsStore.updateDraft({ category: selected });
  };

  const handleSubjectChange = (text: string) => {
    setSubject(text);
    if (text.trim()) setSubjectError(undefined);
    supportTicketsStore.updateDraft({ subject: text });
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (text.trim()) setDescriptionError(undefined);
    supportTicketsStore.updateDraft({ description: text });
  };

  const handleAddAttachment = (attachment: TicketAttachment) => {
    const nextList = [...attachments, attachment];
    setAttachments(nextList);
    supportTicketsStore.updateDraft({ attachments: nextList });
  };

  const handleRemoveAttachment = (id: string) => {
    const nextList = attachments.filter(a => a.id !== id);
    setAttachments(nextList);
    supportTicketsStore.updateDraft({ attachments: nextList });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    let hasError = false;

    if (!category || !category.trim()) {
      setCategoryError('Please select a ticket category.');
      hasError = true;
    }

    if (!subject || !subject.trim()) {
      setSubjectError('Please enter a brief subject for your request.');
      hasError = true;
    }

    if (!description || !description.trim()) {
      setDescriptionError('Please describe your issue or request in detail.');
      hasError = true;
    }

    if (hasError) return;

    const draftData: TicketDraft = {
      category: category.trim(),
      subject: subject.trim(),
      description: description.trim(),
      attachments,
    };

    supportTicketsStore.updateDraft(draftData);

    if (onNext) {
      onNext(draftData);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <SupportTicketsHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrap}>
            {/* Back link */}
            <TouchableOpacity
              style={styles.backLinkRow}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to Support Tickets"
            >
              <Text style={styles.backChevron}>←</Text>
              <Text style={styles.backLinkText}>Back to Support Tickets</Text>
            </TouchableOpacity>

            {/* Page Title & Subtitle */}
            <Text style={styles.pageTitle}>Create Support Ticket</Text>
            <Text style={styles.pageSubtitle}>
              Raise your request and get help from our team.
            </Text>

            {/* Step Progress Indicator (Step 1 active) */}
            <SupportProgressStepper currentStep={1} />

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Category Selector (collapsed & Screen 3 expanded inline dropdown) */}
              <SupportCategorySelector
                selectedCategory={category}
                onSelectCategory={handleCategoryChange}
                error={categoryError}
              />

              {/* Subject Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Subject</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    !!subjectError && styles.textInputError,
                  ]}
                  placeholder="Enter a brief subject for your request..."
                  placeholderTextColor="#94A3B8"
                  value={subject}
                  onChangeText={handleSubjectChange}
                  accessibilityLabel="Subject"
                />
                {!!subjectError && (
                  <Text style={styles.errorText}>{subjectError}</Text>
                )}
              </View>

              {/* Description Input with 500-character counter */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                <TextInput
                  style={[
                    styles.textArea,
                    !!descriptionError && styles.textInputError,
                  ]}
                  placeholder="Please describe your issue or request in detail..."
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={handleDescriptionChange}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  accessibilityLabel="Description"
                />
                <View style={styles.descFooterRow}>
                  {!!descriptionError ? (
                    <Text style={styles.errorText}>{descriptionError}</Text>
                  ) : <View />}
                  <Text
                    style={[
                      styles.counterText,
                      description.length >= 480 && styles.counterTextWarning,
                    ]}
                  >
                    {`${description.length}/500`}
                  </Text>
                </View>
              </View>

              {/* Attach Files (Optional) */}
              <SupportAttachmentUploader
                attachments={attachments}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={handleRemoveAttachment}
              />

              {/* Bottom Actions: Cancel & Next Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Next"
                >
                  <Text style={styles.nextButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavHost}>
        <SupportBottomNav
          bottomInset={insets.bottom}
          activeKey="support"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  backChevron: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  backLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  formContainer: {
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.sm + 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredAsterisk: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 90,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  descFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  counterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  counterTextWarning: {
    color: '#D97706',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 3,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primary,
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
