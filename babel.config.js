module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Zod v4 ships ESM `export * as ns` syntax (zod/v4/classic/external.js).
    // The React Native 0.87.1 preset compiles ESM to CommonJS but does not
    // include the namespace-export transform, so Metro fails with:
    // "Export namespace should be first transformed by
    //  @babel/plugin-transform-export-namespace-from".
    // This plugin must run BEFORE the preset's modules-commonjs transform.
    '@babel/plugin-transform-export-namespace-from',
  ],
};
