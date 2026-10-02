module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // React Navigation v7 ships ESM builds; transform RN-ecosystem packages.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-mmkv|react-native-keychain|react-native-biometrics|react-native-screens|react-native-safe-area-context|react-native-nitro-modules)/)',
  ],
};