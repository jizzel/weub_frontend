/**
 * React Query hook for individual video details
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { VideoDetailData } from '../types/api';

export function useVideo(id: string | undefined): UseQueryResult<VideoDetailData, Error> {
  return useQuery<VideoDetailData, Error, VideoDetailData>({
    queryKey: ['video', id],
    queryFn: async () => {
      if (!id) throw new Error('Video ID is required');
      const response = await apiClient.getVideo(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });
}
