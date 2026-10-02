/**
 * Jest setup: mock native-dependent UI modules that have no jest runtime.
 * - lucide-react-native / react-native-svg render native SVG; replaced with inert components.
 * - react-native-safe-area-context requires native insets; replaced with zero insets.
 */
/* global jest */

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
    SafeAreaProvider: props => props.children ?? null,
    SafeAreaView: props => props.children ?? null,
    SafeAreaConsumer: props => (props.children ? props.children(zeroInsets) : null),
    useSafeAreaInsets: () => zeroInsets,
  };
});
