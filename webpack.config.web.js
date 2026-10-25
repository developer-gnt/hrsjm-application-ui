/**
 * Web dev-preview webpack config.
 * Serves the React Native app in a browser via react-native-web and
 * proxies /api to the local HRSJM backend so no CORS changes are
 * needed on the backend.
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Environment mode: 'local' (default 127.0.0.1:3000) or 'production' (194.164.151.17:3000)
const APP_ENV = process.env.APP_ENV || 'local';
const BACKEND_TARGET =
  process.env.BACKEND_PROXY_TARGET ||
  (APP_ENV === 'production' ? 'http://194.164.151.17:3000' : 'http://127.0.0.1:3000');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    publicPath: '/',
  },
  devServer: {
    port: 8089,
    historyApiFallback: true,
    hot: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: [
      {
        context: '/api',
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-share': path.resolve(__dirname, 'web/mocks/react-native-share.js'),
      'react-native-blob-util': path.resolve(__dirname, 'web/mocks/react-native-blob-util.js'),
      'react-native-image-picker': path.resolve(__dirname, 'web/mocks/react-native-image-picker.js'),
      '@react-native-documents/picker': path.resolve(__dirname, 'web/mocks/react-native-documents-picker.js'),
      'react-native-cashfree-pg-sdk': path.resolve(__dirname, 'web/mocks/react-native-cashfree-pg-sdk.js'),
      'react-native-mmkv': path.resolve(__dirname, 'web/mocks/react-native-mmkv.js'),
      'react-native-keychain': path.resolve(__dirname, 'web/mocks/react-native-keychain.js'),
      'react-native-biometrics': path.resolve(__dirname, 'web/mocks/react-native-biometrics.js'),
      '@react-native/assets-registry/registry': path.resolve(__dirname, 'web/mocks/assetsRegistry.js'),
    },
    extensions: [
      '.web.js',
      '.web.tsx',
      '.web.ts',
      '.tsx',
      '.ts',
      '.js',
      '.jsx',
      '.json',
    ],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules(?!.*react-native-web)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:@react-native/babel-preset'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'web/index.html'),
    }),
  ],
};