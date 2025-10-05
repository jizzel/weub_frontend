/**
 * React Query hooks for video listing and search
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { mockVideosList } from '../lib/mockData';
import { useDemoMode } from './useDemoMode';
import type { VideosListData, VideosQueryParams } from '../types/api';

export function useVideos(params: VideosQueryParams = {}): UseQueryResult<VideosListData, Error> {
  const { setDemoMode } = useDemoMode();

  return useQuery<VideosListData, Error, VideosListData>({
    queryKey: ['videos', params],
    queryFn: async (): Promise<VideosListData> => {
      try {
        const response = await apiClient.listVideos(params);
        setDemoMode(false);
        console.log('✅ Connected to backend API');
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
