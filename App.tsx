import React from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DonationsScreen,
  ReceiptDetailsPage,
} from './src/features/admin/donations';
import {
  ProfileScreen,
  EditPersonalInfoScreen,
  AdminDetailsScreen,
  MyIdCardScreen,
} from './src/features/admin/profile';
import {
  CreateAccountScreen,
  CreateAccountAdditionalScreen,
  CreateAccountVerificationScreen,
  CreateAccountCompleteScreen,
  updateRegistrationState,
  getRegistrationState,
} from './src/features/auth';
import {
  getRouteSnapshot,
  subscribeToRoute,
  navigateToCreateAccount,
  navigateToCreateAccountAdditional,
  navigateToCreateAccountVerification,
  navigateToCreateAccountComplete,
  navigateToDashboard,
  navigateToProfile,
} from './src/core/navigation/appRouter';

// Temporary app shell: navigation infrastructure is not built yet, so
// screens are hosted directly and switched by the lightweight hash
// router (`#/create-account`, `#/create-account/additional`, `#/create-account/verification`, etc.)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const route = React.useSyncExternalStore(
    subscribeToRoute,
    getRouteSnapshot,
    getRouteSnapshot,
  );

  const renderRoute = () => {
    switch (route.name) {
      case 'create-account':
        return (
          <CreateAccountScreen
            key="create-account-screen"
            onContinue={(formData) => {
              updateRegistrationState({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim()
                  ? `${formData.countryCode || '+91'} ${formData.phone.trim()}`
                  : '',
                countryCode: formData.countryCode || '+91',
                dob: formData.dob.trim(),
              });
              navigateToCreateAccountAdditional();
            }}
          />
        );
      case 'create-account-additional':
        return (
          <CreateAccountAdditionalScreen
            key="create-account-additional-screen"
            onBack={() => navigateToCreateAccount()}
            onContinue={(accountType) => {
              const labelMap: Record<string, string> = {
                general: 'General User',
                member: 'Member',
                seeker: 'Donation Seeker',
              };
              updateRegistrationState({
                accountType,
                accountTypeLabel: labelMap[accountType] || 'General User',
              });
              if (accountType === 'general') {
                navigateToCreateAccountComplete();
              } else {
                navigateToCreateAccountVerification();
              }
            }}
          />
        );
      case 'create-account-verification':
        return (
          <CreateAccountVerificationScreen
            key="create-account-verification-screen"
            onBack={() => navigateToCreateAccountAdditional()}
            onContinue={(selectedDoc, uploadedFile) => {
              const docTitleMap: Record<string, string> = {
                aadhaar: 'Aadhaar Card',
                pan: 'PAN Card',
                passport: 'Passport',
                driving: 'Driving Licence',
                voter: 'Voter ID',
                other: 'Other Document',
              };
              updateRegistrationState({
                selectedDocId: selectedDoc,
                selectedDocTitle: docTitleMap[selectedDoc] || 'Document',
                uploadedFileName: uploadedFile.name,
                uploadedFileSize: uploadedFile.formattedSize,
                uploadedFileUri: uploadedFile.uri,
                hasUploadedDocument: true,
              });
              navigateToCreateAccountComplete();
            }}
          />
        );
      case 'create-account-complete':
        return (
          <CreateAccountCompleteScreen
            key="create-account-complete-screen"
            onBack={() => {
              const currentState = getRegistrationState();
              if (currentState.accountType === 'general') {
                navigateToCreateAccountAdditional();
              } else {
                navigateToCreateAccountVerification();
              }
            }}
            onGoToDashboard={() => navigateToDashboard()}
            onViewProfile={() => navigateToProfile()}
          />
        );
      case 'receipt':
        return <ReceiptDetailsPage key={route.donationId} donationId={route.donationId} />;
      case 'profile':
        return <ProfileScreen key="profile-screen" />;
      case 'profile-edit-personal':
        return <EditPersonalInfoScreen key="profile-edit-personal" />;
      case 'profile-admin-details':
        return <AdminDetailsScreen key="profile-admin-details" />;
      case 'profile-id-card':
        return <MyIdCardScreen key="profile-id-card" />;
      default:
        return (
          <CreateAccountScreen
            key="create-account-default"
            onContinue={(formData) => {
              updateRegistrationState({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim()
                  ? `${formData.countryCode || '+91'} ${formData.phone.trim()}`
                  : '',
                countryCode: formData.countryCode || '+91',
                dob: formData.dob.trim(),
              });
              navigateToCreateAccountAdditional();
            }}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.container}>{renderRoute()}</View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
