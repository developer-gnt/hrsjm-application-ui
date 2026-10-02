import { useAuthStore } from '../../src/features/auth/store/authStore';
import { authService } from '../../src/features/auth/services/auth.service';
import { tokenStorage } from '../../src/core/storage/token-storage';
import { UserProfile } from '../../src/features/auth/types/auth.types';

const mockPermissionStore = {
  loadPermissions: jest.fn(),
  clear: jest.fn(),
};

jest.mock('../../src/core/permissions/permission.store', () => ({
  usePermissionStore: {
    getState: () => mockPermissionStore,
  },
}));

jest.mock('../../src/features/auth/services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('../../src/core/storage/token-storage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(() => null),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn(async () => null),
    setRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

const ADMIN_PROFILE: UserProfile = {
  id: 'u-1',
  full_name: 'Mubasshir Admin',
  mobile_number: '9876543210',
  email: 'admin@hrsjm.org',
  status: 'ACTIVE',
  roles: [{ id: 'r-1', name: 'ADMIN' }],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const MEMBER_PROFILE: UserProfile = {
  id: 'u-2',
  full_name: 'HRSJM Test Member',
  mobile_number: '9888880002',
  email: 'member@hrsjm.org',
  status: 'ACTIVE',
  roles: [{ id: 'r-2', name: 'MEMBER' }],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissionStore.loadPermissions.mockReset();
    mockPermissionStore.clear.mockReset();
    useAuthStore.setState({ user: null, status: 'idle' });
  });

  describe('signIn', () => {
    it('stores the token pair, loads permissions and resolves authenticated', async () => {
      mockedAuthService.login.mockResolvedValue({
        user: ADMIN_PROFILE,
        access_token: 'access-1',
        refresh_token: 'refresh-1',
      });

      await useAuthStore.getState().signIn('9876543210', 'AdminPass#1');

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        '9876543210',
        'AdminPass#1',
      );
      expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith(
        'access-1',
        'refresh-1',
      );
      expect(mockPermissionStore.loadPermissions).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toEqual(ADMIN_PROFILE);
      expect(useAuthStore.getState().status).toBe('authenticated');
    });

    it('keeps the session memory-only when rememberMe=false', async () => {
      mockedAuthService.login.mockResolvedValue({
        user: ADMIN_PROFILE,
        access_token: 'access-1',
        refresh_token: 'refresh-1',
      });

      await useAuthStore
        .getState()
        .signIn('9876543210', 'AdminPass#1', false);

      expect(mockedTokenStorage.setRefreshToken).toHaveBeenCalledWith(null);
      expect(useAuthStore.getState().status).toBe('authenticated');
    });

    it('falls back to unauthenticated and rethrows on failure', async () => {
      mockedAuthService.login.mockRejectedValue(
        Object.assign(new Error('Invalid credentials'), { statusCode: 401 }),
      );

      await expect(
        useAuthStore.getState().signIn('9876543210', 'wrong'),
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
      expect(mockedTokenStorage.setTokens).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('stores the token pair and user but waits for completeRegistration', async () => {
      mockedAuthService.register.mockResolvedValue({
        user: MEMBER_PROFILE,
        access_token: 'access-r',
        refresh_token: 'refresh-r',
      });

      await useAuthStore.getState().register({
        full_name: 'New Member',
        mobile_number: '9888880002',
        email: 'member@hrsjm.org',
        password: 'MemberPass#1',
        confirm_password: 'MemberPass#1',
        role_name: 'MEMBER',
      });

      expect(mockedAuthService.register).toHaveBeenCalledWith({
        full_name: 'New Member',
        mobile_number: '9888880002',
        email: 'member@hrsjm.org',
        password: 'MemberPass#1',
        confirm_password: 'MemberPass#1',
        role_name: 'MEMBER',
      });
      expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith(
        'access-r',
        'refresh-r',
      );
      expect(mockPermissionStore.loadPermissions).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toEqual(MEMBER_PROFILE);
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });

    it('completeRegistration activates the session', async () => {
      useAuthStore.setState({ user: MEMBER_PROFILE, status: 'unauthenticated' });

      useAuthStore.getState().completeRegistration();

      expect(useAuthStore.getState().status).toBe('authenticated');
    });
  });

  describe('restoreSession', () => {
    it('returns false immediately when no refresh token exists', async () => {
      mockedTokenStorage.getRefreshToken.mockResolvedValue(null);

      const restored = await useAuthStore.getState().restoreSession();

      expect(restored).toBe(false);
      expect(mockedAuthService.refresh).not.toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });

    it('exchanges the stored refresh token for a fresh pair on success', async () => {
      mockedTokenStorage.getRefreshToken.mockResolvedValue('stored-refresh');
      mockedAuthService.refresh.mockResolvedValue({
        user: ADMIN_PROFILE,
        access_token: 'access-2',
        refresh_token: 'rotated-refresh',
      });

      const restored = await useAuthStore.getState().restoreSession();

      expect(restored).toBe(true);
      expect(mockedAuthService.refresh).toHaveBeenCalledWith('stored-refresh');
      expect(mockedTokenStorage.setTokens).toHaveBeenCalledWith(
        'access-2',
        'rotated-refresh',
      );
      expect(useAuthStore.getState().status).toBe('authenticated');
    });

    it('clears tokens and reports failure when refresh is rejected', async () => {
      mockedTokenStorage.getRefreshToken.mockResolvedValue('stale-refresh');
      mockedAuthService.refresh.mockRejectedValue(
        Object.assign(new Error('Invalid or expired refresh token'), {
          statusCode: 401,
        }),
      );

      const restored = await useAuthStore.getState().restoreSession();

      expect(restored).toBe(false);
      expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });

  describe('signOut', () => {
    it('revokes the refresh token server-side and clears local state', async () => {
      useAuthStore.setState({ user: ADMIN_PROFILE, status: 'authenticated' });
      mockedTokenStorage.getRefreshToken.mockResolvedValue('stored-refresh');

      await useAuthStore.getState().signOut();

      expect(mockedAuthService.logout).toHaveBeenCalledWith('stored-refresh');
      expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
      expect(mockPermissionStore.clear).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });

    it('clears the local session even when the server revoke fails', async () => {
      mockedTokenStorage.getRefreshToken.mockResolvedValue('stored-refresh');
      mockedAuthService.logout.mockRejectedValue(new Error('network down'));

      await useAuthStore.getState().signOut();

      expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
      expect(mockPermissionStore.clear).toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });

  describe('handleSessionExpired', () => {
    it('clears local state without a server call', () => {
      useAuthStore.setState({ user: ADMIN_PROFILE, status: 'authenticated' });

      useAuthStore.getState().handleSessionExpired();

      expect(mockedAuthService.logout).not.toHaveBeenCalled();
      expect(mockedTokenStorage.clearTokens).toHaveBeenCalled();
      expect(mockPermissionStore.clear).toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });
});