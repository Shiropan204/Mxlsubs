import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, Search, X, Home as HomeIcon, Compass, User } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import React, { useEffect, useState, useRef } from 'react';

export default function Layout() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors relative">
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-4 text-text-muted" size={24} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Cari judul episode, member, atau tag..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-14 pr-14 py-4 text-lg font-medium text-text-primary focus:outline-none placeholder:text-text-muted"
              />
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 p-2 text-text-muted hover:text-brand transition-colors rounded-full hover:bg-border-subtle"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            <img 
              src={`${import.meta.env.BASE_URL}logo-${theme === 'dark' ? 'dark' : 'light'}.png`} 
              alt="MXL Subs Logo" 
              className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-6 mr-2">
              <Link to="/" className="hover:text-brand transition-colors font-medium">Home</Link>
              <Link to="/variety" className="hover:text-brand transition-colors font-medium">Variety</Link>
              <Link to="/about" className="hover:text-brand transition-colors font-medium">About</Link>
              <Link to="/support" className="hover:text-brand transition-colors font-medium">Support</Link>
            </div>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-border-subtle transition-colors text-text-muted hover:text-brand"
              title="Search"
            >
              <Search size={20} />
            </button>
            <button onClick={toggleTheme} className="hidden md:block p-2 rounded-full hover:bg-border-subtle transition-colors text-text-muted hover:text-brand" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 transition-colors relative w-12 h-12 flex items-center justify-center z-50 text-text-primary"
            >
              <div className="flex flex-col items-center justify-center gap-[6px] w-8 h-8">
                <span className={`block h-[1px] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-8 rotate-45 translate-y-[3.5px] bg-current' : 'w-8 bg-current'}`}></span>
                <span className={`block h-[1px] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-8 -rotate-45 -translate-y-[3.5px] bg-current' : 'w-8 bg-current'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-bg-primary/40 backdrop-blur-sm"></div>
          {/* Slanted pink background */}
          <div 
            className={`absolute top-0 bottom-0 w-[150%] -right-[50%] md:w-[1000px] md:right-[calc(min(42vw,440px)-1000px)] xl:right-[calc(min(30vw,420px)-1000px)] bg-[#ea6687] transform origin-top-left transition-transform duration-700 ease-in-out ${
              isMobileMenuOpen 
                ? 'translate-x-[-40%] md:translate-x-0 -skew-x-[15deg] md:-skew-x-[10deg]' 
                : 'translate-x-[100%] md:translate-x-full -skew-x-[15deg] md:-skew-x-[10deg]'
            }`}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col h-full pt-28 px-8 md:px-12 xl:px-14 pb-12 overflow-y-auto pointer-events-none md:ml-auto w-full md:w-[min(42vw,440px)] xl:w-[min(30vw,420px)]">
          <div className={`flex flex-col gap-6 text-[15px] tracking-widest font-heading font-medium text-white mt-4 ${isMobileMenuOpen ? 'pointer-events-auto' : ''}`}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">HOME</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">ABOUT</Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">PROFILE</Link>
            <Link to="/partners" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">PARTNERS</Link>
            <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">SUPPORT</Link>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <h3 className="text-xs text-white/50 mb-4">CATEGORIES</h3>
              <div className="flex flex-col gap-4">
                <Link to="/?search=&type=IKONOIJOY+Channel" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">IKONOIJOY CHANNEL</Link>
                <Link to="/variety" onClick={() => setIsMobileMenuOpen(false)} className="hover:opacity-70 transition-opacity">VARIETY</Link>
                <span className="opacity-50 cursor-not-allowed">MUSIC VIDEO</span>
                <span className="opacity-50 cursor-not-allowed">CONCERT</span>
                <span className="opacity-50 cursor-not-allowed">BEHIND THE SCENES</span>
              </div>
            </div>
          </div>
          
          <div className={`mt-auto pt-8 ${isMobileMenuOpen ? 'pointer-events-auto' : ''}`}>
            <button 
              onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} 
              className="flex items-center gap-3 text-xs tracking-widest font-medium text-white/80 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <><Sun size={16} /> LIGHT MODE</> : <><Moon size={16} /> DARK MODE</>}
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 w-full" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <React.Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Outlet />
        </React.Suspense>
      </main>
      
      {/* Bottom Navigation for Mobile - Floating Style */}
      <nav className="md:hidden fixed left-4 right-4 z-40" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="bg-bg-surface/85 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-xl shadow-black/15 dark:shadow-black/40">
          <div className="flex items-center justify-around h-14 px-2">
            <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${location.pathname === '/' ? 'text-brand' : 'text-text-muted'}`}>
              <HomeIcon size={20} className={location.pathname === '/' ? 'fill-current' : ''} />
              <span className="text-[10px] font-semibold">{location.pathname === '/' ? '•' : 'Beranda'}</span>
            </Link>
            <Link to="/variety" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${location.pathname === '/variety' ? 'text-brand' : 'text-text-muted'}`}>
              <Compass size={20} className={location.pathname === '/variety' ? 'fill-current' : ''} />
              <span className="text-[10px] font-semibold">{location.pathname === '/variety' ? '•' : 'Variety'}</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${location.pathname === '/profile' ? 'text-brand' : 'text-text-muted'}`}>
              <User size={20} className={location.pathname === '/profile' ? 'fill-current' : ''} />
              <span className="text-[10px] font-semibold">{location.pathname === '/profile' ? '•' : 'Profil'}</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <footer className="hidden md:block border-t border-border-subtle bg-bg-surface py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img 
              src={`${import.meta.env.BASE_URL}logo-${theme === 'dark' ? 'dark' : 'light'}.png`} 
              alt="MXL Subs Logo" 
              className="h-12 md:h-16 w-auto object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
            />
            <p className="text-text-muted text-sm text-center md:text-left max-w-md">
              Fan-subtitle Indonesia non-komersial untuk video =LOVE (イコールラブ). Tidak berafiliasi dengan pihak resmi.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2 text-sm text-text-muted">
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-brand transition-colors">Home</Link>
              <Link to="/about" className="hover:text-brand transition-colors">About</Link>
              <Link to="/support" className="hover:text-brand transition-colors">Support</Link>
              <Link to="/about" className="hover:text-brand transition-colors">Disclaimer</Link>
            </div>
            <p className="mt-2 text-xs opacity-70">
              &copy; {new Date().getFullYear()} MXL Subs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
