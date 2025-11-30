'use client';

import { useEffect, useRef, useState } from 'react';
import { updateMaterialProgress, getMaterialProgress, markMaterialComplete } from '@/lib/api/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  materialId: string;
  videoUrl?: string;
  title: string;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ materialId, videoUrl, title }: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState<{ watchedDuration: number; isCompleted: boolean } | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  useEffect(() => {
    // Load existing progress
    const loadProgress = async () => {
      try {
        const materialProgress = await getMaterialProgress(materialId);
        if (materialProgress) {
          setProgress({
            watchedDuration: materialProgress.watchedDuration,
            isCompleted: materialProgress.isCompleted,
          });
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();
  }, [materialId]);

  // Add CSS to hide YouTube UI elements (note: these may not work due to iframe isolation)
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'youtube-hide-ui';
    style.textContent = `
      /* Note: YouTube iframe content is isolated, so we can't directly hide YouTube UI elements via CSS */
      /* The overlay and playerVars (controls: 0) handle hiding controls */
    `;
    if (!document.getElementById('youtube-hide-ui')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('youtube-hide-ui');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  useEffect(() => {
    if (!videoId || !playerRef.current) return;

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (!playerRef.current || !videoId) return;

      const startTime = progress?.watchedDuration || 0;

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          start: Math.floor(startTime),
          controls: 0, // Hide YouTube's native controls
          rel: 0,
          modestbranding: 1,
          disablekb: 1, // Disable keyboard controls
          fs: 0, // Disable fullscreen button
          iv_load_policy: 3, // Hide annotations
          playsinline: 1, // Play inline on mobile
          showinfo: 0, // Hide video info
          cc_load_policy: 0, // Hide closed captions by default
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
            if (startTime > 0) {
              event.target.seekTo(startTime, true);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            setIsPlaying(event.data === 1);
            
            if (event.data === 0) {
              // Video ended
              handleVideoComplete();
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
          },
        },
      });
    }

    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [videoId, progress]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!isReady || !isPlaying) {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        progressSaveIntervalRef.current = null;
      }
      return;
    }

    progressSaveIntervalRef.current = setInterval(async () => {
      if (playerInstanceRef.current) {
        try {
          const currentTime = playerInstanceRef.current.getCurrentTime();
          const duration = playerInstanceRef.current.getDuration();
          const watchedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

          await updateMaterialProgress(materialId, {
            watchedDuration: Math.floor(currentTime),
            isCompleted: watchedPercent >= 80,
          });

          setProgress({
            watchedDuration: Math.floor(currentTime),
            isCompleted: watchedPercent >= 80,
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    }, 10000); // Save every 10 seconds

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [isReady, isPlaying, materialId]);

  // Update current time periodically
  useEffect(() => {
    if (!isReady || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerInstanceRef.current) {
        try {
          setCurrentTime(playerInstanceRef.current.getCurrentTime());
        } catch (error) {
          // Ignore errors
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, isPlaying]);

  const handlePlayPause = () => {
    if (!playerInstanceRef.current) return;
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  };

  const handleVideoComplete = async () => {
    try {
      await markMaterialComplete(materialId);
      setProgress((prev) => prev ? { ...prev, isCompleted: true } : null);
    } catch (error) {
      console.error('Failed to mark video as complete:', error);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.setPlaybackRate(speed);
    setPlaybackRate(speed);
  };

  const handleSeek = (seconds: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.seekTo(seconds, true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">URL video tidak valid</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Video Player */}
        <div 
          className="relative aspect-video bg-black"
          onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
        >
          <div 
            ref={playerRef} 
            className="w-full h-full"
          />
          {/* Overlay to prevent clicking through to YouTube - intercepts clicks but video plays via API */}
          <div 
            className="absolute inset-0 z-10"
            onClick={(e) => {
              // Intercept all clicks to prevent navigation to YouTube
              e.preventDefault();
              e.stopPropagation();
              // Control video only through app controls
              if (isReady) {
                handlePlayPause();
              }
            }}
            onDoubleClick={(e) => {
              // Prevent double-click fullscreen
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // Prevent any mouse interactions that might trigger YouTube navigation
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'auto',
              background: 'transparent'
            }}
          />
        </div>

        {/* Video Controls */}
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}>
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={!isReady}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              {/* Speed Control */}
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
                disabled={!isReady}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            {progress?.isCompleted && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>✓ Selesai</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

