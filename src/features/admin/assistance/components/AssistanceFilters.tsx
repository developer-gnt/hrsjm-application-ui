import React, { useEffect, useState } from 'react';
import AdminFilterSheet from '../../../../core/components/admin/AdminFilterSheet';
import {
  ASSISTANCE_TABS,
  type AssistanceTabKey,
} from '../assistance.utils';

interface AssistanceFiltersProps {
  visible: boolean;
  currentTab: AssistanceTabKey;
  onClose: () => void;
  onApply: (tab: AssistanceTabKey) => void;
}

const BACKEND_PENDING_NOTE =
  'Pending backend support — the API does not provide this filter yet.';

// Filter bottom sheet per the phase plan: Status / Category / Date Range /
// Amount Range. Only Status has backend support today (confirmed contract);
// the remaining sections are shown disabled instead of sending unsupported
// query params the API would reject.
export function AssistanceFilters({ visible, currentTab, onClose, onApply }: AssistanceFiltersProps) {
  const [draftTab, setDraftTab] = useState<AssistanceTabKey>(currentTab);

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
          options: ASSISTANCE_TABS.map(tab => ({ key: tab.key, label: tab.label })),
          selected: [draftTab],
          onToggle: key => setDraftTab(key as AssistanceTabKey),
        },
        pendingSection('Category'),
        pendingSection('Date Range'),
        pendingSection('Amount Range'),
      ]}
    />
  );
}

export default AssistanceFilters;
