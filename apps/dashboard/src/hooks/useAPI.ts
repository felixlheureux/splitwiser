import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createAPI } from '../features/api/options';

export function useAPI() {
  const queryClient = useQueryClient();
  return useMemo(() => createAPI(queryClient, window.location.origin), [queryClient]);
}
