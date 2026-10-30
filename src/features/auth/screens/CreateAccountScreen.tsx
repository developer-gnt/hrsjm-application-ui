import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserOutlineIcon,
  MailOutlineIcon,
  PhoneOutlineIcon,
  CalendarOutlineIcon,
  ArrowRightIcon,
  GoogleGIcon,
  ChevronDownIcon,
  GenderIcon,
  LockOutlineIcon,
  EyeOutlineIcon,
  EyeSlashOutlineIcon,
  CheckCircleFilledIcon,
} from '../components/AuthIcons';
import { DobDatePickerModal } from '../components/DobDatePickerModal';
import { IneligibleAgeScreen } from './IneligibleAgeScreen';
import { validateAgeEligibility } from '../../../core/utils/age';
import { GenderPickerModal } from '../components/GenderPickerModal';
import { getRegistrationState, updateRegistrationState } from '../state/registrationState';
import { authService } from '../services/auth.service';
import { useKeyboardSpacing } from '../../../core/hooks';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');
const HERO_BG = require('../../../assets/create_account_hero.jpg');

interface CreateAccountScreenProps {
  onBack?: () => void;
  onContinue?: (formData: CreateAccountFormData) => void;
  onLoginPress?: () => void;
  onGoogleSignUp?: () => void;
}

export interface CreateAccountFormData {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  dob: string;
  gender?: string;
  password?: string;
}

interface StepItem {
  number: number;
  label: string;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
  onBack,
  onContinue,
  onLoginPress,
  onGoogleSignUp,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const regState = getRegistrationState();
  const accountType = regState.accountType || 'general';
  const isSeeker = accountType === 'seeker';

  const steps: StepItem[] = isSeeker
    ? [
        { number: 1, label: 'Account\nType' },
        { number: 2, label: 'Personal\nDetails' },
        { number: 3, label: 'Verification' },
        { number: 4, label: 'Complete' },
      ]
    : [
        { number: 1, label: 'Account\nType' },
        { number: 2, label: 'Personal\nDetails' },
        { number: 3, label: 'Complete' },
      ];

  const [fullName, setFullName] = useState(() => regState.fullName || '');
  const [email, setEmail] = useState(() => regState.email || '');
  const [phone, setPhone] = useState(() => {
    if (regState.phone && regState.phone.startsWith('+91 ')) {
      return regState.phone.replace('+91 ', '');
    }
    return regState.phone || '';
  });
  const [countryCode, setCountryCode] = useState(() => regState.countryCode || '+91');
  const [dob, setDob] = useState(() => regState.dob || '');
  const [gender, setGender] = useState(() => regState.gender || '');
  const [password, setPassword] = useState(() => regState.password || '');
  const [confirmPassword, setConfirmPassword] = useState(() => regState.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isGenderPickerVisible, setIsGenderPickerVisible] = useState(false);

  // Field validation and database check states
  const [showIneligible, setShowIneligible] = useState(false);
  const [ineligibleAge, setIneligibleAge] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    dob?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const { keyboardPadding, handleInputFocus, dismissKeyboard } = useKeyboardSpacing({
    basePadding: 80,
    extraPadding: 60,
    minKeyboardHeight: 340,
  });

  const checkPhoneDuplicate = useCallback(async (phoneToCheck: string) => {
    const cleanPhone = phoneToCheck.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) return;
    setCheckingPhone(true);
    try {
      const res = await authService.checkDuplicates(cleanPhone, undefined);
      if (res?.mobile_taken) {
        setErrors(prev => ({
          ...prev,
          phone: res.mobile_message || 'Mobile number is already registered.',
        }));
        setVerifiedPhone(null);
      } else {
        setVerifiedPhone(cleanPhone);
        setErrors(prev => {
          if (prev.phone && prev.phone.toLowerCase().includes('already registered')) {
            const next = { ...prev };
            delete next.phone;
            return next;
          }
          return prev;
        });
      }
    } catch {
      // Ignore background check error
    } finally {
      setCheckingPhone(false);
    }
  }, []);

  const checkEmailDuplicate = useCallback(async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) return;
    setCheckingEmail(true);
    try {
      const res = await authService.checkDuplicates(undefined, cleanEmail);
      if (res?.email_taken) {
        setErrors(prev => ({
          ...prev,
          email: res.email_message || 'Email address is already registered.',
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
      // Ignore background check error
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Live debounced duplicate check for mobile number
  useEffect(() => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setVerifiedPhone(null);
      return;
    }
    const timer = setTimeout(() => {
      checkPhoneDuplicate(clean);
    }, 500);
    return () => clearTimeout(timer);
  }, [phone, checkPhoneDuplicate]);

  // Live debounced duplicate check for email
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setVerifiedEmail(null);
      return;
    }
    const timer = setTimeout(() => {
      checkEmailDuplicate(trimmed);
    }, 500);
    return () => clearTimeout(timer);
  }, [email, checkEmailDuplicate]);

  // Validation Rules
  const validateFullName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Full name is required';
    if (trimmed.length < 2) return 'Full name must be at least 2 characters';
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return 'Full name can only contain letters and spaces';
    }
    return null;
  };

  const validateEmail = (emailStr: string): string | null => {
    const trimmed = emailStr.trim();
    if (!trimmed) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePhone = (phoneStr: string): string | null => {
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (!digitsOnly) return 'Mobile number is required';
    if (digitsOnly.length !== 10) return 'Mobile number must be exactly 10 digits';
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    return null;
  };

  const validatePassword = (pwd: string): string | null => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (pwd: string, confirm: string): string | null => {
    if (!confirm) return 'Please confirm your password';
    if (pwd !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleContinue = async () => {
    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);

    // Date of Birth & 18+ Age eligibility validation
    const ageResult = validateAgeEligibility(dob);
    let dobErr: string | undefined;
    if (!ageResult.isValid) {
      dobErr = ageResult.error || 'Date of birth is required';
    } else if (!ageResult.isEligible) {
      setIneligibleAge(ageResult.age);
      setShowIneligible(true);
      return;
    }
    let termsErr: string | undefined;
    if (!termsAccepted) {
      termsErr = 'Please accept Terms & Conditions to proceed';
    } else if (!privacyAccepted) {
      termsErr = 'Please accept Privacy Policy to proceed';
    }

    if (nameErr || emailErr || phoneErr || dobErr || passwordErr || confirmPasswordErr || termsErr) {
      setErrors({
        fullName: nameErr || undefined,
        email: emailErr || undefined,
        phone: phoneErr || undefined,
        dob: dobErr || undefined,
        password: passwordErr || undefined,
        confirmPassword: confirmPasswordErr || undefined,
        terms: termsErr,
      });
      return;
    }

    // Database Duplication Check
    setIsValidating(true);
    const cleanMobile = phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const dupRes = await authService.checkDuplicates(cleanMobile, cleanEmail);

      if (!dupRes.available) {
        setErrors({
          phone: dupRes.mobile_taken
            ? dupRes.mobile_message || 'Mobile number is already registered.'
            : undefined,
          email: dupRes.email_taken
            ? dupRes.email_message || 'Email address is already registered.'
            : undefined,
        });
        setIsValidating(false);
        return;
      }
    } catch {
      // In case of network check failure, proceed with standard registration pipeline
    }

    setIsValidating(false);
    setErrors({});
    const formattedPhone = `${countryCode} ${cleanMobile}`;

    updateRegistrationState({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: formattedPhone,
      countryCode,
      dob: dob.trim(),
      gender: gender.trim(),
      password: password.trim(),
    });

    if (onContinue) {
      onContinue({
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanMobile,
        countryCode,
        dob: dob.trim(),
        gender: gender.trim(),
        password: password.trim(),
      });
    }
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardPadding },
            isTabletOrDesktop && { alignItems: 'center' },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          bounces={false}
        >
          <View style={[styles.mainWrapper, { width: contentMaxWidth }]}>
            {/* Top Hero Image Section */}
            <View
              style={[
                styles.heroBackground,
                {
                  paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 16 : 12) + 8,
                },
              ]}
            >
              <Image
                source={HERO_BG}
                style={styles.heroBackgroundImage}
                resizeMode="cover"
                fadeDuration={0}
              />
              <View style={styles.heroOverlay} pointerEvents="none" />
              {/* Top Bar with Back Button & Centered Screen Title */}
              <View style={styles.headerRow}>
                {onBack ? (
                  <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Go back to Account Type"
                  >
                    <ChevronLeftIcon size={16} color="#0F2860" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.headerSpacer} />
                )}
                <Text style={styles.headerTitle}>Create Your Account</Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Branding Section */}
              <View style={styles.brandingSection}>
                <Image
                  source={HRSJM_LOGO}
                  style={styles.logoImage}
                  resizeMode="contain"
                  accessibilityLabel="HRSJM Emblem Logo"
                />
              </View>

              {/* Main Heading & Subtitle */}
              <View style={styles.headingSection}>
                <Text style={styles.heroHeading}>
                  <Text style={styles.headingNavy}>Personal </Text>
                  <Text style={styles.headingGold}>Details</Text>
                </Text>
                <Text style={styles.heroSubheading}>
                  Enter your details and secure password to register.
                </Text>
              </View>

              {/* Bottom Spacer */}
              <View style={styles.peopleBottomSpacer} />
            </View>

            {/* Overlapping White Information Card */}
            <View style={styles.cardContainer}>
              {/* Stepper Bar at top of card */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepsRow}>
                  {steps.map((s, idx) => {
                    const isDone = s.number < 2;
                    const isActive = s.number === 2;
                    return (
                      <React.Fragment key={s.number}>
                        <View style={styles.stepNode}>
                          <View
                            style={[
                              styles.stepCircle,
                              isDone && styles.stepCircleDone,
                              isActive && styles.stepCircleActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stepCircleText,
                                (isDone || isActive) && styles.stepCircleTextActive,
                              ]}
                            >
                              {isDone ? '✓' : s.number}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.stepLabel,
                              (isDone || isActive) && styles.stepLabelActive,
                            ]}
                          >
                            {s.label}
                          </Text>
                        </View>
                        {idx < steps.length - 1 && (
                          <View
                            style={[
                              styles.stepLine,
                              isDone && styles.stepLineDone,
                            ]}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.cardHeading}>Personal Information &amp; Password</Text>
              <Text style={styles.cardDescription}>
                Fill in your details and password to register your account.
              </Text>

              {/* Field 1: Full Name */}
              <View style={styles.fieldWrapper}>
                <View
                  style={[
                    styles.inputField,
                    errors.fullName ? styles.inputFieldError : null,
                  ]}
                >
                  <View style={styles.inputLeftIcon}>
                    <UserOutlineIcon
                      size={18}
                      color={errors.fullName ? '#DC2626' : '#475569'}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Full Name *"
                    onFocus={handleInputFocus}
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={(t) => {
                      setFullName(t);
                      if (errors.fullName) setErrors(p => ({ ...p, fullName: undefined }));
                    }}
                    autoCapitalize="words"
                    accessibilityLabel="Full Name"
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.fieldErrorText}>{errors.fullName}</Text>
                )}
              </View>

              {/* Field 2: Phone Number */}
              <View style={styles.fieldWrapper}>
                <View
                  style={[
                    styles.inputField,
                    errors.phone ? styles.inputFieldError : null,
                  ]}
                >
                  <View style={styles.inputLeftIcon}>
                    <PhoneOutlineIcon
                      size={18}
                      color={errors.phone ? '#DC2626' : '#475569'}
                    />
                  </View>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mobile Number *"
                    onFocus={handleInputFocus}
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      if (errors.phone) setErrors(p => ({ ...p, phone: undefined }));
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    accessibilityLabel="Mobile Number"
                  />
                  {checkingPhone ? (
                    <ActivityIndicator size="small" color="#EAA224" style={styles.inputRightIcon} />
                  ) : verifiedPhone && phone.replace(/\D/g, '').slice(-10) === verifiedPhone && !errors.phone ? (
                    <View style={styles.inputRightIcon}>
                      <CheckCircleFilledIcon size={18} color="#059669" />
                    </View>
                  ) : null}
                </View>
                {errors.phone && (
                  <Text style={styles.fieldErrorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Field 3: Email Address */}
              <View style={styles.fieldWrapper}>
                <View
                  style={[
                    styles.inputField,
                    errors.email ? styles.inputFieldError : null,
                  ]}
                >
                  <View style={styles.inputLeftIcon}>
                    <MailOutlineIcon
                      size={18}
                      color={errors.email ? '#DC2626' : '#475569'}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address *"
                    onFocus={handleInputFocus}
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errors.email) setErrors(p => ({ ...p, email: undefined }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Email Address"
                  />
                  {checkingEmail ? (
                    <ActivityIndicator size="small" color="#EAA224" style={styles.inputRightIcon} />
                  ) : verifiedEmail && email.trim().toLowerCase() === verifiedEmail && !errors.email ? (
                    <View style={styles.inputRightIcon}>
                      <CheckCircleFilledIcon size={18} color="#059669" />
                    </View>
                  ) : null}
                </View>
                {errors.email && (
                  <Text style={styles.fieldErrorText}>{errors.email}</Text>
                )}
              </View>

              {/* Field 4: Date of Birth */}
              <View style={styles.fieldWrapper}>
                <TouchableOpacity
                  style={[
                    styles.inputField,
                    errors.dob ? styles.inputFieldError : null,
                  ]}
                  onPress={() => { dismissKeyboard(); setIsDatePickerVisible(true); }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Select Date of Birth"
                >
                  <View style={styles.inputLeftIcon}>
                    <CalendarOutlineIcon size={18} color={errors.dob ? '#DC2626' : '#475569'} />
                  </View>
                  <Text
                    style={[
                      styles.textInput,
                      styles.dobText,
                      !dob && styles.placeholderText,
                    ]}
                  >
                    {dob || 'Date of Birth * (DD-MM-YYYY)'}
                  </Text>
                  <View style={styles.inputRightIcon}>
                    <ChevronDownIcon size={12} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
                {errors.dob && (
                  <Text style={styles.fieldErrorText}>{errors.dob}</Text>
                )}
              </View>

              <DobDatePickerModal
                visible={isDatePickerVisible}
                selectedDate={dob}
                onSelectDate={(selected) => {
                  setDob(selected);
                  updateRegistrationState({ dob: selected });
                  const ageCheck = validateAgeEligibility(selected);
                  if (!ageCheck.isValid) {
                    setErrors(prev => ({ ...prev, dob: ageCheck.error || undefined }));
                  } else if (!ageCheck.isEligible) {
                    setIneligibleAge(ageCheck.age);
                    setShowIneligible(true);
                  } else {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.dob;
                      return next;
                    });
                  }
                }}
                onClose={() => setIsDatePickerVisible(false)}
              />

              {/* Field 5: Gender with Picker */}
              <View style={styles.fieldWrapper}>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={() => { dismissKeyboard(); setIsGenderPickerVisible(true); }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Select Gender"
                >
                  <View style={styles.inputLeftIcon}>
                    <GenderIcon size={18} color="#475569" />
                  </View>
                  <Text
                    style={[
                      styles.textInput,
                      styles.dobText,
                      !gender && styles.placeholderText,
                    ]}
                  >
                    {gender || 'Select Gender (Optional)'}
                  </Text>
                  <View style={styles.inputRightIcon}>
                    <ChevronDownIcon size={12} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
              </View>

              <GenderPickerModal
                visible={isGenderPickerVisible}
                selectedGender={gender}
                onSelectGender={(selected) => {
                  setGender(selected);
                  updateRegistrationState({ gender: selected });
                }}
                onClose={() => setIsGenderPickerVisible(false)}
              />

              {/* Field 6: Password */}
              <View style={styles.fieldWrapper}>
                <View
                  style={[
                    styles.inputField,
                    errors.password ? styles.inputFieldError : null,
                  ]}
                >
                  <View style={styles.inputLeftIcon}>
                    <LockOutlineIcon
                      size={18}
                      color={errors.password ? '#DC2626' : '#475569'}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Create Password (min. 6 chars) *"
                    onFocus={handleInputFocus}
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                    accessibilityLabel="Password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(p => !p)}
                    style={styles.inputRightIcon}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeSlashOutlineIcon size={18} color="#64748B" />
                    ) : (
                      <EyeOutlineIcon size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.fieldErrorText}>{errors.password}</Text>
                )}
              </View>

              {/* Field 7: Confirm Password */}
              <View style={styles.fieldWrapper}>
                <View
                  style={[
                    styles.inputField,
                    errors.confirmPassword ? styles.inputFieldError : null,
                  ]}
                >
                  <View style={styles.inputLeftIcon}>
                    <LockOutlineIcon
                      size={18}
                      color={errors.confirmPassword ? '#DC2626' : '#475569'}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password *"
                    onFocus={handleInputFocus}
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: undefined }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    accessibilityLabel="Confirm Password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(p => !p)}
                    style={styles.inputRightIcon}
                    activeOpacity={0.7}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashOutlineIcon size={18} color="#64748B" />
                    ) : (
                      <EyeOutlineIcon size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Consents: Terms and Privacy */}
              <View style={styles.consentsContainer}>
                <TouchableOpacity
                  style={styles.consentRow}
                  onPress={() => setTermsAccepted(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                    {termsAccepted && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>
                    I agree to the <Text style={styles.consentLink}>Terms &amp; Conditions</Text> of HRSJM. *
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.consentRow}
                  onPress={() => setPrivacyAccepted(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, privacyAccepted && styles.checkboxActive]}>
                    {privacyAccepted && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>
                    I accept the <Text style={styles.consentLink}>Privacy Policy</Text> and consent to data processing. *
                  </Text>
                </TouchableOpacity>

                {errors.terms && (
                  <Text style={styles.fieldErrorText}>{errors.terms}</Text>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isValidating && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isValidating}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={isSeeker ? 'Continue to Document Upload' : 'Create Account'}
              >
                {isValidating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>
                      {isSeeker ? 'Continue to Document Upload' : 'Create Account'}
                    </Text>
                    <View style={styles.continueArrowWrapper}>
                      <ArrowRightIcon size={16} color="#FFFFFF" />
                    </View>
                  </>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              {onLoginPress && (
                <View style={styles.loginRow}>
                  <Text style={styles.loginQuestion}>Already have an account? </Text>
                  <TouchableOpacity
                    onPress={onLoginPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Login"
                  >
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  mainWrapper: {
    alignSelf: 'center',
    width: '100%',
  },
  heroBackground: {
    position: 'relative',
    width: '100%',
    minHeight: 195,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingHorizontal: 16,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 247, 240, 0.76)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 40, 96, 0.12)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  brandingSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headingNavy: {
    color: '#0F2860',
  },
  headingGold: {
    color: '#C9971A',
  },
  heroSubheading: {
    fontSize: 13,
    color: '#34516D',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  peopleBottomSpacer: {
    height: 12,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  stepperContainer: {
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNode: {
    alignItems: 'center',
    width: 58,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleDone: {
    backgroundColor: '#059669',
  },
  stepCircleActive: {
    backgroundColor: '#EAA224',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 12,
  },
  stepLabelActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineDone: {
    backgroundColor: '#059669',
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputFieldError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  inputRightIcon: {
    padding: 6,
    marginLeft: 6,
  },
  countryCodeBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F2860',
  },
  dobText: {
    paddingVertical: 12,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 4,
  },
  consentsContainer: {
    marginVertical: 12,
    gap: 8,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#EAA224',
    borderColor: '#EAA224',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  consentLink: {
    color: '#0F2860',
    fontWeight: '700',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  continueArrowWrapper: {
    marginLeft: 4,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginQuestion: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
});
