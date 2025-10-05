/**
 * Video card component for displaying video in lists
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/badge';
import type { VideoData } from '../types/api';
import { formatRelativeTime } from '../utils/formatters';
import { getAssetUrl } from '../lib/apiClient';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  video: VideoData;
}

export function VideoCard({ video }: VideoCardProps) {
  const thumbnailUrl = video.thumbnail
    ? getAssetUrl(video.thumbnail)
    : 'https://placehold.co/640x360/1a1a1a/666?text=No+Thumbnail';

  return (
    <Link to={`/video/${video.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {video.status === 'ready' && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white rounded-full p-3">
                <Play className="size-6 text-black fill-black" />
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={video.status} />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2">{video.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {video.description || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              {formatRelativeTime(video.createdAt)}
            </p>
            {video.availableResolutions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.availableResolutions.map((resolution) => (
                  <Badge key={resolution} variant="outline" className="text-xs">
                    {resolution}
                  </Badge>
                ))}
              </div>
            )}
            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{video.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
