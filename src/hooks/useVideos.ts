/**
 * React Query hooks for video listing and search
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { mockVideosList } from '../lib/mockData';
import { useDemoMode } from './useDemoMode';
import type { VideosListData, VideosQueryParams } from '../types/api';

export function useVideos(params: VideosQueryParams = {}) {
  const { setDemoMode } = useDemoMode();

  return useQuery<VideosListData>({
    queryKey: ['videos', params],
    queryFn: async () => {
      try {
        const response = await apiClient.listVideos(params);
        setDemoMode(false);
        console.log('✅ Connected to backend API');
        console.log(response)
        return response.data;
      } catch (error) {
        // Return mock data in demo mode when API is unavailable
        console.log('⚠️ Backend API unavailable, using demo mode:', error);
        setDemoMode(true);
        return mockVideosList;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
