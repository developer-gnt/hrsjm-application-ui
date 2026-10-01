import { assistanceService } from '../src/features/admin/assistance/services/assistance.service';
import { authService } from '../src/core/auth/auth.service';
import { api } from '../src/core/api/client';
import type { AssistanceListData } from '../src/features/admin/assistance/types/assistance.types';

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

const listPayload: AssistanceListData = {
  items: [
    {
      id: '9f1c2b3a-4d5e-4f60-a1b2-c3d4e5f60718',
      user_id: 'owner-1',
      full_name: 'Ahmed Khan',
      mobile: '9876543210',
      email: 'ahmed@example.com',
      requested_amount: 50000,
      reason: 'Medical treatment',
      description: null,
      status: 'PENDING',
      admin_remark: null,
      reviewed_at: null,
      created_at: '2026-09-28T10:00:00.000Z',
      updated_at: '2026-09-28T10:00:00.000Z',
      user: {
        id: 'owner-1',
        full_name: 'Ahmed Khan',
        email: 'ahmed@example.com',
      },
    },
  ],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('assistanceService.list', () => {
  it('calls GET /assistance-requests with pagination and status filter', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    const result = await assistanceService.list({ status: 'APPROVED', page: 2, limit: 10 });

    expect(mockedApi.get).toHaveBeenCalledWith('/assistance-requests', {
      params: { status: 'APPROVED', page: 2, limit: 10 },
    });
    expect(result).toEqual(listPayload);
  });

  it('defaults to page 1 / limit 10 and omits status when not set', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    await assistanceService.list();

    expect(mockedApi.get).toHaveBeenCalledWith('/assistance-requests', {
      params: { page: 1, limit: 10 },
    });
    const call = mockedApi.get.mock.calls[0][1] as { params: Record<string, unknown> };
    expect('status' in call.params).toBe(false);
  });

  it('never sends parameters the backend does not support', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    await assistanceService.list({ page: 1, limit: 5 });

    const call = mockedApi.get.mock.calls[0][1] as { params: Record<string, unknown> };
    const allowedKeys = ['status', 'page', 'limit'];
    expect(Object.keys(call.params).every(key => allowedKeys.includes(key))).toBe(true);
  });
});

describe('assistanceService.getById', () => {
  it('calls GET /assistance-requests/:id', async () => {
    const request = listPayload.items[0];
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: request } });

    const result = await assistanceService.getById(request.id);

    expect(mockedApi.get).toHaveBeenCalledWith(`/assistance-requests/${request.id}`);
    expect(result).toEqual(request);
  });
});

describe('assistanceService.updateStatus', () => {
  it('PATCHes /assistance-requests/:id/status with the backend body shape', async () => {
    const request = { ...listPayload.items[0], status: 'APPROVED' as const };
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: request } });

    const result = await assistanceService.updateStatus(request.id, {
      status: 'APPROVED',
      admin_remark: 'Verified documents',
    });

    expect(mockedApi.patch).toHaveBeenCalledWith(`/assistance-requests/${request.id}/status`, {
      status: 'APPROVED',
      admin_remark: 'Verified documents',
    });
    expect(result.status).toBe('APPROVED');
  });
});

describe('assistanceService.listDocuments', () => {
  it('queries the generic documents endpoint by related entity', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } } },
    });

    await assistanceService.listDocuments('9f1c2b3a-4d5e-4f60-a1b2-c3d4e5f60718');

    expect(mockedApi.get).toHaveBeenCalledWith('/documents', {
      params: {
        related_entity_type: 'ASSISTANCE_REQUEST',
        related_entity_id: '9f1c2b3a-4d5e-4f60-a1b2-c3d4e5f60718',
        page: 1,
        limit: 50,
      },
    });
  });
});

describe('authService', () => {
  it('logs in with a trimmed identifier and returns the backend token pair', async () => {
    const session = {
      user: {
        id: 'u-1',
        full_name: 'Admin',
        mobile_number: '9888880001',
        email: 'admin@example.com',
        status: 'ACTIVE',
        roles: [{ id: 'r-1', name: 'ADMIN' }],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    };
    mockedApi.post.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: session } });

    const result = await authService.login('  Admin@Example.COM ', 'secret');

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
      identifier: 'Admin@Example.COM',
      password: 'secret',
    });
    expect(result).toEqual(session);
  });

  it('exchanges a refresh token via POST /auth/refresh', async () => {
    const pair = {
      user: {
        id: 'u-1',
        full_name: 'Admin',
        mobile_number: '9888880001',
        email: 'admin@example.com',
        status: 'ACTIVE',
        roles: [{ id: 'r-1', name: 'ADMIN' }],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      access_token: 'token-2',
      refresh_token: 'refresh-2',
    };
    mockedApi.post.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: pair } });

    const result = await authService.refresh('refresh-1');

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: 'refresh-1' });
    expect(result.access_token).toBe('token-2');
  });

  it('fetches the current user from /auth/me', async () => {
    const user = {
      id: 'u-1',
      full_name: 'Admin',
      mobile_number: '9888880001',
      email: 'admin@example.com',
      status: 'ACTIVE',
      roles: [{ id: 'r-1', name: 'ADMIN' }],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: user } });

    const result = await authService.me();

    expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });
});
