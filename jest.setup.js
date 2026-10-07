/* eslint-env jest */
/**
 * Jest global mocks for native modules used across auth, storage, navigation, and UI components.
 */

jest.mock('react-native-keychain', () => {
  const store = new Map();
  return {
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' },
    setGenericPassword: jest.fn(async (username, password) => {
      store.set(username, password);
      return { service: 'jest', storage: 'storage' };
    }),
    getGenericPassword: jest.fn(async () => {
      const first = store.entries().next();
      if (first.done) {
        return false;
      }
      return { username: first.value[0], password: first.value[1] };
    }),
    resetGenericPassword: jest.fn(async () => {
      store.clear();
      return true;
    }),
  };
});

jest.mock('react-native-mmkv', () => {
  const createInstance = () => ({
    getBoolean: jest.fn(() => false),
    set: jest.fn(),
    getString: jest.fn(() => null),
    remove: jest.fn(),
    clearAll: jest.fn(),
  });
  return {
    createMMKV: jest.fn(() => createInstance()),
    useMMKV: jest.fn(() => createInstance()),
  };
});

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isSensorAvailable: jest.fn(async () => ({ available: false })),
    simplePrompt: jest.fn(async () => ({ success: false })),
  })),
}));

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: jest.fn(() => true),
    compatibilityFlags: {
      isNewBackTitleImplementation: true,
      usesHeaderFlexboxImplementation: true,
      usesNewAndroidHeaderHeightImplementation: true,
    },
    Screen: ({ children, ...rest }) => React.createElement(View, rest, children),
    ScreenContainer: ({ children, ...rest }) => React.createElement(View, rest, children),
    NativeScreen: ({ children, ...rest }) => React.createElement(View, rest, children),
    NativeScreenContainer: ({ children, ...rest }) => React.createElement(View, rest, children),
    ScreenStack: ({ children, ...rest }) => React.createElement(View, rest, children),
    ScreenStackItem: ({ children, ...rest }) => React.createElement(View, rest, children),
    ScreenStackHeaderConfig: ({ children, ...rest }) => React.createElement(View, rest, children),
    ScreenStackHeaderSubview: ({ children, ...rest }) => React.createElement(View, rest, children),
    SearchBar: ({ children, ...rest }) => React.createElement(View, rest, children),
    FullWindowOverlay: ({ children, ...rest }) => React.createElement(View, rest, children),
  };
});

const makeInertIconModule = () => {
  const inertComponent = () => null;
  return new Proxy(
    { __esModule: true, default: inertComponent },
    {
      get(target, prop) {
        if (typeof prop === 'symbol') return undefined;
        if (prop === '__esModule' || prop === 'default') return target[prop];
        return inertComponent;
      },
    }
  );
};

jest.mock('lucide-react-native', () => makeInertIconModule());
jest.mock('react-native-svg', () => makeInertIconModule());

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock').default;
  return {
    __esModule: true,
    ...mock,
    default: mock,
  };
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

jest.mock('./src/core/components/feedback/SkeletonCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SkeletonCard: props => React.createElement(View, props),
  };
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));
