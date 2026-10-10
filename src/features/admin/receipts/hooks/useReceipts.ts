import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  receiptEntriesService,
  ListReceiptsParams,
} from '../services/receipt-entries.service';
import type { CreateReceiptPayload, UpdateReceiptPayload } from '../types/receipts.types';

export const RECEIPTS_QUERY_KEYS = {
  list: (
    status: string | undefined,
    search: string | undefined,
    payment_method?: string,
  ) =>
    ['receipt-entries', 'list', status ?? 'ALL', search ?? '', payment_method ?? 'ALL'] as const,
  detail: (id: string) => ['receipt-entries', 'detail', id] as const,
  stats: ['receipt-entries', 'stats'] as const,
};

export const useReceipts = (params: Omit<ListReceiptsParams, 'page' | 'limit'>) =>
  useInfiniteQuery({
    queryKey: RECEIPTS_QUERY_KEYS.list(params.status, params.search, params.payment_method),
    queryFn: ({ pageParam }) =>
      receiptEntriesService.list({ ...params, page: pageParam, limit: 15 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.meta.totalPages ? next : undefined;
    },
  });

export const useReceiptStats = () =>
  useQuery({
    queryKey: RECEIPTS_QUERY_KEYS.stats,
    queryFn: async () => {
      try {
        return await receiptEntriesService.getStats();
      } catch {
        const [allRes, postedRes, cancelledRes] = await Promise.all([
          receiptEntriesService.list({ page: 1, limit: 100 }),
          receiptEntriesService.list({ page: 1, limit: 1, status: 'POSTED' }),
          receiptEntriesService.list({ page: 1, limit: 1, status: 'CANCELLED' }),
        ]);
        const totalAmount = allRes.items
          .filter(item => item.status === 'POSTED')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        return {
          all: allRes.meta.total ?? 0,
          posted: postedRes.meta.total ?? 0,
          cancelled: cancelledRes.meta.total ?? 0,
          totalAmount,
        };
      }
    },
    staleTime: 15_000,
  });

export const useReceiptDetail = (id: string) =>
  useQuery({
    queryKey: RECEIPTS_QUERY_KEYS.detail(id),
    queryFn: () => receiptEntriesService.get(id),
    enabled: Boolean(id),
  });

export const useCreateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReceiptPayload) =>
      receiptEntriesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipt-entries'] });
    },
  });
};

export const useUpdateReceipt = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      receiptEntriesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipt-entries'] });
    },
  });
};

export const useCancelReceipt = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cancellationReason?: string) =>
      receiptEntriesService.cancel(id, cancellationReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipt-entries'] });
    },
  });
};

export const useInvalidateReceipts = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['receipt-entries'] });
  }, [queryClient]);
};