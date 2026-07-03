import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { episodes } from '../data/episodes';
import { Search, PlayCircle, Filter, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [selectedCategories, setSelectedCategories] = useLocalStorage<string[]>('filter_categories', []);
  const [selectedMembers, setSelectedMembers] = useLocalStorage<string[]>('filter_members', []);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customThumbnails] = useLocalStorage<Record<string, string>>('customThumbnails', {});
  const [watchHistory] = useLocalStorage<Record<string, { currentTime: number, duration: number } | number>>('watchHistory', {});
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      if (!selectedCategories.includes(typeParam)) {
        setSelectedCategories([...selectedCategories, typeParam]);
      }
      searchParams.delete('type');
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
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
    if (typeof historyEntry === 'number') return Math.min(100, (historyEntry / 100) * 100); // fallback
    if (!historyEntry.duration) return 0;
    return Math.min(100, (historyEntry.currentTime / historyEntry.duration) * 100);
  };

  return (
    <div className="w-full space-y-8 md:space-y-12 pb-20 md:pb-8">
      {/* Hero Section */}
      {isLoading ? (
        <section className="md:max-w-7xl md:mx-auto md:px-4 md:pt-8">
          <div className="bg-bg-surface md:border md:border-border-subtle md:rounded-2xl p-4 sm:p-6 md:p-12 flex flex-col-reverse md:flex-row gap-4 sm:gap-6 md:gap-8 items-center animate-pulse min-h-[50vh] md:min-h-0">
            <div className="flex-1 w-full space-y-3 md:space-y-4 relative z-10">
              <div className="h-5 md:h-6 w-20 md:w-24 bg-border-subtle rounded-full"></div>
              <div className="h-8 md:h-12 w-3/4 bg-border-subtle rounded-lg"></div>
              <div className="h-4 md:h-6 w-1/2 bg-border-subtle rounded"></div>
              <div className="pt-2 md:pt-4">
                <div className="h-10 md:h-12 w-full md:w-48 bg-border-subtle rounded-full"></div>
              </div>
            </div>
            <div className="absolute inset-0 md:relative md:w-1/2 md:aspect-video bg-border-subtle md:rounded-xl"></div>
          </div>
        </section>
      ) : (
        <section className="relative md:max-w-7xl md:mx-auto md:px-4 md:pt-8 w-full group">
          <div className="md:bg-bg-surface md:border md:border-border-subtle md:rounded-2xl md:p-12 flex flex-col md:flex-row items-end md:items-center min-h-[65vh] md:min-h-0 relative">
            
            {/* Background Image for Mobile / Standard Image for Desktop */}
            <div className="absolute inset-0 md:relative md:w-1/2 md:aspect-video bg-black md:rounded-2xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 z-0 md:order-2">
              <img 
                src={customThumbnails[episodes[0].id] || `https://img.youtube.com/vi/${episodes[0].videoId}/maxresdefault.jpg`} 
                alt={episodes[0].title}
                className="w-full h-full object-cover opacity-70 md:opacity-100 group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent md:hidden" />
              <div className="hidden md:flex absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors items-center justify-center pointer-events-none">
                 <PlayCircle size={64} className="text-white opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300" />
              </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 space-y-3 md:space-y-4 w-full p-4 pb-8 md:p-0 md:order-1 text-white md:text-text-primary">
              <div className="inline-block px-2.5 py-1 md:px-3 rounded-full bg-brand/90 md:bg-brand/10 text-white md:text-brand text-[10px] md:text-sm font-bold tracking-wider uppercase mb-1">
                Terbaru
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold leading-tight drop-shadow-md md:drop-shadow-none">
                {episodes[0].title}
              </h1>
              <p className="text-white/80 md:text-text-muted text-sm sm:text-base md:text-lg drop-shadow-sm md:drop-shadow-none max-w-lg">
                Saksikan keseruan member =LOVE di episode terbaru!
              </p>
              <div className="pt-3 md:pt-4">
                <Link 
                  to={`/episode/${episodes[0].id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-4 md:px-6 py-3 rounded-full font-bold text-sm md:text-base hover:bg-brand-strong transition-all hover:scale-105 shadow-lg shadow-brand/30"
                >
                  <PlayCircle size={20} className="w-5 h-5 fill-current md:fill-none" />
                  <span className="tracking-wide">Tonton Sekarang</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Container with Side Paddings */}
      <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
        {/* Recently Viewed */}
      {!isLoading && recentlyViewed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">Lanjutkan Menonton</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentlyViewed.map(ep => (
              <Link key={`recent-${ep.id}`} to={`/episode/${ep.id}`} className="group flex-none w-64 flex flex-col gap-2">
                <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  <img 
                    src={customThumbnails[ep.id] || `https://img.youtube.com/vi/${ep.videoId}/mqdefault.jpg`} 
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {watchHistory[ep.id] && getProgressWidth(ep.id) > 0 && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div className="h-full bg-brand" style={{ width: `${getProgressWidth(ep.id)}%` }} />
                     </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors">
                  {ep.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
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
              className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-subtle rounded-xl focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm font-medium text-text-primary hover:bg-border-subtle transition-colors"
          >
            <Filter size={18} />
            Filter
            {(selectedCategories.length > 0 || selectedMembers.length > 0) && (
              <span className="ml-1 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedCategories.length + selectedMembers.length}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategories.length > 0 || selectedMembers.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-text-muted mr-1">Filter Aktif:</span>
            {selectedCategories.map(c => (
              <span key={`cat-${c}`} className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full border border-brand/20">
                {c}
                <button onClick={() => setSelectedCategories(selectedCategories.filter(sc => sc !== c))} className="hover:text-brand-strong transition-colors"><X size={14} /></button>
              </span>
            ))}
            {selectedMembers.map(m => (
              <span key={`mem-${m}`} className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full border border-brand/20">
                {m}
                <button onClick={() => setSelectedMembers(selectedMembers.filter(sm => sm !== m))} className="hover:text-brand-strong transition-colors"><X size={14} /></button>
              </span>
            ))}
            <button 
              onClick={() => { setSelectedCategories([]); setSelectedMembers([]); }} 
              className="text-xs text-text-muted hover:text-text-primary ml-2 underline transition-colors"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </section>

      {/* Filter Drawer Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)}>
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
                 )})}
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

      {/* Episodes Grid */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 md:gap-3 animate-pulse">
                <div className="w-full aspect-video bg-border-subtle rounded-lg md:rounded-xl"></div>
                <div>
                  <div className="h-4 md:h-5 bg-border-subtle rounded mb-1 md:mb-2 w-3/4"></div>
                  <div className="flex gap-1 md:gap-2 mt-1 md:mt-2">
                     <div className="h-3 md:h-5 w-12 md:w-16 bg-border-subtle rounded"></div>
                     <div className="h-3 md:h-5 w-16 md:w-20 bg-border-subtle rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredEpisodes.map(ep => (
              <Link key={ep.id} to={`/episode/${ep.id}`} className="group flex flex-col gap-2 md:gap-3">
                <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden relative shadow-sm">
                  <img 
                    src={customThumbnails[ep.id] || `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`} 
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/80 text-white text-[9px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded font-mono">
                    {ep.date}
                  </div>
                  {/* Progress bar if watched */}
                  {watchHistory[ep.id] && getProgressWidth(ep.id) > 0 && (
                     <div className="absolute bottom-0 left-0 right-0 h-[2px] md:h-1 bg-gray-600">
                        <div className="h-full bg-brand" style={{ width: `${getProgressWidth(ep.id)}%` }} />
                     </div>
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xs md:text-lg line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                    {ep.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2 hidden sm:flex">
                    <span className="text-[9px] md:text-xs text-text-muted bg-border-subtle px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                      {ep.type}
                    </span>
                    {ep.members.slice(0, 2).map(m => (
                      <span key={m} className="text-[9px] md:text-xs text-text-muted bg-bg-surface border border-border-subtle px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                        {m}
                      </span>
                    ))}
                    {ep.members.length > 2 && (
                      <span className="text-[9px] md:text-xs text-text-muted bg-bg-surface border border-border-subtle px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                        +{ep.members.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {!isLoading && filteredEpisodes.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            Tidak ada episode yang cocok dengan pencarian.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
