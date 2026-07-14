import { motion } from 'motion/react';
import { members } from '../data/members';
import { Instagram, Music2, Tv, PenTool } from 'lucide-react';

const XLogo = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);


export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary tracking-tight mb-4">
          MEMBERS
        </h1>
        <p className="text-text-secondary max-w-2xl text-lg mb-12">
          =LOVE (Equal Love) member profiles.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative flex flex-col bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden hover:border-[#ea6687]/50 transition-colors"
          >
            <div className="aspect-[3/4] overflow-hidden bg-bg-primary relative">
              {/* Fallback image placeholder if image fails to load */}
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                No Image
              </div>
              <img 
                src={member.imageUrl} 
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              <div 
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none z-20"
                style={{ backgroundColor: member.color || '#ea6687' }}
              />
            </div>
            
            <div className="p-3 sm:p-5 flex-1 flex flex-col">
              <h2 className="text-sm sm:text-xl font-heading font-bold text-text-primary mb-0.5">{member.name}</h2>
              <p className="text-[10px] sm:text-xs tracking-widest text-[#ea6687] font-medium mb-3 uppercase">{member.nameRomaji}</p>
              
              <div className="space-y-1.5 mt-auto text-[10px] sm:text-sm text-text-secondary hidden sm:block">
                <div className="flex justify-between">
                  <span className="text-text-muted">Birth Date</span>
                  <span>{member.birthDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Blood Type</span>
                  <span>{member.bloodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Birth Place</span>
                  <span>{member.birthPlace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Zodiac</span>
                  <span>{member.zodiac}</span>
                </div>
              </div>

              {/* SNS Links */}
              {member.sns && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-border-subtle">
                  {member.sns.twitter && (
                    <a href={member.sns.twitter} target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" title="X (Twitter)">
                      <XLogo size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.sns.instagram && (
                    <a href={member.sns.instagram} target="_blank" rel="noreferrer" className="text-text-muted hover:text-[#E1306C] transition-colors" title="Instagram">
                      <Instagram size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.sns.tiktok && (
                    <a href={member.sns.tiktok} target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors" title="TikTok">
                      <Music2 size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.sns.showroom && (
                    <a href={member.sns.showroom} target="_blank" rel="noreferrer" className="text-text-muted hover:text-[#2BCB9E] transition-colors" title="Showroom">
                      <Tv size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.sns.blog && (
                    <a href={member.sns.blog} target="_blank" rel="noreferrer" className="text-text-muted hover:text-[#2D8C3C] transition-colors" title="Blog">
                      <PenTool size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
