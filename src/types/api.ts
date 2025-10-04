/**
 * TypeScript types derived from /docs/docs.yaml
 * All API responses follow { data, statusCode, error } structure
 */

// Base API response wrapper
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  error: string | null;
}

// Video status enum
export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed';

// Upload response
export interface UploadResponseData {
  id: string;
  title: string;
  status: VideoStatus;
  estimatedProcessingTime: string;
}

// Processing status response
export interface ProcessingStatusData {
  id: string;
  status: VideoStatus;
  progress: number;
  retryCount: number;
  errorMessage: string | null;
}

// Video metadata
export interface VideoData {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  thumbnailUrl?: string;
  uploadDate: string;
  availableResolutions: string[];
  playlistUrl: string;
  tags: string[];
}

// List videos response
export interface VideosListData {
  videos: VideoData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Stats response
export interface StatsData {
  totalUploads: number;
  successful: number;
  failed: number;
  storageUsedMB: number;
  mostPopularResolutions: Array<{
    resolution: string;
    count: number;
  }>;
}

// Health check response
export interface HealthData {
  status: string;
  uptime: string;
  timestamp: string;
}

// Upload request payload
export interface UploadPayload {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
}

// List videos query params
export interface VideosQueryParams {
  page?: number;
  limit?: number;
  title?: string;
  fromDate?: string;
  toDate?: string;
  resolution?: string;
  tags?: string;
}
