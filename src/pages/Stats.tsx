/**
 * Stats dashboard page
 */

import { useStats, useHealth } from '../hooks/useStats';
import { useDemoMode } from '../hooks/useDemoMode';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
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
import { Upload, CheckCircle, XCircle, HardDrive, Activity, ArrowLeft } from 'lucide-react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { ForwardedLink } from '../components/ForwardedLink';

export function Stats() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: health, isLoading: healthLoading } = useHealth();
  const { isDemoMode } = useDemoMode();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Demo Mode Banner */}
      {isDemoMode && <DemoModeBanner />}
      
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <ForwardedLink to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Library
          </ForwardedLink>
        </Button>
        <h1>System Statistics</h1>
        <p className="text-muted-foreground">
          Overview of video processing and system health
        </p>
      </div>

      {/* Health Status */}
      {health && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <Activity className="size-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            <strong>System Status:</strong> {health.status.toUpperCase()} • Uptime: {health.uptime}
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load statistics: {statsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {(statsLoading || healthLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Uploads"
              value={formatNumber(stats.totalUploads)}
              icon={Upload}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Successful"
              value={formatNumber(stats.successful)}
              subtitle={formatPercentage(stats.successful, stats.totalUploads)}
              icon={CheckCircle}
              iconColor="text-green-600"
            />
            <StatCard
              title="Failed"
              value={formatNumber(stats.failed)}
              subtitle={formatPercentage(stats.failed, stats.totalUploads)}
              icon={XCircle}
              iconColor="text-red-600"
            />
            <StatCard
              title="Storage Used"
              value={`${stats.storageUsedMB.toLocaleString()} MB`}
              subtitle={`${(stats.storageUsedMB / 1024).toFixed(2)} GB`}
              icon={HardDrive}
              iconColor="text-purple-600"
            />
          </div>

          {/* Resolution Chart */}
          {stats.mostPopularResolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Resolutions</CardTitle>
                <CardDescription>
                  Distribution of video resolutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.mostPopularResolutions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resolution" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
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
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className={`size-4 ${iconColor || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
