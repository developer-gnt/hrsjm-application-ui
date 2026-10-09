import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { AppStackParamList } from '../../../core/navigation/types';
import { useMembership } from '../context/MembershipContext';
import { MembershipTopBar } from '../components/MembershipTopBar';
import { MembershipProgressBar } from '../components/MembershipProgressBar';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { ImagePickerSheet } from '../components/ImagePickerSheet';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface FormErrors {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  email?: string;
}

const GENDER_OPTIONS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

export function MembershipStep1Screen() {
  const navigation = useNavigation<NavProp>();
  const { personalInfo, updatePersonalInfo } = useMembership();

  const [errors, setErrors] = useState<FormErrors>({});
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const handlePickPhoto = () => {
    setImagePickerVisible(true);
  };

  const handleRemovePhoto = () => {
    updatePersonalInfo({ profilePhotoUri: undefined });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name validation
    if (!personalInfo.fullName || personalInfo.fullName.trim().length === 0) {
      newErrors.fullName = 'Full name is required';
    } else if (personalInfo.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // 2. Date of Birth validation
    if (!personalInfo.dateOfBirth || personalInfo.dateOfBirth.trim().length === 0) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    // 3. Gender validation
    if (!personalInfo.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // 4. Mobile Number validation
    if (!personalInfo.mobileNumber || personalInfo.mobileNumber.trim().length === 0) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else {
      const cleanMobile = personalInfo.mobileNumber.replace(/[^0-9]/g, '');
      if (cleanMobile.length < 10) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }
    }

    // 5. Email validation
    if (!personalInfo.email || personalInfo.email.trim().length === 0) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalInfo.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigation.navigate('MembershipStep2Address');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar
        showBack
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Tabs' as any, { screen: 'DashboardTab' });
          }
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Main Title */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Apply for Membership</Text>
          </View>

          {/* 3-Step Progress Bar (Step 1 Active) */}
          <MembershipProgressBar currentStep={1} />

          {/* Section Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSubtitle}>
              Please provide your basic details to apply for membership.
            </Text>
          </View>

          {/* Photo Upload Box */}
          <View style={styles.photoContainer}>
            {personalInfo.profilePhotoUri ? (
              <View style={styles.photoPreviewWrap}>
                <Image
                  source={{ uri: personalInfo.profilePhotoUri }}
                  style={styles.photoPreview}
                />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.photoChangeBtn}
                    onPress={handlePickPhoto}
                    accessibilityLabel="Change profile photo">
                    <Icon name="camera" size={14} color={colors.primary} strokeWidth={2.2} />
                    <Text style={styles.photoChangeText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={handleRemovePhoto}
                    accessibilityLabel="Remove photo">
                    <Text style={styles.photoRemoveText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoBox}
                activeOpacity={0.75}
                onPress={handlePickPhoto}
                accessibilityRole="button"
                accessibilityLabel="Add profile photo, JPG, PNG Max 2MB">
                <View style={styles.photoIconCircle}>
                  <Icon name="camera" size={24} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.photoTextWrap}>
                  <Text style={styles.photoTitle}>Add Profile Photo</Text>
                  <Text style={styles.photoHint}>JPG, PNG (Max 2MB)</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* 1. Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.fullName ? styles.inputError : undefined,
                ]}>
                <Icon name="person" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.fullName}
                  onChangeText={text => {
                    updatePersonalInfo({ fullName: text });
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  autoCapitalize="words"
                  accessibilityLabel="Full Name"
                />
              </View>
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* 2. Date of Birth (Interactive Calendar Picker) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Date of Birth <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputWrap,
                  errors.dateOfBirth ? styles.inputError : undefined,
                ]}
                activeOpacity={0.8}
                onPress={() => setDatePickerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`Date of Birth, ${personalInfo.dateOfBirth || 'Select date of birth'}`}>
                <Text
                  style={[
                    styles.selectText,
                    !personalInfo.dateOfBirth && styles.placeholderText,
                  ]}>
                  {personalInfo.dateOfBirth || 'Select date of birth'}
                </Text>
                <Icon name="calendar" size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              {errors.dateOfBirth ? (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              ) : null}
            </View>

            {/* 3. Gender (Dropdown Bottom Sheet) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Gender <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputWrap,
                  errors.gender ? styles.inputError : undefined,
                ]}
                activeOpacity={0.8}
                onPress={() => setGenderModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`Gender, ${personalInfo.gender || 'Select gender'}`}>
                <Icon name="person" size={18} color="#64748B" strokeWidth={2} />
                <Text
                  style={[
                    styles.selectText,
                    !personalInfo.gender && styles.placeholderText,
                  ]}>
                  {personalInfo.gender || 'Select gender'}
                </Text>
                <Icon name="chevron-down" size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
              {errors.gender ? (
                <Text style={styles.errorText}>{errors.gender}</Text>
              ) : null}
            </View>

            {/* 4. Mobile Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Mobile Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.mobileNumber ? styles.inputError : undefined,
                ]}>
                <Icon name="phone" size={17} color="#64748B" strokeWidth={2} />
                <View style={styles.countryCodePill}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.mobileNumber}
                  onChangeText={text => {
                    updatePersonalInfo({ mobileNumber: text });
                    if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: undefined }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  accessibilityLabel="Mobile Number"
                />
              </View>
              {errors.mobileNumber ? (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              ) : null}
            </View>

            {/* 5. Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Email Address <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.email ? styles.inputError : undefined,
                ]}>
                <Icon name="mail" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.email}
                  onChangeText={text => {
                    updatePersonalInfo({ email: text });
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email Address"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to Address Details">
            <Text style={styles.continueBtnText}>Continue</Text>
            <Icon name="arrow-right" size={18} color={colors.white} strokeWidth={2.4} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Calendar Sheet */}
      <DatePickerSheet
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        selectedDate={personalInfo.dateOfBirth}
        onSelectDate={d => {
          updatePersonalInfo({ dateOfBirth: d });
          if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
        }}
      />

      {/* Gender Picker Bottom Sheet */}
      <AppBottomSheet
        visible={genderModalVisible}
        title="Select Gender"
        onClose={() => setGenderModalVisible(false)}>
        <View style={styles.genderList}>
          {GENDER_OPTIONS.map(option => {
            const isSelected = personalInfo.gender === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  isSelected && styles.genderOptionSelected,
                ]}
                onPress={() => {
                  updatePersonalInfo({ gender: option });
                  if (errors.gender) setErrors(prev => ({ ...prev, gender: undefined }));
                  setGenderModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.genderOptionText,
                    isSelected && styles.genderOptionTextSelected,
                  ]}>
                  {option}
                </Text>
                {isSelected && (
                  <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </AppBottomSheet>

      {/* Image Picker Sheet for Profile Photo */}
      <ImagePickerSheet
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        currentImageUri={personalInfo.profilePhotoUri}
        onSelectImage={uri => {
          updatePersonalInfo({ profilePhotoUri: uri });
          setImagePickerVisible(false);
        }}
        onRemoveImage={handleRemovePhoto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  titleSection: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...serif,
    fontSize: 26,
    fontWeight: '700',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16274B',
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
  },
  photoContainer: {
    marginBottom: spacing.md,
  },
  photoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  photoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTextWrap: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#16274B',
  },
  photoHint: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  photoPreviewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF1FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  photoChangeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  photoRemoveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  photoRemoveText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.danger,
  },
  formContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: 10,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF8F8',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#16274B',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#16274B',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  countryCodePill: {
    paddingRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  errorText: {
    fontSize: 11.5,
    color: colors.danger,
    fontWeight: '600',
    marginLeft: 2,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 48,
    gap: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  genderList: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderOptionSelected: {
    backgroundColor: '#EAF1FE',
    borderColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#16274B',
  },
  genderOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default MembershipStep1Screen;
