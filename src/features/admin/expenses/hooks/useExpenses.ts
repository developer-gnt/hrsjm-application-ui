import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesService, ListVouchersParams } from '../services/expenses.service';
import type { CreateExpensePayload } from '../types/expenses.types';

export const EXPENSES_QUERY_KEYS = {
  list: (status: string | undefined, search: string | undefined) =>
    ['expense-entries', 'list', status ?? 'ALL', search ?? ''] as const,
  detail: (id: string) => ['expense-entries', 'detail', id] as const,
  stats: ['expense-entries', 'stats'] as const,
};

export const useExpenses = (params: Omit<ListVouchersParams, 'page' | 'limit'>) =>
  useInfiniteQuery({
    queryKey: EXPENSES_QUERY_KEYS.list(params.status, params.search),
    queryFn: ({ pageParam }) =>
      expensesService.list({ ...params, page: pageParam, limit: 15 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.meta.totalPages ? next : undefined;
    },
  });

export const useExpenseStats = () =>
  useQuery({
    queryKey: EXPENSES_QUERY_KEYS.stats,
    queryFn: async () => {
      const [all, posted, cancelled] = await Promise.all([
        expensesService.list({ page: 1, limit: 1 }),
        expensesService.list({ page: 1, limit: 1, status: 'POSTED' }),
        expensesService.list({ page: 1, limit: 1, status: 'CANCELLED' }),
      ]);
      return {
        all: all.meta.total,
        posted: posted.meta.total,
        cancelled: cancelled.meta.total,
      };
    },
    staleTime: 15_000,
  });

export const useExpenseDetail = (id: string) =>
  useQuery({
    queryKey: EXPENSES_QUERY_KEYS.detail(id),
    queryFn: () => expensesService.get(id),
    enabled: Boolean(id),
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expensesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expense-entries'] });
    },
  });
};

export const useCancelExpense = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cancellationReason?: string) => expensesService.cancel(id, cancellationReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expense-entries'] });
    },
  });
};

export const useInvalidateExpenses = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['expense-entries'] });
  }, [queryClient]);
};