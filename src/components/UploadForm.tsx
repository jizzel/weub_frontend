/**
 * Video upload form component with validation and progress
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useUpload } from '../hooks/useUpload';
import { validateVideoFile, validateTitle, validateDescription, validateTags } from '../utils/validators';
import { parseTags } from '../utils/formatters';
import { Upload, AlertCircle, FileVideo } from 'lucide-react';

interface UploadFormProps {
  onSuccess?: (videoId: string) => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress] = useState(0);

  const uploadMutation = useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateVideoFile(selectedFile);
    if (!validation.valid) {
      setErrors({ ...errors, file: validation.error || 'Invalid file' });
      setFile(null);
      return;
    }

    setErrors({ ...errors, file: '' });
    setFile(selectedFile);
    
    // Auto-fill title from filename if empty
    if (!title) {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};

    if (!file) {
      newErrors.file = 'Please select a video file';
    }

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      newErrors.title = titleValidation.error || 'Invalid title';
    }

    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) {
      newErrors.description = descriptionValidation.error || 'Invalid description';
    }

    const tags = parseTags(tagsInput);
    const tagsValidation = validateTags(tags);
    if (!tagsValidation.valid) {
      newErrors.tags = tagsValidation.error || 'Invalid tags';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !file) {
      return;
    }

    // Submit upload
    uploadMutation.mutate(
      {
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (data) => {
          // Reset form
          setFile(null);
          setTitle('');
          setDescription('');
          setTagsInput('');
          setErrors({});
          
          // Call success callback
          if (onSuccess) {
            onSuccess(data.id);
          }
        },
      }
    );
  };

  const isUploading = uploadMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Upload your video and it will be processed for streaming
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Video File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".mp4,.mov,.webm,.avi"
                onChange={handleFileChange}
                disabled={isUploading}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileVideo className="size-4" />
                <span>{file.name}</span>
              </div>
            )}
            {errors.file && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{errors.file}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, WebM, AVI. Max size: 2GB
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              placeholder="Enter video title"
            />
            {errors.title && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{errors.title}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              placeholder="Enter video description (optional)"
              rows={4}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{errors.description}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isUploading}
              placeholder="travel, vlog, music (comma-separated)"
            />
            {errors.tags && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{errors.tags}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Separate tags with commas. Max 10 tags.
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isUploading || !file} className="w-full">
            <Upload className="mr-2 size-4" />
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
