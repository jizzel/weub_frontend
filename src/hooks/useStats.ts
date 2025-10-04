/**
 * React Query hooks for system stats and health
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { mockStats, mockHealth } from '../lib/mockData';
import type { StatsData, HealthData } from '../types/api';

export function useStats() {
  return useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: async () => {
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

export function useHealth() {
  return useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: async () => {
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
