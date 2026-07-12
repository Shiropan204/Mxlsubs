import freleinLogo from '../assets/partners/frelein-fansub.png';

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
            <img src={freleinLogo} alt="Frelein Fansub Logo" className="h-12 object-contain" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">Frelein Fansub</h3>
          <p className="text-text-muted mb-6 flex-grow">Fansub Indonesia yang fokus menggarap konten-konten Hinatazaka46.</p>
          <div className="flex gap-4">
            <a href="https://fansub.frelein.my.id/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="Website">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </a>
            <a href="https://discord.gg/mCaUwH4GFS" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="Discord">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.01.05.02.07.01c1.71-.53 3.44-1.33 5.24-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
              </svg>
            </a>
            <a href="https://x.com/frelein_asli" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors" title="X">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
