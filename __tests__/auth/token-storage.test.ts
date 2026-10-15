import Keychain from 'react-native-keychain';
import { tokenStorage } from '../../src/core/storage/token-storage';

/**
 * Token strategy (spec §14): access token stays in memory only; refresh token
 * goes through the Keychain-backed secure storage.
 */
describe('tokenStorage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    tokenStorage.setAccessToken(null);
    await tokenStorage.clearTokens();
  });

  it('keeps the access token in memory only', () => {
    tokenStorage.setAccessToken('access-123');
    expect(tokenStorage.getAccessToken()).toBe('access-123');
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  it('persists the refresh token in secure storage', async () => {
    await tokenStorage.setRefreshToken('refresh-abc');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      expect.any(String),
      'refresh-abc',
      expect.objectContaining({ service: 'com.hrsjm.admin' }),
    );
  });

  it('round-trips the refresh token through secure storage', async () => {
    await tokenStorage.setRefreshToken('refresh-abc');
    await expect(tokenStorage.getRefreshToken()).resolves.toBe('refresh-abc');
  });

  it('returns null when no refresh token is stored', async () => {
    await expect(tokenStorage.getRefreshToken()).resolves.toBeNull();
  });

  it('clears both tokens', async () => {
    tokenStorage.setAccessToken('access-123');
    await tokenStorage.setRefreshToken('refresh-abc');

    await tokenStorage.clearTokens();

    expect(tokenStorage.getAccessToken()).toBeNull();
    await expect(tokenStorage.getRefreshToken()).resolves.toBeNull();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
      expect.objectContaining({ service: 'com.hrsjm.admin' }),
    );
  });

  it('setTokens stores the pair in one call', async () => {
    await tokenStorage.setTokens('access-456', 'refresh-456');
    expect(tokenStorage.getAccessToken()).toBe('access-456');
    await expect(tokenStorage.getRefreshToken()).resolves.toBe('refresh-456');
  });
});