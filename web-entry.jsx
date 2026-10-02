/**
 * Web preview entry (development only).
 * Renders the same shared App.tsx used on Android/iOS via react-native-web.
 * Start with: npm run web  →  http://localhost:8081
 * This file is intentionally .jsx so the React Native TypeScript project
 * (tsc) does not need DOM lib types.
 */
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('HRSJM_APPLICATION_UI', () => App);
AppRegistry.runApplication('HRSJM_APPLICATION_UI', {
  rootTag: document.getElementById('root'),
});
