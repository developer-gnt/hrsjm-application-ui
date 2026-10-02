/**
 * Web dev-preview entry.
 * Runs the same React Native app (and the same feature code) in the
 * browser via react-native-web. This is development tooling only.
 */
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('HRSJM_APPLICATION_UI', () => App);

AppRegistry.runApplication('HRSJM_APPLICATION_UI', {
  rootTag: document.getElementById('root'),
});