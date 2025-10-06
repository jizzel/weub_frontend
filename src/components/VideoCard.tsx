/**
 * Video card component for displaying video in lists
 */

import { memo, useState, MouseEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/badge';
import type { VideoData } from '../types/api';
import { formatRelativeTime } from '../utils/formatters';
import { getAssetUrl } from '../lib/apiClient';
import { Play, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from './ui/alert-dialog';
import { useDeleteVideo } from '../hooks/useDeleteVideo';
import { Button } from './ui/button';

interface VideoCardProps {
  video: VideoData;
}

function VideoCardComponent({ video }: VideoCardProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteVideo();

  const thumbnailUrl = video.thumbnail
    ? getAssetUrl(video.thumbnail)
    : 'https://placehold.co/640x360/1a1a1a/666?text=No+Thumbnail';

  const handleDelete = () => {
    deleteMutation.mutate(video.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleMenuClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative group">
      <Link to={`/video/${video.id}`} className="block">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
            <div className="absolute top-2 right-2 z-10">
              <StatusBadge status={video.status} />
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle className="line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="line-clamp-2 pt-1">
                {video.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <div className="flex flex-col gap-3">
                <p className="text-muted-foreground text-sm">
                  {formatRelativeTime(video.createdAt)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {video.availableResolutions.map((resolution) => (
                    <Badge key={resolution} variant="outline" className="text-xs">
                      {resolution}
                    </Badge>
                  ))}
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
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
      <Button onClick={handleDelete}>Delete</Button>

      <div className="absolute top-2 right-2 z-20" onClick={handleMenuClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="size-8 rounded-full opacity-80 hover:opacity-100">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const VideoCard = memo(VideoCardComponent);
