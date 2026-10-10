import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../../../core';
import { usersStore } from '../services/usersStore';
import { UserType, UserGender } from '../types/user.types';
import { UsersHeader } from '../components/UsersHeader';
import { UsersBottomNav } from '../components/UsersBottomNav';
import { DobDatePickerModal } from '../../../auth/components/DobDatePickerModal';
import {
  UserOutlineIcon,
  MailOutlineIcon,
  PhoneOutlineIcon,
  LockOutlineIcon,
  EyeOutlineIcon,
  EyeSlashOutlineIcon,
  CalendarOutlineIcon,
  ChevronLeftIcon,
} from '../../../auth/components/AuthIcons';

interface AddUserScreenProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  password?: string;
  confirmPassword?: string;
}

const USER_TYPE_OPTIONS: { label: string; value: UserType }[] = [
  { label: 'Member', value: 'member' },
  { label: 'Donation Seeker', value: 'seeker' },
  { label: 'Donor', value: 'donor' },
  { label: 'General User', value: 'general' },
];

const GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export const AddUserScreen: React.FC<AddUserScreenProps> = ({
  onBack,
  onSuccess,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserType | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [address, setAddress] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modals
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDobModal, setShowDobModal] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const err: FormErrors = {};

    // 1. Full Name
    if (!fullName.trim()) {
      err.name = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      err.name = 'Full name must be at least 2 characters';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      err.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      err.email = 'Please enter a valid email address';
    }

    // 3. Phone Number
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      err.phone = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      err.phone = 'Please enter a valid 10-digit phone number';
    }

    // 4. User Type
    if (!userType) {
      err.userType = 'Please select a user type';
    }

    // 5. Password
    if (!password) {
      err.password = 'Password is required';
    } else if (password.length < 6) {
      err.password = 'Password must be at least 6 characters';
    }

    // 6. Confirm Password
    if (!confirmPassword) {
      err.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreateUser = () => {
    if (!validate()) {
      return;
    }

    // Validated: save user to store (passwords are NOT stored or exposed in user records)
    const formattedPhone = `${countryCode} ${phone.trim()}`;
    usersStore.addUser({
      name: fullName.trim(),
      email: email.trim(),
      phone: formattedPhone,
      userType: userType as UserType,
      dob: dob.trim() || undefined,
      gender: (gender as UserGender) || undefined,
      address: address.trim() || undefined,
    });

    if (onSuccess) {
      onSuccess();
    } else if (onBack) {
      onBack();
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  const getUserTypeLabel = (val: string) => {
    const found = USER_TYPE_OPTIONS.find(o => o.value === val);
    return found ? found.label : 'Select user type';
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 84 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrap}>
            {/* Back to Users Link */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to Users list"
            >
              <ChevronLeftIcon size={16} color="#0F2860" />
              <Text style={styles.backText}>Back to Users</Text>
            </TouchableOpacity>

            {/* Title & Subtitle */}
            <Text style={styles.pageTitle}>Add New User</Text>
            <Text style={styles.pageSubtitle}>
              Create a new user account and fill in the required details.
            </Text>

            {/* Form Fields */}
            <View style={styles.formCard}>
              {/* Field 1: Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Full Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.name && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.fieldIconWrap}>
                    <UserOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={t => {
                      setFullName(t);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    autoCapitalize="words"
                    accessibilityLabel="Full Name input"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Field 2: Email Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Email Address <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.email && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.fieldIconWrap}>
                    <MailOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email address"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={t => {
                      setEmail(t);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Email Address input"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Field 3: Phone Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Phone Number <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.phone && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>+91 ▾</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={t => {
                      setPhone(t);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    keyboardType="phone-pad"
                    accessibilityLabel="Phone Number input"
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* Field 4: User Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  User Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    errors.userType && styles.inputContainerError,
                  ]}
                  onPress={() => setShowUserTypeModal(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Select user type"
                >
                  <View style={styles.fieldIconWrap}>
                    <UserOutlineIcon size={18} color="#64748B" />
                  </View>
                  <Text
                    style={[
                      styles.selectText,
                      !userType && styles.selectPlaceholder,
                    ]}
                  >
                    {userType ? getUserTypeLabel(userType) : 'Select user type'}
                  </Text>
                  <Text style={styles.chevronIcon}>▾</Text>
                </TouchableOpacity>
                {errors.userType && <Text style={styles.errorText}>{errors.userType}</Text>}
              </View>

              {/* Field 5: Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.fieldIconWrap}>
                    <LockOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Create a password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={t => {
                      setPassword(t);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    accessibilityLabel="Password input"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(p => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOutlineIcon size={18} color="#0F2860" />
                    ) : (
                      <EyeSlashOutlineIcon size={18} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Field 6: Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Confirm Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.confirmPassword && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.fieldIconWrap}>
                    <LockOutlineIcon size={18} color="#64748B" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={t => {
                      setConfirmPassword(t);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    accessibilityLabel="Confirm Password input"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(p => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOutlineIcon size={18} color="#0F2860" />
                    ) : (
                      <EyeSlashOutlineIcon size={18} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Section: Additional Information */}
              <Text style={styles.sectionHeader}>Additional Information</Text>

              {/* 2-Column: Date of Birth & Gender */}
              <View style={styles.twoColumnRow}>
                {/* Date of Birth */}
                <View style={styles.columnHalf}>
                  <Text style={styles.fieldLabel}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowDobModal(true)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Select Date of Birth"
                  >
                    <Text
                      style={[
                        styles.selectText,
                        !dob && styles.selectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {dob || 'Select date'}
                    </Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                </View>

                {/* Gender */}
                <View style={styles.columnHalf}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowGenderModal(true)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Select Gender"
                  >
                    <Text
                      style={[
                        styles.selectText,
                        !gender && styles.selectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {gender || 'Select gender'}
                    </Text>
                    <Text style={styles.chevronIcon}>▾</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 9: Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Address</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.fieldIconWrap}>
                    <Text style={styles.addressIcon}>📍</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter address (optional)"
                    placeholderTextColor="#94A3B8"
                    value={address}
                    onChangeText={setAddress}
                    accessibilityLabel="Address input"
                  />
                </View>
              </View>

              {/* Action Buttons: Cancel & Create User */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel adding user"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateUser}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Submit Create User"
                >
                  <Text style={styles.createButtonText}>Create User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* User Type Selection Modal */}
      <Modal
        visible={showUserTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserTypeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowUserTypeModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerSheetTitle}>Select User Type</Text>
                {USER_TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pickerItem,
                      userType === opt.value && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setUserType(opt.value);
                      if (errors.userType) {
                        setErrors(prev => ({ ...prev, userType: undefined }));
                      }
                      setShowUserTypeModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        userType === opt.value && styles.pickerItemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {userType === opt.value && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGenderModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerSheetTitle}>Select Gender</Text>
                {GENDER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.pickerItem,
                      gender === opt && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setGender(opt);
                      setShowGenderModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        gender === opt && styles.pickerItemTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                    {gender === opt && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Picker Modal */}
      <DobDatePickerModal
        visible={showDobModal}
        selectedDate={dob}
        onSelectDate={d => {
          setDob(d);
          setShowDobModal(false);
        }}
        onClose={() => setShowDobModal(false)}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavHost}>
        <UsersBottomNav
          bottomInset={insets.bottom}
          activeKey="users"
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
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: Spacing.base,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldIconWrap: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeBadge: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  selectText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  selectPlaceholder: {
    color: '#94A3B8',
  },
  chevronIcon: {
    fontSize: 14,
    color: '#64748B',
  },
  calendarIcon: {
    fontSize: 14,
  },
  addressIcon: {
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 10,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  columnHalf: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#0F2860',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
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

  // Pickers Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  pickerSheet: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  pickerItemTextActive: {
    color: '#0F2860',
    fontWeight: '800',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
  },
});
