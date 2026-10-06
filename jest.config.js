module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\.(webp)$': '<rootDir>/jest/fileMock.js',
  },
};
