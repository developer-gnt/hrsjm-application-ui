import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { Check, Plus, UsersRound, X } from '../../../../core/components/icons';
import { useMembershipCategories } from '../hooks/useMembers';
import type { CreateMemberPayload, MembershipCategoryItem } from '../services/members.service';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMemberPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

const GENDER_OPTIONS = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
  { key: 'OTHER', label: 'Other' },
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { data: categories = [], isLoading: isLoadingCategories } = useMembershipCategories();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [gender, setGender] = useState<string>('MALE');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [autoActivate, setAutoActivate] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-select first active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters).';
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!selectedCategoryId) {
      newErrors.category = 'Please select a membership category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFullName('');
    setMobileNumber('');
    setEmail('');
    setGender('MALE');
    setDob('');
    setAddress('');
    setCity('');
    setState('');
    setAdminNotes('');
    setAutoActivate(true);
    setErrors({});
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit({
        category_id: selectedCategoryId,
        full_name: fullName.trim(),
        mobile_number: mobileNumber.replace(/\D/g, ''),
        email: email.trim() || undefined,
        personal_details: {
          gender,
          dob: dob.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
        },
        admin_notes: adminNotes.trim() || undefined,
        auto_activate: autoActivate,
      });
      handleReset();
      onClose();
    } catch {
      // Error handled by mutation/caller
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconWrap}>
              <UsersRound size={20} color={BrandColors.navy} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.modalTitle}>Add New Member</Text>
              <Text style={styles.modalSubtitle}>
                Register a new member with membership details
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={BrandColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Membership Category Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Membership Category <Text style={styles.requiredStar}>*</Text>
              </Text>
              {isLoadingCategories ? (
                <View style={styles.categoriesLoading}>
                  <ActivityIndicator size="small" color={BrandColors.navy} />
                  <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
              ) : (
                <View style={styles.categoryGrid}>
                  {categories.map((cat: MembershipCategoryItem) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const feeNum = Number(cat.fee);
                    const feeLabel = Number.isFinite(feeNum)
                      ? `₹${feeNum.toLocaleString('en-IN')}`
                      : `${cat.fee}`;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedCategoryId(cat.id);
                          if (errors.category) {
                            setErrors(prev => ({ ...prev, category: '' }));
                          }
                        }}
                      >
                        <View style={styles.categoryHeader}>
                          <Text
                            style={[
                              styles.categoryName,
                              isSelected && styles.categoryNameSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Check size={11} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.categoryFee,
                            isSelected && styles.categoryFeeSelected,
                          ]}
                        >
                          {feeLabel}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {errors.category ? (
                <Text style={styles.errorText}>{errors.category}</Text>
              ) : null}
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor={BrandColors.textMuted}
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Mobile Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.mobileInputRow,
                  errors.mobileNumber && styles.inputError,
                ]}
              >
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={BrandColors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={text => {
                    setMobileNumber(text);
                    if (errors.mobileNumber)
                      setErrors(prev => ({ ...prev, mobileNumber: '' }));
                  }}
                />
              </View>
              {errors.mobileNumber ? (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address (Optional)</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="e.g. member@example.com"
                placeholderTextColor={BrandColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Gender Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map(opt => {
                  const isSelected = gender === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.genderChip,
                        isSelected && styles.genderChipSelected,
                      ]}
                      onPress={() => setGender(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* City & State */}
            <View style={styles.twoColumnRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mumbai"
                  placeholderTextColor={BrandColors.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maharashtra"
                  placeholderTextColor={BrandColors.textMuted}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Residential Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="House / Street / Locality"
                placeholderTextColor={BrandColors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Auto Activate Switch */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Initial Membership Status</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    autoActivate && styles.statusOptionActive,
                  ]}
                  onPress={() => setAutoActivate(true)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: autoActivate ? '#16A34A' : '#94A3B8' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      autoActivate && styles.statusOptionTextSelected,
                    ]}
                  >
                    Active & Approved
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    !autoActivate && styles.statusOptionPending,
                  ]}
                  onPress={() => setAutoActivate(false)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: !autoActivate ? '#2563EB' : '#94A3B8' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      !autoActivate && styles.statusOptionTextPendingSelected,
                    ]}
                  >
                    Pending Review
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Admin Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Admin Notes / Remarks</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any internal remarks or notes..."
                placeholderTextColor={BrandColors.textMuted}
                multiline
                numberOfLines={3}
                value={adminNotes}
                onChangeText={setAdminNotes}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <AppButton
              title={isSubmitting ? 'Creating Member...' : 'Create Member'}
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.navyDeep,
  },
  modalSubtitle: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
  },
  formScroll: {
    flexGrow: 1,
  },
  formContent: {
    padding: Spacing.lg,
    gap: Spacing.base,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    fontSize: 13,
    color: BrandColors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  mobileInputRow: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.base,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  prefixBox: {
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 13,
    color: BrandColors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.base,
    padding: 10,
    gap: 2,
  },
  categoryCardSelected: {
    borderColor: BrandColors.navy,
    backgroundColor: '#EFF6FF',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  categoryName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  categoryNameSelected: {
    color: BrandColors.navy,
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BrandColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFee: {
    fontSize: 12,
    fontWeight: '800',
    color: BrandColors.goldSoft,
    marginTop: 2,
  },
  categoryFeeSelected: {
    color: BrandColors.navy,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.base,
  },
  genderChipSelected: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  genderTextSelected: {
    color: '#FFFFFF',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.base,
  },
  statusOptionActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  statusOptionPending: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  statusOptionTextSelected: {
    color: '#15803D',
    fontWeight: '800',
  },
  statusOptionTextPendingSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  cancelButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  submitButton: {
    backgroundColor: BrandColors.navy,
    minHeight: 42,
    paddingHorizontal: Spacing.lg,
  },
});

export default AddMemberModal;
