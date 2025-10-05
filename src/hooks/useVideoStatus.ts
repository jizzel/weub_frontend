/**
 * React Query hook for polling video processing status
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { VideoStatusData } from '../types/api';

export function useVideoStatus(
  id: string | undefined,
  options: {
    enabled?: boolean;
    pollingInterval?: number;
  } = {}
): UseQueryResult<VideoStatusData, Error> {
  const { enabled = true, pollingInterval = 5000 } = options;

  return useQuery<VideoStatusData, Error, VideoStatusData>({
    queryKey: ['videoStatus', id],
    queryFn: async (): Promise<VideoStatusData> => {
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
      // Continue polling at a fixed interval
      return pollingInterval;
    },
    refetchOnWindowFocus: false,
  });
}
