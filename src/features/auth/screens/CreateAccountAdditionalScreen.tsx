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
  ArrowRightIcon,
} from '../components/AuthIcons';
import { getRegistrationState, updateRegistrationState } from '../state/registrationState';
import {
  navigateToCreateAccountVerification,
  navigateToCreateAccountComplete,
  navigateToMembershipCategories,
} from '../../../core/navigation/appRouter';

export type AccountTypeOption = 'general' | 'member' | 'seeker';

interface CreateAccountAdditionalScreenProps {
  onBack?: () => void;
  onContinue?: (accountType: AccountTypeOption, password?: string) => void;
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

  // Phase 2: Account Type state (read from registration state, default to general)
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeOption>(() => {
    const saved = getRegistrationState().accountType as AccountTypeOption;
    if (saved === 'member') return 'member';
    if (saved === 'seeker') return 'seeker';
    return 'general';
  });

  // Soft error states
  const [errors, setErrors] = useState<{
    terms?: string;
  }>({});

  // Phase 4: Consents state (Terms, Privacy, Pledge)
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  const handleToggleTerms = () => {
    const nextVal = !termsAccepted;
    setTermsAccepted(nextVal);
    if (nextVal && errors.terms) {
      setErrors((prev) => ({ ...prev, terms: undefined }));
    }
  };

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

  const handlePledgePress = () => {
    Alert.alert(
      'HRSJM Member Pledge',
      'I solemnly pledge to uphold fundamental human rights, promote social justice, observe the Constitution and Code of Conduct of HRSJM, maintain ethical integrity, and certify that all details submitted are accurate.'
    );
  };

  const handleContinue = () => {
    const newErrors: { terms?: string } = {};

    if (!termsAccepted) {
      newErrors.terms = 'Please agree to the Terms & Conditions of HRSJM to proceed.';
    } else if (!privacyAccepted) {
      newErrors.terms = 'Please accept the Privacy Policy of HRSJM to proceed.';
    } else if (!pledgeAccepted) {
      newErrors.terms = 'Please accept the HRSJM Member Pledge to proceed.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateRegistrationState({
      accountType: selectedAccountType,
      accountTypeLabel: ACCOUNT_TYPE_LABELS[selectedAccountType] || 'General User',
    });

    if (onContinue) {
      onContinue(selectedAccountType);
    } else {
      if (selectedAccountType === 'general') {
        navigateToCreateAccountComplete();
      } else if (selectedAccountType === 'member') {
        navigateToMembershipCategories();
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

            {/* Account Cards Grid (3 account types: General User, Member, Donation Seeker) */}
            <View style={styles.cardsGrid}>
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
                    <UsersGroupIcon size={24} color="#0F2860" />
                  </View>
                  <Text style={styles.cardTitle}>Member</Text>
                  <Text style={styles.cardDescription}>
                    Join as an official{'\n'}member of HRSJM
                  </Text>
                </TouchableOpacity>
              </View>

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

                <View style={styles.cardPlaceholder} />
              </View>
            </View>
          </View>

          {/* 4. Action Section (Terms, Privacy, Pledge & Continue) */}
          <View style={styles.actionSectionContainer}>
            <View style={{ gap: 12, marginBottom: 20 }}>
              {/* Terms & Conditions */}
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxActive,
                    errors.terms && !termsAccepted && styles.checkboxError,
                  ]}
                  onPress={() => {
                    const nextVal = !termsAccepted;
                    setTermsAccepted(nextVal);
                    if (nextVal && errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: termsAccepted }}
                  accessibilityLabel="I agree to Terms & Conditions of HRSJM"
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
                  of HRSJM. *
                </Text>
              </View>

              {/* Privacy Policy */}
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    privacyAccepted && styles.checkboxActive,
                    errors.terms && !privacyAccepted && styles.checkboxError,
                  ]}
                  onPress={() => {
                    const nextVal = !privacyAccepted;
                    setPrivacyAccepted(nextVal);
                    if (nextVal && errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: privacyAccepted }}
                  accessibilityLabel="I accept the Privacy Policy of HRSJM"
                >
                  {privacyAccepted && (
                    <View style={styles.checkboxCheckmark}>
                      <View style={styles.checkboxCheckmarkShort} />
                      <View style={styles.checkboxCheckmarkLong} />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I accept the{' '}
                  <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                    Privacy Policy
                  </Text>{' '}
                  and consent to data processing for membership. *
                </Text>
              </View>

              {/* Member Pledge */}
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    pledgeAccepted && styles.checkboxActive,
                    errors.terms && !pledgeAccepted && styles.checkboxError,
                  ]}
                  onPress={() => {
                    const nextVal = !pledgeAccepted;
                    setPledgeAccepted(nextVal);
                    if (nextVal && errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: pledgeAccepted }}
                  accessibilityLabel="I take the HRSJM Member Pledge"
                >
                  {pledgeAccepted && (
                    <View style={styles.checkboxCheckmark}>
                      <View style={styles.checkboxCheckmarkShort} />
                      <View style={styles.checkboxCheckmarkLong} />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I solemnly take the{' '}
                  <Text style={styles.termsLink} onPress={handlePledgePress}>
                    HRSJM Member Pledge
                  </Text>{' '}
                  to defend human rights and uphold the NGO&apos;s Code of Conduct. *
                </Text>
              </View>

              {/* Terms Soft Error */}
              {errors?.terms && (
                <View style={styles.softErrorRow}>
                  <View style={styles.softErrorBadge}>
                    <Text style={styles.softErrorExclamation}>!</Text>
                  </View>
                  <Text style={styles.softErrorText}>{errors.terms}</Text>
                </View>
              )}
            </View>

            {/* Continue Button */}
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
  actionSectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  softErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  softErrorBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softErrorExclamation: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  softErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  termsWrapper: {
    marginTop: 4,
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  checkboxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
    marginBottom: 4,
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
