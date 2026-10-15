import React from 'react';
import AdminStatusBadge from '../../../../core/components/admin/AdminStatusBadge';
import { statusMeta } from '../assistance.utils';
import type { AssistanceStatus } from '../types/assistance.types';

interface AssistanceStatusBadgeProps {
  status: AssistanceStatus;
}

export function AssistanceStatusBadge({ status }: AssistanceStatusBadgeProps) {
  const meta = statusMeta(status);
  return <AdminStatusBadge label={meta.label} tone={meta.tone} />;
}

export default AssistanceStatusBadge;
