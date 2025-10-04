/**
 * HLS video player component using hls.js
 */

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { getAssetUrl } from '../lib/apiClient';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

interface PlayerProps {
  playlistUrl: string;
  availableResolutions?: string[];
  className?: string;
}

export function Player({ playlistUrl, availableResolutions = [], className }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fullUrl = getAssetUrl(playlistUrl);
    console.log('video: ', fullUrl, playlistUrl)

    // Check if HLS is natively supported (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = fullUrl;
      return;
    }

    // Use hls.js for browsers that don't support HLS natively
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;

      hls.loadSource(fullUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setError(null);
        // Extract available quality levels
        const hlsLevels = hls.levels.map((level, index) => ({
          height: level.height,
          index,
        }));
        setLevels(hlsLevels);
        setCurrentLevel(hls.currentLevel);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - failed to load video');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - trying to recover');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error - cannot play video');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else {
      setError('HLS is not supported in this browser');
    }
  }, [playlistUrl]);

  const handleQualityChange = (levelIndex: string) => {
    const hls = hlsRef.current;
    if (!hls) return;

    const index = parseInt(levelIndex);
    if (index === -1) {
      hls.currentLevel = -1; // Auto quality
    } else {
      hls.currentLevel = index;
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video bg-black rounded-lg"
        playsInline
      />
      
      {levels.length > 1 && (
        <div className="absolute bottom-14 right-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon" className="size-10 rounded-full opacity-80 hover:opacity-100">
                <Settings className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-2">
                <h4 className="text-sm">Quality</h4>
                <Select
                  value={String(currentLevel)}
                  onValueChange={handleQualityChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Auto</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level.index} value={String(level.index)}>
                        {level.height}p
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
