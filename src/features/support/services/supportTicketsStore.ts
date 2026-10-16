import {
  SupportTicket,
  TicketStatsData,
  StatusTabKey,
  DateFilter,
  TicketDraft,
  TicketAttachment,
  TicketStatus,
} from '../types/ticket.types';
import { INITIAL_DEV_TICKETS } from '../data/ticketFixtures';
import { supportService } from '../../admin/support/services/support.service';

export interface TicketFilterOptions {
  statusTab?: StatusTabKey;
  searchQuery?: string;
  category?: string;
  relatedPage?: string;
  dateFilter?: DateFilter | null;
}

const INITIAL_DRAFT: TicketDraft = {
  category: '',
  subject: '',
  description: '',
  attachments: [],
};

export const mapBackendTicketToSupportTicket = (item: any): SupportTicket => {
  const rawSubject = (item.subject || '').trim();
  const match = /^\[(.*?)\]\s*(.*)$/.exec(rawSubject);
  const category = match ? match[1] : item.category || 'General Inquiry';
  const cleanSubject = match ? (match[2] || match[1]) : rawSubject;

  const rawStatus = (item.status || '').toUpperCase();
  let status: TicketStatus = 'open';
  if (rawStatus === 'SUBMITTED' || rawStatus === 'OPEN') {
    status = 'open';
  } else if (rawStatus === 'UNDER_REVIEW' || rawStatus === 'IN_PROGRESS') {
    status = 'in_progress';
  } else if (rawStatus === 'RESOLVED') {
    status = 'resolved';
  } else if (rawStatus === 'CLOSED') {
    status = 'closed';
  } else if (rawStatus === 'PENDING') {
    status = 'pending';
  }

  const d = new Date(item.created_at || Date.now());
  const formattedDate = !isNaN(d.getTime())
    ? d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + `, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    : 'Recently';

  const rawId = item.id || '';
  const ticketNumber = `#${rawId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  const attachments: TicketAttachment[] = Array.isArray(item.documents)
    ? item.documents.map((doc: any, idx: number) => ({
        id: doc.id || `att-${idx}`,
        name: doc.document_name || 'document',
        size: doc.file_size || 0,
        formattedSize: doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
        type: doc.mime_type || 'file',
        uri: doc.file_url,
      }))
    : [];

  return {
    id: item.id,
    ticketNumber,
    category,
    subject: cleanSubject || rawSubject,
    description: item.description || '',
    status,
    createdAt: item.created_at || new Date().toISOString(),
    formattedDate,
    attachments,
  };
};

class SupportTicketsStore {
  // Real tickets fetched from backend; defaults to empty so NO mock data is shown to real users
  private tickets: SupportTicket[] = [];
  private draft: TicketDraft = { ...INITIAL_DRAFT, attachments: [] };
  private lastCreatedTicket: SupportTicket | undefined = undefined;
  private listeners: Set<() => void> = new Set();
  private version: number = 0;
  private isFetching: boolean = false;

  public getSnapshot = (): number => {
    return this.version;
  };

  public getDraft = (): TicketDraft => {
    return { ...this.draft, attachments: [...this.draft.attachments] };
  };

  public updateDraft = (partial: Partial<TicketDraft>): void => {
    this.draft = {
      ...this.draft,
      ...partial,
      attachments: partial.attachments !== undefined ? [...partial.attachments] : this.draft.attachments,
    };
    this.notify();
  };

  public clearDraft = (): void => {
    this.draft = { ...INITIAL_DRAFT, attachments: [] };
    this.notify();
  };

  public async fetchTickets(options?: TicketFilterOptions): Promise<SupportTicket[]> {
    if (this.isFetching) return this.tickets;
    this.isFetching = true;
    try {
      const data = await supportService.list({
        limit: 50,
        search: options?.searchQuery,
      });

      const rawItems = Array.isArray(data?.items) ? data.items : [];
      this.tickets = rawItems.map(mapBackendTicketToSupportTicket);
      this.notify();
      return this.tickets;
    } catch (err) {
      console.warn('Failed to fetch support tickets from backend:', err);
      return this.tickets;
    } finally {
      this.isFetching = false;
    }
  }

  public getTickets(options?: TicketFilterOptions): SupportTicket[] {
    let result = [...this.tickets];

    if (options?.statusTab && options.statusTab !== 'all') {
      result = result.filter(ticket => ticket.status === options.statusTab);
    }

    if (options?.dateFilter) {
      const { mode, singleDate, fromDate, toDate } = options.dateFilter;
      if (mode === 'single' && singleDate) {
        result = result.filter(ticket => {
          const ticketDate = ticket.createdAt.slice(0, 10);
          return ticketDate === singleDate;
        });
      } else if (mode === 'range') {
        result = result.filter(ticket => {
          const ticketDate = ticket.createdAt.slice(0, 10);
          if (fromDate && toDate) {
            return ticketDate >= fromDate && ticketDate <= toDate;
          } else if (fromDate) {
            return ticketDate >= fromDate;
          } else if (toDate) {
            return ticketDate <= toDate;
          }
          return true;
        });
      }
    }

    if (options?.relatedPage && options.relatedPage !== 'all') {
      result = result.filter(
        ticket =>
          ticket.relatedPage?.toLowerCase() === options.relatedPage?.toLowerCase() ||
          ticket.category?.toLowerCase() === options.relatedPage?.toLowerCase()
      );
    }

    if (options?.category && options.category !== 'all') {
      result = result.filter(
        ticket => ticket.category.toLowerCase() === options.category?.toLowerCase()
      );
    }

    if (options?.searchQuery) {
      const q = options.searchQuery.trim().toLowerCase();
      if (q) {
        result = result.filter(ticket => {
          return (
            ticket.ticketNumber.toLowerCase().includes(q) ||
            ticket.id.toLowerCase().includes(q) ||
            ticket.subject.toLowerCase().includes(q) ||
            ticket.category.toLowerCase().includes(q) ||
            ticket.description.toLowerCase().includes(q)
          );
        });
      }
    }

    return result;
  }

  public getAllTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  public getTicketById(id: string): SupportTicket | undefined {
    const cleanId = id.replace(/^#/, '').toLowerCase();
    return this.tickets.find(
      t =>
        t.id.toLowerCase() === cleanId ||
        t.ticketNumber.toLowerCase().replace(/^#/, '') === cleanId
    );
  }

  public getStats(): TicketStatsData {
    const total = this.tickets.length;
    const pending = this.tickets.filter(t => t.status === 'pending').length;
    const open = this.tickets.filter(t => t.status === 'open').length;
    const inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;
    const closed = this.tickets.filter(t => t.status === 'closed').length;

    return {
      total,
      pending,
      open,
      inProgress,
      resolved,
      closed,
    };
  }

  public async createTicket(draft?: TicketDraft): Promise<SupportTicket> {
    const data = draft || this.draft;
    const finalCategory = data.category || 'General Inquiry';
    const finalSubject = data.subject || 'Support Request';

    try {
      const created = await supportService.create({
        category: finalCategory,
        subject: finalSubject,
        description: data.description || '',
        priority: 'NORMAL',
      });

      const mapped = mapBackendTicketToSupportTicket(created);
      this.tickets = [mapped, ...this.tickets.filter(t => t.id !== mapped.id)];
      this.lastCreatedTicket = mapped;
      this.clearDraft();
      this.notify();
      return mapped;
    } catch (err) {
      console.error('Failed to create support ticket in backend:', err);
      // Local fallback if network fails
      const now = new Date();
      const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
      const fallbackTicket: SupportTicket = {
        id: ticketId,
        ticketNumber: `#${ticketId}`,
        category: finalCategory,
        subject: finalSubject,
        description: data.description || '',
        status: 'open',
        createdAt: now.toISOString(),
        formattedDate: 'Just now',
        attachments: data.attachments ? [...data.attachments] : [],
      };
      this.tickets = [fallbackTicket, ...this.tickets];
      this.lastCreatedTicket = fallbackTicket;
      this.clearDraft();
      this.notify();
      return fallbackTicket;
    }
  }

  public createTicketFromDraft(draft?: TicketDraft): SupportTicket {
    const data = draft || this.draft;
    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tempId = `TKT-2026-${randomSuffix}`;
    const newTicket: SupportTicket = {
      id: tempId,
      ticketNumber: `#${tempId}`,
      category: data.category || 'General Inquiry',
      subject: data.subject || 'Support Request',
      description: data.description || '',
      status: 'pending',
      createdAt: now.toISOString(),
      formattedDate: 'Just now',
      attachments: data.attachments ? [...data.attachments] : [],
    };

    this.tickets = [newTicket, ...this.tickets];
    this.lastCreatedTicket = newTicket;
    this.clearDraft();
    this.notify();

    // Trigger backend creation immediately and replace temp ticket
    supportService
      .create({
        category: newTicket.category,
        subject: newTicket.subject,
        description: newTicket.description,
        priority: 'NORMAL',
      })
      .then(created => {
        const mapped = mapBackendTicketToSupportTicket(created);
        this.tickets = this.tickets.map(t => (t.id === tempId ? mapped : t));
        if (this.lastCreatedTicket?.id === tempId) {
          this.lastCreatedTicket = mapped;
        }
        this.notify();
      })
      .catch(err => {
        console.warn('Background createTicket error:', err);
      });

    return newTicket;
  }

  public getLastCreatedTicket(): SupportTicket | undefined {
    return this.lastCreatedTicket;
  }

  public addTicket(newTicket: SupportTicket): void {
    this.tickets = [newTicket, ...this.tickets.filter(t => t.id !== newTicket.id)];
    this.notify();
  }

  public resetToFixtures(): void {
    this.tickets = [...INITIAL_DEV_TICKETS];
    this.lastCreatedTicket = undefined;
    this.notify();
  }

  public clearTickets(): void {
    this.tickets = [];
    this.notify();
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.version++;
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying supportTicketsStore subscriber:', err);
      }
    });
  }
}

export const supportTicketsStore = new SupportTicketsStore();
