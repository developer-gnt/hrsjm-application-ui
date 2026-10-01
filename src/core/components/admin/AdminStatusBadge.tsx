import React from 'react';
import { AppBadge } from '../common/AppBadge';
import { toneColors, type StatusTone } from '../../theme/theme';

interface AdminStatusBadgeProps {
  label: string;
  tone: StatusTone;
}

// Status is never communicated by color alone - the label text is always present.
export function AdminStatusBadge({ label, tone }: AdminStatusBadgeProps) {
  const scheme = toneColors[tone];
  return <AppBadge label={label} bg={scheme.bg} fg={scheme.fg} />;
}

export default AdminStatusBadge;
