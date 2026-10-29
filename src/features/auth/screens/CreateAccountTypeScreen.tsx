import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
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

export type AccountTypeOption = 'general' | 'member' | 'seeker';

interface CreateAccountTypeScreenProps {
  onBack?: () => void;
  onContinue?: (accountType: AccountTypeOption) => void;
  onMemberSelect?: () => void;
  onLoginPress?: () => void;
}

interface StepItem {
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Account\nType' },
  { number: 2, label: 'Personal\nDetails' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Complete' },
];

export const CreateAccountTypeScreen: React.FC<CreateAccountTypeScreenProps> = ({
  onBack,
  onContinue,
  onMemberSelect,
  onLoginPress,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const [selectedType, setSelectedType] = useState<AccountTypeOption>(() => {
    const saved = getRegistrationState().accountType as AccountTypeOption;
    if (saved === 'member') return 'member';
    if (saved === 'seeker') return 'seeker';
    return 'general';
  });

  const handleSelect = (type: AccountTypeOption) => {
    setSelectedType(type);
    updateRegistrationState({
      accountType: type,
      accountTypeLabel:
        type === 'general'
          ? 'General User'
          : type === 'seeker'
          ? 'Donation Seeker'
          : 'Member',
    });

    if (type === 'member') {
      if (onMemberSelect) {
        onMemberSelect();
      }
      return;
    }

    if (onContinue) {
      onContinue(type);
    }
  };

  const handleNext = () => {
    updateRegistrationState({
      accountType: selectedType,
      accountTypeLabel:
        selectedType === 'general'
          ? 'General User'
          : selectedType === 'seeker'
          ? 'Donation Seeker'
          : 'Member',
    });

    if (selectedType === 'member') {
      if (onMemberSelect) onMemberSelect();
      return;
    }
    if (onContinue) {
      onContinue(selectedType);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainWrapper, { maxWidth: contentMaxWidth, width: '100%' }]}>
          {/* Header row with back button */}
          <View style={styles.headerRow}>
            {onBack ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                activeOpacity={0.7}
              >
                <ChevronLeftIcon size={18} color="#0F2860" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Text style={styles.headerTitle}>Create Your Account</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Stepper Progress Bar matching Design */}
          <View style={styles.stepperWrap}>
            <View style={styles.stepperRow}>
              {STEPS.map((step, idx) => {
                const isActive = step.number === 1;
                return (
                  <React.Fragment key={step.number}>
                    <View style={styles.stepCircleWrap}>
                      <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
                        <Text style={[styles.stepCircleText, isActive ? styles.stepCircleTextActive : styles.stepCircleTextInactive]}>
                          {step.number}
                        </Text>
                      </View>
                      <Text style={[styles.stepLabel, isActive ? styles.stepLabelActive : styles.stepLabelInactive]}>
                        {step.label}
                      </Text>
                    </View>
                    {idx < STEPS.length - 1 && (
                      <View style={styles.stepConnectorLine} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Main Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.sectionHeading}>Account Type</Text>
            <Text style={styles.sectionSubheading}>
              Please select the option that best describes you.
            </Text>
          </View>

          {/* 3 Interactive Cards matching design */}
          <View style={styles.cardsGrid}>
            {/* Card 1: General User */}
            <TouchableOpacity
              style={[
                styles.accountCard,
                selectedType === 'general' && styles.accountCardActive,
              ]}
              onPress={() => handleSelect('general')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Select General User account"
            >
              {selectedType === 'general' && (
                <View style={styles.checkBadge}>
                  <CheckCircleFilledIcon size={20} color="#EAA224" />
                </View>
              )}
              <View style={styles.iconWrap}>
                <UserOutlineIcon size={32} color={selectedType === 'general' ? '#0F2860' : '#475569'} />
              </View>
              <Text style={[styles.cardTitle, selectedType === 'general' && styles.cardTitleActive]}>
                General User
              </Text>
              <Text style={styles.cardDesc}>
                Explore, learn and support HRSJM
              </Text>
              <View style={styles.instantAccessBadge}>
                <Text style={styles.instantAccessText}>Instant Access • No Approval</Text>
              </View>
            </TouchableOpacity>

            {/* Card 2: Member */}
            <TouchableOpacity
              style={[
                styles.accountCard,
                selectedType === 'member' && styles.accountCardActive,
              ]}
              onPress={() => handleSelect('member')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Select Member account"
            >
              {selectedType === 'member' && (
                <View style={styles.checkBadge}>
                  <CheckCircleFilledIcon size={20} color="#EAA224" />
                </View>
              )}
              <View style={styles.iconWrap}>
                <UsersGroupIcon size={32} color={selectedType === 'member' ? '#0F2860' : '#475569'} />
              </View>
              <Text style={[styles.cardTitle, selectedType === 'member' && styles.cardTitleActive]}>
                Member
              </Text>
              <Text style={styles.cardDesc}>
                Join as an official member of HRSJM
              </Text>
              <View style={[styles.instantAccessBadge, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.instantAccessText, { color: '#15803D' }]}>Official ID & Voting Rights →</Text>
              </View>
            </TouchableOpacity>

            {/* Card 3: Donation Seeker */}
            <TouchableOpacity
              style={[
                styles.accountCard,
                styles.seekerCardFull,
                selectedType === 'seeker' && styles.accountCardActive,
              ]}
              onPress={() => handleSelect('seeker')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Select Donation Seeker account"
            >
              {selectedType === 'seeker' && (
                <View style={styles.checkBadge}>
                  <CheckCircleFilledIcon size={20} color="#EAA224" />
                </View>
              )}
              <View style={styles.iconWrap}>
                <HeartHandIcon size={32} color={selectedType === 'seeker' ? '#0F2860' : '#475569'} />
              </View>
              <Text style={[styles.cardTitle, selectedType === 'seeker' && styles.cardTitleActive]}>
                Donation Seeker
              </Text>
              <Text style={styles.cardDesc}>
                Request financial, medical or educational aid for approved causes
              </Text>
              <View style={[styles.instantAccessBadge, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.instantAccessText, { color: '#B45309' }]}>Requires Document Upload & Admin Approval</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleNext}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continue to personal details"
          >
            <Text style={styles.continueButtonText}>
              {selectedType === 'member' ? 'Proceed to Membership Form' : 'Continue'}
            </Text>
            <ArrowRightIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Already have an account row */}
          {onLoginPress && (
            <View style={styles.loginRow}>
              <Text style={styles.loginRowText}>Already have an account? </Text>
              <TouchableOpacity onPress={onLoginPress} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  mainWrapper: {
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: -0.2,
  },
  stepperWrap: {
    paddingVertical: 14,
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCircleWrap: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#EAA224',
  },
  stepCircleInactive: {
    backgroundColor: '#F1F5F9',
  },
  stepCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepCircleTextInactive: {
    color: '#94A3B8',
  },
  stepLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  stepLabelInactive: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepConnectorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  cardsGrid: {
    gap: 14,
    marginBottom: 24,
  },
  accountCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 18,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  accountCardActive: {
    borderColor: '#EAA224',
    backgroundColor: '#FFFCF5',
    shadowColor: '#EAA224',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  seekerCardFull: {
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 4,
  },
  cardTitleActive: {
    color: '#0F2860',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  instantAccessBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  instantAccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loginRowText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
});
