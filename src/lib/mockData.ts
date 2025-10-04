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
    thumbnailUrl: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=640',
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
    availableResolutions: ['480p', '720p', '1080p'],
    playlistUrl: '/demo/playlist.m3u8',
    tags: ['demo', 'welcome'],
  },
  {
    id: 'demo-2',
    title: 'Sample Video Processing',
    description: 'Example of a video currently being processed',
    status: 'processing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640',
    uploadDate: new Date(Date.now() - 3600000).toISOString(),
    availableResolutions: [],
    playlistUrl: '',
    tags: ['sample', 'processing'],
  },
  {
    id: 'demo-3',
    title: 'Tutorial: Getting Started',
    description: 'Learn how to upload and manage videos on the platform',
    status: 'ready',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640',
    uploadDate: new Date(Date.now() - 172800000).toISOString(),
    availableResolutions: ['720p', '1080p'],
    playlistUrl: '/demo/tutorial.m3u8',
    tags: ['tutorial', 'getting-started'],
  },
];

export const mockVideosList: VideosListData = {
  videos: mockVideos,
  pagination: {
    page: 1,
    limit: 12,
    total: mockVideos.length,
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
