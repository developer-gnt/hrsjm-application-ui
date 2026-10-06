import React, { useState } from 'react';
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
import {
  AlertCircle,
  Check,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  User,
  X,
} from '../../../../core/components/icons';
import type {
  AssistanceStatus,
  CreateAssistanceRequestPayload,
} from '../types/assistance.types';

interface AddSeekerModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAssistanceRequestPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

interface CauseOption {
  key: string;
  label: string;
  icon: string;
}

const CAUSE_OPTIONS: CauseOption[] = [
  { key: 'Medical Emergency', label: 'Medical Emergency', icon: '🏥' },
  { key: 'Education Support', label: 'Education & Tuition', icon: '🎓' },
  { key: 'Disaster Relief', label: 'Disaster Relief', icon: '🌊' },
  { key: 'Livelihood & Food', label: 'Livelihood & Food', icon: '🌾' },
  { key: 'Disability Support', label: 'Disability Support', icon: '♿' },
  { key: 'Housing / Shelter', label: 'Housing / Shelter', icon: '🏠' },
  { key: 'Other', label: 'Other', icon: '📝' },
];

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const URGENCY_LEVELS = [
  { key: 'NORMAL', label: 'Normal', color: '#10B981', bg: '#ECFDF5' },
  { key: 'MEDIUM', label: 'Medium', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'HIGH', label: 'High', color: '#F97316', bg: '#FFF7ED' },
  { key: 'CRITICAL', label: 'Critical', color: '#EF4444', bg: '#FEF2F2' },
];

export const AddSeekerModal: React.FC<AddSeekerModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [selectedCause, setSelectedCause] = useState<string>('Medical Emergency');
  const [customCause, setCustomCause] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [initialStatus, setInitialStatus] = useState<AssistanceStatus>('UNDER_REVIEW');
  const [adminRemark, setAdminRemark] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters).';
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (selectedCause === 'Other' && !customCause.trim()) {
      newErrors.customCause = 'Please enter the specific reason/cause.';
    }

    const amt = parseFloat(requestedAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) {
      newErrors.requestedAmount = 'Please enter a valid amount greater than ₹0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const amt = parseFloat(requestedAmount.replace(/,/g, ''));
    const finalReason =
      selectedCause === 'Other' ? customCause.trim() : selectedCause;

    const payload: CreateAssistanceRequestPayload = {
      full_name: fullName.trim(),
      mobile: mobile.replace(/\D/g, ''),
      email: email.trim() ? email.trim() : undefined,
      requested_amount: amt,
      reason: finalReason,
      description: description.trim() ? description.trim() : undefined,
      status: initialStatus,
      admin_remark: adminRemark.trim() ? adminRemark.trim() : undefined,
    };

    await onSubmit(payload);
  };

  const handleReset = () => {
    setFullName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setSelectedCause('Medical Emergency');
    setCustomCause('');
    setRequestedAmount('');
    setUrgency('MEDIUM');
    setDescription('');
    setInitialStatus('UNDER_REVIEW');
    setAdminRemark('');
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  const formatAmountDisplay = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) {
      setRequestedAmount('');
      return;
    }
    setRequestedAmount(Number(num).toLocaleString('en-IN'));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheetContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconBg}>
                <Heart size={20} color="#0F2C59" strokeWidth={2.2} />
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.modalTitle}>Add Donation Seeker</Text>
                <Text style={styles.modalSubtitle}>
                  Submit an assistance application for verification
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isSubmitting}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close Add Seeker Dialog"
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* SECTION 1: APPLICANT INFO */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <User size={15} color="#0F2C59" />
                  <Text style={styles.sectionTitle}>Seeker Personal Information</Text>
                </View>

                {/* Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Full Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.fullName ? styles.inputWrapperError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Ramesh Kumar"
                      placeholderTextColor="#94A3B8"
                      value={fullName}
                      onChangeText={val => {
                        setFullName(val);
                        if (errors.fullName) {
                          setErrors(prev => ({ ...prev, fullName: '' }));
                        }
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
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
                      styles.inputWrapper,
                      errors.mobile ? styles.inputWrapperError : null,
                    ]}
                  >
                    <View style={styles.phonePrefix}>
                      <Text style={styles.phonePrefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={mobile}
                      onChangeText={val => {
                        setMobile(val);
                        if (errors.mobile) {
                          setErrors(prev => ({ ...prev, mobile: '' }));
                        }
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                  {errors.mobile ? (
                    <Text style={styles.errorText}>{errors.mobile}</Text>
                  ) : null}
                </View>

                {/* Email Address */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address (Optional)</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email ? styles.inputWrapperError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. seeker@example.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={val => {
                        setEmail(val);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                  {errors.email ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
                </View>

                {/* City / Location */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>City / Location (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Jaipur, Rajasthan"
                      placeholderTextColor="#94A3B8"
                      value={address}
                      onChangeText={setAddress}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>

              {/* SECTION 2: ASSISTANCE CAUSE & AMOUNT */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Heart size={15} color="#0F2C59" />
                  <Text style={styles.sectionTitle}>Assistance Request Details</Text>
                </View>

                {/* Cause / Category Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Assistance Category / Cause <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.chipsWrap}>
                    {CAUSE_OPTIONS.map(cause => {
                      const isSelected = selectedCause === cause.key;
                      return (
                        <TouchableOpacity
                          key={cause.key}
                          style={[
                            styles.causeChip,
                            isSelected && styles.causeChipSelected,
                          ]}
                          onPress={() => {
                            setSelectedCause(cause.key);
                            if (errors.customCause) {
                              setErrors(prev => ({ ...prev, customCause: '' }));
                            }
                          }}
                          disabled={isSubmitting}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.causeChipIcon}>{cause.icon}</Text>
                          <Text
                            style={[
                              styles.causeChipText,
                              isSelected && styles.causeChipTextSelected,
                            ]}
                          >
                            {cause.label}
                          </Text>
                          {isSelected ? (
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* If Other selected, dynamic text input */}
                  {selectedCause === 'Other' ? (
                    <View style={{ marginTop: Spacing.sm }}>
                      <Text style={styles.fieldSubLabel}>
                        Specify Cause / Purpose <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          errors.customCause ? styles.inputWrapperError : null,
                        ]}
                      >
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Orphan welfare, wedding support, etc."
                          placeholderTextColor="#94A3B8"
                          value={customCause}
                          onChangeText={val => {
                            setCustomCause(val);
                            if (errors.customCause) {
                              setErrors(prev => ({ ...prev, customCause: '' }));
                            }
                          }}
                          editable={!isSubmitting}
                        />
                      </View>
                      {errors.customCause ? (
                        <Text style={styles.errorText}>{errors.customCause}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                {/* Requested Amount */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Requested Amount (₹) <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.requestedAmount ? styles.inputWrapperError : null,
                    ]}
                  >
                    <View style={styles.currencyBadge}>
                      <Text style={styles.currencyBadgeText}>₹</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.amountInput]}
                      placeholder="e.g. 25,000"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={requestedAmount}
                      onChangeText={val => {
                        formatAmountDisplay(val);
                        if (errors.requestedAmount) {
                          setErrors(prev => ({ ...prev, requestedAmount: '' }));
                        }
                      }}
                      editable={!isSubmitting}
                    />
                  </View>
                  {errors.requestedAmount ? (
                    <Text style={styles.errorText}>{errors.requestedAmount}</Text>
                  ) : null}

                  {/* Preset Amount Chips */}
                  <View style={styles.presetsRow}>
                    {PRESET_AMOUNTS.map(amt => {
                      const isCurrent =
                        requestedAmount === amt.toLocaleString('en-IN');
                      return (
                        <TouchableOpacity
                          key={amt}
                          style={[
                            styles.presetChip,
                            isCurrent && styles.presetChipActive,
                          ]}
                          onPress={() =>
                            setRequestedAmount(amt.toLocaleString('en-IN'))
                          }
                          disabled={isSubmitting}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              isCurrent && styles.presetChipTextActive,
                            ]}
                          >
                            ₹{amt.toLocaleString('en-IN')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Urgency Level */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Urgency / Priority Level</Text>
                  <View style={styles.urgencyRow}>
                    {URGENCY_LEVELS.map(lvl => {
                      const isSelected = urgency === lvl.key;
                      return (
                        <TouchableOpacity
                          key={lvl.key}
                          style={[
                            styles.urgencyChip,
                            isSelected && {
                              backgroundColor: lvl.bg,
                              borderColor: lvl.color,
                            },
                          ]}
                          onPress={() => setUrgency(lvl.key)}
                          disabled={isSubmitting}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.urgencyDot,
                              { backgroundColor: lvl.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.urgencyText,
                              isSelected && { color: lvl.color, fontWeight: '800' },
                            ]}
                          >
                            {lvl.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Detailed Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Case Description / Notes</Text>
                  <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Describe the medical/financial situation, background, hospital or school details..."
                      placeholderTextColor="#94A3B8"
                      multiline={true}
                      numberOfLines={4}
                      value={description}
                      onChangeText={setDescription}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>

              {/* SECTION 3: STATUS & ADMIN REMARKS */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Shield size={15} color="#0F2C59" />
                  <Text style={styles.sectionTitle}>Initial Status & Review</Text>
                </View>

                {/* Initial Status Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Set Initial Status</Text>
                  <View style={styles.statusOptionsRow}>
                    {(['UNDER_REVIEW', 'PENDING', 'APPROVED'] as AssistanceStatus[]).map(
                      st => {
                        const isSelected = initialStatus === st;
                        return (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.statusSelectChip,
                              isSelected && styles.statusSelectChipActive,
                            ]}
                            onPress={() => setInitialStatus(st)}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.statusSelectChipText,
                                isSelected && styles.statusSelectChipTextActive,
                              ]}
                            >
                              {st === 'UNDER_REVIEW'
                                ? 'Under Review'
                                : st === 'PENDING'
                                  ? 'Pending'
                                  : 'Approved'}
                            </Text>
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </View>
                </View>

                {/* Admin Remarks */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Admin Verification Remarks</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Documents verified via local coordinator"
                      placeholderTextColor="#94A3B8"
                      value={adminRemark}
                      onChangeText={setAdminRemark}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.submitBtnText}>Create Request</Text>
                  </>
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
  keyboardView: {
    width: '100%',
    maxHeight: '92%',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '100%',
    ...Shadows.elevated,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitles: {
    flex: 1,
  },
  modalTitle: {
    ...Typography.sectionHeader,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
  },
  modalSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  formScroll: {
    maxHeight: 520,
  },
  formScrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2C59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    ...Typography.caption,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  fieldSubLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  phonePrefix: {
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    marginRight: 8,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2C59',
  },
  phoneInput: {
    letterSpacing: 1,
  },
  currencyBadge: {
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    marginRight: 8,
  },
  currencyBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  amountInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2C59',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  causeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  causeChipSelected: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  causeChipIcon: {
    fontSize: 13,
  },
  causeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  causeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  urgencyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  urgencyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    minHeight: 80,
    paddingVertical: 6,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusSelectChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusSelectChipActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  statusSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statusSelectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 2,
    marginLeft: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0F2C59',
    shadowColor: '#0F2C59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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

export default AddSeekerModal;
