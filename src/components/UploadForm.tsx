/**
 * Video upload form component with validation and progress
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useUpload } from '../hooks/useUpload';
import { validateVideoFile, validateTitle, validateDescription, validateTags } from '../utils/validators';
import { parseTags } from '../utils/formatters';
import { Upload, FileVideo, Loader2 } from 'lucide-react';

interface FormErrors {
  file?: string;
  title?: string;
  description?: string;
  tags?: string;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const uploadMutation = useUpload();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const { valid, error } = validateVideoFile(selectedFile);
    if (!valid) {
      setErrors(prev => ({ ...prev, file: error }));
      setFile(null);
      e.target.value = ''; // Clear the input
      return;
    }

    setErrors(prev => ({ ...prev, file: undefined }));
    setFile(selectedFile);
    
    if (!title) {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!file) newErrors.file = 'Please select a video file';

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) newErrors.title = titleValidation.error;

    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) newErrors.description = descriptionValidation.error;

    const tags = parseTags(tagsInput);
    const tagsValidation = validateTags(tags);
    if (!tagsValidation.valid) newErrors.tags = tagsValidation.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!file) return;

    uploadMutation.mutate({
      file,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const isUploading = uploadMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Your video will be processed and made available for streaming.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Video File *</Label>
            <Input
              id="file"
              type="file"
              accept=".mp4,.mov,.webm,.avi"
              onChange={handleFileChange}
              disabled={isUploading}
              aria-invalid={!!errors.file}
              aria-describedby="file-error"
            />
            {file && !errors.file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <FileVideo className="size-4" />
                <span>{file.name}</span>
              </div>
            )}
            {errors.file && <p id="file-error" className="text-sm text-destructive pt-1">{errors.file}</p>}
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, WebM, AVI. Max size: 2GB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              placeholder="e.g., My Awesome Vacation"
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
            />
            {errors.title && <p id="title-error" className="text-sm text-destructive pt-1">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              placeholder="A brief summary of your video (optional)"
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby="description-error"
            />
            {errors.description && <p id="description-error" className="text-sm text-destructive pt-1">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isUploading}
              placeholder="e.g., travel, vlog, music (comma-separated)"
              aria-invalid={!!errors.tags}
              aria-describedby="tags-error"
            />
            {errors.tags && <p id="tags-error" className="text-sm text-destructive pt-1">{errors.tags}</p>}
            <p className="text-xs text-muted-foreground">
              Separate tags with commas. Max 10 tags, 50 chars per tag.
            </p>
          </div>

          <Button type="submit" disabled={isUploading || !file} className="w-full">
            {isUploading ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="mr-2 size-4" /> Upload Video</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
