/**
 * React Query hook for individual video details
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { VideoData } from '../types/api';

export function useVideo(id: string | undefined) {
  return useQuery<VideoData>({
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
