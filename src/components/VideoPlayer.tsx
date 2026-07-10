import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SubtitleCue, VideoServer, SubtitleTrack } from '../types';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Settings, ChevronUp, ChevronDown, Type, Smartphone } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VideoPlayerProps {
  servers?: VideoServer[];
  activeServer?: VideoServer;
  onServerChange?: (server: VideoServer) => void;
  subtitleTracks?: SubtitleTrack[];
  activeSubtitleTrack?: SubtitleTrack | null;
  onSubtitleChange?: (track: SubtitleTrack | null) => void;
  videoId: string;
  serverType?: 'youtube' | 'drive' | 'dailymotion';
  subtitles?: SubtitleCue[];
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
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
  servers = [], 
  activeServer, 
  onServerChange,
  subtitleTracks = [],
  activeSubtitleTrack,
  onSubtitleChange,
  videoId, 
  serverType = 'youtube',
  subtitles = [], 
  onProgress, 
  initialTime = 0 
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const hideTimerRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
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
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  // Detect mobile once
  useEffect(() => {
    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

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

  // Tap to toggle controls on mobile
  const handleContainerTap = useCallback(() => {
    if (isMobileRef.current) {
      setShowControls(prev => !prev);
      if (!showControls) {
        window.clearTimeout(hideTimerRef.current);
      }
    }
  }, [showControls]);

  useEffect(() => {
    if (serverType !== 'youtube') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    } else if (window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      window.clearTimeout(hideTimerRef.current);
    };
  }, [videoId, serverType]);

  const initPlayer = () => {
    playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
      videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        start: Math.floor(initialTime),
        cc_load_policy: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
          setVolume(event.target.getVolume());
          setIsMuted(event.target.isMuted());
          if (initialTime > 0) {
            event.target.seekTo(initialTime, true);
          }
          try {
            event.target.unloadModule('captions');
            event.target.unloadModule('cc');
          } catch (e) {
            console.error('Could not unload captions module', e);
          }
        },
        onStateChange: (event: any) => {
          const playing = event.data === window.YT.PlayerState.PLAYING;
          setIsPlaying(playing);
          if (playing) {
            setShowTapHint(false);
            try {
              event.target.unloadModule('captions');
              event.target.unloadModule('cc');
            } catch (e) {}
          }
        }
      }
    });
  };

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          if (onProgress) onProgress(time, duration);

          // Buffered
          try {
            const frac = playerRef.current.getVideoLoadedFraction();
            setBuffered(frac * duration);
          } catch {}

          if (showSubtitles && subtitles.length > 0) {
            const adjustedTime = time - subtitleDelay;
            const cue = subtitles.find(c => adjustedTime >= c.start && adjustedTime <= c.end);
            setCurrentSubtitle(cue ? cue.text : '');
          } else {
            setCurrentSubtitle('');
          }
        }
      }, 100);
    }
    return () => window.clearInterval(interval);
  }, [isPlaying, showSubtitles, subtitles, subtitleDelay, duration, onProgress]);

  // Auto-show subtitles when track changes from outside
  useEffect(() => {
    if (activeSubtitleTrack) {
      setShowSubtitles(true);
    }
  }, [activeSubtitleTrack?.id]);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPlaying]);

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !duration) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = fraction * duration;
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  };

  const handleSeekBarTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !duration) return;
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = seekBarRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const time = fraction * duration;
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

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
  }, [togglePlay, toggleFullscreen, currentTime, setShowSubtitles]);

  const formatTime = (time: number) => {
    const hrs = Math.floor(time / 3600);
    const min = Math.floor((time % 3600) / 60);
    const sec = Math.floor(time % 60);
    if (hrs > 0) return `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

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
      onMouseMove={resetHideTimer}
      onTouchStart={() => {
        resetHideTimer();
        handleContainerTap();
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(false);
        }
      }}
    >
      {/* ===== VIDEO IFRAME / YT PLAYER ===== */}
      {serverType === 'youtube' && (
        <div id={`youtube-player-${videoId}`} className="w-full h-full pointer-events-none" />
      )}
      {serverType === 'drive' && (
        <iframe 
          src={`https://drive.google.com/file/d/${videoId}/preview`} 
          className="w-full h-full border-0" 
          allow="autoplay; fullscreen"
          allowFullScreen
        />
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

      {/* ===== SUBTITLE DISPLAY ===== */}
      {serverType === 'youtube' && showSubtitles && currentSubtitle && (
        <div className="absolute bottom-20 md:bottom-24 left-0 right-0 flex justify-center pointer-events-none px-4 md:px-8 z-10">
          <div 
            className="bg-black/70 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-center leading-relaxed max-w-[85%]"
            style={{ 
              fontSize: `${subSize}px`,
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              lineHeight: 1.5,
            }}
          >
            {currentSubtitle}
          </div>
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
          className="absolute inset-0 z-0 cursor-pointer" 
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
              onClick={handleSeekBarClick}
              onMouseMove={handleSeekBarHover}
              onMouseLeave={() => setHoverTime(null)}
              onTouchStart={handleSeekBarTouch}
              onTouchMove={handleSeekBarTouch}
              onTouchEnd={handleSeekBarTouch}
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
                  {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
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

          {subtitleTracks.length > 0 && serverType === 'youtube' && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowSettings(!showSettings);
              }}
              className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-lg border ${showSettings ? 'bg-black/80 text-brand border-brand/30 rotate-45' : 'bg-black/50 hover:bg-black/70 text-white border-white/10'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          )}
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
