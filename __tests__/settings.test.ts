import { settingsService } from '../src/features/admin/settings/services/settings.service';
import {
  validatePassword,
  validatePasswordConfirmation,
  validateProfileEdit,
} from '../src/features/admin/settings/settings.utils';
import { api } from '../src/core/api/client';

jest.mock('../src/core/api/client', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
  unwrap: (envelope: { data: unknown }) => envelope.data,
  authEvents: {
    onUnauthorized: jest.fn(),
    emitUnauthorized: jest.fn(),
  },
  getApiErrorMessage: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('settingsService.updateProfile', () => {
  it('PATCHes /auth/me with the snake_case body the backend accepts', async () => {
    const updated = {
      id: 'u-1',
      full_name: 'Updated Name',
      mobile_number: '9888880001',
      email: 'updated@example.com',
      status: 'ACTIVE',
      roles: [{ id: 'r-1', name: 'ADMIN' }],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    };
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: updated } });

    const result = await settingsService.updateProfile({
      full_name: 'Updated Name',
      email: 'updated@example.com',
    });

    expect(mockedApi.patch).toHaveBeenCalledWith('/auth/me', {
      full_name: 'Updated Name',
      email: 'updated@example.com',
    });
    expect(result.full_name).toBe('Updated Name');
  });

  it('only sends the fields that are provided (backend whitelist)', async () => {
    mockedApi.patch.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: {} },
    });

    await settingsService.updateProfile({ full_name: 'Only Name' });

    const body = mockedApi.patch.mock.calls[0][1] as Record<string, unknown>;
    expect(body).toEqual({ full_name: 'Only Name' });
    expect('email' in body).toBe(false);
  });
});

describe('password validation (client-side rules mirroring the backend constraints)', () => {
  it('requires at least 8 characters', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('longenough1').valid).toBe(true);
  });

  it('requires at most 72 characters', () => {
    expect(validatePassword('x'.repeat(73)).valid).toBe(false);
    expect(validatePassword('x'.repeat(72)).valid).toBe(true);
  });

  it('requires the confirmation to match', () => {
    expect(validatePasswordConfirmation('secret123', 'secret123').valid).toBe(true);
    expect(validatePasswordConfirmation('secret123', 'secret124').valid).toBe(false);
  });
});

describe('profile edit validation', () => {
  it('accepts a valid name and email', () => {
    const result = validateProfileEdit({ fullName: 'Arshad Ali', email: 'arshad@example.com' });
    expect(result.valid).toBe(true);
  });

  it('rejects a too-short name', () => {
    const result = validateProfileEdit({ fullName: 'A', email: 'a@example.com' });
    expect(result.valid).toBe(false);
    expect(result.fullNameError).toContain('at least 2');
  });

  it('rejects an invalid email format', () => {
    const result = validateProfileEdit({ fullName: 'Arshad Ali', email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.emailError).toContain('valid email');
  });

  it('rejects a too-long name (backend max 255)', () => {
    const result = validateProfileEdit({ fullName: 'x'.repeat(256), email: 'a@example.com' });
    expect(result.valid).toBe(false);
  });
});
