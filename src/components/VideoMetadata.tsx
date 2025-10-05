/**
 * Component for displaying detailed video metadata
 */

import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { formatFileSize, formatDuration } from '../utils/formatters';
import type { VideoDetailData } from '../types/api';

interface VideoMetadataProps {
  video: VideoDetailData;
}

export function VideoMetadata({ video }: VideoMetadataProps) {
  const metadataItems = [
    { label: 'File Size', value: formatFileSize(video.fileSize) },
    { label: 'Duration', value: formatDuration(video.duration) },
    { label: 'Original Filename', value: video.originalFilename },
    { label: 'MIME Type', value: video.mimeType },
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      {video.description && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {video.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold">Details</h3>
            <ul className="space-y-2 text-sm">
              {metadataItems.map(item => (
                <li key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-right break-all">{item.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Available Resolutions */}
          {video.availableResolutions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold">Available Resolutions</h3>
                <div className="flex flex-wrap gap-2">
                  {video.availableResolutions.map((resolution) => (
                    <Badge key={resolution} variant="secondary">
                      {resolution}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
