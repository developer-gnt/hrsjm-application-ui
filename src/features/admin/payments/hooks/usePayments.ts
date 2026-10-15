import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  paymentsService,
  ListPaymentsParams,
} from '../services/payments.service';
import type {
  PaymentStatus,
  SetPaymentStatusPayload,
  VerifyPaymentPayload,
} from '../types/payments.types';

export const PAYMENTS_QUERY_KEYS = {
  list: (status: PaymentStatus | undefined, search: string | undefined) =>
    ['membership-payments', 'list', status ?? 'ALL', search ?? ''] as const,
  detail: (id: string) => ['membership-payments', 'detail', id] as const,
  stats: ['membership-payments', 'stats'] as const,
};

/** Paginated payments feed (infinite scroll over meta.totalPages). */
export const usePayments = (params: Omit<ListPaymentsParams, 'page' | 'limit'>) =>
  useInfiniteQuery({
    queryKey: PAYMENTS_QUERY_KEYS.list(params.status, params.search),
    queryFn: ({ pageParam }) =>
      paymentsService.list({ ...params, page: pageParam, limit: 15 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.meta.totalPages ? next : undefined;
    },
  });

/** Per-status totals for the filter tabs + stat chips (meta.total probes). */
export const usePaymentStats = () =>
  useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.stats,
    queryFn: async () => {
      const statuses: Array<PaymentStatus | undefined> = [
        undefined,
        'PENDING',
        'SUCCESS',
        'FAILED',
      ];
      const results = await Promise.all(
        statuses.map(status => paymentsService.list({ page: 1, limit: 1, status })),
      );
      return {
        all: results[0]?.meta?.total ?? 0,
        pending: results[1]?.meta?.total ?? 0,
        verified: results[2]?.meta?.total ?? 0,
        failed: results[3]?.meta?.total ?? 0,
      };
    },
    staleTime: 15_000,
  });

export const usePaymentDetail = (id: string) =>
  useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.detail(id),
    queryFn: () => paymentsService.get(id),
  });

/** Idempotent verify (backend returns the existing pair on re-verify). */
export const useVerifyPayment = (paymentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) =>
      paymentsService.verify(paymentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['membership-payments'],
      });
    },
  });
};

/** Manual status change (permission: payment.manage_status). */
export const useSetPaymentStatus = (paymentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetPaymentStatusPayload) =>
      paymentsService.setStatus(paymentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['membership-payments'],
      });
    },
  });
};

/** Shared invalidation helper for after-mutation refreshes. */
export const useInvalidatePayments = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['membership-payments'] });
  }, [queryClient]);
};