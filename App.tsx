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
  getRouteSnapshot,
  subscribeToRoute,
} from './src/core/navigation/appRouter';

// Temporary app shell: navigation infrastructure is not built yet, so
// screens are hosted directly and switched by the lightweight hash
// router (`#/donations`, `#/donations/:donationId/receipt`,
// `#/profile`, `#/profile/edit/personal`,
// `#/profile/edit/admin-details`, `#/profile/id-card`). Move to
// src/app/ once the shared navigation stack lands.
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
      case 'receipt':
        return <ReceiptDetailsPage donationId={route.donationId} />;
      case 'profile':
        return <ProfileScreen />;
      case 'profile-edit-personal':
        return <EditPersonalInfoScreen />;
      case 'profile-admin-details':
        return <AdminDetailsScreen />;
      case 'profile-id-card':
        return <MyIdCardScreen />;
      default:
        return <DonationsScreen />;
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
