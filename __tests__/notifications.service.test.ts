import { notificationsService } from '../src/features/admin/notifications/services/notifications.service';
import { api } from '../src/core/api/client';
import type { MyNotificationsData } from '../src/features/admin/notifications/types/notifications.types';

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

const inboxPayload: MyNotificationsData = {
  items: [
    {
      recipient_id: 'rec-1',
      is_read: false,
      read_at: null,
      created_at: '2026-09-30T12:00:00.000Z',
      notification: {
        id: 'n-1',
        title: 'New Support Ticket',
        body: 'Support ticket submitted: "Receipt not received".',
        target_audience: 'ALL_USERS',
        sent_at: '2026-09-30T12:00:00.000Z',
      },
    },
  ],
  unread_count: 1,
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('notificationsService.listMine', () => {
  it('calls GET /notifications/me with pagination', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: inboxPayload } });

    const result = await notificationsService.listMine({ page: 1, limit: 10 });

    expect(mockedApi.get).toHaveBeenCalledWith('/notifications/me', {
      params: { page: 1, limit: 10 },
    });
    expect(result.unread_count).toBe(1);
  });

  it('sends unread_only=true only for the unread view', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: inboxPayload } });

    await notificationsService.listMine({ unread_only: true });

    expect(mockedApi.get).toHaveBeenCalledWith('/notifications/me', {
      params: { page: 1, limit: 10, unread_only: true },
    });

    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: inboxPayload } });
    await notificationsService.listMine();
    const call = mockedApi.get.mock.calls[1][1] as { params: Record<string, unknown> };
    expect('unread_only' in call.params).toBe(false);
  });
});

describe('notificationsService.markRead', () => {
  it('PATCHes /notifications/recipients/:recipientId/read', async () => {
    mockedApi.patch.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { recipient_id: 'rec-1', is_read: true, read_at: '2026-10-01T00:00:00.000Z' } },
    });

    const result = await notificationsService.markRead('rec-1');

    expect(mockedApi.patch).toHaveBeenCalledWith('/notifications/recipients/rec-1/read');
    expect(result.is_read).toBe(true);
  });
});

describe('notificationsService.markAllRead', () => {
  it('PATCHes /notifications/me/read-all (confirmed backend support)', async () => {
    mockedApi.patch.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { updated_count: 3 } },
    });

    const result = await notificationsService.markAllRead();

    expect(mockedApi.patch).toHaveBeenCalledWith('/notifications/me/read-all');
    expect(result.updated_count).toBe(3);
  });
});
