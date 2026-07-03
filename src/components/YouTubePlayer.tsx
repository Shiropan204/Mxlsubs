import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SubtitleCue } from '../types';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface YouTubePlayerProps {
  videoId: string;
  subtitles?: SubtitleCue[];
  subtitleDelay?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function YouTubePlayer({ videoId, subtitles = [], subtitleDelay = 0, onProgress, initialTime = 0 }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [showSubtitles, setShowSubtitles] = useLocalStorage('showSubtitles', true);
  const [subSize, setSubSize] = useLocalStorage('subSize', 24);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

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
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
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

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
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

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

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
  }, [togglePlay, currentTime, setShowSubtitles]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div 
      className={`relative w-full aspect-video bg-black md:rounded-lg overflow-hidden group ${theaterMode ? 'fixed inset-4 z-50 rounded-xl shadow-2xl transition-all' : ''}`}
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onMouseMove={() => {
        setShowControls(true);
      }}
    >
      {theaterMode && (
         <div className="fixed inset-0 bg-black/90 -z-10" onClick={() => setTheaterMode(false)} />
      )}

      <div id={`youtube-player-${videoId}`} className="w-full h-full pointer-events-none" />

      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none px-4 z-10 transition-opacity duration-200">
          <div 
            className="bg-black/65 text-white rounded-md px-3 py-1 text-center font-sans"
            style={{ 
              fontSize: `${subSize}px`, 
              textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)' 
            }}
          >
            {currentSubtitle}
          </div>
        </div>
      )}

      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 flex flex-col gap-2 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand"
            style={{
               background: `linear-gradient(to right, var(--brand-pink) ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-brand transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-brand transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`text-sm font-bold px-1 border-b-2 transition-colors ${showSubtitles ? 'border-brand text-brand' : 'border-transparent hover:text-gray-300'}`}
              title="Toggle Subtitles (C)"
            >
              =
            </button>
            <button 
              onClick={() => setTheaterMode(!theaterMode)}
              className="text-sm hover:text-brand transition-colors font-semibold"
              title="Theater Mode"
            >
              [ ]
            </button>
            <button onClick={toggleFullscreen} className="hover:text-brand transition-colors" title="Fullscreen (F)">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute inset-0 z-0 cursor-pointer flex items-center justify-center" 
        onClick={togglePlay}
        style={{ height: 'calc(100% - 60px)' }}
      >
        <div className={`absolute inset-0 flex items-center justify-center gap-8 md:gap-16 transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 bg-black/40 backdrop-blur-[1px]' : 'opacity-0'}`}>
          <button 
            onClick={skipBackward}
            className="p-3 md:p-4 rounded-full bg-black/50 text-white hover:bg-brand/80 transition-all transform hover:scale-110 active:scale-95"
            title="Rewind 10s"
          >
            <RotateCcw size={32} className="md:w-10 md:h-10" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-5 md:p-6 rounded-full bg-brand text-white hover:bg-brand-strong shadow-lg shadow-brand/20 transition-all transform hover:scale-110 active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={40} className="md:w-12 md:h-12 fill-current" /> : <Play size={40} className="md:w-12 md:h-12 fill-current ml-2" />}
          </button>
          
          <button 
            onClick={skipForward}
            className="p-3 md:p-4 rounded-full bg-black/50 text-white hover:bg-brand/80 transition-all transform hover:scale-110 active:scale-95"
            title="Skip 10s"
          >
            <RotateCw size={32} className="md:w-10 md:h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}
