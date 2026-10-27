/**
 * Web dev-preview entry.
 * Runs the same React Native app (and the same feature code) in the
 * browser via react-native-web. This is development tooling only.
 */
if (typeof window !== 'undefined') {
  if (typeof window.__DEV__ === 'undefined') {
    window.__DEV__ = process.env.NODE_ENV !== 'production';
  }

  // If this window is a 3DS/OTP completed popup redirect, close it automatically
  if (window.opener && window.location.search.includes('order_id=')) {
    try {
      window.close();
    } catch {
      // ignore
    }
  }

  // Suppress third-party cross-origin script errors from triggering webpack overlay
  const prevOnError = window.onerror;
  window.onerror = function (msg, url) {
    if (msg === 'Script error.' || !url || url.includes('cashfree') || url.includes('overlay')) {
      return true; // suppresses the browser/webpack overlay
    }
    if (typeof prevOnError === 'function') {
      return prevOnError.apply(this, arguments);
    }
    return false;
  };

  window.addEventListener('error', function (event) {
    if (
      event.message === 'Script error.' ||
      (event.filename && event.filename.includes('cashfree')) ||
      (event.target && (event.target.id === 'cashfree-js-sdk' || event.target.src?.includes('cashfree')))
    ) {
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    }
  }, true);

  window.addEventListener('unhandledrejection', function (event) {
    if (event.reason && (String(event.reason).includes('cashfree') || String(event.reason).includes('Script error'))) {
      event.preventDefault();
    }
  });
}

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('HRSJM_APPLICATION_UI', () => App);

AppRegistry.runApplication('HRSJM_APPLICATION_UI', {
  rootTag: document.getElementById('root'),
});
