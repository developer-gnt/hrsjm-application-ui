import React from 'react';
import AdminStatusBadge from '../../../../core/components/admin/AdminStatusBadge';
import { ticketStatusMeta } from '../support.utils';
import type { TicketStatus } from '../types/support.types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const meta = ticketStatusMeta(status);
  return <AdminStatusBadge label={meta.label} tone={meta.tone} />;
}

export default TicketStatusBadge;
