/**
 * Client-side validation utilities
 */

const ALLOWED_VIDEO_FORMATS = ['.mp4', '.mov', '.webm', '.avi'];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate video file format
 */
export function validateFileFormat(file: File): ValidationResult {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!ALLOWED_VIDEO_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed formats: ${ALLOWED_VIDEO_FORMATS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${formatBytes(MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true };
}

/**
 * Validate video file (format and size)
 */
export function validateVideoFile(file: File): ValidationResult {
  const formatResult = validateFileFormat(file);
  if (!formatResult.valid) {
    return formatResult;
  }

  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  return { valid: true };
}

/**
 * Validate title
 */
export function validateTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return {
      valid: false,
      error: 'Title is required',
    };
  }

  if (title.length > 200) {
    return {
      valid: false,
      error: 'Title must be less than 200 characters',
    };
  }

  return { valid: true };
}

/**
 * Validate description
 */
export function validateDescription(description: string): ValidationResult {
  if (description.length > 5000) {
    return {
      valid: false,
      error: 'Description must be less than 5000 characters',
    };
  }

  return { valid: true };
}

/**
 * Validate tags
 */
export function validateTags(tags: string[]): ValidationResult {
  if (tags.length > 10) {
    return {
      valid: false,
      error: 'Maximum 10 tags allowed',
    };
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return {
        valid: false,
        error: 'Each tag must be less than 50 characters',
      };
    }
  }

  return { valid: true };
}

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
