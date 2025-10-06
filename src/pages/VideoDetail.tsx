/**
 * Video detail page with player and metadata
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideo } from '../hooks/useVideo';
import { useDeleteVideo } from '../hooks/useDeleteVideo';
import { Player } from '../components/Player';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, Calendar, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { UploadProgress } from '../components/UploadProgress';
import { ForwardedLink } from '../components/ForwardedLink';
import { VideoMetadata } from '../components/VideoMetadata';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: video, isLoading, error } = useVideo(id);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteVideo();

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigate('/');
      },
      onSettled: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="aspect-video w-full mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-4">
          <ForwardedLink to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Library
          </ForwardedLink>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error loading video</AlertTitle>
          <AlertDescription>
            {error?.message || 'Video not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" asChild className="mb-6">
        <ForwardedLink to="/">
          <ArrowLeft className="mr-2 size-4" />
          Back to Library
        </ForwardedLink>
      </Button>

      {video.status === 'ready' ? (
        <div className="mb-6">
          <Player videoData={video} />
        </div>
      ) : (
        <div className="mb-6">
          <UploadProgress
            videoId={video.id}
            videoTitle={video.title}
          />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="flex-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {video.title}
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={video.status} />
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              <span>Uploaded {formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>

        {video.status === 'ready' ? (
          <VideoMetadata video={video} />
        ) : (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Video not ready</AlertTitle>
            <AlertDescription>
              This video is still being processed. Full metadata and playback will be available once processing is complete.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Button onClick={handleDelete}>Delete</Button>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video "{video.title}" and all of its associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
