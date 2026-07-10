import { Heart, Coffee, ExternalLink, Gift } from 'lucide-react';

export default function Support() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center p-3 bg-brand/10 text-brand rounded-full mb-6">
          <Heart size={32} className="fill-brand/20" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">Support Us</h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Jika Anda menyukai terjemahan yang kami kerjakan dan ingin mendukung kami agar terus bisa menghadirkan konten-konten berkualitas, Anda bisa memberikan dukungan melalui platform di bawah ini.
        </p>
      </div>

      {/* Support Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Trakteer */}
        <a 
          href="https://trakteer.id/mxlsubs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-8 hover:border-[#be1e2d] hover:shadow-lg hover:shadow-[#be1e2d]/10 transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#be1e2d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-16 h-16 bg-[#be1e2d]/10 text-[#be1e2d] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Gift size={32} />
          </div>
          <h3 className="text-xl font-heading font-bold mb-3">Trakteer</h3>
          <p className="text-text-muted text-sm mb-6 flex-grow">Dukung kami dengan memberikan traktiran melalui platform Trakteer.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#be1e2d]">
            <span>Kunjungi Trakteer</span>
            <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </a>

        {/* Ko-fi */}
        <a 
          href="https://ko-fi.com/mxlsubs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-8 hover:border-[#13C3FF] hover:shadow-lg hover:shadow-[#13C3FF]/10 transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#13C3FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-16 h-16 bg-[#13C3FF]/10 text-[#13C3FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Coffee size={32} />
          </div>
          <h3 className="text-xl font-heading font-bold mb-3">Ko-fi</h3>
          <p className="text-text-muted text-sm mb-6 flex-grow">International supporters can buy us a coffee through Ko-fi.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#13C3FF]">
            <span>Visit Ko-fi</span>
            <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </a>
      </div>
      
      {/* Note Section */}
      <div className="mt-16 max-w-2xl mx-auto bg-brand/5 border border-brand/20 rounded-2xl p-6 text-center animate-in fade-in duration-700 delay-300">
        <h4 className="text-brand font-semibold mb-2">Terima kasih atas dukungannya!</h4>
        <p className="text-sm text-text-muted">
          Setiap dukungan dari kalian sangat berarti bagi kami untuk menutupi biaya server dan memotivasi kami agar terus berkarya.
        </p>
      </div>
    </div>
  );
}
