import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { Check, X } from '../../../../core/components/icons';
import { feedback } from '../../../../core/feedback/FeedbackContext';
import { supportService } from '../services/support.service';
import type { CreateTicketBody } from '../types/support.types';

interface CreateTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'Membership', label: 'Membership Issue', icon: '🏛️' },
  { id: 'Donation', label: 'Donation & Payment', icon: '💳' },
  { id: 'Assistance', label: 'Assistance / Scheme', icon: '🤝' },
  { id: 'Technical', label: 'App / Technical', icon: '📱' },
  { id: 'KYC', label: 'KYC & Verification', icon: '🪪' },
  { id: 'General', label: 'General / Other', icon: '💬' },
];

const PRIORITIES: Array<{ id: 'NORMAL' | 'HIGH' | 'URGENT'; label: string; tone: string; badgeBg: string }> = [
  { id: 'NORMAL', label: 'Normal', tone: '#0F2C59', badgeBg: '#EFF6FF' },
  { id: 'HIGH', label: 'High Priority', tone: '#D97706', badgeBg: '#FEF3C7' },
  { id: 'URGENT', label: 'Urgent Action', tone: '#DC2626', badgeBg: '#FEE2E2' },
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<string>('Membership');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOtherCategory = category === 'General';

  const resetForm = () => {
    setCategory('Membership');
    setCustomCategory('');
    setPriority('NORMAL');
    setSubject('');
    setDescription('');
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (isOtherCategory && (!customCategory.trim() || customCategory.trim().length < 2)) {
      setErrorMsg('Please specify the custom category/topic.');
      return;
    }
    if (!subject.trim() || subject.trim().length < 3) {
      setErrorMsg('Please enter a valid subject (at least 3 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg('Please enter a detailed description (at least 5 characters).');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const finalCategory = isOtherCategory && customCategory.trim()
        ? customCategory.trim()
        : category;

      const payload: CreateTicketBody = {
        category: finalCategory,
        priority,
        subject: subject.trim(),
        description: description.trim(),
      };
      await supportService.create(payload);
      feedback.success(
        'Complaint Submitted',
        'Your support ticket has been submitted successfully and routed to our support team.',
      );
      resetForm();
      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to submit support ticket. Please try again.';
      setErrorMsg(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleCol}>
                <Text style={styles.headerTitle}>New Complaint / Ticket</Text>
                <Text style={styles.headerSubtitle}>
                  Submit a formal complaint or request support
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              showsVerticalScrollIndicator={true}
            >
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Category Selector */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Category / Issue Type</Text>
                <View style={styles.chipsWrap}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={[
                          styles.catChip,
                          isSelected && styles.catChipSelected,
                        ]}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.catEmoji}>{cat.icon}</Text>
                        <Text
                          style={[
                            styles.catChipText,
                            isSelected && styles.catChipTextSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Custom Topic Input (when Other / General is selected) */}
              {isOtherCategory ? (
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>
                    Specify Custom Topic / Category <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="e.g. Website Issue, Certificate Request, Event Help..."
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                    maxLength={60}
                  />
                </View>
              ) : null}

              {/* Priority Selector */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Priority Level</Text>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setPriority(p.id)}
                        style={[
                          styles.priorityCard,
                          isSelected && {
                            borderColor: p.tone,
                            backgroundColor: p.badgeBg,
                          },
                        ]}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.priorityDot,
                            { backgroundColor: p.tone },
                          ]}
                        />
                        <Text
                          style={[
                            styles.priorityText,
                            isSelected && { color: p.tone, fontWeight: '700' },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Subject Input */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>
                  Subject / Summary <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. ID Card validity expired / Payment not updated"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                  maxLength={150}
                />
              </View>

              {/* Description Input */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>
                  Detailed Description <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your issue, including dates, references, or specific details..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.cancelBtn}
                activeOpacity={0.8}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                activeOpacity={0.85}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Complaint</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 44, 89, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '92%',
    display: 'flex',
    flexDirection: 'column',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C59',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  requiredStar: {
    color: '#DC2626',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.lg,
  },
  catChipSelected: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  catEmoji: {
    fontSize: 13,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  catChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 11,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0F2C59',
    shadowColor: '#0F2C59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CreateTicketModal;
