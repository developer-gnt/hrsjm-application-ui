export { default as SupportTicketsScreen } from './screens/SupportTicketsScreen';
export { default as TicketDetailsScreen } from './screens/TicketDetailsScreen';
export { default as TicketChatScreen } from './screens/TicketChatScreen';
export { supportService } from './services/support.service';
export { useSupportTickets } from './hooks/useSupportTickets';
export { useTicketDetails } from './hooks/useTicketDetails';
export { useTicketActions } from './hooks/useTicketActions';
export { useTicketReply } from './hooks/useTicketReply';
export type { TicketActionKind } from './hooks/useTicketActions';
export type {
  SupportTicket,
  SupportTicketMessage,
  TicketStatus,
} from './types/support.types';
export { ticketStatusMeta, TICKET_TABS } from './support.utils';
