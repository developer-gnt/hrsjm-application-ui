/* eslint-env jest */
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  types: { allFiles: '*/*', pdf: 'application/pdf', images: 'image/*' },
  isErrorWithCode: jest.fn(),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));

jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: { DocumentDir: '/mock/docs', CacheDir: '/mock/cache' },
    writeFile: jest.fn(),
  },
}));
