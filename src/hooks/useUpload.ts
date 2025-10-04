/**
 * React Query mutation hook for video uploads
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { UploadResponseData, UploadPayload } from '../types/api';
import { toast } from 'sonner@2.0.3';

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation<UploadResponseData, Error, UploadPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.uploadVideo(payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate videos list to show new upload
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video uploaded successfully', {
        description: `Processing will take approximately ${data.estimatedProcessingTime}`,
      });
    },
    onError: (error) => {
      toast.error('Upload failed', {
        description: error.message,
      });
    },
  });
}
