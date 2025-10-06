/**
 * React Query mutation hook for deleting a video.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { toast } from 'sonner';

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (id: string) => apiClient.deleteVideo(id),
    onSuccess: () => {
      toast.success('Video deleted successfully');
      // Invalidate and refetch the videos query to update the list
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error) => {
      toast.error('Failed to delete video', {
        description: error.message,
      });
    },
  });
}
