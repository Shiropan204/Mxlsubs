import { useParams, Navigate, Link } from 'react-router-dom';
import { episodes } from '../data/episodes';
import VideoPlayer from '../components/VideoPlayer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AlertCircle, Languages, Share2, MessageCircle, Upload } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SubtitleCue, VideoServer, SubtitleTrack } from '../types';

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
    if (line.startsWith('WEBVTT') || line.startsWith('Region:') || line.startsWith('Style:')) {
      continue;
    }
    
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
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedSubtitles, setFetchedSubtitles] = useState<SubtitleCue[] | null>(null);
  const vttInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // New state for servers and subtitles
  const [activeServer, setActiveServer] = useState<VideoServer | undefined>();
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState<SubtitleTrack | null | undefined>(undefined); // undefined = uninitialized

  useEffect(() => {
    if (episode) {
      if (episode.servers && episode.servers.length > 0) {
        setActiveServer(episode.servers[0]);
      } else if (episode.videoId) {
        setActiveServer({ id: 'youtube', name: 'YouTube', videoId: episode.videoId });
      }

      if (episode.subtitleTracks && episode.subtitleTracks.length > 0) {
        setActiveSubtitleTrack(episode.subtitleTracks[0]);
      } else if (episode.vttUrl) {
        setActiveSubtitleTrack({ id: 'default', label: 'Default', url: episode.vttUrl });
      } else {
        setActiveSubtitleTrack(null);
      }
    }
  }, [episode?.id]);

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
    if (!showCopiedToast) return;
    const timer = window.setTimeout(() => setShowCopiedToast(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showCopiedToast]);

  useEffect(() => {
    if (activeSubtitleTrack && activeSubtitleTrack.url) {
      fetch(activeSubtitleTrack.url)
        .then(res => {
          if (!res.ok) throw new Error('VTT not found');
          return res.text();
        })
        .then(text => setFetchedSubtitles(parseVTT(text)))
        .catch(err => {
          console.warn('Failed to load subtitles from vttUrl', err);
          setFetchedSubtitles(null);
        });
    } else {
      setFetchedSubtitles(null);
    }
  }, [activeSubtitleTrack?.url]);

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

  const activeSubtitles = customSubtitles[episode.id] || fetchedSubtitles || episode.subtitles;
  const servers = episode.servers || (episode.videoId ? [{ id: 'youtube', name: 'YouTube', videoId: episode.videoId } as VideoServer] : []);
  const subtitleTracks = episode.subtitleTracks || (episode.vttUrl ? [{ id: 'default', label: 'Default', url: episode.vttUrl } as SubtitleTrack] : []);

  // Detect Indonesian and English subtitles availability (check both tracks and tags)
  const combined = subtitleTracks.map(track => `${track.id || ''} ${track.label || ''}`).join(' ').toLowerCase();
  const tags = episode.subtitleTags ? episode.subtitleTags.join(' ').toLowerCase() : '';
  const fullSubtitleInfo = (combined + ' ' + tags).toLowerCase();
  const hasIndonesian = /(indonesia|indonesian|indo|id|bahasa)/.test(fullSubtitleInfo);
  const hasEnglish = /(english|eng|en)/.test(fullSubtitleInfo);
  const showSubtitleBanner = hasIndonesian || hasEnglish;

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setShowCopiedToast(true);
    } catch (error) {
      console.warn('Failed to copy link automatically', error);
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-0 md:py-8 flex flex-col lg:flex-row gap-10">
      {showCopiedToast && (
        <div className="fixed bottom-4 right-4 z-[120] rounded-xl border border-brand/20 bg-bg-surface/95 px-4 py-3 text-sm font-medium text-text-primary shadow-lg shadow-black/10 backdrop-blur">
          Link copied to clipboard!
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-0">
        {/* Video Player */}
        <div className="w-full md:rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
          <VideoPlayer 
            servers={servers}
            activeServer={activeServer}
            onServerChange={setActiveServer}
            subtitleTracks={subtitleTracks}
            activeSubtitleTrack={activeSubtitleTrack}
            onSubtitleChange={setActiveSubtitleTrack}
            videoId={activeServer?.videoId || episode.videoId || ''} 
            serverType={activeServer?.id || 'youtube'}
            subtitles={activeSubtitles}
            onProgress={handleProgress}
            initialTime={initialTime}
          />
        </div>
        
        <div className="px-4 md:px-0 space-y-6 mt-6">
          {showSubtitleBanner && (
            <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.08] to-transparent p-4 shadow-sm shadow-brand/5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-brand/10 p-2 text-brand">
                  <Languages size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">Subtitles Available</p>
                  <p className="text-sm text-text-muted">
                    {hasIndonesian && hasEnglish && (
                      <><span className="mr-1">🇮🇩</span> Indonesian & <span className="ml-1 mr-1">🇺🇸</span> English subtitles tersedia.</>
                    )}
                    {hasIndonesian && !hasEnglish && (
                      <><span className="mr-1">🇮🇩</span> Indonesian subtitles tersedia. <span className="ml-1 mr-1">🇺🇸</span> English coming soon.</>
                    )}
                    {!hasIndonesian && hasEnglish && (
                      <><span className="mr-1">🇺🇸</span> English subtitles tersedia. <span className="ml-1 mr-1">🇮🇩</span> Indonesian coming soon.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title & Info Card */}
          <div className="space-y-5">
            <h1 className="text-xl md:text-3xl font-heading font-bold leading-tight tracking-tight">{episode.title}</h1>
            
            {/* Meta Info Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {episode.date}
                </span>
                <span className="hidden sm:inline text-border-subtle">|</span>
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                  {episode.type}
                </span>
                {episode.subtitleTags && episode.subtitleTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-white bg-white/10 border border-white/20 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {showUploadControls && (
                  <>
                    <input type="file" accept=".vtt" className="hidden" ref={vttInputRef} onChange={handleVTTUpload} />
                    <input type="file" accept="image/*" className="hidden" ref={thumbnailInputRef} onChange={handleThumbnailUpload} />
                    <button 
                      onClick={() => vttInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand/15 to-brand/5 hover:from-brand/25 hover:to-brand/15 text-brand rounded-xl text-sm font-semibold transition-all duration-200 border border-brand/20 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
                      title="Upload .vtt file (Persists locally)"
                    >
                      <Upload size={15} /> Subtitle
                    </button>
                    <button 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand/15 to-brand/5 hover:from-brand/25 hover:to-brand/15 text-brand rounded-xl text-sm font-semibold transition-all duration-200 border border-brand/20 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
                      title="Upload custom thumbnail (Persists locally)"
                    >
                      <Upload size={15} /> Thumbnail
                    </button>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-surface hover:bg-border-subtle rounded-xl text-sm font-semibold transition-all duration-200 flex-1 sm:flex-none border border-border-subtle hover:border-brand/30 hover:text-brand hover:shadow-md hover:shadow-brand/5"
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
          
            {/* Members & Tags */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted mr-1">Members</span>
                {episode.members.map(m => (
                  <Link 
                    key={m} 
                    to={`/?search=${m}`} 
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-brand/40 to-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                      {m.charAt(0)}
                    </span>
                    {m}
                  </Link>
                ))}
              </div>
              
              {episode.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted mr-1">Tags</span>
                  {episode.tags.map(t => (
                    <span key={t} className="text-xs font-medium bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full text-text-muted hover:text-brand hover:border-brand/30 transition-colors cursor-default">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          
            {/* Translator Notes */}
            {episode.translatorNotes && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-brand/15 bg-gradient-to-br from-brand/[0.03] to-transparent">
                <button 
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-brand/[0.07] hover:bg-brand/[0.12] transition-colors"
                >
                  <span className="flex items-center gap-2 text-brand font-heading font-semibold text-sm">
                    <MessageCircle size={16} />
                    Catatan Penerjemah
                  </span>
                  <span className={`text-brand transition-transform duration-300 ${showNotes ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {showNotes && (
                  <div className="px-5 py-4 text-sm text-text-muted leading-relaxed border-t border-brand/10">
                    {episode.translatorNotes}
                  </div>
                )}
              </div>
            )}
          
            {/* Report Issue */}
            <div className="pt-6 pb-4">
               <a href="https://x.com/Mxlsubs" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-all duration-200">
                 <AlertCircle size={15} className="group-hover:scale-110 transition-transform" /> Lapor Masalah Subtitle (Typo/Timing) via X/Twitter
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-5 px-4 md:px-0 lg:pt-0">
        <div className="lg:sticky lg:top-24 space-y-5">
          <h3 className="font-heading font-bold text-base uppercase tracking-wider text-text-muted flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-brand to-brand/30" />
            Episode Terkait
          </h3>
          <div className="flex flex-col gap-3">
            {relatedEpisodes.map(ep => (
              <Link key={ep.id} to={`/episode/${ep.id}`} className="group flex gap-3 p-2 -mx-2 rounded-xl hover:bg-bg-surface transition-all duration-200">
                <div className="w-36 aspect-video bg-bg-surface rounded-xl overflow-hidden shrink-0 relative border border-border-subtle group-hover:border-brand/30 transition-colors shadow-sm">
                  <img 
                    src={customThumbnails[ep.id] || ep.thumbnailUrl || (ep.servers?.[0]?.id === 'youtube' ? `https://img.youtube.com/vi/${ep.servers[0].videoId}/mqdefault.jpg` : ep.videoId ? `https://img.youtube.com/vi/${ep.videoId}/mqdefault.jpg` : '')} 
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex flex-col justify-center py-0.5 gap-1.5 min-w-0">
                  <h4 className="font-heading font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                    {ep.title}
                  </h4>
                  <span className="text-[11px] text-text-muted font-medium">{ep.date}</span>
                </div>
              </Link>
            ))}
            {relatedEpisodes.length === 0 && (
              <div className="text-center py-10 rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50">
                <p className="text-sm text-text-muted">Belum ada episode terkait.</p>
                <p className="text-xs text-text-muted/60 mt-1">Stay tuned! 🎀</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
