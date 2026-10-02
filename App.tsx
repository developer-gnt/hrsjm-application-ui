import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MembersScreen } from './src/features/admin/members/screens/MembersScreen';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <MembersScreen />
    </SafeAreaProvider>
  );
}

export default App;
