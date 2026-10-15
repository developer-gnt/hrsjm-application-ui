import { apiClient } from '../../src/core/api/client';
import { authService } from '../../src/features/auth/services/auth.service';

jest.mock('../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

/**
 * The service payload shapes must match the backend auth controller contract
 * exactly (snake_case token fields, confirm_password on reset).
 */
describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login posts identifier + password to /auth/login', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: { user: {}, access_token: 'a', refresh_token: 'r' },
    });

    const session = await authService.login('9876543210', 'AdminPass#1');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
      identifier: '9876543210',
      password: 'AdminPass#1',
    });
    expect(session.access_token).toBe('a');
    expect(session.refresh_token).toBe('r');
  });

  it('refresh posts the snake_case refresh_token field to /auth/refresh', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: { user: {}, access_token: 'a2', refresh_token: 'r2' },
    });

    await authService.refresh('stored-refresh');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refresh_token: 'stored-refresh',
    });
  });

  it('logout posts the refresh token and tolerates a null payload', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: null,
    });

    await authService.logout('stored-refresh');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout', {
      refresh_token: 'stored-refresh',
    });
  });

  it('forgotPassword posts the identifier and returns the result payload', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: { delivered_mechanism: 'TBC', reset_token: 'tok' },
    });

    const result = await authService.forgotPassword('admin@hrsjm.org');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      identifier: 'admin@hrsjm.org',
    });
    expect(result.delivered_mechanism).toBe('TBC');
    expect(result.reset_token).toBe('tok');
  });

  it('resetPassword posts token, password and confirm_password', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: null,
    });

    await authService.resetPassword('tok', 'NewPass#123', 'NewPass#123');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'tok',
      password: 'NewPass#123',
      confirm_password: 'NewPass#123',
    });
  });

  it('getMe GETs /auth/me', async () => {
    (mockedApiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Operation successful',
      data: { id: 'u1', full_name: 'Admin' },
    });

    const profile = await authService.getMe();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(profile.id).toBe('u1');
  });
});