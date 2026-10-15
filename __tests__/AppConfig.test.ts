import { Platform } from 'react-native';
import { resolveApiBaseUrl } from '../src/app/config/app.config';

describe('AppConfig — resolveApiBaseUrl', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  describe('Development environment (__DEV__ === true)', () => {
    it('should return 10.0.2.2 on Android in development', () => {
      Platform.OS = 'android';
      const url = resolveApiBaseUrl(true);
      expect(url).toBe('http://10.0.2.2:3000/api/v1');
    });

    it('should return localhost on web/other platforms in development', () => {
      Platform.OS = 'web';
      const url = resolveApiBaseUrl(true);
      expect(url).toBe('http://localhost:3000/api/v1');
    });
  });

  describe('Production release environment (__DEV__ === false)', () => {
    it('should throw when production URL is missing or empty', () => {
      expect(() => resolveApiBaseUrl(false, '')).toThrow(
        'Production API Base URL is required for release builds',
      );
    });

    it('should throw when production URL contains 10.0.2.2', () => {
      expect(() =>
        resolveApiBaseUrl(false, 'https://10.0.2.2:3000/api/v1'),
      ).toThrow('Insecure emulator or localhost URL detected');
    });

    it('should throw when production URL contains localhost', () => {
      expect(() =>
        resolveApiBaseUrl(false, 'https://localhost:3000/api/v1'),
      ).toThrow('Insecure emulator or localhost URL detected');
    });

    it('should throw when production URL uses non-HTTPS protocol', () => {
      expect(() =>
        resolveApiBaseUrl(false, 'http://api.hrsjm.org/api/v1'),
      ).toThrow('Production API URL must use HTTPS');
    });

    it('should return approved HTTPS production URL', () => {
      const prodUrl = 'https://api.hrsjm.org/api/v1';
      const url = resolveApiBaseUrl(false, prodUrl);
      expect(url).toBe(prodUrl);
    });
  });
});
