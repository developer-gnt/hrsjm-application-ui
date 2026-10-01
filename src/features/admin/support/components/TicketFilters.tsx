import React, { useEffect, useState } from 'react';
import AdminFilterSheet from '../../../../core/components/admin/AdminFilterSheet';
import {
  TICKET_TABS,
  type TicketTabKey,
} from '../support.utils';

interface TicketFiltersProps {
  visible: boolean;
  currentTab: TicketTabKey;
  onClose: () => void;
  onApply: (tab: TicketTabKey) => void;
}

const BACKEND_PENDING_NOTE =
  'Pending backend support — the API does not provide this filter yet.';

// Filter bottom sheet per the phase plan: Status / Priority / Category /
// Assignee / Date Range. Only Status has backend support today (confirmed
// contract: page, limit, status, user_id, search); the remaining sections are
// shown disabled instead of sending unsupported query params the API would
// reject. Reported as contract gaps.
export function TicketFilters({ visible, currentTab, onClose, onApply }: TicketFiltersProps) {
  const [draftTab, setDraftTab] = useState<TicketTabKey>(currentTab);

  useEffect(() => {
    if (visible) {
      setDraftTab(currentTab);
    }
  }, [visible, currentTab]);

  const pendingSection = (heading: string) => ({
    heading,
    note: BACKEND_PENDING_NOTE,
    options: [],
    selected: [] as string[],
    disabled: true,
    onToggle: () => undefined,
  });

  return (
    <AdminFilterSheet
      visible={visible}
      title="Filters"
      onClose={onClose}
      onApply={() => onApply(draftTab)}
      onClear={() => setDraftTab('ALL')}
      sections={[
        {
          heading: 'Status',
          options: TICKET_TABS.map(tab => ({ key: tab.key, label: tab.label })),
          selected: [draftTab],
          onToggle: key => setDraftTab(key as TicketTabKey),
        },
        pendingSection('Priority'),
        pendingSection('Category'),
        pendingSection('Assignee'),
        pendingSection('Date Range'),
      ]}
    />
  );
}

export default TicketFilters;
