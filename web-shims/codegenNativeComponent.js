/**
 * Web-preview shim for react-native codegen native components.
 * Deep imports from react-native-safe-area-context / react-native-svg specs
 * are replaced with a plain View passthrough so layout chains keep rendering.
 */
import React from 'react';
import { View } from 'react-native';

export default function codegenNativeComponent(name) {
  const NativeComponentShim = React.forwardRef(function NativeComponentShim(props, ref) {
    return React.createElement(View, Object.assign({ ref }, props));
  });
  NativeComponentShim.displayName = name || 'RNCodegenShim';
  return NativeComponentShim;
}
