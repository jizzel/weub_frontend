# API Mapping Documentation

This document maps each frontend feature to the exact backend API endpoint defined in `/docs/docs.yaml`.

## Overview

All API responses follow this standard format:
```typescript
{
  data: T,           // Main payload
  statusCode: number, // HTTP status code
  error: string | null // Error message or null
}
```

Base URL: Configured via `VITE_API_BASE_URL` environment variable

## Frontend to API Mapping

### 1. Video Upload

**Frontend Component**: `UploadForm.tsx`  
**Hook**: `useUpload` (hooks/useUpload.ts)  
**API Client Method**: `apiClient.uploadVideo()`

**API Endpoint**:
- **Method**: `POST`
- **Path**: `/api/v1/videos/upload`
- **Request Type**: `multipart/form-data`
- **Request Body**:
  ```typescript
  {
    file: File,           // Required - Video file
    title: string,        // Required - Video title
    description?: string, // Optional - Video description
    tags?: string[]       // Optional - Array of tags
  }
  ```
- **Response**:
  ```typescript
  {
    data: {
      id: string,                      // UUID of created video
      title: string,                   // Video title
      status: 'pending',               // Initial status
      estimatedProcessingTime: string  // Human-readable time estimate
      uploadedAt: string,
      fileSize: number,
    },
    statusCode: 201,
    error: null
  }
  ```

### 2. Video Processing Status

**Frontend Component**: `UploadProgress.tsx`  
**Hook**: `useVideoStatus` (hooks/useVideoStatus.ts)  
**API Client Method**: `apiClient.getVideoStatus()`

**API Endpoint**:
- **Method**: `GET`
- **Path**: `/api/v1/videos/:id/status`
- **Path Parameters**:
  - `id`: Video UUID
- **Response**:
  ```typescript
  {
    data: {
      id: string,                    // Video UUID
      status: VideoStatus,           // 'pending' | 'processing' | 'ready' | 'failed'
      progress: number,              // 0-100
      retryCount: number,            // Number of processing retries
      errorMessage: string | null    // Error details if failed
    },
    statusCode: 200,
    error: null
  }
  ```
- **Frontend Behavior**: 
  - Polls every 5 seconds (with exponential backoff)
  - Stops polling when status is 'ready' or 'failed'
  - Uses retry count to adjust polling interval

### 3. List Videos

**Frontend Page**: `Home.tsx`  
**Hook**: `useVideos` (hooks/useVideos.ts)  
**API Client Method**: `apiClient.listVideos()`

**API Endpoint**:
- **Method**: `GET`
- **Path**: `/api/v1/videos`
- **Query Parameters**:
  ```typescript
  {
    page?: number,        // Default: 1
    limit?: number,       // Default: 10, Frontend uses: 12
    title?: string,       // Partial match filter
    fromDate?: string,    // ISO date string
    toDate?: string,      // ISO date string
    resolution?: string,  // e.g., '720p', '1080p'
    tags?: string         // Comma-separated list
  }
  ```
- **Response**:
  ```typescript
import {number} from "prop-types"; 
  {
    data: {
      items: Array<{
        id: string,
        title: string,
        description: string,
        status: VideoStatus,
        duration: number,
        fileSize: number,
        thumbnail: string,
        createdAt: string,              // ISO date
        processedAt: string,
        availableResolutions: string[],  // ['480p', '720p', '1080p']
        streamingUrls: {},             // HLS master playlist path
        tags: string[]
      }>,
      pagination: {
        currentPage: number,
        totalPages: number,
        totalItems: number,
        itemsPerPage: number,
        hasNextPage: boolean,
        hasPreviousPage: boolean
      }
    },
    statusCode: 200,
    error: null
  }
  ```

### 4. Get Video Details

**Frontend Page**: `VideoDetail.tsx`  
**Hook**: `useVideo` (hooks/useVideo.ts)  
**API Client Method**: `apiClient.getVideo()`

**API Endpoint**:
- **Method**: `GET`
- **Path**: `/api/v1/videos/:id`
- **Path Parameters**:
  - `id`: Video UUID
- **Response**:
  ```typescript
  {
    data: {
      id: string,
      title: string,
      description: string,
      status: VideoStatus,
      createdAt: string,
      processedAt: string,
      availableResolutions: string[],
      playlistUrl: string,  // Used by HLS player
      tags: string[]
    },
    statusCode: 200,
    error: null
  }
  ```
- **Frontend Behavior**: 
  - Displays metadata and player if status is 'ready'
  - Shows processing status component otherwise
  - Passes `playlistUrl` to hls.js Player component

### 5. System Statistics

**Frontend Page**: `Stats.tsx`  
**Hook**: `useStats` (hooks/useStats.ts)  
**API Client Method**: `apiClient.getStats()`

**API Endpoint**:
- **Method**: `GET`
- **Path**: `/api/v1/stats`
- **Response**:
  ```typescript
  {
    data: {
      totalUploads: number,
      successful: number,
      failed: number,
      storageUsedMB: number,
      mostPopularResolutions: Array<{
        resolution: string,
        count: number
      }>
    },
    statusCode: 200,
    error: null
  }
  ```
- **Frontend Behavior**: 
  - Displays stats in cards
  - Renders bar chart for resolution distribution
  - Caches for 1 minute (staleTime: 60000)

### 6. Health Check

**Frontend Page**: `Stats.tsx`  
**Hook**: `useHealth` (hooks/useStats.ts)  
**API Client Method**: `apiClient.getHealth()`

**API Endpoint**:
- **Method**: `GET`
- **Path**: `/api/v1/health`
- **Response**:
  ```typescript
  {
    data: {
      status: string,     // e.g., 'ok'
      uptime: string,     // Human-readable uptime
      timestamp: string   // ISO date
    },
    statusCode: 200,
    error: null
  }
  ```
- **Frontend Behavior**: 
  - Displays system status badge on Stats page
  - Shows uptime information

## Error Handling

### API Client Error Handling

The `apiClient.ts` implements comprehensive error handling:

1. **Response Error Field**: Checks `response.error` and throws if present
2. **HTTP Status Codes**: Throws on non-2xx responses
3. **Retry Logic**: Retries transient errors (408, 429, 5xx) with exponential backoff
4. **Network Errors**: Catches and retries network failures

### Frontend Error Display

- **Toast Notifications**: Success/error toasts via `sonner`
- **Alert Components**: Inline error alerts on pages
- **Error Boundary**: Catches uncaught React errors

## Caching Strategy

React Query configuration:

```typescript
{
  videos: {
    staleTime: 30000,     // 30 seconds
    refetchOnWindowFocus: true
  },
  video: {
    staleTime: 10000,     // 10 seconds
    refetchOnWindowFocus: true
  },
  videoStatus: {
    refetchInterval: dynamic, // 5-30s with backoff
    refetchOnWindowFocus: false
  },
  stats: {
    staleTime: 60000,     // 1 minute
    retry: 2
  },
  health: {
    staleTime: 30000,     // 30 seconds
    retry: 1
  }
}
```

## Validation

### Client-side Validation (Before API Call)

**File Upload**:
- Format: `.mp4`, `.mov`, `.webm`, `.avi`
- Size: Max 2GB
- Required: Yes

**Title**:
- Required: Yes
- Max length: 200 characters

**Description**:
- Required: No
- Max length: 5000 characters

**Tags**:
- Required: No
- Max count: 10
- Max length per tag: 50 characters

## Asset URL Handling

Static assets (thumbnails, videos) are served with paths relative to the backend:

```typescript
function getAssetUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}
```

Example:
- API returns: `/static/thumbnails/a19b3f4a.jpg`
- Frontend converts to: `http://localhost:3000/static/thumbnails/a19b3f4a.jpg`

## HLS Playback

The `Player.tsx` component uses `playlistUrl` from video data:

1. Converts relative URL to absolute: `getAssetUrl(playlistUrl)`
2. Loads HLS stream with hls.js (or native on Safari)
3. Extracts available quality levels from manifest
4. Allows manual quality selection

Example playlist URL: `/videos/a19b3f4a/master.m3u8`

## Notes and Assumptions

1. **UUID Format**: All video IDs are UUIDs (v4)
2. **Date Format**: All dates are ISO 8601 strings
3. **Pagination**: Frontend uses 12 items per page (overriding API default of 10)
4. **Tag Format**: Tags are sent as array in upload, comma-separated string in filters
5. **Status Polling**: Maximum 30-second interval to avoid excessive load
6. **Retry Limits**: 3 retries for most endpoints, 1 for uploads
7. **Base URL**: Must not have trailing slash

## Testing Checklist

- [ ] Upload video and verify all form data is sent correctly
- [ ] Verify status polling stops when video is ready/failed
- [ ] Test all filter combinations in video list
- [ ] Verify pagination calculations are correct
- [ ] Test HLS playback on multiple browsers
- [ ] Verify error responses are displayed as user-friendly messages
- [ ] Test retry logic with network interruptions
- [ ] Verify asset URLs are constructed correctly
- [ ] Test keyboard navigation and accessibility
- [ ] Verify stats chart renders correctly

## Migration Notes

If discrepancies are found between this documentation and the actual backend API:

1. Report discrepancies with endpoint, expected vs actual
2. Update this documentation
3. Add TODO comments in code with explanation
4. Implement temporary mock/fallback if needed
5. Continue with rest of implementation

Currently, no discrepancies have been identified. The implementation matches the API specification in `/docs/docs.yaml`.
