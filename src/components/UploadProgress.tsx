/**
 * Component to show upload progress and processing status
 */

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { StatusBadge } from './StatusBadge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { useVideoStatus } from '../hooks/useVideoStatus';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ForwardedLink } from './ForwardedLink';

interface UploadProgressProps {
  videoId: string;
  videoTitle: string;
  estimatedTime?: string;
  onComplete?: () => void;
}

export function UploadProgress({
  videoId,
  videoTitle,
  estimatedTime,
  onComplete,
}: UploadProgressProps) {
  const { data: status, isLoading } = useVideoStatus(videoId);

  useEffect(() => {
    if (status?.status === 'ready' && onComplete) {
      onComplete();
    }
  }, [status?.status, onComplete]);

  if (isLoading || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Video</CardTitle>
          <CardDescription>Loading status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { status: videoStatus, progress, errorMessage } = status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{videoTitle}</CardTitle>
            <CardDescription>Processing status</CardDescription>
          </div>
          <StatusBadge status={videoStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar for processing */}
        {(videoStatus === 'processing' || videoStatus === 'pending') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Status-specific messages */}
        {videoStatus === 'pending' && (
          <Alert>
            <Clock className="size-4" />
            <AlertTitle>Waiting to process</AlertTitle>
            <AlertDescription>
              Your video is in the queue. {estimatedTime && `Estimated time: ${estimatedTime}`}
            </AlertDescription>
          </Alert>
        )}

        {videoStatus === 'processing' && (
          <Alert>
            <Clock className="size-4" />
            <AlertTitle>Processing in progress</AlertTitle>
            <AlertDescription>
              Your video is being transcoded. This may take a few minutes.
            </AlertDescription>
          </Alert>
        )}

        {videoStatus === 'ready' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertTitle className="text-green-600">Ready to watch!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your video has been processed and is ready for streaming.
            </AlertDescription>
          </Alert>
        )}

        {videoStatus === 'failed' && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Processing failed</AlertTitle>
            <AlertDescription>
              {errorMessage || 'An error occurred while processing your video.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button asChild variant={videoStatus === 'ready' ? 'default' : 'outline'}>
            <ForwardedLink to={`/video/${videoId}`}>View Video</ForwardedLink>
          </Button>
          <Button asChild variant="outline">
            <ForwardedLink to="/">Back to Library</ForwardedLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
