/**
 * Error boundary component for catching React errors.
 * Provides recovery options and detailed error info in development.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const isDevelopment = import.meta.env.DEV;

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-destructive">
              Something went wrong
            </h1>
            <p className="mt-2 text-muted-foreground">
              An unexpected error occurred. Please try again or return home.
            </p>

            {isDevelopment && this.state.error && (
              <details className="mt-4 rounded-lg bg-destructive/10 p-3 text-left">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-sm font-mono">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="destructive" onClick={this.handleReset}>
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
