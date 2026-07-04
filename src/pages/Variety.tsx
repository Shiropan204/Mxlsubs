import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { episodes } from '../data/episodes';
import { Play, Tv2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Variety() {
  const varietyEps = useMemo(
    () => episodes.filter(ep => ep.type === 'Variety'),
    []
  );

  // Get all unique series names from variety episodes
  const seriesList = useMemo(() => {
    const names = varietyEps
      .map(ep => ep.series)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set(names));
  }, [varietyEps]);

  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [customThumbnails] = useLocalStorage<Record<string, string>>('customThumbnails', {});
  const [watchHistory] = useLocalStorage<Record<string, { currentTime: number; duration: number } | number>>('watchHistory', {});

  const getProgress = (id: string) => {
    const h = watchHistory[id];
    if (!h) return 0;
    if (typeof h === 'number') return Math.min(100, (h / 100) * 100);
    if (!h.duration) return 0;
    return Math.min(100, (h.currentTime / h.duration) * 100);
  };

  const displayed = activeSeries
    ? varietyEps.filter(ep => ep.series === activeSeries)
    : varietyEps;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
          <Tv2 size={22} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Variety</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Program variety =LOVE dengan subtitle Indonesia
          </p>
        </div>
      </div>

      {/* Series Filter Chips */}
      {seriesList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Filter Series</p>
          <div className="flex flex-wrap gap-2">
            {/* "Semua" chip */}
            <button
              onClick={() => setActiveSeries(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeSeries === null
                  ? 'bg-brand text-white border-brand shadow-md shadow-brand/30'
                  : 'bg-bg-surface text-text-muted border-border-subtle hover:border-brand/40 hover:text-brand'
              }`}
            >
              Semua ({varietyEps.length})
            </button>

            {seriesList.map(name => {
              const count = varietyEps.filter(ep => ep.series === name).length;
              const isActive = activeSeries === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveSeries(isActive ? null : name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    isActive
                      ? 'bg-brand text-white border-brand shadow-md shadow-brand/30'
                      : 'bg-bg-surface text-text-muted border-border-subtle hover:border-brand/40 hover:text-brand'
                  }`}
                >
                  {name}
                  <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Series Banner */}
      {activeSeries && (
        <div className="rounded-2xl bg-gradient-to-r from-brand/10 to-transparent border border-brand/20 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand/70 mb-0.5">Series</p>
            <h2 className="text-lg font-heading font-bold">{activeSeries}</h2>
          </div>
          <button
            onClick={() => setActiveSeries(null)}
            className="text-xs text-text-muted hover:text-brand underline transition-colors"
          >
            Lihat Semua
          </button>
        </div>
      )}

      {/* Episode Grid */}
      {displayed.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayed.map(ep => {
            const thumb = customThumbnails[ep.id] || ep.thumbnailUrl ||
              (ep.servers?.[0]?.id === 'youtube'
                ? `https://img.youtube.com/vi/${ep.servers[0].videoId}/hqdefault.jpg`
                : ep.videoId
                  ? `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`
                  : '');
            const progress = getProgress(ep.id);

            return (
              <Link
                key={ep.id}
                to={`/episode/${ep.id}`}
                className="group flex flex-col gap-2"
              >
                <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-md shadow-black/10 dark:shadow-black/30 bg-bg-surface">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={ep.title}
                      className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/5">
                      <Tv2 size={32} className="text-brand/30" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play size={18} className="fill-black text-black ml-0.5" />
                    </div>
                  </div>

                  {/* Date badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                    {ep.date}
                  </div>

                  {/* Series badge */}
                  {ep.series && (
                    <div className="absolute top-2 left-2 bg-brand/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                      {ep.series}
                    </div>
                  )}

                  {/* Progress bar */}
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                      <div
                        className="h-full bg-brand rounded-r-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="px-0.5">
                  <h3 className="font-heading font-semibold text-[13px] md:text-sm line-clamp-2 leading-snug group-hover:text-brand transition-colors">
                    {ep.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {ep.subtitleTags?.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] text-white bg-brand/80 border border-brand/50 px-1.5 py-0.5 rounded shadow-sm font-bold uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                    {ep.members.slice(0, 2).map(m => (
                      <span key={m} className="text-[10px] text-text-muted">{m}</span>
                    ))}
                    {ep.members.length > 2 && (
                      <span className="text-[10px] text-text-muted">+{ep.members.length - 2}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50">
          <Tv2 size={40} className="text-brand/20 mx-auto mb-3" />
          <p className="text-sm text-text-muted">Belum ada episode variety.</p>
          <p className="text-xs text-text-muted/60 mt-1">Stay tuned! 🎀</p>
        </div>
      )}
    </div>
  );
}
