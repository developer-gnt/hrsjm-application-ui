import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
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
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { useAuthStore } from '../../auth/store/authStore';
import { authService } from '../../auth/services/auth.service';
import { useProfileStore } from '../../admin/profile/profileStore';
import type { MembershipPostData } from '../data/membershipCategoriesData';
import { useKeyboardSpacing } from '../../../core/hooks';
import { IneligibleAgeScreen } from '../../auth/screens/IneligibleAgeScreen';
import { validateAgeEligibility } from '../../../core/utils/age';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface FormErrors {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  email?: string;
  policeStation?: string;
  password?: string;
  confirmPassword?: string;
}

const GENDER_OPTIONS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

export function MembershipStep1Screen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const {
    personalInfo,
    updatePersonalInfo,
    selectedPost,
    setSelectedPost,
    selectedMembershipType,
    setSelectedMembershipType,
  } = useMembership();

  const routePost = route?.params?.post as MembershipPostData | undefined;
  const activePost = routePost || selectedPost;
  const authUser = useAuthStore(state => state.user);
  const roleNames = [
    (authUser as any)?.role?.name,
    (authUser as any)?.roleName,
    ...((authUser as any)?.roles || []).map((r: any) => (typeof r === 'string' ? r : r?.name)),
  ]
    .filter(Boolean)
    .map(r => String(r).toUpperCase());
  const isAdmin = roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN');
  const profileAvatar = useProfileStore(state => state.profile?.avatar);
  const userAvatar = authUser?.avatar || profileAvatar;
  const [userRemovedPhoto, setUserRemovedPhoto] = useState(false);

  React.useEffect(() => {
    if (routePost) {
      if (setSelectedPost) {
        setSelectedPost(routePost);
      } else if (setSelectedMembershipType) {
        setSelectedMembershipType(routePost.postName);
      }
    }
  }, [routePost]);

  // Keep name in placeholder: if personalInfo.fullName was pre-filled with authUser's full name, clear it so placeholder shows
  React.useEffect(() => {
    if (authUser?.full_name && personalInfo.fullName === authUser.full_name) {
      updatePersonalInfo({ fullName: '' });
    }
  }, [authUser?.full_name]);

  // Pre-fill profile photo from account avatar if available and no photo selected yet (skip for admin adding members)
  React.useEffect(() => {
    if (userAvatar && !personalInfo.profilePhotoUri && !userRemovedPhoto && !isAdmin) {
      updatePersonalInfo({ profilePhotoUri: userAvatar });
    }
  }, [userAvatar, personalInfo.profilePhotoUri, userRemovedPhoto, isAdmin]);

  const currentUserId = isAdmin ? undefined : (authUser?.id || (authUser as any)?._id || (authUser as any)?.sub);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { keyboardPadding, handleInputFocus, dismissKeyboard } = useKeyboardSpacing({
    basePadding: 96,
    extraPadding: 60,
    minKeyboardHeight: 340,
  });
  const [verifiedMobile, setVerifiedMobile] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const checkMobileDuplicate = useCallback(async (phoneToCheck: string) => {
    const cleanPhone = phoneToCheck.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) return;
    setCheckingMobile(true);
    try {
      const res = await authService.checkDuplicates(cleanPhone, undefined, currentUserId);
      if (res?.mobile_taken) {
        setErrors(prev => ({
          ...prev,
          mobileNumber: res.mobile_message || 'Mobile number is already registered. Please sign in or use another number.',
        }));
        setVerifiedMobile(null);
      } else {
        setVerifiedMobile(cleanPhone);
        setErrors(prev => {
          if (prev.mobileNumber && prev.mobileNumber.toLowerCase().includes('already registered')) {
            const next = { ...prev };
            delete next.mobileNumber;
            return next;
          }
          return prev;
        });
      }
    } catch {
      // Ignore background check network error
    } finally {
      setCheckingMobile(false);
    }
  }, [currentUserId]);

  const checkEmailDuplicate = useCallback(async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) return;
    setCheckingEmail(true);
    try {
      const res = await authService.checkDuplicates(undefined, cleanEmail, currentUserId);
      if (res?.email_taken) {
        setErrors(prev => ({
          ...prev,
          email: res.email_message || 'Email address is already registered. Please sign in or use another email.',
        }));
        setVerifiedEmail(null);
      } else {
        setVerifiedEmail(cleanEmail);
        setErrors(prev => {
          if (prev.email && prev.email.toLowerCase().includes('already registered')) {
            const next = { ...prev };
            delete next.email;
            return next;
          }
          return prev;
        });
      }
    } catch {
      // Ignore background check network error
    } finally {
      setCheckingEmail(false);
    }
  }, [currentUserId]);

  // Debounced live duplicate check for mobile number
  useEffect(() => {
    const cleanPhone = (personalInfo.mobileNumber || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setVerifiedMobile(null);
      return;
    }
    const timer = setTimeout(() => {
      checkMobileDuplicate(cleanPhone);
    }, 500);
    return () => clearTimeout(timer);
  }, [personalInfo.mobileNumber, checkMobileDuplicate]);

  // Debounced live duplicate check for email address
  useEffect(() => {
    const cleanEmail = (personalInfo.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setVerifiedEmail(null);
      return;
    }
    const timer = setTimeout(() => {
      checkEmailDuplicate(cleanEmail);
    }, 500);
    return () => clearTimeout(timer);
  }, [personalInfo.email, checkEmailDuplicate]);

  const [showIneligible, setShowIneligible] = useState(false);
  const [ineligibleAge, setIneligibleAge] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const handlePickPhoto = () => {
    setImagePickerVisible(true);
  };

  const handleRemovePhoto = () => {
    setUserRemovedPhoto(true);
    updatePersonalInfo({ profilePhotoUri: undefined });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name validation (effective name uses input or falls back to authUser full_name)
    const effectiveName = (personalInfo.fullName || (isAdmin ? '' : authUser?.full_name) || '').trim();
    if (!effectiveName) {
      newErrors.fullName = 'Full name is required';
    } else if (effectiveName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // 2. Date of Birth validation & 18+ eligibility
    const ageResult = validateAgeEligibility(personalInfo.dateOfBirth);
    if (!ageResult.isValid) {
      newErrors.dateOfBirth = ageResult.error || 'Date of birth is required';
    } else if (!ageResult.isEligible) {
      setIneligibleAge(ageResult.age);
      setShowIneligible(true);
      return false;
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

    // 6. Nearby Police Station validation
    if (!personalInfo.policeStation || personalInfo.policeStation.trim().length === 0) {
      newErrors.policeStation = 'Nearby police station is required';
    } else if (personalInfo.policeStation.trim().length < 3) {
      newErrors.policeStation = 'Police station must be at least 3 characters';
    }

    // 7. Password validation
    if (!personalInfo.password || personalInfo.password.trim().length === 0) {
      newErrors.password = 'Password is required';
    } else if (personalInfo.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 8. Confirm Password validation
    if (!personalInfo.confirmPassword || personalInfo.confirmPassword.trim().length === 0) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (personalInfo.confirmPassword !== personalInfo.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    const cleanMobile = (personalInfo.mobileNumber || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (personalInfo.email || '').trim().toLowerCase();

    // Check duplicate email and mobile on Step 1 before proceeding
    setIsValidating(true);
    try {
      const dupRes = await authService.checkDuplicates(cleanMobile, cleanEmail, currentUserId);
      if (!dupRes.available) {
        setErrors(prev => ({
          ...prev,
          mobileNumber: dupRes.mobile_taken
            ? dupRes.mobile_message || 'Mobile number is already registered. Please sign in or use another number.'
            : prev.mobileNumber,
          email: dupRes.email_taken
            ? dupRes.email_message || 'Email address is already registered. Please sign in or use another email.'
            : prev.email,
        }));
        setIsValidating(false);
        return;
      }
    } catch {
      // In case of check failure, proceed
    } finally {
      setIsValidating(false);
    }

    if (!personalInfo.fullName && authUser?.full_name && !isAdmin) {
      updatePersonalInfo({ fullName: authUser.full_name });
    }
    navigation.navigate('MembershipStep2Address');
  };

  if (showIneligible) {
    return (
      <IneligibleAgeScreen
        onBackToRegistration={() => setShowIneligible(false)}
        calculatedAge={ineligibleAge}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar
        showBack
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try {
              (navigation as any).navigate('MembershipCategories');
            } catch {
              (navigation as any).navigate('UserHome');
            }
          }
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={styles.keyboardAvoid}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          bounces={true}>
          {/* Main Title */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Apply for Membership</Text>
          </View>

          {/* 3-Step Progress Bar (Step 1 Active) */}
          <MembershipProgressBar currentStep={1} />

          {/* Selected Post Banner */}
          {activePost ? (
            <View style={styles.selectedPostBanner}>
              <View style={styles.selectedPostLeft}>
                <View style={styles.postBadgeCircle}>
                  <Icon name="award" size={16} color="#059669" strokeWidth={2.4} />
                </View>
                <View style={styles.selectedPostInfo}>
                  <Text style={styles.selectedPostLabel}>Applying For</Text>
                  <Text style={styles.selectedPostTitle}>{activePost.postName}</Text>
                  <Text style={styles.selectedPostSub}>
                    {activePost.qualification} • {activePost.validity} Duration
                  </Text>
                </View>
              </View>
              <View style={styles.selectedPostFeeBadge}>
                <Text style={styles.selectedPostFeeText}>{activePost.fee}</Text>
                <Text style={styles.selectedPostFeeSub}>Reg. Fee</Text>
              </View>
            </View>
          ) : selectedMembershipType && selectedMembershipType !== 'Individual Membership' ? (
            <View style={styles.selectedPostBanner}>
              <View style={styles.selectedPostLeft}>
                <View style={styles.postBadgeCircle}>
                  <Icon name="award" size={16} color="#059669" strokeWidth={2.4} />
                </View>
                <View style={styles.selectedPostInfo}>
                  <Text style={styles.selectedPostLabel}>Applying For</Text>
                  <Text style={styles.selectedPostTitle}>{selectedMembershipType}</Text>
                </View>
              </View>
            </View>
          ) : null}

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
                  placeholder={isAdmin ? 'Enter full name' : (authUser?.full_name || 'Enter full name')}
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
                {checkingMobile ? (
                  <ActivityIndicator size="small" color="#D97706" style={styles.fieldStatusIcon} />
                ) : verifiedMobile && (personalInfo.mobileNumber || '').replace(/\D/g, '').slice(-10) === verifiedMobile && !errors.mobileNumber ? (
                  <Icon name="check" size={16} color="#059669" strokeWidth={2.5} style={styles.fieldStatusIcon} />
                ) : null}
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
                {checkingEmail ? (
                  <ActivityIndicator size="small" color="#D97706" style={styles.fieldStatusIcon} />
                ) : verifiedEmail && (personalInfo.email || '').trim().toLowerCase() === verifiedEmail && !errors.email ? (
                  <Icon name="check" size={16} color="#059669" strokeWidth={2.5} style={styles.fieldStatusIcon} />
                ) : null}
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* 6. Nearby Police Station */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Nearby Police Station <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.policeStation ? styles.inputError : undefined,
                ]}>
                <Icon name="shield-check" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter nearby police station"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.policeStation || ''}
                  onChangeText={text => {
                    updatePersonalInfo({ policeStation: text });
                    if (errors.policeStation) setErrors(prev => ({ ...prev, policeStation: undefined }));
                  }}
                  autoCapitalize="words"
                  accessibilityLabel="Nearby Police Station"
                />
              </View>
              {errors.policeStation ? (
                <Text style={styles.errorText}>{errors.policeStation}</Text>
              ) : null}
            </View>

            {/* 7. Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.password ? styles.inputError : undefined,
                ]}>
                <Icon name="lock" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter password (min. 6 characters)"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.password || ''}
                  onChangeText={text => {
                    updatePersonalInfo({ password: text });
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggleBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* 8. Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Confirm Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.confirmPassword ? styles.inputError : undefined,
                ]}>
                <Icon name="lock" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  value={personalInfo.confirmPassword || ''}
                  onChangeText={text => {
                    updatePersonalInfo({ confirmPassword: text });
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Confirm Password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeToggleBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueBtn, isValidating && styles.continueBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={isValidating}
            accessibilityRole="button"
            accessibilityLabel="Continue to Address Details">
            {isValidating ? (
              <ActivityIndicator size="small" color="#011F39" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>Continue</Text>
                <Icon name="arrow-right" size={18} color="#011F39" strokeWidth={2.4} />
              </>
            )}
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
          const check = validateAgeEligibility(d);
          if (!check.isValid) {
            setErrors(prev => ({ ...prev, dateOfBirth: check.error || undefined }));
          } else if (!check.isEligible) {
            setIneligibleAge(check.age);
            setShowIneligible(true);
          } else {
            if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
          }
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
          setUserRemovedPhoto(false);
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
    backgroundColor: '#FAD465',
    borderRadius: radius.md,
    height: 48,
    gap: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#011F39',
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  fieldStatusIcon: {
    marginLeft: 4,
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
  selectedPostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: spacing.md,
    gap: 8,
  },
  selectedPostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  postBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPostInfo: {
    flex: 1,
  },
  selectedPostLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedPostTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F2860',
  },
  selectedPostSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  selectedPostFeeBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedPostFeeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedPostFeeSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#E6F4EA',
  },
  eyeToggleBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MembershipStep1Screen;
