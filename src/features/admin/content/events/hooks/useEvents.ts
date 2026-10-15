import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEventsList,
  getEventDetails,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  EventsFilterParams,
} from '../services/events.service';
import type { CreateEventFormState } from '../types/events.types';

export const EVENTS_QUERY_KEYS = {
  all: ['events'] as const,
  list: (params?: EventsFilterParams) => ['events', 'list', params] as const,
  details: (id: string) => ['events', 'details', id] as const,
};

export const useEvents = (params?: EventsFilterParams) => {
  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.list(params),
    queryFn: () => getEventsList(params),
    staleTime: 20_000,
  });
};

export const useEventDetails = (id: string) => {
  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.details(id),
    queryFn: () => getEventDetails(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateEventFormState) => createEventApi(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: CreateEventFormState }) =>
      updateEventApi(id, form),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEYS.details(variables.id),
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
    },
  });
};

export const useRefreshEvents = (params?: EventsFilterParams) => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: EVENTS_QUERY_KEYS.list(params),
    });
  }, [queryClient, params]);
};
