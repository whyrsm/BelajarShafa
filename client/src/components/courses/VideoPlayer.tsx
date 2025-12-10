'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { updateMaterialProgress, getMaterialProgress, markMaterialComplete } from '@/lib/api/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  materialId: string;
  videoUrl?: string;
  title: string;
  /**
   * Allow forward seeking in the video player.
   * Can be set via prop or environment variable NEXT_PUBLIC_ALLOW_FORWARD_SEEK.
   * Default: false (forward seeking is blocked)
   * Set to true for development/testing purposes.
   */
  allowForwardSeek?: boolean;
  /**
   * Callback fired when progress is updated (e.g., when material is completed)
   * Use this to refresh enrollment and course progress data in parent components
   */
  onProgressUpdate?: () => void | Promise<void>;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function VideoPlayerComponent({ materialId, videoUrl, title, allowForwardSeek: propAllowForwardSeek, onProgressUpdate }: VideoPlayerProps) {
  // Check environment variable first, then prop, default to false (prevent forward seek)
  const envValue = process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK;
  const allowForwardSeekRef = useRef(
    envValue === 'true' || propAllowForwardSeek === true
  );
  
  // Refs for mutable values that don't need to trigger re-renders
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);
  
  // UI State
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState<{ watchedDuration: number; isCompleted: boolean } | null>(null);
  const [showForwardWarning, setShowForwardWarning] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  // Load existing progress once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      try {
        const materialProgress = await getMaterialProgress(materialId);
        if (materialProgress && isMounted) {
          setProgress({
            watchedDuration: materialProgress.watchedDuration,
            isCompleted: materialProgress.isCompleted,
          });
          isCompletedRef.current = materialProgress.isCompleted;
          lastSavedTimeRef.current = materialProgress.watchedDuration;
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();
    
    return () => {
      isMounted = false;
    };
  }, [materialId]);

  // Optimized save progress function with useCallback and stable dependencies
  const saveProgress = useCallback(async (timeValue?: number) => {
    if (!isReady || !playerInstanceRef.current) return;
    
    try {
      const time = timeValue !== undefined ? timeValue : playerInstanceRef.current.getCurrentTime();
      const dur = playerInstanceRef.current.getDuration();
      
      // Skip if time hasn't changed significantly (avoid unnecessary API calls)
      if (Math.abs(time - lastSavedTimeRef.current) < 3 && !isCompletedRef.current) {
        return;
      }
      
      const watchedPercent = dur > 0 ? (time / dur) * 100 : 0;
      const watchedSeconds = Math.floor(time);
      
      // Mark as complete if watched 95% or more
      const isComplete = watchedPercent >= 95 || watchedSeconds >= dur - 1;
      
      // Check if this is a new completion
      const wasJustCompleted = !isCompletedRef.current && isComplete;

      await updateMaterialProgress(materialId, {
        watchedDuration: watchedSeconds,
        isCompleted: isComplete,
      });

      lastSavedTimeRef.current = watchedSeconds;
      isCompletedRef.current = isComplete;
      
      setProgress({
        watchedDuration: watchedSeconds,
        isCompleted: isComplete,
      });

      // Call progress update callback when material is newly completed
      if (wasJustCompleted && onProgressUpdate) {
        await onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [isReady, materialId, onProgressUpdate]);

  const handleVideoComplete = useCallback(async () => {
    if (!playerInstanceRef.current) return;
    
    try {
      const dur = playerInstanceRef.current.getDuration();
      const wasAlreadyCompleted = isCompletedRef.current;
      
      await updateMaterialProgress(materialId, {
        watchedDuration: Math.floor(dur),
        isCompleted: true,
      });
      
      isCompletedRef.current = true;
      setProgress({
        watchedDuration: Math.floor(dur),
        isCompleted: true,
      });

      // Call progress update callback if newly completed
      if (!wasAlreadyCompleted && onProgressUpdate) {
        await onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to mark video as complete:', error);
    }
  }, [materialId, onProgressUpdate]);

  // Initialize YouTube player
  useEffect(() => {
    if (!videoId || !playerRef.current) return;
    
    // Prevent re-initialization if player already exists
    if (playerInstanceRef.current) return;

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
      if (!playerRef.current || !videoId || playerInstanceRef.current) return;

      // Use ref values instead of state to avoid re-initialization
      const startTime = lastSavedTimeRef.current || 0;

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          start: Math.floor(startTime),
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          showinfo: 0,
          cc_load_policy: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(100);
            event.target.setPlaybackRate(1);
            if (startTime > 0) {
              event.target.seekTo(startTime, true);
            }
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
            
            if (event.data === 0) {
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
          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        progressSaveIntervalRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    };
  }, [videoId, handleVideoComplete]);

  // Auto-save progress periodically while playing
  useEffect(() => {
    if (!isReady) return;

    if (isPlaying) {
      // Save progress every 15 seconds while playing (reduced frequency)
      progressSaveIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 15000);
    } else {
      // Clear interval when paused
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        progressSaveIntervalRef.current = null;
      }
      // Save immediately when paused
      saveProgress();
    }

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        progressSaveIntervalRef.current = null;
      }
    };
  }, [isReady, isPlaying, saveProgress]);

  // Update current time periodically (optimized to avoid too many state updates)
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      if (playerInstanceRef.current) {
        try {
          const time = playerInstanceRef.current.getCurrentTime();
          const dur = playerInstanceRef.current.getDuration();
          
          // Only update state if time changed significantly (reduce re-renders)
          setCurrentTime(prevTime => {
            const timeDiff = Math.abs(time - prevTime);
            return timeDiff > 0.5 ? time : prevTime;
          });
          
          // Check for completion threshold (95%)
          if (dur > 0 && !isCompletedRef.current) {
            const percent = (time / dur) * 100;
            if (percent >= 95) {
              saveProgress(time);
            }
          }
        } catch (error) {
          // Ignore errors silently
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, saveProgress]);

  // Update volume when changed (optimized to avoid circular dependencies)
  useEffect(() => {
    if (!isReady || !playerInstanceRef.current) return;
    try {
      playerInstanceRef.current.setVolume(volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, [volume, isReady]);

  // Update playback rate when changed
  useEffect(() => {
    if (!isReady || !playerInstanceRef.current) return;
    try {
      playerInstanceRef.current.setPlaybackRate(playbackRate);
    } catch (error) {
      console.error('Failed to set playback rate:', error);
    }
  }, [playbackRate, isReady]);

  const handlePlayPause = useCallback(() => {
    if (!playerInstanceRef.current) return;
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  }, [isPlaying]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackRate(speed);
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    if (!playerInstanceRef.current) return;
    
    // Check if forward seeking is allowed
    if (!allowForwardSeekRef.current && seconds > currentTime) {
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
      
      return;
    }
    
    // Allow seeking (backward always, forward if allowed)
    playerInstanceRef.current.seekTo(seconds, true);
    
    // Save progress after seeking
    setTimeout(() => {
      saveProgress(seconds);
    }, 500);
  }, [currentTime, saveProgress]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    // Update previous volume and mute state
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
      if (isMuted) {
        setIsMuted(false);
      }
    } else {
      if (!isMuted) {
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  const handleMuteToggle = useCallback(() => {
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
  }, [isMuted, previousVolume, volume]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

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
          {/* Overlay to prevent clicking through to YouTube */}
          <div 
            className="absolute inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isReady) {
                handlePlayPause();
              }
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
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
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Forward Warning Message */}
          {showForwardWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-2 rounded-md flex items-start sm:items-center gap-2 text-xs sm:text-sm transition-all duration-300">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="flex-1">Anda tidak dapat melompat ke depan. Hanya dapat kembali ke bagian sebelumnya.</span>
            </div>
          )}

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div 
              className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 cursor-pointer relative" 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const seekTime = percent * duration;
                handleSeek(seekTime);
              }}
            >
              <div
                className="bg-primary h-2 sm:h-2.5 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={!isReady}
                className="h-8 sm:h-9"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMuteToggle}
                  disabled={!isReady}
                  className="h-8 sm:h-9"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume}%, rgb(229, 231, 235) ${volume}%, rgb(229, 231, 235) 100%)`
                  }}
                  disabled={!isReady}
                />
                <span className="text-xs text-muted-foreground w-6 sm:w-8 hidden sm:inline">{volume}%</span>
              </div>

              {/* Speed Control */}
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="px-2 py-1 border rounded text-xs sm:text-sm h-8 sm:h-9"
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
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                <span>✓ Selesai</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent re-renders when parent state changes
// Only re-render if materialId, videoUrl, title, or allowForwardSeek changes
export const VideoPlayer = memo(VideoPlayerComponent, (prevProps, nextProps) => {
  return (
    prevProps.materialId === nextProps.materialId &&
    prevProps.videoUrl === nextProps.videoUrl &&
    prevProps.title === nextProps.title &&
    prevProps.allowForwardSeek === nextProps.allowForwardSeek
  );
});

VideoPlayer.displayName = 'VideoPlayer';

