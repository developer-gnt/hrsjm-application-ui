import { supportService } from '../src/features/admin/support/services/support.service';
import { api } from '../src/core/api/client';
import type { SupportTicketListData } from '../src/features/admin/support/types/support.types';

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

const listPayload: SupportTicketListData = {
  items: [
    {
      id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
      user_id: 'user-1',
      user: {
        id: 'user-1',
        full_name: 'Aisha Rahman',
        email: 'aisha@example.com',
      },
      subject: 'Donation receipt not received',
      description: 'I donated last week but never received the receipt email.',
      status: 'SUBMITTED',
      resolved_by: null,
      resolved_by_user: null,
      resolved_at: null,
      created_at: '2026-09-30T09:00:00.000Z',
      updated_at: '2026-09-30T09:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('supportService.list', () => {
  it('calls GET /support-tickets with pagination, status filter and search', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    const result = await supportService.list({
      status: 'UNDER_REVIEW',
      search: 'receipt',
      page: 2,
      limit: 10,
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/support-tickets', {
      params: { status: 'UNDER_REVIEW', search: 'receipt', page: 2, limit: 10 },
    });
    expect(result).toEqual(listPayload);
  });

  it('defaults to page 1 / limit 10 and omits optional filters when not set', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    await supportService.list();

    expect(mockedApi.get).toHaveBeenCalledWith('/support-tickets', {
      params: { page: 1, limit: 10 },
    });
    const call = mockedApi.get.mock.calls[0][1] as { params: Record<string, unknown> };
    expect('status' in call.params).toBe(false);
    expect('search' in call.params).toBe(false);
  });

  it('never sends parameters the backend does not support', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: listPayload } });

    await supportService.list({ page: 1, limit: 5 });

    const call = mockedApi.get.mock.calls[0][1] as { params: Record<string, unknown> };
    // The list endpoint whitelist: page, limit, status, search (user_id is
    // not needed by the admin UI). No priority/category/assignee/date params
    // exist in the backend contract.
    const allowedKeys = ['status', 'search', 'page', 'limit'];
    expect(Object.keys(call.params).every(key => allowedKeys.includes(key))).toBe(true);
  });
});

describe('supportService.getById', () => {
  it('calls GET /support-tickets/:id', async () => {
    const ticket = listPayload.items[0];
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: ticket } });

    const result = await supportService.getById(ticket.id);

    expect(mockedApi.get).toHaveBeenCalledWith(`/support-tickets/${ticket.id}`);
    expect(result).toEqual(ticket);
  });
});

describe('supportService.updateStatus', () => {
  it('PATCHes /support-tickets/:id/status with { status, note? }', async () => {
    const ticket = { ...listPayload.items[0], status: 'RESOLVED' as const };
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: ticket } });

    const result = await supportService.updateStatus(ticket.id, {
      status: 'RESOLVED',
      note: 'Receipt re-sent',
    });

    expect(mockedApi.patch).toHaveBeenCalledWith(`/support-tickets/${ticket.id}/status`, {
      status: 'RESOLVED',
      note: 'Receipt re-sent',
    });
    expect(result.status).toBe('RESOLVED');
  });

  it('omits the note when no resolution note is given', async () => {
    const ticket = { ...listPayload.items[0], status: 'UNDER_REVIEW' as const };
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: ticket } });

    await supportService.updateStatus(ticket.id, { status: 'UNDER_REVIEW' });

    const body = mockedApi.patch.mock.calls[0][1] as Record<string, unknown>;
    expect('note' in body).toBe(false);
  });
});

describe('supportService messages', () => {
  it('lists conversation messages via GET /support-tickets/:id/messages', async () => {
    const messages = [
      {
        id: 'm-1',
        ticket_id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
        author_id: 'user-1',
        author: { id: 'user-1', full_name: 'Aisha Rahman', email: 'aisha@example.com' },
        body: 'Waiting for the receipt.',
        created_at: '2026-09-30T09:01:00.000Z',
        updated_at: '2026-09-30T09:01:00.000Z',
      },
    ];
    mockedApi.get.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: messages } });

    const result = await supportService.listMessages('1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d');

    expect(mockedApi.get).toHaveBeenCalledWith(
      '/support-tickets/1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d/messages',
    );
    expect(result).toEqual(messages);
  });

  it('posts a reply with the backend body shape { body }', async () => {
    const message = {
      id: 'm-2',
      ticket_id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
      author_id: 'admin-1',
      body: 'We have re-sent your receipt.',
      created_at: '2026-09-30T10:00:00.000Z',
      updated_at: '2026-09-30T10:00:00.000Z',
    };
    mockedApi.post.mockResolvedValueOnce({ data: { success: true, message: 'ok', data: message } });

    const result = await supportService.addMessage('1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d', {
      body: 'We have re-sent your receipt.',
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/support-tickets/1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d/messages',
      { body: 'We have re-sent your receipt.' },
    );
    expect(result.id).toBe('m-2');
  });
});

describe('supportService.listAttachments', () => {
  it('queries the shared documents endpoint by SUPPORT_TICKET relation', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } } },
    });

    await supportService.listAttachments('1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d');

    expect(mockedApi.get).toHaveBeenCalledWith('/documents', {
      params: {
        related_entity_type: 'SUPPORT_TICKET',
        related_entity_id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
        page: 1,
        limit: 50,
      },
    });
  });
});
