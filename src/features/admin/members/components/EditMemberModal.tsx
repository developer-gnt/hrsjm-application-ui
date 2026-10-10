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
import { DatePickerModal } from '../../../../core/components/common/DatePickerModal';
import { Calendar, Check, Pencil, X } from '../../../../core/components/icons';
import { useMembershipCategories } from '../hooks/useMembers';
import type { BackendMembership, UpdateMemberPayload } from '../services/members.service';
import type { Member } from '../types';

interface EditMemberModalProps {
  visible: boolean;
  member: Member | null;
  onClose: () => void;
  onSubmit: (id: string, payload: UpdateMemberPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

const GENDER_OPTIONS = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
  { key: 'OTHER', label: 'Other' },
];

const QUALIFICATION_OPTIONS = [
  { key: '10th Pass', label: '10th Pass (10 TH)' },
  { key: '12th Pass', label: '12th Pass (12 TH)' },
  { key: 'Graduate', label: 'Graduate' },
  { key: 'Post Graduate', label: 'Post Graduate' },
  { key: 'Other', label: 'Other' },
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  visible,
  member,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { data: categories = [], isLoading: isLoadingCategories } = useMembershipCategories();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [qualification, setQualification] = useState<string>('10th Pass');
  const [customQualification, setCustomQualification] = useState('');
  const [gender, setGender] = useState<string>('MALE');
  const [dob, setDob] = useState('');
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate fields when member changes
  useEffect(() => {
    if (member && visible) {
      const raw = member.rawBackend as BackendMembership | undefined;
      const appData = raw?.application_data || {};
      const personal = (appData.personal_details as Record<string, any>) || {};

      setFullName(member.name || appData.full_name || raw?.user?.full_name || '');
      setMobileNumber(member.phone && member.phone !== '—' ? member.phone : (appData.mobile_number || raw?.user?.mobile_number || ''));
      setEmail(member.email && member.email !== '—' ? member.email : (appData.email || raw?.user?.email || ''));
      
      // Category
      if (raw?.category_id) {
        setSelectedCategoryId(raw.category_id);
      } else if (categories.length > 0) {
        const found = categories.find(c => c.name === member.categoryName);
        setSelectedCategoryId(found ? found.id : categories[0].id);
      }

      // Gender
      const g = (personal.gender || 'MALE').toUpperCase();
      setGender(['MALE', 'FEMALE', 'OTHER'].includes(g) ? g : 'MALE');

      // Qualification
      const qual = personal.qualification || '';
      const matchedQual = QUALIFICATION_OPTIONS.find(q => q.key === qual);
      if (matchedQual) {
        setQualification(qual);
        setCustomQualification(personal.other_qualification || '');
      } else if (qual) {
        setQualification('Other');
        setCustomQualification(qual);
      } else {
        setQualification('10th Pass');
        setCustomQualification('');
      }

      setDob(personal.dob || '');
      setAddress(personal.address || '');
      setCity(personal.city || '');
      setState(personal.state || '');
      setPincode(personal.pincode || '');
      setAdminNotes(raw?.admin_notes || '');
      setErrors({});
    }
  }, [member, visible, categories]);

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

    if (qualification === 'Other' && !customQualification.trim()) {
      newErrors.customQualification = 'Please specify the qualification.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!member || !validate()) return;

    const payload: UpdateMemberPayload = {
      category_id: selectedCategoryId || undefined,
      application_data: {
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        email: email.trim() || undefined,
        personal_details: {
          gender,
          qualification: qualification === 'Other' ? customQualification.trim() : qualification,
          other_qualification: qualification === 'Other' ? customQualification.trim() : undefined,
          dob: dob.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          pincode: pincode.trim() || undefined,
        },
      },
      admin_notes: adminNotes.trim() || undefined,
    };

    try {
      await onSubmit(member.id, payload);
      onClose();
    } catch {
      // Error handled by parent
    }
  };

  if (!member) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Pencil size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.headerTitle}>Edit Member</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {member.name} · {member.membershipId}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityLabel="Close edit modal"
              accessibilityRole="button"
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Membership Category Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Membership Category</Text>
                <Text style={styles.sectionRequired}>*</Text>
              </View>
              <Text style={styles.sectionHint}>
                Select the official unit designation for this member
              </Text>

              {isLoadingCategories ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={BrandColors.navy} />
                  <Text style={styles.loadingText}>Loading membership tiers...</Text>
                </View>
              ) : (
                <View style={styles.categoryList}>
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const rawFee = Number(cat.fee) || 3000;
                    const feeFormatted = `₹${rawFee.toLocaleString('en-IN')}`;

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardSelected,
                        ]}
                        activeOpacity={0.8}
                      >
                        <View style={styles.categoryRadio}>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                        </View>
                        <View style={styles.categoryInfo}>
                          <View style={styles.categoryTitleRow}>
                            <Text
                              style={[
                                styles.categoryName,
                                isSelected && styles.categoryNameSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {cat.name}
                            </Text>
                            <View style={styles.feeBadge}>
                              <Text style={styles.feeText}>{feeFormatted}</Text>
                            </View>
                          </View>
                          {cat.description ? (
                            <Text style={styles.categoryDescription} numberOfLines={2}>
                              {cat.description}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {errors.category ? (
                <Text style={styles.errorText}>{errors.category}</Text>
              ) : null}
            </View>

            {/* Applicant Details Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Full Name</Text>
                  <Text style={styles.requiredMark}>*</Text>
                </View>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={BrandColors.textMuted}
                  style={[styles.input, errors.fullName ? styles.inputError : null]}
                  autoCapitalize="words"
                />
                {errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>

              {/* Mobile Number */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <Text style={styles.requiredMark}>*</Text>
                </View>
                <TextInput
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={BrandColors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
                />
                {errors.mobileNumber ? (
                  <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. member@example.com"
                  placeholderTextColor={BrandColors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, errors.email ? styles.inputError : null]}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Gender */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.pillGroup}>
                  {GENDER_OPTIONS.map((g) => {
                    const isSelected = gender === g.key;
                    return (
                      <TouchableOpacity
                        key={g.key}
                        onPress={() => setGender(g.key)}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            isSelected && styles.pillTextSelected,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.datePickerInputRow}>
                  <TextInput
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={BrandColors.textMuted}
                    style={[styles.input, styles.dateInput]}
                  />
                  <TouchableOpacity
                    onPress={() => setDobPickerVisible(true)}
                    style={styles.calendarPickerBtn}
                    activeOpacity={0.7}
                    accessibilityLabel="Open calendar"
                    accessibilityRole="button"
                  >
                    <Calendar size={18} color={BrandColors.navy} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Educational Qualification */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Educational Qualification</Text>
                  <Text style={styles.requiredMark}>*</Text>
                </View>
                <View style={styles.pillGroup}>
                  {QUALIFICATION_OPTIONS.map((q) => {
                    const isSelected = qualification === q.key;
                    return (
                      <TouchableOpacity
                        key={q.key}
                        onPress={() => setQualification(q.key)}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            isSelected && styles.pillTextSelected,
                          ]}
                        >
                          {q.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {qualification === 'Other' && (
                  <View style={styles.otherInputWrapper}>
                    <Text style={styles.subLabel}>Specify Other Qualification *</Text>
                    <TextInput
                      value={customQualification}
                      onChangeText={setCustomQualification}
                      placeholder="e.g. B.Tech, LL.B, Diploma"
                      placeholderTextColor={BrandColors.textMuted}
                      style={[
                        styles.input,
                        errors.customQualification ? styles.inputError : null,
                      ]}
                    />
                    {errors.customQualification ? (
                      <Text style={styles.errorText}>
                        {errors.customQualification}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>

            {/* Address Details Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Address Details</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Residential Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="House / Street / Area"
                  placeholderTextColor={BrandColors.textMuted}
                  style={styles.input}
                />
              </View>

              <View style={styles.twoColRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>City / District</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Lucknow"
                    placeholderTextColor={BrandColors.textMuted}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="e.g. Uttar Pradesh"
                    placeholderTextColor={BrandColors.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="6-digit pincode"
                  placeholderTextColor={BrandColors.textMuted}
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Admin Notes */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Admin Notes</Text>
              <View style={styles.fieldGroup}>
                <TextInput
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Internal administrative remarks for this member..."
                  placeholderTextColor={BrandColors.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea]}
                />
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer Actions */}
          <View style={styles.footer}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.footerBtn}
            />
            <AppButton
              title="Save Changes"
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={[styles.footerBtn, styles.saveBtn]}
            />
          </View>
        </KeyboardAvoidingView>

        <DatePickerModal
          visible={dobPickerVisible}
          value={dob}
          onSelect={(selectedDate) => setDob(selectedDate)}
          onClose={() => setDobPickerVisible(false)}
          title="Select Date of Birth"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 58, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: BrandColors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
    minHeight: '60%',
    ...Shadows.elevated,
  },
  header: {
    backgroundColor: BrandColors.navyDeep,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  sectionCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: Spacing.sm + 2,
    ...Shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  sectionRequired: {
    color: BrandColors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHint: {
    fontSize: 12,
    color: BrandColors.textMuted,
    marginBottom: Spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  categoryList: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    backgroundColor: '#FAFAFC',
  },
  categoryCardSelected: {
    borderColor: BrandColors.navy,
    backgroundColor: '#F0F7FF',
  },
  categoryRadio: {
    marginRight: Spacing.sm + 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: BrandColors.navy,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.navy,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    flex: 1,
  },
  categoryNameSelected: {
    color: BrandColors.navyDeep,
    fontWeight: '700',
  },
  feeBadge: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoryDescription: {
    fontSize: 11,
    color: BrandColors.textMuted,
    marginTop: 3,
    lineHeight: 15,
  },
  fieldGroup: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.navyDeep,
    marginTop: 4,
  },
  requiredMark: {
    color: BrandColors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: BrandColors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: BrandColors.danger,
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  otherInputWrapper: {
    marginTop: 6,
    gap: 4,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    color: BrandColors.danger,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    ...Shadows.subtle,
  },
  footerBtn: {
    flex: 1,
  },
  saveBtn: {
    backgroundColor: BrandColors.navy,
  },
  datePickerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  calendarPickerBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditMemberModal;
