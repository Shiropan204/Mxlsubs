import { Globe, Discord, Twitter } from 'lucide-react';

export default function Partners() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Our Partners</h1>
        <p className="text-text-muted text-lg">Collaborating with amazing creators and platforms</p>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Frelein Fansub */}
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8 flex flex-col">
          <div className="mb-4">
            <img src="/partners/frelein-fansub.png" alt="Frelein Fansub Logo" className="h-12 object-contain" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">Frelein Fansub</h3>
          <p className="text-text-muted mb-6 flex-grow">Fansub Indonesia yang fokus menggarap konten-konten Hinatazaka46.</p>
          <div className="flex gap-4">
            <a href="https://fansub.frelein.my.id/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="Website">
              <Globe size={20} />
            </a>
            <a href="https://discord.gg/mCaUwH4GFS" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="Discord">
              <Discord size={20} />
            </a>
            <a href="https://x.com/frelein_asli" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="X">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
