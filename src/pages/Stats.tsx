/**
 * Stats dashboard page with loading, empty, and error states.
 */

import { useStats, useHealth } from '../hooks/useStats';
import { useDemoMode } from '../hooks/useDemoMode';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Upload, CheckCircle, XCircle, HardDrive, Activity, ArrowLeft, Video } from 'lucide-react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { ForwardedLink } from '../components/ForwardedLink';

export function Stats() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: health, isLoading: healthLoading } = useHealth();
  const { isDemoMode } = useDemoMode();

  const renderContent = () => {
    if (statsLoading || healthLoading) {
      return <StatsSkeleton />;
    }

    if (statsError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Failed to Load Statistics</AlertTitle>
          <AlertDescription>
            {statsError.message}. Please ensure the backend API is running.
          </AlertDescription>
        </Alert>
      );
    }

    if (!stats || stats.totalUploads === 0) {
      return <StatsEmptyState />;
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Uploads"
            value={formatNumber(stats.totalUploads)}
            icon={Upload}
            iconColor="text-blue-500"
          />
          <StatCard
            title="Successful Videos"
            value={formatNumber(stats.successful)}
            subtitle={formatPercentage(stats.successful, stats.totalUploads)}
            icon={CheckCircle}
            iconColor="text-green-500"
          />
          <StatCard
            title="Failed Videos"
            value={formatNumber(stats.failed)}
            subtitle={formatPercentage(stats.failed, stats.totalUploads)}
            icon={XCircle}
            iconColor="text-red-500"
          />
          <StatCard
            title="Storage Used"
            value={`${stats.storageUsedMB.toLocaleString()} MB`}
            subtitle={`${(stats.storageUsedMB / 1024).toFixed(2)} GB`}
            icon={HardDrive}
            iconColor="text-purple-500"
          />
        </div>

        {stats.mostPopularResolutions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resolution Distribution</CardTitle>
              <CardDescription>
                An overview of the most commonly processed video resolutions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.mostPopularResolutions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resolution" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted-foreground) / 0.2)' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {isDemoMode && <DemoModeBanner />}
      
      <div className="mb-8 space-y-4">
        <Button variant="ghost" asChild className="-ml-4">
          <ForwardedLink to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Library
          </ForwardedLink>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Statistics</h1>
          <p className="text-muted-foreground">
            An overview of video processing activity and system health.
          </p>
        </div>
      </div>

      {health && (
        <Alert className="mb-8 border-green-500/50 bg-green-50/50 dark:bg-green-950/50">
          <Activity className="size-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            <strong>System Status:</strong> {health.status.toUpperCase()} | <strong>Uptime:</strong> {health.uptime}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">{renderContent()}</div>
    </div>
  );
}

// --- Helper Components ---

function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function StatsEmptyState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
      <div>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Video className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">No Statistics Yet</h2>
        <p className="mt-2 text-muted-foreground">
          Upload your first video to start gathering processing statistics.
        </p>
        <Button asChild className="mt-6">
          <ForwardedLink to="/upload">
            <Upload className="mr-2 size-4" />
            Upload a Video
          </ForwardedLink>
        </Button>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`size-4 ${iconColor || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
