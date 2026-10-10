import { useCallback, useEffect, useState } from 'react';
import type { JournalEntryItem } from '../types/accounting.types';
import {
  listJournalEntriesApi,
  reverseJournalEntryApi,
} from '../services/entries.service';

export interface UseJournalEntriesParams {
  entryType?: string;
  referenceType?: string;
  statusFilter?: 'ALL' | 'POSTED' | 'REVERSED';
  search?: string;
}

export interface UseJournalEntriesResult {
  entries: JournalEntryItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reverseEntry: (id: string, reason?: string) => Promise<JournalEntryItem>;
}

export const useJournalEntries = ({
  entryType,
  referenceType,
  statusFilter = 'ALL',
  search,
}: UseJournalEntriesParams = {}): UseJournalEntriesResult => {
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listJournalEntriesApi({
        entry_type: entryType,
        reference_type: referenceType,
      });

      let items = data.items || [];

      // Filter by status (POSTED vs REVERSED)
      if (statusFilter === 'POSTED') {
        items = items.filter(e => !e.is_reversed && e.entry_type !== 'REVERSAL');
      } else if (statusFilter === 'REVERSED') {
        items = items.filter(e => e.is_reversed || e.entry_type === 'REVERSAL');
      }

      // Filter by search query
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(
          e =>
            (e.entry_number || '').toLowerCase().includes(q) ||
            (e.narration || '').toLowerCase().includes(q) ||
            (e.reference_type || '').toLowerCase().includes(q),
        );
      }

      setEntries(items);
      setTotal(items.length);
    } catch (err: any) {
      setError(err?.message || 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  }, [entryType, referenceType, statusFilter, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const reverseEntry = async (id: string, reason?: string): Promise<JournalEntryItem> => {
    const reversed = await reverseJournalEntryApi(id, reason);
    await fetchEntries();
    return reversed;
  };

  return {
    entries,
    total,
    loading,
    error,
    refresh: fetchEntries,
    reverseEntry,
  };
};
