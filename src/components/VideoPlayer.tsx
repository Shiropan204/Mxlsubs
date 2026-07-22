import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SubtitleCue } from '../types';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Settings, ChevronUp, ChevronDown, Type, Smartphone, SkipForward } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VideoPlayerProps {
  videoId: string;
  serverType?: 'youtube' | 'drive' | 'dailymotion';
  vttUrl?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  thumbnailUrl?: string;
  onNextEpisode?: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    webkitEnterFullscreen?: () => void;
  }
  interface Document {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
  }
}

export default function VideoPlayer({ 
  videoId, 
  serverType = 'youtube',
  vttUrl, 
  onProgress, 
  initialTime = 0,
  thumbnailUrl,
  onNextEpisode
}: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const playerRef = useRef<any>(null);
  const hideTimerRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const dragTimeRef = useRef<number | null>(null);

  const [showSubtitles, setShowSubtitles] = useLocalStorage('showSubtitles', true);
  const [subSize, setSubSize] = useLocalStorage('subSize', 22);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useLocalStorage('subtitleDelay', 0);
  const [buffered, setBuffered] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [showTapHint, setShowTapHint] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  // Detect mobile once
  useEffect(() => {
    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    if (trackRef.current && trackRef.current.track) {
      trackRef.current.track.mode = 'hidden';
    }
  }, [vttUrl]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    window.clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  }, [isPlaying]);

  // CB-1 fix: Tap to toggle controls on mobile — single source of truth,
  // no conflict with resetHideTimer's setShowControls(true).
  const handleContainerTap = useCallback(() => {
    if (!isMobileRef.current) return;
    setShowControls(prev => {
      const next = !prev;
      window.clearTimeout(hideTimerRef.current);
      if (next && isPlaying) {
        hideTimerRef.current = window.setTimeout(() => {
          setShowControls(false);
          setShowSettings(false);
        }, 3000);
      }
      return next;
    });
  }, [isPlaying]);

  // CB-3 fix: Cleanup hideTimer unconditionally on unmount
  useEffect(() => {
    return () => window.clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    if (serverType !== 'youtube' || !loaded) return;

    let checkYTInterval: number | null = null;

    const startPlayerWhenReady = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        if (!document.getElementById('youtube-iframe-api-script')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api-script';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          initPlayer();
        };

        // Fallback interval if API script was already loaded
        checkYTInterval = window.setInterval(() => {
          if (window.YT && window.YT.Player) {
            if (checkYTInterval) clearInterval(checkYTInterval);
            initPlayer();
          }
        }, 100);
      }
    };

    startPlayerWhenReady();

    return () => {
      if (checkYTInterval) clearInterval(checkYTInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      window.clearTimeout(hideTimerRef.current);
    };
  }, [videoId, serverType, loaded]);

  const initPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }

    const targetEl = document.getElementById(`youtube-player-${videoId}`);
    if (!targetEl) return;

    try {
      playerRef.current = new window.YT.Player(targetEl, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: Math.floor(initialTime),
          cc_load_policy: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            const dur = event.target.getDuration();
            if (dur && dur > 0) setDuration(dur);
            setVolume(event.target.getVolume());
            setIsMuted(event.target.isMuted());
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
            }
            try {
              event.target.unloadModule('captions');
              event.target.unloadModule('cc');
            } catch (e) {}

            setIsBuffering(false);
            try {
              event.target.playVideo();
            } catch (e) {}
          },
          onStateChange: (event: any) => {
            const state = event.data;
            const playing = state === window.YT.PlayerState.PLAYING;
            setIsPlaying(playing);
            setIsEnded(state === window.YT.PlayerState.ENDED);
            
            const dur = event.target.getDuration();
            if (dur && dur > 0) setDuration(dur);

            if (state === window.YT.PlayerState.BUFFERING) {
              setIsBuffering(true);
            } else {
              // PLAYING, PAUSED, CUED, UNSTARTED, ENDED
              setIsBuffering(false);
              setLoaded(true);
            }

            if (playing) {
              setShowTapHint(false);
              try {
                event.target.unloadModule('captions');
                event.target.unloadModule('cc');
              } catch (e) {}
            }
          },
          onError: (event: any) => {
            console.error('YouTube Player Error:', event.data);
            setHasError(true);
            setIsBuffering(false);
          }
        }
      });
    } catch (err) {
      console.error('Error creating YT player:', err);
      setHasError(true);
      setIsBuffering(false);
    }
  };

  useEffect(() => {
    let interval: number;
    interval = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;

          if (dur > 0 && dur !== duration) {
            setDuration(dur);
          }

          if (isPlaying && !isDraggingRef.current) {
            setCurrentTime(time);
          }

          if (isPlaying && onProgress) {
            onProgress(time, dur || duration);
          }

          if (typeof playerRef.current.getVideoLoadedFraction === 'function') {
            const frac = playerRef.current.getVideoLoadedFraction() || 0;
            setBuffered(frac * (dur || duration));
          }

          if (isPlaying && showSubtitles && trackRef.current && trackRef.current.track && trackRef.current.track.cues) {
            const cues = Array.from(trackRef.current.track.cues) as VTTCue[];
            const adjustedTime = time - subtitleDelay;
            const activeCues = cues.filter(c => c.startTime <= adjustedTime && c.endTime >= adjustedTime);
            
            if (subtitleContainerRef.current) {
              subtitleContainerRef.current.innerHTML = '';
              activeCues.forEach(cue => {
                const cueDiv = document.createElement('div');
                cueDiv.appendChild(cue.getCueAsHTML());
                subtitleContainerRef.current!.appendChild(cueDiv);
              });
            }
          } else if (subtitleContainerRef.current) {
            subtitleContainerRef.current.innerHTML = '';
          }
        } catch (e) {}
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPlaying, showSubtitles, subtitleDelay, duration, onProgress]);



  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isEnded) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setIsEnded(false);
      } else if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPlaying, isEnded]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    isDraggingRef.current = true;
    updateDragTime(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !seekBarRef.current || !duration) return;
    updateDragTime(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    isDraggingRef.current = false;
    
    if (dragTimeRef.current !== null) {
      setCurrentTime(dragTimeRef.current);
      if (playerRef.current) playerRef.current.seekTo(dragTimeRef.current, true);
    }
    
    setDragTime(null);
    dragTimeRef.current = null;
  };

  const updateDragTime = (clientX: number) => {
    const rect = seekBarRef.current!.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = fraction * duration;
    setDragTime(newTime);
    dragTimeRef.current = newTime;
  };

  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !duration) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(fraction * duration);
    setHoverX(e.clientX - rect.left);
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 50);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
      if (vol > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  // ===== FULLSCREEN: robust, works on Android & iOS =====
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNativeFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (!isNativeFs && !isCssFullscreen) {
      // --- ENTER FULLSCREEN ---
      let nativeRequested = false;

      // 1) Try standard native fullscreen (Android Chrome, desktop)
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Fallback to CSS fullscreen if native fails
          enterCssFullscreen();
        });
        nativeRequested = true;
      }
      // 2) Try webkit fullscreen (iOS Safari, older Android)
      else if ((el as any).webkitRequestFullscreen) {
        try {
          (el as any).webkitRequestFullscreen();
          nativeRequested = true;
        } catch {
          enterCssFullscreen();
        }
      }
      // 3) No native API available → CSS fullscreen
      else {
        enterCssFullscreen();
      }

      if (nativeRequested) {
        attemptOrientationLock('landscape');
        // Verify native fullscreen worked (timeout for iOS)
        setTimeout(() => {
          if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
            enterCssFullscreen();
          }
        }, 500);
      }
    } else {
      // --- EXIT FULLSCREEN ---
      if (isCssFullscreen) {
        exitCssFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          try { (document as any).webkitExitFullscreen(); } catch {}
        }
      }
      attemptOrientationUnlock();
    }
  }, [isCssFullscreen]);

  const enterCssFullscreen = () => {
    setIsCssFullscreen(true);
    setIsFullscreen(true);
    attemptOrientationLock('landscape');
  };

  const exitCssFullscreen = () => {
    setIsCssFullscreen(false);
    setIsFullscreen(false);
  };

  const attemptOrientationLock = (orientation: 'landscape' | 'portrait') => {
    if (!isMobileRef.current) return;
    try {
      const so = (screen as any).orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
      if (so?.lock) {
        so.lock(orientation).catch(() => {});
      }
    } catch {}
  };

  const attemptOrientationUnlock = () => {
    try {
      const so = (screen as any).orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
      if (so?.unlock) so.unlock();
    } catch {}
  };

  // Listen for native fullscreen change events
  useEffect(() => {
    const onFsChange = () => {
      const isNativeFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (isNativeFs) {
        setIsFullscreen(true);
        setIsCssFullscreen(false);
      } else if (!isCssFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, [isCssFullscreen]);

  const skipBackward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      playerRef.current.seekTo(currentTime - 10, true);
    }
  };

  const skipForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      playerRef.current.seekTo(currentTime + 10, true);
    }
  };

  // CB-2 fix: Keyboard shortcuts scoped to this instance via isFocusedRef,
  // also handles Escape for CSS fullscreen (LB-4 fix), and contentEditable (A11Y-4 fix).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocusedRef.current) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'c':
          setShowSubtitles(s => !s);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'escape':
          if (isCssFullscreen) {
            setIsCssFullscreen(false);
            setIsFullscreen(false);
          }
          break;
        case 'arrowright':
          if (playerRef.current) playerRef.current.seekTo(currentTime + 5, true);
          break;
        case 'arrowleft':
          if (playerRef.current) playerRef.current.seekTo(currentTime - 5, true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, currentTime, setShowSubtitles, isCssFullscreen]);

  const formatTime = (time: number) => {
    const hrs = Math.floor(time / 3600);
    const min = Math.floor((time % 3600) / 60);
    const sec = Math.floor(time % 60);
    if (hrs > 0) return `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progressPercent = duration ? (displayTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  if (!loaded) {
    const defaultThumb = serverType === 'youtube' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return (
      <div ref={containerRef} className="relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden select-none shadow-xl shadow-black/20">
        <button onClick={() => setLoaded(true)} className="group relative h-full w-full block" aria-label="Putar video">
          <img 
            src={thumbnailUrl || defaultThumb} 
            onError={(e) => {
              if (e.currentTarget.src.includes('maxresdefault.jpg')) {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
            alt="Video thumbnail" 
            draggable={false} 
            loading="lazy" 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <span className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,102,135,0.6)] group-hover:scale-110 transition-transform duration-300">
              <Play size={36} className="ml-1.5 fill-current" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={
        isCssFullscreen 
          ? `fixed inset-0 z-[100] w-screen h-dvh bg-black flex flex-col select-none`
          : `relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden select-none`
      }
      style={isCssFullscreen ? { 
        width: '100dvw',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      } : {}}
      ref={containerRef}
      tabIndex={0}
      onFocus={() => { isFocusedRef.current = true; }}
      onBlur={() => { isFocusedRef.current = false; }}
      onMouseEnter={() => { isFocusedRef.current = true; }}
      onMouseLeave={() => {
        isFocusedRef.current = false;
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(false);
        }
      }}
      onMouseMove={resetHideTimer}
      onTouchStart={() => handleContainerTap()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ===== VIDEO IFRAME / YT PLAYER ===== */}
      {serverType === 'youtube' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div key={videoId} id={`youtube-player-${videoId}`} className="w-full h-full" />
        </div>
      )}
      {serverType === 'drive' && (
        <iframe 
          src={`https://drive.google.com/file/d/${videoId}/preview`} 
          className="w-full h-full border-0" 
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      )}

      {/* ===== ERROR OVERLAY ===== */}
      {hasError && (
        <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Video Tidak Tersedia</h3>
          <p className="text-text-muted text-sm max-w-md">
            Video ini mungkin telah dihapus, bersifat private, atau dibatasi wilayah. Silakan ganti server di bawah.
          </p>
        </div>
      )}

      {/* ===== LOADING OVERLAY ===== */}
      {!hasError && isBuffering && serverType === 'youtube' && loaded && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* ===== ENDSCREEN OVERLAY ===== */}
      {isEnded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (playerRef.current) {
                playerRef.current.seekTo(0, true);
                playerRef.current.playVideo();
              }
            }}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/20"
          >
            <RotateCcw size={16} />
            Putar Ulang
          </button>

          {onNextEpisode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextEpisode();
              }}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <SkipForward size={16} />
              Episode Selanjutnya
            </button>
          )}
        </div>
      )}
      
      {serverType === 'dailymotion' && (
        <iframe 
          src={`https://geo.dailymotion.com/player.html?video=${videoId}`}
          className="w-full h-full border-0" 
          allow="autoplay; fullscreen; web-share"
          allowFullScreen
          title="Dailymotion Video Player"
        />
      )}

      {/* ===== HIDDEN VIDEO PARSER ===== */}
      {serverType === 'youtube' && vttUrl && (
        <video 
          src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" 
          className="hidden" 
          crossOrigin="anonymous"
          preload="auto"
        >
          <track key={vttUrl} ref={trackRef} src={vttUrl} kind="subtitles" default />
        </video>
      )}

      {/* ===== SUBTITLE DISPLAY ===== */}
      {serverType === 'youtube' && showSubtitles && (
        <div className="absolute bottom-20 md:bottom-24 left-0 right-0 flex justify-center pointer-events-none px-4 md:px-8 z-10">
          <div 
            ref={subtitleContainerRef}
            className="bg-black/70 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-center leading-relaxed max-w-[85%] vtt-container empty:hidden"
            style={{ 
              fontSize: `${subSize}px`,
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              lineHeight: 1.5,
            }}
          />
        </div>
      )}

      {/* ===== TAP HINT (shown once on first load) ===== */}
      {serverType === 'youtube' && showTapHint && !isPlaying && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
            <Smartphone size={12} />
            Tap screen for controls
          </div>
        </div>
      )}

      {/* ===== CENTER PLAY OVERLAY (YouTube only) ===== */}
      {serverType === 'youtube' && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          style={{ height: 'calc(100% - 56px)' }}
        >
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <div className="flex items-center gap-8 md:gap-14">
                <button 
                  onClick={(e) => { e.stopPropagation(); skipBackward(e); }}
                  className="p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                  title="Rewind 10s"
                >
                  <RotateCcw size={24} className="md:w-7 md:h-7" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="p-5 md:p-7 rounded-full bg-white/95 text-black hover:bg-white shadow-2xl shadow-black/30 transition-all hover:scale-110 active:scale-95"
                  title="Play"
                >
                  <Play size={36} className="ml-1 fill-current" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); skipForward(e); }}
                  className="p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                  title="Skip 10s"
                >
                  <RotateCw size={24} className="md:w-7 md:h-7" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== BOTTOM CONTROLS (YouTube only) ===== */}
      {serverType === 'youtube' && (
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          
          <div className="relative px-3 md:px-5 pb-3 md:pb-4 pt-8 flex flex-col gap-2">
            {/* Seek Bar */}
            <div 
              ref={seekBarRef}
              className="group/seek relative h-8 flex items-center cursor-pointer touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseMove={handleSeekBarHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Track background */}
              <div className="absolute left-0 right-0 h-[4px] md:h-[3px] group-hover/seek:h-[5px] transition-all bg-white/20 rounded-full overflow-hidden">
                {/* Buffered */}
                <div 
                  className="absolute top-0 left-0 h-full bg-white/25 rounded-full" 
                  style={{ width: `${bufferedPercent}%` }} 
                />
                {/* Progress */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-colors"
                  style={{ 
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--brand-pink), #ff6b9d)'
                  }} 
                />
              </div>
              {/* Seek thumb - always visible on mobile, hover-only on desktop */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand shadow-lg shadow-brand/40 md:opacity-0 md:scale-0 group-hover/seek:opacity-100 group-hover/seek:scale-100 transition-all pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div 
                  className="absolute bottom-7 -translate-x-1/2 bg-black/90 text-white text-[11px] font-mono px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover/seek:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ left: `${hoverX}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 md:gap-3">
                {/* Play/Pause */}
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                  {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-0.5" />}
                </button>
                
                {/* Skip buttons */}
                <button onClick={(e) => { e.stopPropagation(); skipBackward(e); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hidden md:flex" title="Rewind 10s">
                  <RotateCcw size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); skipForward(e); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hidden md:flex" title="Forward 10s">
                  <RotateCw size={18} />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="hidden md:block w-20">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={isMuted ? 0 : volume} 
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-[11px] md:text-xs font-mono text-white/70 ml-1">
                  {formatTime(displayTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-0.5 md:gap-1">
                {/* Subtitle toggle */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSubtitles(!showSubtitles); }}
                  className={`p-1.5 rounded-lg transition-all ${showSubtitles ? 'bg-white/20 text-brand' : 'hover:bg-white/10 text-white/60'}`}
                  title="Toggle Subtitles (C)"
                >
                  <Type size={18} />
                </button>

                {/* Settings */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowSettings(!showSettings);
                  }}
                  className={`p-1.5 rounded-lg transition-all ${showSettings ? 'bg-white/20 text-brand rotate-45' : 'hover:bg-white/10 text-white/80'}`}
                  title="Settings"
                >
                  <Settings size={18} />
                </button>

                {/* Fullscreen */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleFullscreen(); 
                  }} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" 
                  title={isFullscreen || isCssFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                >
                  {isFullscreen || isCssFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERSISTENT BUTTONS for Drive/Dailymotion ===== */}
      {serverType !== 'youtube' && (
        <div className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2 rounded-xl backdrop-blur-md transition-all shadow-lg border bg-black/50 hover:bg-black/70 text-white border-white/10"
            title="Fullscreen"
          >
            {isFullscreen || isCssFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>


        </div>
      )}

      {/* ===== SETTINGS PANEL ===== */}
      {showSettings && (showControls || (!isPlaying && serverType === 'youtube') || serverType !== 'youtube') && (
        <div 
          className={`absolute ${serverType === 'youtube' ? 'bottom-14 md:bottom-16 right-2 md:right-5' : 'top-16 right-4'} z-30 w-[calc(100%-1rem)] md:w-64 max-w-sm bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Settings</h4>
            <button onClick={() => setShowSettings(false)} className="p-1 -mr-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors">
              <RotateCw size={14} className="rotate-45" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
            {serverType === 'youtube' && (
              <div className="py-2">
                {/* Subtitle Delay */}
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70 font-medium">Subtitle Delay</span>
                    <span className="text-[10px] font-mono font-bold text-brand px-1.5 py-0.5 bg-brand/10 rounded">
                      {subtitleDelay > 0 ? `+${subtitleDelay.toFixed(1)}` : subtitleDelay.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSubtitleDelay(Math.max(-10, subtitleDelay - 0.1))} className="p-1 hover:bg-white/10 rounded text-white/60">
                      <ChevronDown size={14} />
                    </button>
                    <input type="range" min="-10" max="10" step="0.1" value={subtitleDelay} onChange={(e) => setSubtitleDelay(parseFloat(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand" />
                    <button onClick={() => setSubtitleDelay(Math.min(10, subtitleDelay + 0.1))} className="p-1 hover:bg-white/10 rounded text-white/60">
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtitle Size */}
                <div className="px-4 py-3 space-y-2.5 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70 font-medium">Subtitle Size</span>
                    <span className="text-[10px] font-mono font-bold text-white/50 px-1.5 py-0.5 bg-white/5 rounded">
                      {subSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40">A</span>
                    <input type="range" min="14" max="36" step="1" value={subSize} onChange={(e) => setSubSize(parseInt(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand" />
                    <span className="text-sm text-white/40 font-bold">A</span>
                  </div>
                </div>
              </div>
            )}

            {serverType !== 'youtube' && (
              <div className="px-4 py-8 text-sm text-white/50 text-center">
                Settings available only for YouTube player
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
