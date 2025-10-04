/**
 * Banner to indicate when the app is running in demo mode
 */

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';

export function DemoModeBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Invalidate all queries to force refetch
    queryClient.invalidateQueries();
  };

  if (isDismissed) return null;

  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950 mb-6">
      <Info className="size-4 text-blue-600" />
      <AlertTitle className="text-blue-600">Demo Mode</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-400 flex items-center justify-between">
        <span>
          You're viewing demo data. Backend API is not available at{' '}
          <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
            {import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'}
          </code>
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 shrink-0"
          onClick={handleRetry}
        >
          <RefreshCw className="mr-2 size-3" />
          Retry
        </Button>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 size-6"
        onClick={() => setIsDismissed(true)}
      >
        <X className="size-4" />
      </Button>
    </Alert>
  );
}
