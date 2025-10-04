/**
 * Central API client with error handling, retry logic, and response normalization
 * Uses VITE_API_BASE_URL from environment
 */

import type { ApiResponse } from '../types/api';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Exponential backoff delay calculation
 */
function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Check if error is transient and should be retried
 */
function isTransientError(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Core fetch wrapper with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        ...fetchOptions,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const data: ApiResponse<T> = await response.json();

      // Check if response has error field set
      if (data.error) {
        throw new ApiError(data.error, data.statusCode, data);
      }

      // Check for non-2xx status codes
      if (!response.ok) {
        // Retry transient errors
        if (attempt < retries && isTransientError(response.status)) {
          await new Promise(resolve =>
            setTimeout(resolve, getRetryDelay(attempt, retryDelay))
          );
          continue;
        }
        throw new ApiError(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      // Handle abort errors (timeouts)
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Request timed out');
      }

      // Don't retry if it's not a transient error
      if (error instanceof ApiError && !isTransientError(error.statusCode)) {
        throw error;
      }

      // Retry on network errors
      if (attempt < retries) {
        await new Promise(resolve =>
          setTimeout(resolve, getRetryDelay(attempt, retryDelay))
        );
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * Upload a video file with metadata
   */
  async uploadVideo(payload: {
    file: File;
    title: string;
    description?: string;
    tags?: string[];
  }) {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.tags && payload.tags.length > 0) {
      payload.tags.forEach(tag => formData.append('tags', tag));
    }

    return fetchWithRetry(`${BASE_URL}/api/v1/videos/upload`, {
      method: 'POST',
      body: formData,
      retries: 1, // Don't retry uploads by default
    });
  },

  /**
   * Get processing status for a video
   * Supports polling with exponential backoff
   */
  async getVideoStatus(id: string, retries: number = 3) {
    return fetchWithRetry(`${BASE_URL}/api/v1/videos/${id}/status`, {
      retries,
      retryDelay: 2000,
    });
  },

  /**
   * List and search videos with pagination and filters
   */
  async listVideos(params: {
    page?: number;
    limit?: number;
    title?: string;
    fromDate?: string;
    toDate?: string;
    resolution?: string;
    tags?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `${BASE_URL}/api/v1/videos${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    return fetchWithRetry(url);
  },

  /**
   * Get video details and playback information
   */
  async getVideo(id: string) {
    return fetchWithRetry(`${BASE_URL}/api/v1/videos/${id}`);
  },

  /**
   * Get system statistics
   */
  async getStats() {
    return fetchWithRetry(`${BASE_URL}/api/v1/stats`);
  },

  /**
   * Health check
   */
  async getHealth() {
    return fetchWithRetry(`${BASE_URL}/api/v1/health`);
  },
};

/**
 * Helper to build full URL for static assets
 */
export function getAssetUrl(path: string): string {
  console.log(path)
  if (path?.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

/**
 * Test connection to backend API
 * Usage: Open console and run: testConnection()
 */
export async function testConnection() {
  console.log('🔍 Testing connection to:', BASE_URL);
  try {
    const response = await fetch(`${BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connected successfully!');
      console.log('Response:', data);
      return { success: true, data };
    } else {
      console.error('❌ Backend returned error status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend:', error);
    return { success: false, error };
  }
}

// Expose testConnection globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testConnection = testConnection;
}
