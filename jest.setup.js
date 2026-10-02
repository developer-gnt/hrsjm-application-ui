/* eslint-env jest */
/**
 * Jest global mocks for native modules used across auth, storage, navigation, and UI components.
 */

jest.mock('react-native-keychain', () => {
  const store = new Map();
  return {
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' },
    setGenericPassword: jest.fn(async (username: string, password: string) => {
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
  let enableScreens = jest.fn();
  return { enableScreens, enableFreeze: jest.fn() };
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
  const zeroInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    __esModule: true,
    SafeAreaProvider: (props: any) => props.children ?? null,
    SafeAreaView: (props: any) => props.children ?? null,
    SafeAreaConsumer: (props: any) => (props.children ? props.children(zeroInsets) : null),
    useSafeAreaInsets: () => zeroInsets,
  };
});

jest.mock('./src/core/components/feedback/SkeletonCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SkeletonCard: (props: any) => React.createElement(View, props),
  };
});

