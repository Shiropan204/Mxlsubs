import React, { useState, useEffect, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { episodes } from '../data/episodes';
import { Search, Play, Filter, X, Clock, Sparkles } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Reusable horizontal scroll row component
function ContentRow({ title, icon, children, className = '' }: { title: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 px-4">
        {icon}
        <h2 className="text-base md:text-xl font-heading font-bold">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {children}
        <div className="w-1 flex-shrink-0" aria-hidden="true"></div>
      </div>
    </section>
  );
}

// Episode card for horizontal rows (large, streaming-style)
function EpisodeCard({ ep, customThumbnail, progress, size = 'normal' }: { 
  key?: string | number;
  ep: typeof episodes[0]; 
  customThumbnail?: string; 
  progress?: number;
  size?: 'large' | 'normal' | 'wide' | 'grid';
}) {
  const widthClass = 
    size === 'large' ? 'w-[75vw] md:w-80' : 
    size === 'wide' ? 'w-[85vw] md:w-96' : 
    size === 'grid' ? 'w-full' : 
    'w-[42vw] md:w-56';
  
  return (
    <Link to={`/episode/${ep.id}`} className={`group flex-none ${widthClass} flex flex-col gap-2`}>
      <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-sm shadow-black/5 dark:shadow-black/20 bg-bg-surface border border-border-subtle/30">
        <img 
          src={customThumbnail || ep.thumbnailUrl || `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`} 
          alt={ep.title}
          className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Gradient overlay on bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play icon on hover */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:group-hover:scale-110">
          <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30">
            <Play size={20} className="fill-current ml-0.5" />
          </div>
        </div>

        {/* Top badges (minimalist) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <div className="bg-black/70 backdrop-blur-md text-white/90 text-[9px] md:text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide">
            {ep.date}
          </div>
        </div>

        {/* Progress bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
            <div className="h-full bg-brand rounded-r-full" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>
      <div className="px-0.5 mt-0.5">
        <h3 className="font-heading font-semibold text-[13px] md:text-sm line-clamp-2 leading-snug group-hover:text-brand transition-colors">
          {ep.title}
        </h3>
        {/* Minimal metadata text instead of colorful badges */}
        <div className="flex items-center gap-1.5 mt-1 text-[11px] md:text-xs text-text-muted">
          <span>{ep.type}</span>
          {ep.subtitleTags && ep.subtitleTags.length > 0 && (
            <>
              <span className="text-border-subtle/50 text-[8px]">•</span>
              <span className="text-brand/80 font-medium">{ep.subtitleTags.join(', ')}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const selectedCategories = searchParams.getAll('type');
  const selectedMembers = searchParams.getAll('member');
  
  const setSelectedCategories = (categories: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('type');
    categories.forEach(c => newParams.append('type', c));
    setSearchParams(newParams);
  };

  const setSelectedMembers = (members: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('member');
    members.forEach(m => newParams.append('member', m));
    setSearchParams(newParams);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customThumbnails] = useLocalStorage<Record<string, string>>('customThumbnails', {});
  const [watchHistory] = useLocalStorage<Record<string, { currentTime: number, duration: number } | number>>('watchHistory', {});
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    try {
      const stored = sessionStorage.getItem('recentlyViewed');
      if (stored) {
        setRecentlyViewedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading recentlyViewed', e);
    }
    return () => clearTimeout(timer);
  }, []);

  // Searching mode
  const isSearching = search || selectedCategories.length > 0 || selectedMembers.length > 0;

  // Auto-slider effect
  useEffect(() => {
    if (isSearching || isLoading) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % 5); // top 5 featured
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [isSearching, isLoading]);

  const filteredEpisodes = episodes.filter(ep => {
    const matchesSearch = ep.title.toLowerCase().includes(search.toLowerCase()) || 
                          ep.members.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedCategories.length === 0 || selectedCategories.includes(ep.type);
    const matchesMember = selectedMembers.length === 0 || selectedMembers.some(sm => ep.members.includes(sm));
    return matchesSearch && matchesType && matchesMember;
  });

  const recentlyViewed = recentlyViewedIds.map(id => episodes.find(e => e.id === id)).filter(Boolean) as typeof episodes;

  const categories = ['all', 'IKONOIJOY Channel', 'Music Video', 'Concert', 'Variety', 'Behind the Scenes'];
  const allMembers = Array.from(new Set(episodes.flatMap(ep => ep.members))).sort();

  const getProgressWidth = (id: string) => {
    const historyEntry = watchHistory[id];
    if (!historyEntry) return 0;
    if (typeof historyEntry === 'number') return Math.min(100, (historyEntry / 100) * 100);
    if (!historyEntry.duration) return 0;
    return Math.min(100, (historyEntry.currentTime / historyEntry.duration) * 100);
  };


  // Categorized episodes for shelves
  const ikonoijoyEps = episodes.filter(ep => ep.type === 'IKONOIJOY Channel');
  const latestEps = [...episodes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredEpisodes = latestEps.slice(0, 5);
  const featured = featuredEpisodes[featuredIndex] || featuredEpisodes[0];

  return (
    <div className="w-full pb-8">
      
      {/* ====== MOBILE HERO (Auto Slide) ====== */}
      {!isSearching && !isLoading && featuredEpisodes.length > 0 && (
        <section className="md:hidden relative aspect-[16/9] overflow-hidden">
          {featuredEpisodes.map((ep, idx) => (
            <div 
              key={`mob-${ep.id}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === featuredIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <img 
                src={customThumbnails[ep.id] || ep.thumbnailUrl || `https://img.youtube.com/vi/${ep.videoId}/maxresdefault.jpg`} 
                onError={(e) => {
                  if (e.currentTarget.src.includes('maxresdefault.jpg')) {
                    e.currentTarget.src = `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`;
                  }
                }}
                alt={ep.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Subtle bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          {/* Content pinned to bottom-left */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
            <div key={`mob-content-${featured.id}`} className="flex items-end justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 pointer-events-auto">
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-brand bg-brand/20 backdrop-blur-sm px-2 py-0.5 rounded-md mb-1.5 shadow-sm border border-brand/30">
                  Terbaru
                </span>
                <h2 className="text-white font-heading font-bold text-base leading-snug line-clamp-2 drop-shadow-lg">
                  {featured.title}
                </h2>
              </div>
              {/* Play button */}
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/episode/${featured.id}`} className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-brand/30 active:scale-95 transition-transform">
                  <Play size={14} className="fill-current" />
                  Tonton
                </Link>
              </div>
            </div>
            
            {/* Slider Indicators Mobile */}
            <div className="flex items-center gap-1.5 mt-3 pointer-events-auto">
              {featuredEpisodes.map((_, idx) => (
                <button
                  key={`mob-ind-${idx}`}
                  onClick={(e) => { e.preventDefault(); setFeaturedIndex(idx); }}
                  className={`h-1 rounded-full transition-all duration-500 ease-in-out ${idx === featuredIndex ? 'w-4 bg-brand shadow-[0_0_4px_rgba(234,102,135,0.8)]' : 'w-1.5 bg-white/40'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== DESKTOP HERO (Premium Banner Auto Slide) ====== */}
      {!isSearching && !isLoading && featuredEpisodes.length > 0 && (
        <section className="hidden md:block w-full max-w-7xl mx-auto px-4 pt-8 group">
          <div className="block relative rounded-3xl overflow-hidden bg-black aspect-[21/9] shadow-2xl shadow-black/20">
            {/* Background blurred image */}
            <div className="absolute inset-0 opacity-40">
              {featuredEpisodes.map((ep, idx) => (
                <img 
                  key={`blur-${ep.id}`}
                  src={customThumbnails[ep.id] || ep.thumbnailUrl || `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`} 
                  alt="Background blur"
                  className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-1000 ease-in-out ${idx === featuredIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
            </div>
            
            {/* Main sharp image masked on the right */}
            <div className="absolute top-0 right-0 bottom-0 w-2/3 md:w-3/4">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
              {featuredEpisodes.map((ep, idx) => (
                <img 
                  key={`main-${ep.id}`}
                  src={customThumbnails[ep.id] || ep.thumbnailUrl || `https://img.youtube.com/vi/${ep.videoId}/maxresdefault.jpg`} 
                  onError={(e) => {
                    if (e.currentTarget.src.includes('maxresdefault.jpg')) {
                      e.currentTarget.src = `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`;
                    }
                  }}
                  alt={ep.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === featuredIndex ? 'opacity-100 scale-100 md:group-hover:scale-105' : 'opacity-0 scale-105'}`}
                  style={{ maskImage: 'linear-gradient(to right, transparent, black 15%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)' }}
                />
              ))}
            </div>

            {/* Gradient Overlay for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 lg:p-14 w-full md:w-3/4 lg:w-2/3 pointer-events-none">
              <div key={`desk-content-${featured.id}`} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700 ease-out pointer-events-auto">
                <span className="inline-block px-3 py-1 rounded-full bg-brand/20 backdrop-blur-md text-brand font-bold text-xs tracking-widest uppercase border border-brand/30 shadow-sm">
                  Rilisan Terbaru
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-bold leading-tight text-white drop-shadow-lg">
                  {featured.title}
                </h1>
                <p className="text-white/80 text-base md:text-lg max-w-xl line-clamp-2 drop-shadow-md">
                  Saksikan keseruan member =LOVE di episode terbaru!
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Link 
                    to={`/episode/${featured.id}`}
                    className="inline-flex items-center gap-3 bg-brand text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-strong transition-all hover:scale-105 shadow-[0_0_20px_rgba(234,102,135,0.4)] active:scale-95"
                  >
                    <Play size={18} className="fill-current" />
                    Tonton Sekarang
                  </Link>
                  <Link 
                    to={`/episode/${featured.id}`}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
                  >
                    <Sparkles size={20} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
              {featuredEpisodes.map((_, idx) => (
                <button
                  key={`desk-ind-${idx}`}
                  onClick={(e) => { e.preventDefault(); setFeaturedIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${idx === featuredIndex ? 'w-8 bg-brand shadow-[0_0_8px_rgba(234,102,135,0.8)]' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="px-4 pt-4 md:max-w-7xl md:mx-auto md:pt-8 space-y-6 animate-pulse">
          <div className="aspect-[16/9] md:aspect-[21/9] bg-border-subtle rounded-xl md:rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 w-32 bg-border-subtle rounded" />
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-[42vw] md:w-56 aspect-video bg-border-subtle rounded-xl flex-none" />)}
            </div>
          </div>
        </div>
      )}

      {/* ====== CONTENT SHELVES (Rak Toko) ====== */}
      {/* ====== SHELVES / GRID ====== */}
      {!isLoading && !isSearching && (
        <div className="space-y-10 md:space-y-16 mt-8 md:mt-12 max-w-7xl md:mx-auto">
          
          {/* Continue Watching */}
          {recentlyViewed.length > 0 && (
            <ContentRow 
              title="Lanjutkan Menonton" 
              icon={<Clock size={18} className="text-brand" />}
            >
              {recentlyViewed.map(ep => (
                <EpisodeCard 
                  key={`recent-${ep.id}`} 
                  ep={ep} 
                  customThumbnail={customThumbnails[ep.id]}
                  progress={getProgressWidth(ep.id)}
                  size="wide"
                />
              ))}
            </ContentRow>
          )}

          {/* Baru Ditambahkan */}
          <ContentRow 
            title="Baru Ditambahkan" 
            icon={<Sparkles size={18} className="text-brand" />}
          >
            {latestEps.map(ep => (
              <EpisodeCard 
                key={`latest-${ep.id}`} 
                ep={ep} 
                customThumbnail={customThumbnails[ep.id]}
                progress={getProgressWidth(ep.id)}
                size="large"
              />
            ))}
          </ContentRow>

          {/* IKONOIJOY Channel */}
          {ikonoijoyEps.length > 0 && (
            <ContentRow title="IKONOIJOY Channel">
              {ikonoijoyEps.map(ep => (
                <EpisodeCard 
                  key={`iko-${ep.id}`} 
                  ep={ep} 
                  customThumbnail={customThumbnails[ep.id]}
                  progress={getProgressWidth(ep.id)}
                  size="large"
                />
              ))}
            </ContentRow>
          )}

          {/* Semua Episode heading + grid (desktop-friendly) */}
          <section className="px-4 space-y-4">
            <h2 className="text-base md:text-xl font-heading font-bold">Semua Episode</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {episodes.map(ep => (
                <EpisodeCard 
                  key={ep.id} 
                  ep={ep} 
                  customThumbnail={customThumbnails[ep.id]}
                  progress={getProgressWidth(ep.id)}
                  size="grid"
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ====== SEARCH/FILTER MODE ====== */}
      {!isLoading && isSearching && (
        <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Cari judul, member..." 
                value={search}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    searchParams.set('search', val);
                  } else {
                    searchParams.delete('search');
                  }
                  setSearchParams(searchParams);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm font-medium text-text-primary hover:bg-border-subtle transition-colors"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
              {(selectedCategories.length > 0 || selectedMembers.length > 0) && (
                <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedCategories.length + selectedMembers.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Chips */}
          {(selectedCategories.length > 0 || selectedMembers.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted mr-1">Filter:</span>
              {selectedCategories.map(c => (
                <span key={`cat-${c}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand text-[11px] font-medium rounded-full border border-brand/20">
                  {c}
                  <button onClick={() => setSelectedCategories(selectedCategories.filter(sc => sc !== c))} className="hover:text-brand-strong"><X size={12} /></button>
                </span>
              ))}
              {selectedMembers.map(m => (
                <span key={`mem-${m}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand text-[11px] font-medium rounded-full border border-brand/20">
                  {m}
                  <button onClick={() => setSelectedMembers(selectedMembers.filter(sm => sm !== m))} className="hover:text-brand-strong"><X size={12} /></button>
                </span>
              ))}
              <button 
                onClick={() => { 
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('type');
                  newParams.delete('member');
                  setSearchParams(newParams);
                }}
                className="text-[11px] text-text-muted hover:text-text-primary underline"
              >
                Hapus Semua
              </button>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredEpisodes.map(ep => (
              <EpisodeCard 
                key={ep.id} 
                ep={ep} 
                customThumbnail={customThumbnails[ep.id]}
                progress={getProgressWidth(ep.id)}
                size="grid"
              />
            ))}
          </div>
          
          {filteredEpisodes.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <p className="text-sm">Tidak ada episode yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      )}

      {/* Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
          <div 
            className="w-full max-w-sm h-full bg-bg-surface border-l border-border-subtle shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right fade-in duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Filter size={20} className="text-brand" /> Filter
              </h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-border-subtle rounded-full transition-colors text-text-muted">
                <X size={20} />
              </button>
            </div>
            
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Kategori</h3>
              <div className="flex flex-col gap-3">
                 {categories.filter(c => c !== 'all').map(c => {
                    const isDisabled = c !== 'IKONOIJOY Channel';
                    return (
                    <label key={c} className={`flex items-center gap-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          disabled={isDisabled}
                          checked={selectedCategories.includes(c)} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCategories([...selectedCategories, c]);
                            else setSelectedCategories(selectedCategories.filter(sc => sc !== c));
                          }} 
                          className={`w-5 h-5 rounded-md border-2 border-border-subtle appearance-none ${isDisabled ? 'cursor-not-allowed' : 'checked:bg-brand checked:border-brand cursor-pointer'} transition-colors`} 
                        />
                        {selectedCategories.includes(c) && <X size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none rotate-45" />}
                      </div>
                      <span className={`text-sm font-medium text-text-primary ${!isDisabled && 'group-hover:text-brand'} transition-colors`}>{c}</span>
                    </label>
                 );})}
              </div>
            </div>
            
            {/* Members */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Pemeran / Member</h3>
              <div className="flex flex-col gap-3">
                 {allMembers.map(m => (
                    <label key={m} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(m)} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMembers([...selectedMembers, m]);
                            else setSelectedMembers(selectedMembers.filter(sm => sm !== m));
                          }} 
                          className="w-5 h-5 rounded-md border-2 border-border-subtle appearance-none checked:bg-brand checked:border-brand transition-colors cursor-pointer" 
                        />
                        {selectedMembers.includes(m) && <X size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none rotate-45" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">{m}</span>
                    </label>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
