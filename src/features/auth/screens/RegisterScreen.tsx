import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';
import { CreateAccountScreen, CreateAccountFormData } from './CreateAccountScreen';
import {
  CreateAccountAdditionalScreen,
  AccountTypeOption,
} from './CreateAccountAdditionalScreen';
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
import { useMembership } from '../../membership/context/MembershipContext';
import { DISTRICT_STATE_POSTS } from '../../membership/data/membershipCategoriesData';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

/**
 * Multi-step Sahil Registration Flow connected directly to the backend REST API:
 *
 * Step 0: Personal Details (Name, Email, Mobile, DOB)
 * Step 1: Account Type & Password (General User / Member / Donation Seeker + Password with security checks)
 * - General User: Direct account creation with role USER, opens User dashboard.
 * - Member: Seamless redirection to existing 3-step Member registration form.
 * - Donation Seeker: 3-step verification flow with document upload, provisioned with role USER while pending approval.
 * Step 2: Verification & Document Upload (Donation Seeker)
 * Step 3: Complete & Confirmation (Activates session into dashboard)
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const register = useAuthStore(state => state.register);
  const completeRegistration = useAuthStore(state => state.completeRegistration);

  let membershipCtx: any;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    membershipCtx = useMembership();
  } catch {}

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

  const getBackendRoleName = (accountType: string): string => {
    switch (accountType) {
      case 'member':
        return 'MEMBER';
      case 'seeker':
        return 'DONATION_SEEKER';
      case 'general':
      default:
        return 'USER';
    }
  };

  // Step 0 -> Step 1
  const handleContinueFromStep0 = (formData: CreateAccountFormData) => {
    const cleanMobile = extractCleanMobile(formData.phone, formData.countryCode);
    if (!cleanMobile || cleanMobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    const trimmedName = formData.fullName.trim();
    if (trimmedName.length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      Alert.alert('Invalid Name', 'Full name can only contain letters and spaces (no numbers or symbols).');
      return;
    }
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    updateRegistrationState({
      fullName: trimmedName,
      email: trimmedEmail,
      phone: `${formData.countryCode || '+91'} ${cleanMobile}`,
      countryCode: formData.countryCode || '+91',
      dob: formData.dob.trim(),
    });

    setStep(1);
  };

  // Step 1 -> Step 2 (Seeker) / Direct Register (General User) / Redirect to Member Form (Member)
  const handleContinueFromStep1 = async (
    accountType: AccountTypeOption,
    password?: string,
  ) => {
    const state = getRegistrationState();
    const cleanMobile = extractCleanMobile(state.phone, state.countryCode);
    const effectivePassword =
      password && password.trim().length >= 6
        ? password.trim()
        : state.password && state.password.trim().length >= 6
        ? state.password.trim()
        : 'Hrsjm@2026';

    if (accountType === 'member') {
      // Forward collected personal info and password into existing MembershipContext
      try {
        if (membershipCtx?.updatePersonalInfo) {
          membershipCtx.updatePersonalInfo({
            fullName: state.fullName.trim(),
            email: state.email ? state.email.trim() : '',
            mobileNumber: cleanMobile,
            dateOfBirth: state.dob ? state.dob.trim() : '',
            password: effectivePassword,
            confirmPassword: effectivePassword,
          });
        }
      } catch {}

      // Redirect to existing Member categories selection screen
      navigation.navigate('MembershipCategories');
      return;
    }

    if (accountType === 'general') {
      // General User does not require document verification; register with backend immediately
      setSubmitting(true);
      setLoadingMessage('Creating your account...');
      try {
        await register({
          full_name: state.fullName.trim(),
          email: state.email ? state.email.trim() : undefined,
          mobile_number: cleanMobile,
          password: effectivePassword,
          confirm_password: effectivePassword,
          role_name: 'USER',
        });

        usersStore.registerUserFromRegistration({
          ...state,
          accountType: 'general',
          accountTypeLabel: 'General User',
        });

        setStep(3); // Go to Complete
      } catch (error) {
        let message = 'Unable to create account. Please try again.';
        if (error instanceof ApiError) {
          if (error.statusCode === 409) {
            message = 'An account with this mobile number or email already exists. Please log in.';
          } else if (error.message) {
            message = error.message;
          }
        }
        Alert.alert('Registration Failed', message);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Donation Seeker proceeds to Step 2 (verification & file upload)
      setStep(2);
    }
  };

  // Step 2 -> Step 3 (Register with backend for Member/Seeker + Add to applications store)
  const handleContinueFromStep2 = async (
    selectedDoc: DocumentTypeOption,
    uploadedFile: UploadedDocFile,
  ) => {
    const state = getRegistrationState();
    const cleanMobile = extractCleanMobile(state.phone, state.countryCode);
    const roleName = getBackendRoleName(state.accountType);
    const effectivePassword =
      state.password && state.password.trim().length >= 6
        ? state.password.trim()
        : 'Hrsjm@2026';

    setSubmitting(true);
    setLoadingMessage('Submitting registration & documents...');
    try {
      // 1. Submit authentication registration to backend API
      await register({
        full_name: state.fullName.trim(),
        email: state.email ? state.email.trim() : undefined,
        mobile_number: cleanMobile,
        password: effectivePassword,
        confirm_password: effectivePassword,
        role_name: roleName,
      });

      // 2. Also register into Admin stores for administrative review
      const docTitleMap: Record<string, string> = {
        aadhaar: 'Aadhaar Card',
        pan: 'PAN Card',
        passport: 'Passport',
        driving: 'Driving Licence',
        voter: 'Voter ID',
        other: 'Other Document',
      };
      const docTitle = docTitleMap[selectedDoc] || 'Document';

      if (state.accountType === 'member') {
        const newApp = createApplicationFromRegistration({
          fullName: state.fullName,
          email: state.email,
          phone: state.phone,
          countryCode: state.countryCode,
          dob: state.dob,
          selectedDocTitle: docTitle,
          uploadedFileName: uploadedFile.name,
          uploadedFileSize: uploadedFile.formattedSize,
          uploadedFileUri: uploadedFile.uri,
          documents: state.documents,
        });
        membershipApplicationsStore.addApplication(newApp);
        usersStore.registerUserFromRegistration({
          ...state,
          accountType: 'member',
          accountTypeLabel: 'Member',
          selectedDocTitle: docTitle,
          uploadedFileName: uploadedFile.name,
          uploadedFileSize: uploadedFile.formattedSize,
          uploadedFileUri: uploadedFile.uri,
        });
      } else if (state.accountType === 'seeker') {
        // Register user into admin verification list with pending status
        usersStore.registerUserFromRegistration({
          ...state,
          accountType: 'seeker',
          accountTypeLabel: 'Donation Seeker',
          selectedDocTitle: docTitle,
          uploadedFileName: uploadedFile.name,
          uploadedFileSize: uploadedFile.formattedSize,
          uploadedFileUri: uploadedFile.uri,
        });
      } else {
        // General user registration
        usersStore.registerUserFromRegistration({
          ...state,
          accountType: 'general',
          accountTypeLabel: 'User',
          selectedDocTitle: docTitle,
          uploadedFileName: uploadedFile.name,
          uploadedFileSize: uploadedFile.formattedSize,
          uploadedFileUri: uploadedFile.uri,
        });
      }

      setStep(3); // Go to Complete
    } catch (error) {
      let message = 'Unable to complete registration. Please try again.';
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          message = 'An account with this mobile number or email already exists. Please log in.';
        } else if (error.message) {
          message = error.message;
        }
      }
      Alert.alert('Registration Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 -> Finish
  const handleFinish = () => {
    completeRegistration();
    resetRegistrationState();
  };

  return (
    <View style={styles.container}>
      {step === 0 && (
        <CreateAccountScreen
          onBack={() => navigation.goBack()}
          onLoginPress={() => navigation.navigate('Login')}
          onContinue={handleContinueFromStep0}
        />
      )}

      {step === 1 && (
        <CreateAccountAdditionalScreen
          onBack={() => setStep(0)}
          onContinue={handleContinueFromStep1}
        />
      )}

      {step === 2 && (
        <CreateAccountVerificationScreen
          onBack={() => setStep(1)}
          onContinue={handleContinueFromStep2}
        />
      )}

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