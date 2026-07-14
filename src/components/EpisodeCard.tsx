import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, User } from 'lucide-react';
import { Episode } from '../types';
import { getSeriesMeta } from '../data/seriesMetadata';

interface EpisodeCardProps {
  ep: Episode;
  customThumbnail?: string;
  progress?: number;
  size?: 'large' | 'normal' | 'wide' | 'grid';
}

export function EpisodeCard({ ep, customThumbnail, progress, size = 'normal' }: EpisodeCardProps) {
  const widthClass = 
    size === 'large' ? 'w-[75vw] md:w-80' : 
    size === 'wide' ? 'w-[85vw] md:w-96' : 
    size === 'grid' ? 'w-full' : 
    'w-[42vw] md:w-56';
  
  const meta = getSeriesMeta(ep.series);

  return (
    <Link to={`/episode/${ep.id}`} className={`group flex-none ${widthClass} flex flex-col gap-2 relative`}>
      <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-sm shadow-black/5 dark:shadow-black/20 bg-bg-surface border border-border-subtle/30">
        
        {/* Ribbon Badge */}
        {ep.series && (
          <div className="absolute top-2 -right-1 z-30 transform shadow-md">
            {meta.status === 'Completed' ? (
              <div className="bg-gray-600/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-l-md border-y border-l border-white/20">
                TAMAT
              </div>
            ) : (
              <div className="bg-brand/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-l-md border-y border-l border-white/20 shadow-[0_0_10px_rgba(234,102,135,0.5)]">
                ONGOING
              </div>
            )}
          </div>
        )}
        
        <img 
          src={customThumbnail || ep.thumbnailUrl || `https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`} 
          alt={ep.title}
          className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {/* Gradient overlay on bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play icon on hover */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:group-hover:scale-110">
          <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30">
            <Play size={20} className="fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {ep.duration && (
          <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 bg-black/80 backdrop-blur-md text-white font-medium text-[9px] md:text-[10px] px-1.5 py-0.5 rounded tracking-wide z-10">
            {ep.duration}
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20">
            <div className="h-full bg-brand rounded-r-full" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>
      
      <div className="px-0.5 mt-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] md:text-[10px] font-bold text-brand uppercase tracking-wider truncate">
            {ep.series ? meta.title : ep.type}
          </span>
        </div>
        
        <h3 className="font-heading font-semibold text-[13px] md:text-sm line-clamp-2 leading-snug group-hover:text-brand transition-colors">
          {ep.title}
        </h3>
        
        <div className="flex items-center justify-between mt-1.5 text-[10px] md:text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="opacity-70" />
            <span>{ep.date}</span>
          </div>
          {ep.members && ep.members.length > 0 && (
            <div className="flex items-center gap-1.5 max-w-[50%]">
              <User size={12} className="opacity-70 shrink-0" />
              <span className="truncate">{ep.members[0]}</span>
              {ep.members.length > 1 && (
                <span className="shrink-0 text-[9px] opacity-70">+{ep.members.length - 1}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
