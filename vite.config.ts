import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Development-only web preview of the React Native app.
 * Aliases `react-native` to `react-native-web` so the shared src/ code
 * (screens, components, theme) runs in the browser without any native build.
 * The native Android/iOS projects and Metro are unaffected.
 */

const SHIM_CODEGEN = resolve(__dirname, 'web-shims', 'codegenNativeComponent.js');
const SHIM_ASSET_REGISTRY = resolve(__dirname, 'web-shims', 'assetsRegistry.js');

/** Deep `react-native/*` imports used by RN libraries that don't exist on web. */
const RN_WEB_ALIAS = {
  'react-native': 'react-native-web',
  'react-native/Libraries/Utilities/codegenNativeComponent': SHIM_CODEGEN,
  '@react-native/assets-registry/registry': SHIM_ASSET_REGISTRY,
};

export default defineConfig({
  plugins: [react()],
  define: {
    __DEV__: 'true',
  },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: RN_WEB_ALIAS['react-native'] },
      {
        find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent$/,
        replacement: SHIM_CODEGEN,
      },
      {
        find: /^@react-native\/assets-registry\/registry$/,
        replacement: SHIM_ASSET_REGISTRY,
      },
    ],
    extensions: [
      '.web.mjs',
      '.web.js',
      '.web.ts',
      '.web.jsx',
      '.web.tsx',
      '.mjs',
      '.js',
      '.mts',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ],
  },
  optimizeDeps: {
    // Bundle RN libraries through the optimizer so their mixed ESM/CJS files
    // get proper interop (raw serving breaks named imports like pegjs' parse).
    include: ['react-native-svg', 'react-native-safe-area-context', 'lucide-react-native'],
    esbuildOptions: {
      alias: RN_WEB_ALIAS,
      resolveExtensions: [
        '.web.mjs',
        '.web.js',
        '.web.ts',
        '.web.jsx',
        '.web.tsx',
        '.mjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
      ],
    },
  },
  server: {
    port: 8081,
  },
});
