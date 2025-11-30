'use client';

import { useEffect, useRef, useState } from 'react';
import { updateMaterialProgress, getMaterialProgress, markMaterialComplete } from '@/lib/api/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

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
  const [previousVolume, setPreviousVolume] = useState(100); // Track volume before muting
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState<{ watchedDuration: number; isCompleted: boolean } | null>(null);
  const [showForwardWarning, setShowForwardWarning] = useState(false);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            // Set initial volume
            event.target.setVolume(volume);
            event.target.setPlaybackRate(playbackRate);
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
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
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
    if (!isReady) return;

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
  }, [isReady]);

  // Update volume when changed
  useEffect(() => {
    if (!isReady || !playerInstanceRef.current) return;
    try {
      playerInstanceRef.current.setVolume(volume);
      // Update mute state based on volume
      if (volume === 0 && !isMuted) {
        setIsMuted(true);
      } else if (volume > 0 && isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, [volume, isReady, isMuted]);

  // Update playback rate when changed
  useEffect(() => {
    if (!isReady || !playerInstanceRef.current) return;
    try {
      playerInstanceRef.current.setPlaybackRate(playbackRate);
    } catch (error) {
      console.error('Failed to set playback rate:', error);
    }
  }, [playbackRate, isReady]);

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
    setPlaybackRate(speed);
    // The useEffect will handle applying it to the player
  };

  const handleSeek = (seconds: number) => {
    if (!playerInstanceRef.current) return;
    
    // Only allow backward seeking, prevent forward seeking
    if (seconds > currentTime) {
      // Show warning message
      setShowForwardWarning(true);
      
      // Clear existing timeout
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      // Hide warning after 3 seconds
      warningTimeoutRef.current = setTimeout(() => {
        setShowForwardWarning(false);
      }, 3000);
      
      return; // Don't seek forward
    }
    
    // Allow backward seeking
    playerInstanceRef.current.seekTo(seconds, true);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update previous volume if not muted
    if (!isMuted && newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const handleMuteToggle = () => {
    if (!playerInstanceRef.current) return;
    if (isMuted) {
      // Unmute and restore previous volume or default to 50
      const restoreVolume = previousVolume > 0 ? previousVolume : 50;
      setVolume(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute - save current volume before muting
      if (volume > 0) {
        setPreviousVolume(volume);
      }
      setVolume(0);
      setIsMuted(true);
    }
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
          {/* Forward Warning Message */}
          {showForwardWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-all duration-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Anda tidak dapat melompat ke depan. Hanya dapat kembali ke bagian sebelumnya.</span>
            </div>
          )}

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const seekTime = percent * duration;
              handleSeek(seekTime);
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

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMuteToggle}
                  disabled={!isReady}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume}%, rgb(229, 231, 235) ${volume}%, rgb(229, 231, 235) 100%)`
                  }}
                  disabled={!isReady}
                />
                <span className="text-xs text-muted-foreground w-8">{volume}%</span>
              </div>

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

