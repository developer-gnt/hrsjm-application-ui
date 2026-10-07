import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserOutlineIcon,
  UsersGroupIcon,
  HeartHandIcon,
  CheckCircleFilledIcon,
  LockOutlineIcon,
  EyeOutlineIcon,
  EyeSlashOutlineIcon,
  ArrowRightIcon,
} from '../components/AuthIcons';
import { getRegistrationState, updateRegistrationState } from '../state/registrationState';
import {
  navigateToCreateAccountVerification,
  navigateToCreateAccountComplete,
} from '../../../core/navigation/appRouter';

export type AccountTypeOption = 'general' | 'member' | 'seeker';

interface CreateAccountAdditionalScreenProps {
  onBack?: () => void;
  onContinue?: (accountType: AccountTypeOption, password: string) => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

interface StepItem {
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Personal\nDetails' },
  { number: 2, label: 'Account\nType' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Complete' },
];

const ACCOUNT_TYPE_LABELS: Record<AccountTypeOption, string> = {
  general: 'General User',
  member: 'Member',
  seeker: 'Donation Seeker',
};

export const CreateAccountAdditionalScreen: React.FC<CreateAccountAdditionalScreenProps> = ({
  onBack,
  onContinue,
  onTermsPress,
  onPrivacyPress,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;
  const currentStep = 2; // Step 2: Account Type

  // Phase 2: Account Type state (read from registration state)
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeOption>(
    () => (getRegistrationState().accountType as AccountTypeOption) || 'general'
  );

  // Phase 3: Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phase 4: Terms & Conditions state
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Password requirement validations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history) {
      (globalThis as any).window.history.back();
    }
  };

  const handleTermsPress = () => {
    if (onTermsPress) {
      onTermsPress();
    } else {
      Alert.alert('Terms & Conditions', 'HRSJM Terms & Conditions agreement.');
    }
  };

  const handlePrivacyPress = () => {
    if (onPrivacyPress) {
      onPrivacyPress();
    } else {
      Alert.alert('Privacy Policy', 'HRSJM Privacy Policy guidelines.');
    }
  };

  const handleContinue = () => {
    if (!isPasswordValid) {
      Alert.alert(
        'Password Requirements',
        'Please ensure your password meets all 4 security requirements.'
      );
      return;
    }

    if (!confirmPassword) {
      Alert.alert('Confirm Password', 'Please confirm your password.');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        'Terms Required',
        'Please agree to the Terms & Conditions and Privacy Policy of HRSJM.'
      );
      return;
    }

    updateRegistrationState({
      accountType: selectedAccountType,
      accountTypeLabel: ACCOUNT_TYPE_LABELS[selectedAccountType] || 'General User',
    });

    if (onContinue) {
      onContinue(selectedAccountType, password);
    } else {
      if (selectedAccountType === 'general') {
        navigateToCreateAccountComplete();
      } else {
        navigateToCreateAccountVerification();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrDesktop && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainWrapper, { width: contentMaxWidth }]}>
          {/* 1. Header with Back Button & Centered Screen Title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronLeftIcon size={16} color="#0F2860" />
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <Text style={styles.screenTitle}>Create Your Account</Text>
            </View>

            {/* Empty balance spacer for true centering */}
            <View style={styles.headerSpacer} />
          </View>

          {/* 2. 4-Step Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.stepsRow}>
              {STEPS.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isActive = step.number === currentStep;
                const isLast = index === STEPS.length - 1;

                return (
                  <React.Fragment key={step.number}>
                    {/* Step Node */}
                    <View style={styles.stepNodeContainer}>
                      <View
                        style={[
                          styles.stepCircle,
                          isCompleted && styles.stepCircleCompleted,
                          isActive && styles.stepCircleActive,
                        ]}
                      >
                        {isCompleted ? (
                          <View style={styles.whiteCheckmark} />
                        ) : (
                          <Text
                            style={[
                              styles.stepNumber,
                              isCompleted && styles.stepNumberCompleted,
                              isActive && styles.stepNumberActive,
                            ]}
                          >
                            {step.number}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          isActive && styles.stepLabelActive,
                        ]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>

                    {/* Connecting Line between steps */}
                    {!isLast && (
                      <View
                        style={[
                          styles.connectingLine,
                          step.number < currentStep
                            ? styles.connectingLineActive
                            : styles.connectingLineInactive,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* 3. Account Type Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Account Type</Text>
            <Text style={styles.sectionDescription}>
              Please select the option that best describes you.
            </Text>

            {/* 3 Account Cards Grid (2-column layout) */}
            <View style={styles.cardsGrid}>
              {/* Row 1: General User & Member */}
              <View style={styles.cardsRow}>
                {/* Card 1: General User */}
                <TouchableOpacity
                  style={[
                    styles.accountCard,
                    selectedAccountType === 'general' && styles.accountCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccountType('general');
                    updateRegistrationState({
                      accountType: 'general',
                      accountTypeLabel: 'General User',
                    });
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="General User Account Type"
                >
                  {selectedAccountType === 'general' && (
                    <View style={styles.checkBadge}>
                      <CheckCircleFilledIcon size={18} color="#EAA224" />
                    </View>
                  )}
                  <View style={styles.cardIconWrapper}>
                    <UserOutlineIcon size={24} color="#0F2860" />
                  </View>
                  <Text style={styles.cardTitle}>General User</Text>
                  <Text style={styles.cardDescription}>
                    Explore, learn and{'\n'}support HRSJM
                  </Text>
                </TouchableOpacity>

                {/* Card 2: Member */}
                <TouchableOpacity
                  style={[
                    styles.accountCard,
                    selectedAccountType === 'member' && styles.accountCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccountType('member');
                    updateRegistrationState({
                      accountType: 'member',
                      accountTypeLabel: 'Member',
                    });
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Member Account Type"
                >
                  {selectedAccountType === 'member' && (
                    <View style={styles.checkBadge}>
                      <CheckCircleFilledIcon size={18} color="#EAA224" />
                    </View>
                  )}
                  <View style={styles.cardIconWrapper}>
                    <UsersGroupIcon size={26} color="#0F2860" />
                  </View>
                  <Text style={styles.cardTitle}>Member</Text>
                  <Text style={styles.cardDescription}>
                    Join as a member{'\n'}of HRSJM
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Donation Seeker (left-aligned) */}
              <View style={styles.cardsRow}>
                {/* Card 3: Donation Seeker */}
                <TouchableOpacity
                  style={[
                    styles.accountCard,
                    selectedAccountType === 'seeker' && styles.accountCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccountType('seeker');
                    updateRegistrationState({
                      accountType: 'seeker',
                      accountTypeLabel: 'Donation Seeker',
                    });
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Donation Seeker Account Type"
                >
                  {selectedAccountType === 'seeker' && (
                    <View style={styles.checkBadge}>
                      <CheckCircleFilledIcon size={18} color="#EAA224" />
                    </View>
                  )}
                  <View style={styles.cardIconWrapper}>
                    <HeartHandIcon size={24} color="#0F2860" />
                  </View>
                  <Text style={styles.cardTitle}>Donation Seeker</Text>
                  <Text style={styles.cardDescription}>
                    Request support for{'\n'}approved causes
                  </Text>
                </TouchableOpacity>

                {/* Empty invisible placeholder to keep 2-column grid alignment */}
                <View style={styles.cardPlaceholder} />
              </View>
            </View>
          </View>

          {/* 4. Create Password Section */}
          <View style={[styles.sectionContainer, styles.passwordSection]}>
            <Text style={styles.sectionHeading}>Create Password</Text>
            <Text style={styles.sectionDescription}>
              Use a strong password to keep your account secure.
            </Text>

            {/* Password Field */}
            <View style={styles.inputField}>
              <View style={styles.inputLeftIcon}>
                <LockOutlineIcon size={18} color="#0F2860" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Password *"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputRightIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOutlineIcon size={18} color="#0F2860" />
                ) : (
                  <EyeSlashOutlineIcon size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Requirements Checklist */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>

              {/* Requirement 1: Min 8 chars */}
              <View style={styles.reqRow}>
                <View
                  style={[
                    styles.reqCircle,
                    hasMinLength && styles.reqCircleValid,
                  ]}
                >
                  {hasMinLength && <View style={styles.reqDot} />}
                </View>
                <Text
                  style={[
                    styles.reqText,
                    hasMinLength && styles.reqTextValid,
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>

              {/* Requirement 2: Uppercase */}
              <View style={styles.reqRow}>
                <View
                  style={[
                    styles.reqCircle,
                    hasUppercase && styles.reqCircleValid,
                  ]}
                >
                  {hasUppercase && <View style={styles.reqDot} />}
                </View>
                <Text
                  style={[
                    styles.reqText,
                    hasUppercase && styles.reqTextValid,
                  ]}
                >
                  One uppercase letter (A–Z)
                </Text>
              </View>

              {/* Requirement 3: Lowercase */}
              <View style={styles.reqRow}>
                <View
                  style={[
                    styles.reqCircle,
                    hasLowercase && styles.reqCircleValid,
                  ]}
                >
                  {hasLowercase && <View style={styles.reqDot} />}
                </View>
                <Text
                  style={[
                    styles.reqText,
                    hasLowercase && styles.reqTextValid,
                  ]}
                >
                  One lowercase letter (a–z)
                </Text>
              </View>

              {/* Requirement 4: Number */}
              <View style={styles.reqRow}>
                <View
                  style={[
                    styles.reqCircle,
                    hasNumber && styles.reqCircleValid,
                  ]}
                >
                  {hasNumber && <View style={styles.reqDot} />}
                </View>
                <Text
                  style={[
                    styles.reqText,
                    hasNumber && styles.reqTextValid,
                  ]}
                >
                  One number (0–9)
                </Text>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View
              style={[
                styles.inputField,
                passwordMismatch && styles.inputFieldError,
                passwordsMatch && styles.inputFieldSuccess,
              ]}
            >
              <View style={styles.inputLeftIcon}>
                <LockOutlineIcon size={18} color="#0F2860" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password *"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                accessibilityLabel="Confirm Password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.inputRightIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOutlineIcon size={18} color="#0F2860" />
                ) : (
                  <EyeSlashOutlineIcon size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password mismatch feedback */}
            {passwordMismatch && (
              <Text style={styles.errorFeedbackText}>Passwords do not match.</Text>
            )}

            {/* 5. Terms & Conditions Agreement Row */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxActive,
                ]}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                accessibilityLabel="I agree to Terms & Conditions and Privacy Policy of HRSJM"
              >
                {termsAccepted && (
                  <View style={styles.checkboxCheckmark}>
                    <View style={styles.checkboxCheckmarkShort} />
                    <View style={styles.checkboxCheckmarkLong} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  Terms &amp; Conditions
                </Text>{' '}
                and{' '}
                <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                  Privacy Policy
                </Text>{' '}
                of HRSJM.
              </Text>
            </View>

            {/* 6. Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <View style={styles.continueArrowWrapper}>
                <ArrowRightIcon size={16} color="#0F2860" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepNodeContainer: {
    alignItems: 'center',
    width: 68,
    zIndex: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: '#EAA224',
  },
  stepCircleActive: {
    backgroundColor: '#EAA224',
  },
  whiteCheckmark: {
    width: 11,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepNumberCompleted: {
    color: '#FFFFFF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  connectingLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: -8,
    zIndex: 1,
  },
  connectingLineActive: {
    backgroundColor: '#EAA224',
  },
  connectingLineInactive: {
    backgroundColor: '#E2E8F0',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  cardsGrid: {
    gap: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  accountCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
    minHeight: 135,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  accountCardSelected: {
    borderColor: '#EAA224',
    borderWidth: 1.6,
    backgroundColor: '#FFFDF9',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardIconWrapper: {
    marginBottom: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
  cardPlaceholder: {
    flex: 1,
  },
  passwordSection: {
    paddingTop: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputFieldError: {
    borderColor: '#EF4444',
  },
  inputFieldSuccess: {
    borderColor: '#10B981',
  },
  inputLeftIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRightIcon: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
    height: '100%',
  },
  requirementsContainer: {
    marginBottom: 16,
    paddingLeft: 2,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reqCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqCircleValid: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  reqDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  reqText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  reqTextValid: {
    color: '#0F2860',
    fontWeight: '600',
  },
  errorFeedbackText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 10,
    paddingLeft: 4,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#EAA224',
    borderColor: '#EAA224',
  },
  checkboxCheckmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  checkboxCheckmarkShort: {},
  checkboxCheckmarkLong: {},
  termsText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#1E293B',
    fontWeight: '500',
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA224',
    height: 50,
    borderRadius: 12,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.3,
  },
  continueArrowWrapper: {
    marginLeft: 8,
  },
});
