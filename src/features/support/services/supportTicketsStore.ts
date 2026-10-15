import { SupportTicket, TicketStatsData, StatusTabKey, DateFilter, TicketDraft } from '../types/ticket.types';
import { INITIAL_DEV_TICKETS } from '../data/ticketFixtures';

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

class SupportTicketsStore {
  private tickets: SupportTicket[] = [...INITIAL_DEV_TICKETS];
  private draft: TicketDraft = { ...INITIAL_DRAFT, attachments: [] };
  private lastCreatedTicket: SupportTicket | undefined = undefined;
  private listeners: Set<() => void> = new Set();
  private version: number = 0;

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

  public createTicketFromDraft(draft?: TicketDraft): SupportTicket {
    const data = draft || this.draft;
    const now = new Date();
    const isoString = now.toISOString();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const nextSeq = this.tickets.length + 1;
    const seqStr = String(nextSeq).padStart(4, '0');
    const ticketId = `TKT-${now.getFullYear()}-${seqStr}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber: `#${ticketId}`,
      category: data.category || 'General Inquiry',
      subject: data.subject || 'Support Request',
      description: data.description || '',
      status: 'pending',
      createdAt: isoString,
      formattedDate: formattedDate,
      attachments: data.attachments ? [...data.attachments] : [],
    };

    this.tickets = [newTicket, ...this.tickets];
    this.lastCreatedTicket = newTicket;
    this.clearDraft();
    this.notify();
    return newTicket;
  }

  public getLastCreatedTicket(): SupportTicket | undefined {
    return this.lastCreatedTicket;
  }

  public addTicket(newTicket: SupportTicket): void {
    this.tickets = [newTicket, ...this.tickets];
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
