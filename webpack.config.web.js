/**
 * Web dev-preview webpack config.
 * Serves the React Native app in a browser via react-native-web and
 * proxies /api to the local HRSJM backend so no CORS changes are
 * needed on the backend.
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    proxy: [
      {
        context: '/api',
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
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
        test: /\.(t|j)sx?$/,
        exclude: /node_modules(?!.*react-native-web)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:@react-native/babel-preset'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'web/index.html'),
    }),
  ],
};