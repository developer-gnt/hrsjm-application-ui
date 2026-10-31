import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';
import { CreateAccountTypeScreen, AccountTypeOption } from './CreateAccountTypeScreen';
import { CreateAccountScreen, CreateAccountFormData } from './CreateAccountScreen';
import {
  CreateAccountVerificationScreen,
  UploadedDocFile,
} from './CreateAccountVerificationScreen';
import { CreateAccountCompleteScreen } from './CreateAccountCompleteScreen';
import {
  getRegistrationState,
  updateRegistrationState,
  resetRegistrationState,
  DocumentTypeOption,
} from '../state/registrationState';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../../../core/api/api-error';
import {
  membershipApplicationsStore,
  createApplicationFromRegistration,
} from '../../admin/membershipApplications';
import { usersStore } from '../../admin/users/services/usersStore';
import { AdminColors } from '../../../core/theme/colors';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

/**
 * Redesigned Multi-step Registration Flow:
 *
 * Step 0: Account Type Selection (General User / Member / Donation Seeker)
 *  - Member: Directly navigates to Membership Categories flow.
 *  - General User / Seeker: Proceeds to Step 1.
 * Step 1: Personal Details & Password (Name, Mobile, Email, DOB, Gender, Password)
 *  - General User: Submits registration immediately with role USER, displays Complete screen, opens User Dashboard.
 *  - Donation Seeker: Proceeds to Step 2 for KYC document upload.
 * Step 2: Verification & Document Upload (Donation Seeker only)
 *  - Submits documents, assigns application number (e.g. HRSJM-SEK-XXXX), provisions role USER while pending review.
 * Step 3: Complete Screen
 *  - Displays confirmation & application number, navigates to User Dashboard.
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const register = useAuthStore(state => state.register);
  const completeRegistration = useAuthStore(state => state.completeRegistration);

  // Step 0 = Account Type, Step 1 = Personal Details & Password, Step 2 = Verification (Seeker), Step 3 = Complete
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating your account...');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const extractCleanMobile = (phone: string, countryCode: string = '+91'): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length > 10) {
      return digitsOnly.slice(-10);
    }
    return digitsOnly;
  };

  // Step 0: Account Type Selected
  const handleAccountTypeContinue = (accountType: AccountTypeOption) => {
    if (accountType === 'member') {
      navigation.navigate('MembershipCategories' as any);
      return;
    }
    setStep(1); // Proceed to Personal Details & Password
  };

  const handleMemberSelect = () => {
    navigation.navigate('MembershipCategories' as any);
  };

  // Step 1: Personal Details & Password submitted
  const handlePersonalDetailsContinue = async (formData: CreateAccountFormData) => {
    const state = getRegistrationState();
    const cleanMobile = extractCleanMobile(formData.phone, formData.countryCode);
    const cleanEmail = formData.email && formData.email.trim().length > 0
      ? formData.email.trim().toLowerCase()
      : undefined;
    const effectivePassword = formData.password && formData.password.trim().length >= 6
      ? formData.password.trim()
      : 'Hrsjm@2026';

    updateRegistrationState({
      fullName: formData.fullName.trim(),
      email: cleanEmail || '',
      phone: `${formData.countryCode || '+91'} ${cleanMobile}`,
      countryCode: formData.countryCode || '+91',
      dob: formData.dob ? formData.dob.trim() : '',
      gender: formData.gender?.trim() || '',
      password: effectivePassword,
    });

    const isGeneralUser = state.accountType === 'general' || !state.accountType || state.accountType === 'user';
    if (isGeneralUser) {
      // General User: No document verification needed. Register immediately!
      setSubmitting(true);
      setLoadingMessage('Creating your account...');
      try {
        await register({
          full_name: formData.fullName.trim(),
          email: cleanEmail,
          mobile_number: cleanMobile,
          password: effectivePassword,
          confirm_password: effectivePassword,
          role_name: 'USER',
          dob: formData.dob ? formData.dob.trim() : undefined,
        });

        usersStore.registerUserFromRegistration({
          fullName: formData.fullName.trim(),
          email: cleanEmail,
          phone: `${formData.countryCode || '+91'} ${cleanMobile}`,
          countryCode: formData.countryCode || '+91',
          dob: formData.dob ? formData.dob.trim() : '',
          gender: formData.gender?.trim() || '',
          accountType: 'general',
          accountTypeLabel: 'General User',
        });

        // Set session user into auth store
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          useAuthStore.getState().setUser({
            ...authUser,
            account_type: 'general',
            status: 'ACTIVE',
            roles: [{ id: 'role-user', name: 'USER' }],
          });
        }

        setStep(3); // Go directly to Complete screen!
      } catch (error: any) {
        let message = 'Unable to create account. Please try again.';
        if (error instanceof ApiError) {
          if (error.statusCode === 409) {
            message = 'An account with this mobile number or email already exists. Please log in.';
          } else if (error.message) {
            message = error.message;
          }
        } else if (error?.message) {
          message = error.message;
        }
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(message);
        } else {
          Alert.alert('Registration Failed', message);
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      // Donation Seeker: Proceed to Step 2 for Document Upload
      setStep(2);
    }
  };

  // Step 2: Verification Document Uploaded (for Donation Seeker) -> Go to Step 3 (4th step: Complete)
  const handleVerificationContinue = async (
    selectedDoc: DocumentTypeOption,
    uploadedFile: UploadedDocFile,
  ) => {
    const state = getRegistrationState();
    const cleanMobile = extractCleanMobile(state.phone || '', state.countryCode || '+91') || '9876543210';
    const effectiveFullName = (state.fullName && state.fullName.trim().length >= 2)
      ? state.fullName.trim()
      : 'Donation Seeker Applicant';
    const effectivePassword = state.password && state.password.trim().length >= 8
      ? state.password.trim()
      : 'Hrsjm@2026';

    const seekerCount = usersStore.getAllUsers().filter(u => u.userType === 'seeker').length + 1;
    const applicationNumber = state.applicationNumber || `HRSJM-SEK-${String(seekerCount).padStart(4, '0')}`;

    setSubmitting(true);
    setLoadingMessage('Submitting application & verification documents...');

    try {
      // 1. Submit auth registration with role DONATION_SEEKER if API server is available
      await register({
        full_name: effectiveFullName,
        email: state.email && state.email.trim() ? state.email.trim() : undefined,
        mobile_number: cleanMobile,
        password: effectivePassword,
        confirm_password: effectivePassword,
        role_name: 'DONATION_SEEKER',
        dob: state.dob ? state.dob.trim() : undefined,
      });
    } catch (apiError: any) {
      console.warn('Backend registration error or server unreachable; continuing application:', apiError?.message || apiError);
    }

    const docTitleMap: Record<string, string> = {
      aadhaar: 'Aadhaar Card (Identity Proof)',
      pan: 'PAN Card',
      passport: 'Passport',
      driving: 'Driving Licence',
      voter: 'Voter ID',
      other: 'Supporting Document',
    };
    const docTitle = docTitleMap[selectedDoc] || 'Verification Document';

    // 2. Always register into usersStore with pending seeker status
    usersStore.registerUserFromRegistration({
      ...state,
      fullName: effectiveFullName,
      phone: state.phone || `+91 ${cleanMobile}`,
      accountType: 'seeker',
      accountTypeLabel: 'Donation Seeker',
      applicationNumber,
      selectedDocTitle: docTitle,
      uploadedFileName: uploadedFile.name,
      uploadedFileSize: uploadedFile.formattedSize,
      uploadedFileUri: uploadedFile.uri,
    });

    // 3. Update auth store with assistance application tracking
    const authUser = useAuthStore.getState().user;
    if (authUser) {
      useAuthStore.getState().setUser({
        ...authUser,
        full_name: effectiveFullName,
        assistance_status: 'PENDING',
        assistance_application_number: applicationNumber,
        account_type: 'seeker',
        roles: [{ id: 'role-user', name: 'USER' }],
      });
    }

    updateRegistrationState({
      applicationNumber,
      selectedDocTitle: docTitle,
      uploadedFileName: uploadedFile.name,
      uploadedFileSize: uploadedFile.formattedSize,
      uploadedFileUri: uploadedFile.uri,
      hasUploadedDocument: true,
    });

    setSubmitting(false);
    // Proceed directly to the 4th step (Complete screen)
    setStep(3);
  };

  // Step 3 -> Finish & Open Dashboard
  const handleFinish = () => {
    completeRegistration();
    resetRegistrationState();
  };

  return (
    <View style={styles.container}>
      {/* Step 0: Account Type */}
      {step === 0 && (
        <CreateAccountTypeScreen
          onBack={() => navigation.goBack()}
          onContinue={handleAccountTypeContinue}
          onMemberSelect={handleMemberSelect}
          onLoginPress={() => navigation.navigate('Login')}
        />
      )}

      {/* Step 1: Personal Details & Password */}
      {step === 1 && (
        <CreateAccountScreen
          onBack={() => setStep(0)}
          onLoginPress={() => navigation.navigate('Login')}
          onContinue={handlePersonalDetailsContinue}
        />
      )}

      {/* Step 2: Verification Documents (Donation Seeker only) */}
      {step === 2 && (
        <CreateAccountVerificationScreen
          onBack={() => setStep(1)}
          onContinue={handleVerificationContinue}
        />
      )}

      {/* Step 3: Complete & Confirmation */}
      {step === 3 && (
        <CreateAccountCompleteScreen
          onBack={() => {
            const state = getRegistrationState();
            if (state.accountType === 'general') {
              setStep(1);
            } else {
              setStep(2);
            }
          }}
          onGoToDashboard={handleFinish}
          onViewProfile={handleFinish}
        />
      )}

      {/* Fullscreen Loading Modal */}
      <Modal visible={submitting} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={AdminColors.primary} />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 220,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: AdminColors.textPrimary,
    textAlign: 'center',
  },
});

export default RegisterScreen;