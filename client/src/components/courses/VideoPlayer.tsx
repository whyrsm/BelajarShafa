'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ materialId, videoUrl, title, allowForwardSeek: propAllowForwardSeek }: VideoPlayerProps) {
  // Check environment variable first, then prop, default to false (prevent forward seek)
  // For development: Set NEXT_PUBLIC_ALLOW_FORWARD_SEEK=true in .env.local (in client directory)
  // Or pass allowForwardSeek={true} as a prop to the component
  // Note: Restart dev server after adding env variable
  const envValue = process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK;
  const allowForwardSeek = 
    envValue === 'true' || 
    propAllowForwardSeek === true;
  
  // Debug logging (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoPlayer] Forward seek config:', {
        envValue,
        envValueType: typeof envValue,
        propValue: propAllowForwardSeek,
        allowForwardSeek,
        'NEXT_PUBLIC_ALLOW_FORWARD_SEEK': process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK
      });
    }
  }, [envValue, propAllowForwardSeek, allowForwardSeek]);
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

  // Save progress function
  const saveProgress = useCallback(async (currentTimeValue?: number) => {
    if (!isReady || !playerInstanceRef.current) return;
    
    try {
      const time = currentTimeValue !== undefined ? currentTimeValue : playerInstanceRef.current.getCurrentTime();
      const duration = playerInstanceRef.current.getDuration();
      const watchedPercent = duration > 0 ? (time / duration) * 100 : 0;
      const watchedSeconds = Math.floor(time);
      
      // Mark as complete if watched 95% or more (to account for small timing differences)
      const isComplete = watchedPercent >= 95 || watchedSeconds >= duration - 1;

      await updateMaterialProgress(materialId, {
        watchedDuration: watchedSeconds,
        isCompleted: isComplete,
      });

      setProgress({
        watchedDuration: watchedSeconds,
        isCompleted: isComplete,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [isReady, materialId]);

  // Auto-save progress every 10 seconds while playing
  useEffect(() => {
    if (!isReady) {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
        progressSaveIntervalRef.current = null;
      }
      return;
    }

    // Save progress periodically while playing
    if (isPlaying) {
      progressSaveIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 10000); // Save every 10 seconds
    } else {
      // Save progress when paused
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
      }
    };
  }, [isReady, isPlaying, saveProgress]);

  // Save progress when current time changes significantly (e.g., after seeking)
  useEffect(() => {
    if (!isReady || !playerInstanceRef.current || currentTime === 0) return;
    
    // Save progress when time updates (debounced)
    const timeoutId = setTimeout(() => {
      saveProgress(currentTime);
    }, 2000); // Save 2 seconds after time change

    return () => clearTimeout(timeoutId);
  }, [currentTime, isReady, saveProgress]);

  // Update current time periodically
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      if (playerInstanceRef.current) {
        try {
          const time = playerInstanceRef.current.getCurrentTime();
          const duration = playerInstanceRef.current.getDuration();
          setCurrentTime(time);
          
          // Auto-save and mark complete when reaching 95% or more
          if (duration > 0) {
            const percent = (time / duration) * 100;
            if (percent >= 95 && (!progress?.isCompleted)) {
              // Save progress when reaching completion threshold
              saveProgress(time);
            }
          }
        } catch (error) {
          // Ignore errors
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, saveProgress, progress?.isCompleted]);

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
    if (!playerInstanceRef.current) return;
    
    try {
      // Get final duration and mark as complete
      const duration = playerInstanceRef.current.getDuration();
      await updateMaterialProgress(materialId, {
        watchedDuration: Math.floor(duration),
        isCompleted: true,
      });
      
      setProgress({
        watchedDuration: Math.floor(duration),
        isCompleted: true,
      });
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
    
    // Check if forward seeking is allowed
    if (!allowForwardSeek && seconds > currentTime) {
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
    
    // Allow seeking (backward always, forward if allowed)
    playerInstanceRef.current.seekTo(seconds, true);
    
    // Save progress after seeking
    setTimeout(() => {
      saveProgress(seconds);
    }, 500); // Small delay to ensure seek is complete
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
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 cursor-pointer relative" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const seekTime = percent * duration;
              handleSeek(seekTime);
            }}>
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

