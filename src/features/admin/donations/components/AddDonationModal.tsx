import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  AppButton,
  AppInput,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../core';
import { CreateDonationInput, DonationCategory } from '../types/donations.types';

interface AddDonationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateDonationInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

const TYPE_OPTIONS: { key: Exclude<DonationCategory, 'ALL'>; label: string }[] = [
  { key: 'ONE_TIME', label: 'One-time' },
  { key: 'RECURRING', label: 'Recurring' },
  { key: 'OFFLINE', label: 'Offline' },
];

export const AddDonationModal: React.FC<AddDonationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [donorName, setDonorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cause, setCause] = useState('General Donation');
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState<
    'ONE_TIME' | 'RECURRING' | 'OFFLINE'
  >('ONE_TIME');
  const [remark, setRemark] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!donorName.trim()) {
      newErrors.donorName = 'Donor name is required.';
    }
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    }
    const numAmount = parseFloat(amount.trim());
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid donation amount.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setDonorName('');
    setMobileNumber('');
    setEmail('');
    setCause('General Donation');
    setAmount('');
    setDonationType('ONE_TIME');
    setRemark('');
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit({
        donor_name: donorName.trim(),
        donor_mobile: mobileNumber.trim(),
        donor_email: email.trim() || undefined,
        cause: cause.trim() || 'General Donation',
        amount: parseFloat(amount.trim()),
        donation_type: donationType,
        remark: remark.trim() || undefined,
      });
      handleReset();
      onClose();
    } catch {
      // Error handled by parent or mutation
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.avoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>+ Add Donation</Text>
                <Text style={styles.subtitle}>
                  Record a new donation received for the mission.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close form"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <AppInput
                label="Donor Full Name"
                placeholder="e.g. Aman Shaikh"
                value={donorName}
                onChangeText={text => {
                  setDonorName(text);
                  if (errors.donorName) {
                    setErrors(prev => ({ ...prev, donorName: '' }));
                  }
                }}
                required
                error={errors.donorName}
              />

              <AppInput
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={text => {
                  setMobileNumber(text);
                  if (errors.mobileNumber) {
                    setErrors(prev => ({ ...prev, mobileNumber: '' }));
                  }
                }}
                required
                error={errors.mobileNumber}
              />

              <AppInput
                label="Email Address (Optional)"
                placeholder="e.g. donor@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <AppInput
                label="Donation Cause / Campaign"
                placeholder="e.g. General Donation, Medical Support"
                value={cause}
                onChangeText={setCause}
              />

              <View style={styles.typeSection}>
                <Text style={styles.typeLabel}>Donation Type</Text>
                <View style={styles.typePillsRow}>
                  {TYPE_OPTIONS.map(opt => {
                    const isSelected = donationType === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          styles.typePill,
                          isSelected && styles.typePillActive,
                        ]}
                        onPress={() => setDonationType(opt.key)}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.typePillText,
                            isSelected && styles.typePillTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <AppInput
                label="Amount (₹)"
                placeholder="e.g. 5000"
                keyboardType="numeric"
                value={amount}
                onChangeText={text => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }
                }}
                required
                error={errors.amount}
              />

              <AppInput
                label="Remarks / Notes (Optional)"
                placeholder="Additional donation details..."
                multiline
                numberOfLines={3}
                value={remark}
                onChangeText={setRemark}
              />
            </ScrollView>

            <View style={styles.footer}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                style={styles.cancelButton}
                onPress={onClose}
              />
              <AppButton
                title={isSubmitting ? 'Saving...' : 'Save Donation'}
                variant="primary"
                size="md"
                style={styles.submitButton}
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  avoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  subtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    padding: Spacing.xs,
  },
  formScroll: {
    maxHeight: 440,
  },
  formContent: {
    paddingVertical: Spacing.xs,
  },
  typeSection: {
    marginBottom: Spacing.md,
  },
  typeLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  typePillsRow: {
    flexDirection: 'row',
  },
  typePill: {
    flex: 1,
    backgroundColor: AdminColors.divider,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  typePillActive: {
    backgroundColor: AdminColors.primary,
  },
  typePillText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  typePillTextActive: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AdminColors.divider,
  },
  cancelButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  submitButton: {
    flex: 2,
  },
});
