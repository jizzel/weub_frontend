/**
 * Central API client with error handling, retry logic, and response normalization
 * Uses VITE_API_BASE_URL from environment
 */

import type { ApiResponse, UploadPayload } from '../types/api';

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

interface RequestOptions extends Omit<RequestInit, 'body'> {
  retries?: number;
  retryDelay?: number;
  body?: RequestInit['body'] | object;
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
 * Core fetch wrapper with retry logic and body serialization.
 */
async function apiFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers);
  let body: RequestInit['body'] | undefined;

  if (fetchOptions.body) {
    if (fetchOptions.body instanceof FormData || fetchOptions.body instanceof Blob || fetchOptions.body instanceof URLSearchParams) {
      body = fetchOptions.body;
    } else if (typeof fetchOptions.body === 'object') {
      body = JSON.stringify(fetchOptions.body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    } else {
      body = fetchOptions.body as BodyInit;
    }
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  const finalFetchOptions: RequestInit = {
    ...fetchOptions,
    headers,
    body,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { 
        ...finalFetchOptions,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const data: ApiResponse<T> = await response.json();

      if (data.error) {
        throw new ApiError(data.error, data.statusCode, data);
      }

      if (!response.ok) {
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

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Request timed out');
      }

      if (error instanceof ApiError && !isTransientError(error.statusCode)) {
        throw error;
      }

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
  async uploadVideo(payload: UploadPayload) {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.tags && payload.tags.length > 0) {
      payload.tags.forEach(tag => formData.append('tags', tag));
    }

    return apiFetch(`${BASE_URL}/api/v1/videos/upload`, {
      method: 'POST',
      body: formData,
      retries: 1, // Don't retry uploads by default
    });
  },

  /**
   * Get processing status for a video
   */
  async getVideoStatus(id: string, retries: number = 3) {
    return apiFetch(`${BASE_URL}/api/v1/videos/${id}/status`, {
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

    const url = `${BASE_URL}/api/v1/videos?${queryParams.toString()}`;
    return apiFetch(url);
  },

  /**
   * Get video details and playback information
   */
  async getVideo(id: string) {
    return apiFetch(`${BASE_URL}/api/v1/videos/${id}`);
  },

  /**
   * Delete a video
   */
  async deleteVideo(id: string) {
    return apiFetch(`${BASE_URL}/api/v1/videos/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get system statistics
   */
  async getStats() {
    return apiFetch(`${BASE_URL}/api/v1/stats`);
  },

  /**
   * Health check
   */
  async getHealth() {
    return apiFetch(`${BASE_URL}/api/v1/health`);
  },
};

/**
 * Helper to build full URL for static assets
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
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
