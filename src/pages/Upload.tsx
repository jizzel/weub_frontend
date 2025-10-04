/**
 * Upload page for video upload and processing status
 */

import { useState } from 'react';
import { UploadForm } from '../components/UploadForm';
import { UploadProgress } from '../components/UploadProgress';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ForwardedLink } from '../components/ForwardedLink';

export function Upload() {
  const [uploadedVideo, setUploadedVideo] = useState<{
    id: string;
    title: string;
    estimatedTime?: string;
  } | null>(null);

  const handleUploadSuccess = (videoId: string) => {
    // This would ideally get the full response, but we'll set a placeholder
    setUploadedVideo({
      id: videoId,
      title: 'Uploaded Video',
      estimatedTime: '2-5 minutes',
    });
  };

  const handleProcessingComplete = () => {
    // Optional: redirect or show additional UI
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <ForwardedLink to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Library
          </ForwardedLink>
        </Button>
        <h1>Upload Video</h1>
        <p className="text-muted-foreground">
          Upload your video and we'll process it for streaming
        </p>
      </div>

      {/* Upload Form or Progress */}
      {!uploadedVideo ? (
        <UploadForm onSuccess={handleUploadSuccess} />
      ) : (
        <div className="space-y-6">
          <UploadProgress
            videoId={uploadedVideo.id}
            videoTitle={uploadedVideo.title}
            estimatedTime={uploadedVideo.estimatedTime}
            onComplete={handleProcessingComplete}
          />
          
          <Button
            variant="outline"
            onClick={() => setUploadedVideo(null)}
            className="w-full"
          >
            Upload Another Video
          </Button>
        </div>
      )}
    </div>
  );
}
