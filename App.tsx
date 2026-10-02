import React from 'react';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';

/**
 * HRSJM Admin — root component.
 * Providers (safe area, React Query, session-expiry wiring) wrap the root
 * navigator, which switches between the Auth stack and the authenticated
 * area based on the auth store.
 */
function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;