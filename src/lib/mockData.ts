/**
 * Mock data for development and demo purposes
 * Used when backend API is not available
 */

import type { VideosListData, VideoData, StatsData, HealthData } from '../types/api';

export const mockVideos: VideoData[] = [
  {
    id: 'demo-1',
    title: 'Welcome to Weub',
    description: 'This is a demo video showing the platform capabilities. Connect to the backend API to see real data.',
    status: 'ready',
    duration: 125,
    fileSize: 95769222,
    tags: ['demo', 'welcome'],
    thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=640',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    processedAt: new Date(Date.now() - 86300000).toISOString(),
    availableResolutions: ['1080p', '720p', '480p'],
    streamingUrls: {
      '1080p': '/demo/playlist.m3u8',
      '720p': '/demo/playlist.m3u8',
      '480p': '/demo/playlist.m3u8',
    },
  },
  {
    id: 'demo-2',
    title: 'Sample Video Processing',
    description: 'Example of a video currently being processed',
    status: 'processing',
    duration: 357,
    fileSize: 18250978,
    tags: ['sample', 'processing'],
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    processedAt: null,
    availableResolutions: [],
    streamingUrls: {},
  },
  {
    id: 'demo-3',
    title: 'Tutorial: Getting Started',
    description: 'Learn how to upload and manage videos on the platform',
    status: 'ready',
    duration: 27,
    fileSize: 6376080,
    tags: ['tutorial', 'getting-started'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    processedAt: new Date(Date.now() - 172700000).toISOString(),
    availableResolutions: ['1080p', '720p'],
    streamingUrls: {
      '1080p': '/demo/tutorial.m3u8',
      '720p': '/demo/tutorial.m3u8',
    },
  },
];

export const mockVideosList: VideosListData = {
  items: mockVideos,
  pagination: {
    currentPage: '1',
    totalPages: 1,
    totalItems: mockVideos.length,
    itemsPerPage: '12',
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const mockStats: StatsData = {
  totalUploads: 42,
  successful: 39,
  failed: 3,
  storageUsedMB: 2560,
  mostPopularResolutions: [
    { resolution: '1080p', count: 25 },
    { resolution: '720p', count: 12 },
    { resolution: '480p', count: 5 },
  ],
};

export const mockHealth: HealthData = {
  status: 'demo',
  uptime: 'Demo Mode',
  timestamp: new Date().toISOString(),
};
