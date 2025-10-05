/**
 * Central API client with error handling, retry logic, and response normalization
 * Uses VITE_API_BASE_URL from environment
 */

import type { ApiResponse, UploadPayload, VideosQueryParams } from '../types/api';

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
  timeout?: number; // Timeout in milliseconds. 0 to disable.
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
  const { retries = 3, retryDelay = 1000, timeout = 10000, ...fetchOptions } = options;
  
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
      const timeoutId = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : undefined;

      const response = await fetch(url, { 
        ...finalFetchOptions,
        signal: controller.signal 
      });
      
      if (timeoutId) clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json();

      if (data.error) {
        throw new ApiError(data.error, data.statusCode, data);
      }

      if (!response.ok) {
        if (attempt < retries && isTransientError(response.status)) {
          await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
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
        lastError = new Error(`Request timed out after ${timeout / 1000}s`);
      }

      if (error instanceof ApiError && !isTransientError(error.statusCode)) {
        throw error;
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
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
      retries: 1,
      timeout: 0, // Disable timeout for file uploads
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

  async listVideos(params: VideosQueryParams) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const url = `${BASE_URL}/api/v1/videos?${searchParams.toString()}`;
    return apiFetch(url);
  },

  /**
   * Get video details and playback information
   */
  async getVideo(id: string) {
    return apiFetch(`${BASE_URL}/api/v1/videos/${id}`);
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
