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

// Video Status response
export interface VideoStatusData {
  id: string;
  status: VideoStatus;
  progress: number;
  estimatedTimeRemaining: string;
  completedResolutions: string[];
  failedResolutions: string[];
  lastUpdated: string;
}

// Video metadata
export interface VideoData {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  duration: number;
  fileSize: number;
  tags: string[];
  thumbnail: string;
  createdAt: string;
  processedAt: string | null;
  availableResolutions: string[];
  streamingUrls: Record<string, string>;
}

export interface VideoDetailData extends Omit<VideoData, 'streamingUrls' | 'thumbnail' > {
  originalFilename: string;
  mimeType: string;
  outputs: Array<{
    resolution: string;
    width: number;
    height: number;
    bitrate: number;
    fileSize: number;
    status: VideoStatus;
    playlistUrl: string;
  }>;
  streamingUrls: Record<string, string>;
  thumbnail: string;
}

// List videos response
export interface VideosListData {
  items: VideoData[];
  pagination: {
    currentPage: string;
    totalPages: number;
    totalItems: number;
    itemsPerPage: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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
