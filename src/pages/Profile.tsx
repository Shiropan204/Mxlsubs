import { motion } from 'motion/react';
import { members } from '../data/members';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-1">{member.name}</h2>
              <p className="text-sm tracking-widest text-[#ea6687] font-medium mb-4 uppercase">{member.nameRomaji}</p>
              
              <div className="space-y-2 mt-auto text-sm text-text-secondary">
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
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
