/**
 * Web dev-preview entry.
 * Runs the same React Native app (and the same feature code) in the
 * browser via react-native-web. This is development tooling only.
 */
// Ensure __DEV__ global is defined in web browser environment
if (typeof globalThis !== 'undefined' && typeof globalThis.__DEV__ === 'undefined') {
  globalThis.__DEV__ = process.env.NODE_ENV !== 'production';
}
if (typeof window !== 'undefined' && typeof window.__DEV__ === 'undefined') {
  window.__DEV__ = process.env.NODE_ENV !== 'production';
}

// Suppress unhandled third-party cross-origin Script errors
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      if (
        event?.message === 'Script error.' ||
        (typeof event?.message === 'string' && event.message.includes('Script error'))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    },
    true,
  );
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reasonMsg = event?.reason?.message || String(event?.reason || '');
      if (reasonMsg.includes('Script error')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    },
    true,
  );
}

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('HRSJM_APPLICATION_UI', () => App);

AppRegistry.runApplication('HRSJM_APPLICATION_UI', {
  rootTag: document.getElementById('root'),
});
