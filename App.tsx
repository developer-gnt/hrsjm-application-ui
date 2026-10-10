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
  MembershipApplicationsScreen,
  MembershipApplicationDetailsScreen,
  membershipApplicationsStore,
  createApplicationFromRegistration,
} from './src/features/admin/membershipApplications';
import {
  CreateAccountScreen,
  CreateAccountAdditionalScreen,
  CreateAccountVerificationScreen,
  CreateAccountCompleteScreen,
  updateRegistrationState,
  getRegistrationState,
} from './src/features/auth';
import {
  BecomeMemberScreen,
  MembershipCategoriesScreen,
  RenewMembershipScreen,
  MembershipDetailsScreen,
} from './src/features/membership';
import {
  SupportTicketsScreen,
  CreateSupportTicketScreen,
  ReviewSupportTicketScreen,
  TicketSubmittedScreen,
} from './src/features/support';
import {
  UsersListScreen,
  AddUserScreen,
  UserDetailsScreen,
  EditUserScreen,
  UserVerificationScreen,
  usersStore,
} from './src/features/admin/users';
import {
  getRouteSnapshot,
  subscribeToRoute,
  navigateToCreateAccount,
  navigateToCreateAccountAdditional,
  navigateToCreateAccountVerification,
  navigateToCreateAccountComplete,
  navigateToDashboard,
  navigateToDonations,
  navigateToProfile,
  navigateToMembershipApplications,
  navigateToMembershipApplicationDetails,
  navigateToBecomeMember,
  navigateToMembershipCategories,
  navigateToMembershipDetails,
  navigateToRenewMembership,
  navigateToSupportTickets,
  navigateToCreateSupportTicket,
  navigateToReviewSupportTicket,
  navigateToTicketSubmitted,
  navigateToUsers,
  navigateToUserAdd,
  navigateToUserDetails,
  navigateToUserEdit,
  navigateToUserVerification,
  navigateToUserFilter,
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
                const currentState = getRegistrationState();
                usersStore.registerUserFromRegistration({
                  ...currentState,
                  accountType: 'general',
                  accountTypeLabel: 'General User',
                });
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
              const docTitle = docTitleMap[selectedDoc] || 'Document';
              updateRegistrationState({
                selectedDocId: selectedDoc,
                selectedDocTitle: docTitle,
                uploadedFileName: uploadedFile.name,
                uploadedFileSize: uploadedFile.formattedSize,
                uploadedFileUri: uploadedFile.uri,
                hasUploadedDocument: true,
              });

              const currentState = getRegistrationState();
              if (currentState.accountType === 'member') {
                const newApp = createApplicationFromRegistration({
                  fullName: currentState.fullName,
                  email: currentState.email,
                  phone: currentState.phone,
                  countryCode: currentState.countryCode,
                  dob: currentState.dob,
                  selectedDocTitle: docTitle,
                  uploadedFileName: uploadedFile.name,
                  uploadedFileSize: uploadedFile.formattedSize,
                  uploadedFileUri: uploadedFile.uri,
                  documents: currentState.documents,
                });
                membershipApplicationsStore.addApplication(newApp);
              }

              usersStore.registerUserFromRegistration({
                ...currentState,
                selectedDocTitle: docTitle,
                uploadedFileName: uploadedFile.name,
                uploadedFileSize: uploadedFile.formattedSize,
                uploadedFileUri: uploadedFile.uri,
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
            onGoToDashboard={() => navigateToMembershipApplications()}
            onViewProfile={() => {
              const currentState = getRegistrationState();
              if (currentState.accountType === 'member') {
                navigateToMembershipDetails();
              } else {
                navigateToProfile();
              }
            }}
          />
        );
      case 'membership-details':
        return (
          <MembershipDetailsScreen
            key="membership-details-screen"
            onBack={() => navigateToProfile()}
            onRenewPress={() => navigateToRenewMembership()}
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
      case 'membership-application-details':
        return (
          <MembershipApplicationDetailsScreen
            key={route.applicationId}
            applicationId={route.applicationId}
            onBack={() => navigateToMembershipApplications()}
          />
        );
      case 'become-member':
        return (
          <BecomeMemberScreen
            key="become-member-screen"
            onBack={() => navigateToMembershipApplications()}
            onCtaPress={() => navigateToMembershipCategories()}
          />
        );
      case 'membership-categories':
        return (
          <MembershipCategoriesScreen
            key="membership-categories-screen"
            onBack={() => navigateToBecomeMember()}
          />
        );
      case 'renew-membership':
        return (
          <RenewMembershipScreen
            key="renew-membership-screen"
            onBack={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
            onProfilePress={() => navigateToProfile()}
          />
        );
      case 'support-tickets':
        return (
          <SupportTicketsScreen
            key="support-tickets-screen"
            onCreateTicketPress={() => navigateToCreateSupportTicket()}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'support') navigateToSupportTickets();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'create-support-ticket':
        return (
          <CreateSupportTicketScreen
            key="create-support-ticket-screen"
            onBack={() => navigateToSupportTickets()}
            onCancel={() => navigateToSupportTickets()}
            onNext={() => navigateToReviewSupportTicket()}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'support') navigateToSupportTickets();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'review-support-ticket':
        return (
          <ReviewSupportTicketScreen
            key="review-support-ticket-screen"
            onBack={() => navigateToCreateSupportTicket()}
            onEdit={() => navigateToCreateSupportTicket()}
            onSubmitSuccess={(ticket) => navigateToTicketSubmitted(ticket.id)}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'support') navigateToSupportTickets();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'ticket-submitted':
        return (
          <TicketSubmittedScreen
            key={route.ticketId || 'ticket-submitted'}
            ticketId={route.ticketId}
            onViewAllTickets={() => navigateToSupportTickets()}
            onCreateAnotherTicket={() => navigateToCreateSupportTicket()}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'support') navigateToSupportTickets();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'support-ticket-details':
        return (
          <SupportTicketsScreen
            key={`support-tickets-${route.ticketId}`}
            initialTicketId={route.ticketId}
            onCreateTicketPress={() => navigateToCreateSupportTicket()}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'support') navigateToSupportTickets();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users':
        return (
          <UsersListScreen
            key="users-list-screen"
            onAddUserPress={() => navigateToUserAdd()}
            onSignUpPress={() => navigateToCreateAccount()}
            onFilterPress={() => navigateToUserFilter()}
            onUserPress={(user) => navigateToUserDetails(user.id)}
            onEditUserPress={(user) => navigateToUserEdit(user.id)}
            onVerifyUserPress={(user) => navigateToUserVerification(user.id)}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users-add':
        return (
          <AddUserScreen
            key="users-add-screen"
            onBack={() => navigateToUsers()}
            onSuccess={() => navigateToUsers()}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users-details':
        return (
          <UserDetailsScreen
            key={`users-details-${route.userId || 'unknown'}`}
            userId={route.userId}
            onBack={() => navigateToUsers()}
            onEditPress={(u) => navigateToUserEdit(u.id)}
            onVerifyPress={(u) => navigateToUserVerification(u.id)}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users-edit':
        return (
          <EditUserScreen
            key={`users-edit-${route.userId || 'unknown'}`}
            userId={route.userId}
            onBack={() => (route.userId ? navigateToUserDetails(route.userId) : navigateToUsers())}
            onSuccess={() => (route.userId ? navigateToUserDetails(route.userId) : navigateToUsers())}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users-verification':
        return (
          <UserVerificationScreen
            key={`users-verification-${route.userId || 'unknown'}`}
            userId={route.userId}
            onBack={() => (route.userId ? navigateToUserDetails(route.userId) : navigateToUsers())}
            onSuccess={() => (route.userId ? navigateToUserDetails(route.userId) : navigateToUsers())}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'users-filter':
        return (
          <UsersListScreen
            key="users-filter-screen"
            onAddUserPress={() => navigateToUserAdd()}
            onSignUpPress={() => navigateToCreateAccount()}
            onUserPress={(user) => navigateToUserDetails(user.id)}
            onEditUserPress={(user) => navigateToUserEdit(user.id)}
            onVerifyUserPress={(user) => navigateToUserVerification(user.id)}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'members') navigateToMembershipApplications();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'donations') navigateToDonations();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onProfilePress={() => navigateToProfile()}
            onMenuPress={() => navigateToMembershipApplications()}
            onNotificationsPress={() => navigateToMembershipApplications()}
          />
        );
      case 'membership-applications':
      default:
        return (
          <MembershipApplicationsScreen
            key="membership-applications"
            onViewApplication={(app) => {
              navigateToMembershipApplicationDetails(app.applicationId || app.id);
            }}
            onBottomTabPress={(tabKey) => {
              if (tabKey === 'dashboard') navigateToDashboard();
              else if (tabKey === 'applications') navigateToMembershipApplications();
              else if (tabKey === 'complaints') navigateToSupportTickets();
              else if (tabKey === 'users') navigateToUsers();
              else if (tabKey === 'more') navigateToProfile();
            }}
            onSignupPress={() => navigateToCreateAccount()}
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
