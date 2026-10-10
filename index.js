import { AppRegistry, LogBox, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Polyfill TextDecoder and TextEncoder for React Native Hermes (required by jsPDF fast-png)
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = class TextDecoder {
    constructor(encoding = 'utf-8') {
      this.encoding = encoding;
    }
    decode(bytes) {
      if (!bytes || !bytes.length) return '';
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return str;
    }
  };
}

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(str = '') {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i) & 0xff;
      }
      return arr;
    }
  };
}

// Suppress debug overlays, logbox popups & dev loading banner in UI
LogBox.ignoreAllLogs(true);
if (NativeModules.DevLoadingView) {
  try {
    NativeModules.DevLoadingView.hide?.();
    NativeModules.DevLoadingView.setLoadingEnabled?.(false);
  } catch {
    // ignore
  }
}

AppRegistry.registerComponent(appName, () => App);


