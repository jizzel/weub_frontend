/**
 * Status badge component for video processing states
 */

import { Badge } from './ui/badge';
import type { VideoStatus } from '../types/api';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: VideoStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
    },
    processing: {
      label: 'Processing',
      variant: 'default' as const,
      icon: Loader2,
    },
    ready: {
      label: 'Ready',
      variant: 'default' as const,
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      variant: 'destructive' as const,
      icon: XCircle,
    },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className={className}>
      <Icon className="mr-1 size-3" />
      {label}
    </Badge>
  );
}
