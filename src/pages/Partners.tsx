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
        {/* Coming Soon Placeholder */}
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-text-muted text-lg">Partner information coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
