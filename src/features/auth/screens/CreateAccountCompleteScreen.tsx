import React, { useSyncExternalStore } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserOutlineIcon,
  MailOutlineIcon,
  PhoneOutlineIcon,
  CalendarOutlineIcon,
  UsersGroupIcon,
  FileTextOutlineIcon,
  ClockOutlineIcon,
  CheckCircleSuccessIcon,
  InfoCircleFilledIcon,
  ArrowRightIcon,
} from '../components/AuthIcons';
import {
  getRegistrationState,
  subscribeRegistrationState,
  RegistrationState,
} from '../state/registrationState';

interface StepItem {
  number: number;
  label: string;
}

const STEPS_WITH_VERIFICATION: StepItem[] = [
  { number: 1, label: 'Personal\nDetails' },
  { number: 2, label: 'Account\nType' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Complete' },
];

const STEPS_WITHOUT_VERIFICATION: StepItem[] = [
  { number: 1, label: 'Personal\nDetails' },
  { number: 2, label: 'Account\nType' },
  { number: 3, label: 'Complete' },
];

export interface CreateAccountCompleteScreenProps {
  onBack?: () => void;
  onGoToDashboard?: () => void;
  onViewProfile?: () => void;
  registrationData?: Partial<RegistrationState>;
}

export const CreateAccountCompleteScreen: React.FC<CreateAccountCompleteScreenProps> = ({
  onBack,
  onGoToDashboard,
  onViewProfile,
  registrationData: propData,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  // Read live registration state (with fallback to propData or default state)
  const storeState = useSyncExternalStore(
    subscribeRegistrationState,
    getRegistrationState,
    getRegistrationState,
  );

  const regData: RegistrationState = {
    ...storeState,
    ...(propData || {}),
  };

  // Determine if this account type requires verification
  const isGeneralUser = regData.accountType === 'general';
  const STEPS = isGeneralUser ? STEPS_WITHOUT_VERIFICATION : STEPS_WITH_VERIFICATION;
  const currentStep = isGeneralUser ? 3 : 4; // Step 3 for General User, Step 4 for others

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history) {
      (globalThis as any).window.history.back();
    }
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
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
      >
        <View style={[styles.mainWrapper, { width: contentMaxWidth }]}>
          {/* 1. Header with Back Button & Centered Screen Title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to verification"
            >
              <ChevronLeftIcon size={20} color="#0F2860" />
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
                          <View style={styles.checkMark}>
                            <View style={styles.checkMarkStem} />
                            <View style={styles.checkMarkKick} />
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.stepNumber,
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
                          (isCompleted || isActive) && styles.stepLabelActive,
                        ]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>

                    {/* Connecting Line between steps (All gold up to step 4) */}
                    {!isLast && (
                      <View
                        style={[
                          styles.connectingLine,
                          styles.connectingLineActive,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* 3. Phase 2: Success Section + Illustration + Headings */}
          <View style={styles.successSection}>
            {/* Centered Success Illustration */}
            <View style={styles.illustrationContainer}>
              {/* Warm circular glow */}
              <View style={styles.glowBackdrop} />

              {/* Confetti Elements */}
              <View style={[styles.confetti, styles.confettiTopGold]} />
              <View style={[styles.confetti, styles.confettiTopRightBlue]} />
              <View style={[styles.confetti, styles.confettiTopLeftBlue]} />
              <View style={[styles.confetti, styles.confettiMidLeftGold]} />
              <View style={[styles.confetti, styles.confettiMidRightGold]} />
              <View style={[styles.confetti, styles.confettiLowerLeftGold]} />
              <View style={[styles.confetti, styles.confettiLowerRightGold]} />

              {/* Identity Document Card */}
              <View style={styles.idDocumentCard}>
                {/* Top Row: User Avatar & Header lines */}
                <View style={styles.docHeaderRow}>
                  {/* User Profile Avatar */}
                  <View style={styles.docAvatarCircle}>
                    <View style={styles.avatarHead} />
                    <View style={styles.avatarBody} />
                  </View>

                  {/* Header Placeholder Lines */}
                  <View style={styles.docHeaderLines}>
                    <View style={styles.docLineGoldShort} />
                    <View style={styles.docLineGoldTiny} />
                  </View>
                </View>

                {/* Document Body Lines */}
                <View style={styles.docBodyLines}>
                  <View style={styles.docLineGoldLong} />
                  <View style={styles.docLineGoldMedium} />
                </View>
              </View>

              {/* Large Overlapping Green Success Check Badge */}
              <View style={styles.successBadge}>
                <View style={styles.successCheckMark}>
                  <View style={styles.successCheckStem} />
                  <View style={styles.successCheckKick} />
                </View>
              </View>
            </View>

            {/* Success Heading */}
            <Text style={styles.successHeading}>
              Account Created{'\n'}Successfully!
            </Text>

            {/* Welcome Message */}
            <Text style={styles.welcomeMessage}>
              {isGeneralUser
                ? `Welcome to HRSJM! Your account has been\ncreated successfully. You can now explore\nthe app and its features.`
                : `Welcome to HRSJM! Your account has been\ncreated and your document has been submitted\nfor verification.`}
            </Text>
          </View>

          {/* 4. Phase 3: Account Summary Card */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              {/* Card Header Row: Title & Under Verification Pill */}
              <View style={styles.summaryHeaderRow}>
                <View style={styles.summaryTitleWrapper}>
                  <Text style={styles.summaryTitle}>Account Summary</Text>
                  <Text style={styles.summarySubtitle}>Here are your registered details.</Text>
                </View>

                {/* Status Pill — only for accounts requiring verification */}
                {!isGeneralUser && (
                  <View style={styles.statusPill}>
                    <ClockOutlineIcon size={14} color="#B45309" />
                    <Text style={styles.statusPillText}>Under Verification</Text>
                  </View>
                )}
              </View>

              {/* Fields List */}
              <View style={styles.fieldsList}>
                {/* 1. Full Name */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.fieldIconWrapper}>
                      <UserOutlineIcon size={18} color="#0F2860" />
                    </View>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                  </View>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {regData.fullName || '—'}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* 2. Email Address */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.fieldIconWrapper}>
                      <MailOutlineIcon size={18} color="#0F2860" />
                    </View>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                  </View>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {regData.email || '—'}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* 3. Mobile Number */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.fieldIconWrapper}>
                      <PhoneOutlineIcon size={18} color="#0F2860" />
                    </View>
                    <Text style={styles.fieldLabel}>Mobile Number</Text>
                  </View>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {regData.phone || '—'}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* 4. Date of Birth */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.fieldIconWrapper}>
                      <CalendarOutlineIcon size={18} color="#0F2860" />
                    </View>
                    <Text style={styles.fieldLabel}>Date of Birth</Text>
                  </View>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {regData.dob || '—'}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* 5. Account Type */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.fieldIconWrapper}>
                      <UsersGroupIcon size={18} color="#0F2860" />
                    </View>
                    <Text style={styles.fieldLabel}>Account Type</Text>
                  </View>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {regData.accountTypeLabel || 'General User'}
                  </Text>
                </View>

                {/* 6. Document Submitted — hidden for General User */}
                {!isGeneralUser && (
                  <>
                    <View style={styles.divider} />

                    {regData.documents && regData.documents.length > 1 ? (
                      <View style={styles.multiDocsContainer}>
                        <View style={styles.multiDocsHeaderRow}>
                          <View style={styles.fieldLeft}>
                            <View style={styles.fieldIconWrapper}>
                              <FileTextOutlineIcon size={19} color="#0F2860" />
                            </View>
                            <Text style={styles.fieldLabel}>Documents Submitted</Text>
                          </View>
                        </View>

                        <View style={styles.multiDocsList}>
                          {regData.documents.map((doc, idx) => (
                            <View key={doc.id || idx} style={styles.multiDocItemRow}>
                              <View style={styles.docMetaColumnLeft}>
                                <Text style={styles.docTitleValue}>{doc.title}</Text>
                                {doc.name ? (
                                  <Text style={styles.docFileNameValue} numberOfLines={1}>
                                    {doc.name}
                                  </Text>
                                ) : null}
                              </View>
                              <View style={styles.docCheckWrapper}>
                                <CheckCircleSuccessIcon size={18} color="#10B981" />
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.docFieldRow}>
                        <View style={styles.fieldLeft}>
                          <View style={styles.fieldIconWrapper}>
                            <FileTextOutlineIcon size={19} color="#0F2860" />
                          </View>
                          <Text style={styles.fieldLabel}>Document Submitted</Text>
                        </View>

                        <View style={styles.docRightContainer}>
                          <View style={styles.docMetaColumn}>
                            <Text style={styles.docTitleValue}>
                              {regData.documents && regData.documents.length === 1
                                ? regData.documents[0].title
                                : regData.selectedDocTitle || 'Aadhaar Card'}
                            </Text>
                            {(regData.documents && regData.documents.length === 1 && regData.documents[0].name) ||
                            (regData.hasUploadedDocument && regData.uploadedFileName) ? (
                              <Text style={styles.docFileNameValue} numberOfLines={1}>
                                {regData.documents && regData.documents.length === 1
                                  ? regData.documents[0].name
                                  : regData.uploadedFileName}
                              </Text>
                            ) : null}
                          </View>

                          {/* Green check indicates uploaded/submitted document */}
                          {(regData.hasUploadedDocument || (regData.documents && regData.documents.length > 0)) && (
                            <View style={styles.docCheckWrapper}>
                              <CheckCircleSuccessIcon size={18} color="#10B981" />
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* 5. Phase 4: Information Message Card */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <InfoCircleFilledIcon size={22} color="#0284C7" />
              </View>
              <Text style={styles.infoMessageText}>
                We will review your details and document. You will be notified once your account is verified. You can still explore the app in the meantime.
              </Text>
            </View>
          </View>

          {/* 6. Phase 4: Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Primary Button: Go to Dashboard */}
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={handleGoToDashboard}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Go to Dashboard"
            >
              <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
              <View style={styles.arrowIconWrapper}>
                <ArrowRightIcon size={18} color="#0F2860" />
              </View>
            </TouchableOpacity>

            {/* Secondary Button: View My Profile */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleViewProfile}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View My Profile"
            >
              <Text style={styles.profileButtonText}>View My Profile</Text>
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
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  mainWrapper: {
    width: '100%',
    backgroundColor: '#F8F9FB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
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
    borderWidth: 0,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  checkMark: {
    width: 12,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  checkMarkStem: {},
  checkMarkKick: {},
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
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

  /* Phase 2: Success Section Styles */
  successSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 4,
  },
  illustrationContainer: {
    width: 200,
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 14,
  },
  glowBackdrop: {
    position: 'absolute',
    width: 165,
    height: 165,
    borderRadius: 82.5,
    backgroundColor: '#FEF3C7',
    opacity: 0.5,
  },

  /* Confetti Pieces */
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  confettiTopGold: {
    width: 6,
    height: 12,
    backgroundColor: '#EAA224',
    top: 10,
    left: 65,
    transform: [{ rotate: '35deg' }],
  },
  confettiTopRightBlue: {
    width: 7,
    height: 14,
    backgroundColor: '#BAE6FD',
    top: 20,
    right: 48,
    transform: [{ rotate: '-25deg' }],
  },
  confettiTopLeftBlue: {
    width: 8,
    height: 13,
    backgroundColor: '#BAE6FD',
    top: 36,
    left: 36,
    transform: [{ rotate: '45deg' }],
  },
  confettiMidLeftGold: {
    width: 6,
    height: 12,
    backgroundColor: '#F59E0B',
    top: 80,
    left: 28,
    transform: [{ rotate: '-30deg' }],
  },
  confettiMidRightGold: {
    width: 7,
    height: 14,
    backgroundColor: '#EAA224',
    top: 72,
    right: 32,
    transform: [{ rotate: '30deg' }],
  },
  confettiLowerLeftGold: {
    width: 6,
    height: 12,
    backgroundColor: '#FBBF24',
    bottom: 25,
    left: 42,
    transform: [{ rotate: '20deg' }],
  },
  confettiLowerRightGold: {
    width: 6,
    height: 11,
    backgroundColor: '#FBBF24',
    bottom: 30,
    right: 38,
    transform: [{ rotate: '-35deg' }],
  },

  /* Document Card */
  idDocumentCard: {
    width: 116,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.8,
    borderColor: '#0F2860',
    padding: 12,
    justifyContent: 'flex-start',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  docAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F2860',
    marginBottom: 2,
  },
  avatarBody: {
    width: 18,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#0F2860',
  },
  docHeaderLines: {
    flex: 1,
    justifyContent: 'center',
  },
  docLineGoldShort: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F3D9A2',
    marginBottom: 5,
  },
  docLineGoldTiny: {
    width: 28,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
  },
  docBodyLines: {
    marginTop: 4,
  },
  docLineGoldLong: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3D9A2',
    marginBottom: 8,
  },
  docLineGoldMedium: {
    width: '75%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3D9A2',
    marginBottom: 8,
  },

  /* Overlapping Success Badge */
  successBadge: {
    position: 'absolute',
    bottom: 12,
    right: 46,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 4,
  },
  successCheckMark: {
    width: 20,
    height: 11,
    borderLeftWidth: 3.5,
    borderBottomWidth: 3.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -3,
  },
  successCheckStem: {},
  successCheckKick: {},

  /* Headings */
  successHeading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    lineHeight: 33,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: 10,
  },
  welcomeMessage: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#5B6B82',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  /* Phase 3: Account Summary Card Styles */
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryTitleWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.1,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#B45309',
  },
  fieldsList: {
    width: '100%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    paddingRight: 10,
  },
  fieldIconWrapper: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13.5,
    color: '#5B6B82',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13.5,
    color: '#0F2860',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  docFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  docRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    flexShrink: 1,
    gap: 8,
  },
  docMetaColumn: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  docTitleValue: {
    fontSize: 13.5,
    color: '#0F2860',
    fontWeight: '700',
    textAlign: 'right',
  },
  docFileNameValue: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 1,
  },
  docCheckWrapper: {
    marginLeft: 2,
    flexShrink: 0,
  },
  multiDocsContainer: {
    paddingVertical: 11,
  },
  multiDocsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  multiDocsList: {
    paddingLeft: 28,
    gap: 8,
  },
  multiDocItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  docMetaColumnLeft: {
    flex: 1,
    paddingRight: 8,
  },

  /* Phase 4: Information Message Card Styles */
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconWrapper: {
    marginTop: 1,
  },
  infoMessageText: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18.5,
    fontWeight: '400',
  },

  /* Phase 4: Actions Buttons Styles */
  actionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  dashboardButton: {
    height: 52,
    backgroundColor: '#EAA224',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.1,
  },
  arrowIconWrapper: {
    marginLeft: 8,
  },
  profileButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.1,
  },
});
