import { useParams, Navigate, Link } from 'react-router-dom';
import { episodes } from '../data/episodes';
import YouTubePlayer from '../components/YouTubePlayer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AlertCircle, Download, Share2, MessageCircle, Upload } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { SubtitleCue } from '../types';

const parseVTT = (vttString: string): SubtitleCue[] => {
  const lines = vttString.split(/\r?\n/);
  const cues: SubtitleCue[] = [];
  let currentCue: Partial<SubtitleCue> | null = null;

  const timeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':');
    let seconds = 0;
    if (parts.length === 3) {
      seconds += parseInt(parts[0], 10) * 3600;
      seconds += parseInt(parts[1], 10) * 60;
      seconds += parseFloat(parts[2].replace(',', '.'));
    } else if (parts.length === 2) {
      seconds += parseInt(parts[0], 10) * 60;
      seconds += parseFloat(parts[1].replace(',', '.'));
    }
    return seconds;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const times = line.split('-->');
      currentCue = {
        start: timeToSeconds(times[0].trim()),
        end: timeToSeconds(times[1].trim()),
        text: ''
      };
    } else if (line === '') {
      if (currentCue && currentCue.start !== undefined && currentCue.text) {
        currentCue.text = currentCue.text.trim();
        cues.push(currentCue as SubtitleCue);
      }
      currentCue = null;
    } else if (currentCue && !line.match(/^[0-9]+$/)) { // ignore cue numbers
      if (currentCue.text) {
        currentCue.text += '\n' + line;
      } else {
        currentCue.text = line;
      }
    }
  }

  if (currentCue && currentCue.start !== undefined && currentCue.text) {
    currentCue.text = currentCue.text.trim();
    cues.push(currentCue as SubtitleCue);
  }

  return cues;
};

export default function Episode() {
  const { id } = useParams<{ id: string }>();
  const episode = episodes.find(e => e.id === id);
  const [watchHistory, setWatchHistory] = useLocalStorage<Record<string, { currentTime: number, duration: number } | number>>('watchHistory', {});
  const [customSubtitles, setCustomSubtitles] = useLocalStorage<Record<string, SubtitleCue[]>>('customSubtitles', {});
  const [customThumbnails, setCustomThumbnails] = useLocalStorage<Record<string, string>>('customThumbnails', {});
  
  const [showNotes, setShowNotes] = useState(true);
  const [showUploadControls, setShowUploadControls] = useLocalStorage('showUploadControls', false);
  const [isLoading, setIsLoading] = useState(true);
  const vttInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
        setShowUploadControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowUploadControls]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (episode) {
      try {
        const stored = sessionStorage.getItem('recentlyViewed');
        let recent: string[] = stored ? JSON.parse(stored) : [];
        recent = recent.filter(viewedId => viewedId !== episode.id);
        recent.unshift(episode.id);
        if (recent.length > 5) recent = recent.slice(0, 5);
        sessionStorage.setItem('recentlyViewed', JSON.stringify(recent));
      } catch (e) {
        console.warn('Error saving recently viewed', e);
      }
    }
  }, [episode]);

  if (!episode) {
    return <Navigate to="/404" replace />;
  }

  const handleProgress = (currentTime: number, duration: number) => {
    // Only update occasionally to avoid too many renders/saves
    if (Math.floor(currentTime) % 5 === 0) {
      setWatchHistory(prev => ({ ...prev, [episode.id]: { currentTime, duration } }));
    }
  };

  const historyEntry = watchHistory[episode.id];
  const initialTime = typeof historyEntry === 'number' ? historyEntry : (historyEntry?.currentTime || 0);

  const relatedEpisodes = episodes.filter(e => e.id !== episode.id && (e.type === episode.type || e.tags.some(t => episode.tags.includes(t)))).slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8 animate-pulse">
        <div className="flex-1 space-y-6">
          <div className="w-full aspect-video bg-border-subtle rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-border-subtle rounded"></div>
            <div className="h-6 w-1/4 bg-border-subtle rounded"></div>
          </div>
        </div>
        <div className="w-full lg:w-80 space-y-6">
           <div className="h-6 w-1/2 bg-border-subtle rounded mb-4"></div>
           {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="flex gap-3">
               <div className="w-40 aspect-video bg-border-subtle rounded-lg shrink-0"></div>
               <div className="flex-1 space-y-2 py-1">
                 <div className="h-4 bg-border-subtle rounded w-full"></div>
                 <div className="h-4 bg-border-subtle rounded w-2/3"></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  const handleVTTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomSubtitles(prev => ({ ...prev, [episode.id]: parseVTT(content) }));
    };
    reader.readAsText(file);
    if (vttInputRef.current) {
      vttInputRef.current.value = '';
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomThumbnails(prev => ({ ...prev, [episode.id]: content }));
    };
    reader.readAsDataURL(file);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const activeSubtitles = customSubtitles[episode.id] || episode.subtitles;

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-0 md:py-6 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6">
        <div className="w-full">
          <YouTubePlayer 
            videoId={episode.videoId} 
            subtitles={activeSubtitles}
            subtitleDelay={subtitleDelay}
            onProgress={handleProgress}
            initialTime={initialTime}
          />
        </div>
        
        <div className="px-4 md:px-0 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 py-4 bg-bg-surface px-4 rounded-lg border border-border-subtle">
          <label className="text-sm font-medium whitespace-nowrap text-text-muted">Subtitle Delay ({subtitleDelay > 0 ? `+${subtitleDelay.toFixed(1)}s` : `${subtitleDelay.toFixed(1)}s`})</label>
          <input 
            type="range" 
            min="-10" 
            max="10" 
            step="0.1"
            value={subtitleDelay} 
            onChange={(e) => setSubtitleDelay(parseFloat(e.target.value))}
            className="flex-1"
          />
          <button 
            onClick={() => setSubtitleDelay(0)}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-xl md:text-3xl font-heading font-bold leading-tight">{episode.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>{episode.date}</span>
              <span className="hidden sm:inline">•</span>
              <span className="uppercase tracking-wider font-semibold bg-bg-surface px-2 py-1 rounded-md border border-border-subtle sm:border-none sm:p-0 sm:bg-transparent">{episode.type}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {showUploadControls && (
                <>
                  <input 
                    type="file" 
                    accept=".vtt" 
                    className="hidden" 
                    ref={vttInputRef}
                    onChange={handleVTTUpload}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailUpload}
                  />
                  <button 
                    onClick={() => vttInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-full text-sm font-medium transition-colors"
                    title="Upload .vtt file (Persists locally)"
                  >
                    <Upload size={16} /> Subtitle
                  </button>
                  <button 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-full text-sm font-medium transition-colors"
                    title="Upload custom thumbnail (Persists locally)"
                  >
                    <Upload size={16} /> Thumbnail
                  </button>
                </>
              )}
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-surface hover:bg-border-subtle rounded-full text-sm font-medium transition-colors flex-1 sm:flex-none">
                <Download size={16} /> <span className="hidden sm:inline">Subtitle (.vtt)</span><span className="sm:hidden">Download</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-surface hover:bg-border-subtle rounded-full text-sm font-medium transition-colors flex-1 sm:flex-none">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-text-muted mr-2">Members:</span>
              {episode.members.map(m => (
                <Link key={m} to={`/?search=${m}`} className="text-sm text-brand hover:underline">
                  {m}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-text-muted mr-2">Tags:</span>
              {episode.tags.map(t => (
                <span key={t} className="text-xs bg-bg-surface border border-border-subtle px-2 py-1 rounded">
                  #{t}
                </span>
              ))}
            </div>
          </div>
          
          {/* Translator Notes */}
          {episode.translatorNotes && (
            <div className="mt-8 bg-brand/5 border border-brand/20 rounded-xl overflow-hidden">
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className="w-full px-4 py-3 flex items-center justify-between bg-brand/10 text-brand font-medium"
              >
                Catatan Penerjemah
                <span className="text-lg">{showNotes ? '−' : '+'}</span>
              </button>
              {showNotes && (
                <div className="p-4 text-sm text-text-secondary leading-relaxed">
                  {episode.translatorNotes}
                </div>
              )}
            </div>
          )}
          
          <div className="pt-8">
             <a href="mailto:report@mxlsubs.com" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-colors">
               <AlertCircle size={16} /> Lapor Masalah Subtitle (Typo/Timing)
             </a>
          </div>
        </div>
      </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-6 px-4 md:px-0">
        <h3 className="font-heading font-bold text-lg border-b border-border-subtle pb-2">Episode Terkait</h3>
        <div className="flex flex-col gap-4">
          {relatedEpisodes.map(ep => (
            <Link key={ep.id} to={`/episode/${ep.id}`} className="group flex gap-3">
              <div className="w-40 aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                <img 
                  src={customThumbnails[ep.id] || `https://img.youtube.com/vi/${ep.videoId}/mqdefault.jpg`} 
                  alt={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="flex flex-col py-1">
                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors">
                  {ep.title}
                </h4>
                <span className="text-xs text-text-muted mt-1">{ep.date}</span>
              </div>
            </Link>
          ))}
          {relatedEpisodes.length === 0 && (
            <p className="text-sm text-text-muted">Tidak ada episode terkait.</p>
          )}
        </div>
      </div>
    </div>
  );
}
