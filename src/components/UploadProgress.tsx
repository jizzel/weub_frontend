/**
 * Component to show video processing status with real-time updates.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { StatusBadge } from './StatusBadge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useVideoStatus } from '../hooks/useVideoStatus';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface UploadProgressProps {
  videoId: string;
  videoTitle: string;
}

export function UploadProgress({ videoId, videoTitle }: UploadProgressProps) {
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useVideoStatus(videoId);

  useEffect(() => {
    // When processing is complete, invalidate the video query to trigger a re-render
    // on the parent page, which will then show the player.
    if (status?.status === 'ready') {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    }
  }, [status?.status, videoId, queryClient]);

  if (isLoading || !status) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Status...</CardTitle>
          <CardDescription>Fetching the latest video processing details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status: videoStatus, progress, estimatedTimeRemaining, failedResolutions } = status;

  const renderContent = () => {
    switch (videoStatus) {
      case 'pending':
      case 'processing':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>{videoStatus === 'pending' ? 'Waiting in queue...' : 'Processing video...'}</span>
            </div>
            <div className="space-y-2">
              <Progress value={progress} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}% complete</span>
                {estimatedTimeRemaining && <span>{estimatedTimeRemaining}</span>}
              </div>
            </div>
          </div>
        );
      case 'ready':
        return (
          <Alert className="border-green-500 bg-green-50/50 dark:bg-green-950/50">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertTitle className="text-green-600">Processing Complete!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your video is ready. The page will update shortly...
            </AlertDescription>
          </Alert>
        );
      case 'failed':
        return (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Processing Failed</AlertTitle>
            <AlertDescription>
              Unfortunately, we couldn't process this video.
              {failedResolutions.length > 0 && ` Failed resolutions: ${failedResolutions.join(', ')}`}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="line-clamp-2">{videoTitle}</CardTitle>
            <CardDescription>Video ID: {videoId}</CardDescription>
          </div>
          <StatusBadge status={videoStatus} />
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
