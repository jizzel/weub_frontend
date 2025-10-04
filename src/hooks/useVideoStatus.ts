/**
 * React Query hook for polling video processing status
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { ProcessingStatusData } from '../types/api';

export function useVideoStatus(
  id: string | undefined,
  options: {
    enabled?: boolean;
    pollingInterval?: number;
  } = {}
) {
  const { enabled = true, pollingInterval = 5000 } = options;

  return useQuery<ProcessingStatusData>({
    queryKey: ['videoStatus', id],
    queryFn: async () => {
      if (!id) throw new Error('Video ID is required');
      const response = await apiClient.getVideoStatus(id);
      return response.data;
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if status is ready or failed
      if (data?.status === 'ready' || data?.status === 'failed') {
        return false;
      }
      // Use exponential backoff based on retry count
      const baseInterval = pollingInterval;
      const retryCount = data?.retryCount || 0;
      return Math.min(baseInterval * Math.pow(1.5, retryCount), 30000);
    },
    refetchOnWindowFocus: false,
  });
}
