/**
 * React Query mutation hook for video uploads
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import type { UploadResponseData, UploadPayload } from '../types/api';
import { toast } from 'sonner';

export function useUpload() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

      // Redirect to the new video's detail page
      navigate(`/video/${data.id}`);
    },
    onError: (error) => {
      toast.error('Upload failed', {
        description: error.message,
      });
    },
  });
}
