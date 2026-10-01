import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/core/auth/AuthContext';
import { RootNavigator } from './src/core/navigation/RootNavigator';
import { AppLoader } from './src/core/components/common/AppLoader';
import { colors } from './src/core/theme/theme';

function AppContent() {
  const { status } = useAuth();

  if (status === 'restoring') {
    return (
      <View style={styles.restore}>
        <AppLoader label="Restoring session" />
      </View>
    );
  }

  return <RootNavigator />;
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.root}>
          <AppContent />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  restore: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
