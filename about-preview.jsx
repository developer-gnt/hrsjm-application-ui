/**
 * Dev-only web preview of the About page (HRSJM About spec, visual QA).
 * Renders AboutScreen outside the auth flow so it can be screenshot against
 * the reference at multiple widths. The "Join the Movement" CTA navigates to
 * the real DonationsScreen here (same components the app uses) so every
 * button is exercisable in the preview. Dev tooling only — same category as
 * web-entry.jsx / index.html; not referenced by the native apps.
 */
import React, { useState } from 'react';
import { AppRegistry } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AboutScreen } from './src/features/about';
import { DonationsScreen } from './src/features/admin/donations';

window.__HARNESS_MODULES = {
  about: typeof AboutScreen,
  donations: typeof DonationsScreen,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function AboutPreview() {
  window.__HARNESS_RENDER = (window.__HARNESS_RENDER || 0) + 1;
  const [screen, setScreen] = useState('about');

  if (screen === 'donations') {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DonationsScreen onBack={() => setScreen('about')} showBack />
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {/* onBack mirrors the real MoreNavigator wiring (goes back in-app); it
          is a no-op here because the preview is the root screen. */}
      <AboutScreen
        onBack={() => {}}
        onNavigate={target => {
          if (target === 'Donations') {
            setScreen('donations');
          }
        }}
      />
    </SafeAreaProvider>
  );
}

try {
  AppRegistry.registerComponent('ABOUT_PREVIEW', () => AboutPreview);
  AppRegistry.runApplication('ABOUT_PREVIEW', {
    rootTag: document.getElementById('root'),
  });
} catch (e) {
  window.__errors.push('runApplication: ' + String((e && e.stack) || e));
}
