/**
 * React Query hooks for system stats and health
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { mockStats, mockHealth } from '../lib/mockData';
import type { StatsData, HealthData } from '../types/api';

export function useStats(): UseQueryResult<StatsData, Error> {
  return useQuery<StatsData, Error, StatsData>({
    queryKey: ['stats'],
    queryFn: async (): Promise<StatsData> => {
      try {
        const response = await apiClient.getStats();
        return response.data;
      } catch (error) {
        // Return mock stats in demo mode
        return mockStats;
      }
    },
    staleTime: 60000, // 1 minute
    retry: 0,
  });
}

export function useHealth(): UseQueryResult<HealthData, Error> {
  return useQuery<HealthData, Error, HealthData>({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthData> => {
      try {
        const response = await apiClient.getHealth();
        return response.data;
      } catch (error) {
        // Return mock health in demo mode
        return mockHealth;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 0,
  });
}
