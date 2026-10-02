/* eslint-env jest */
/**
 * Jest global mocks for native modules used by the auth/storage layer.
 * Keychain-backed secure storage and MMKV are simulated with plain JS so
 * unit tests exercise real logic without a device.
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