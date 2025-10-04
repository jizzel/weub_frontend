/**
 * Main layout component with navigation
 */

import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Video, BarChart3, Upload as UploadIcon, Home, Wifi, WifiOff } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { ForwardedLink } from './ForwardedLink';
import { useDemoMode } from '../hooks/useDemoMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();

  const navigation = [
    { name: 'Library', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: UploadIcon },
    { name: 'Stats', href: '/stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <ForwardedLink to="/" className="flex items-center gap-2">
              <Video className="size-6" />
              <span className="text-xl">Weub</span>
            </ForwardedLink>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    asChild
                  >
                    <ForwardedLink to={item.href}>
                      <Icon className="mr-2 size-4" />
                      {item.name}
                    </ForwardedLink>
                  </Button>
                );
              })}
              
              {/* Connection Status Indicator */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-2 px-2">
                      {isDemoMode ? (
                        <WifiOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Wifi className="size-4 text-green-600" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDemoMode ? 'Demo Mode - Using mock data' : 'Connected to backend'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
