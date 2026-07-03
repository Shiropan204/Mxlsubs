export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <h1 className="text-8xl font-heading font-bold text-brand">404</h1>
      <h2 className="text-2xl font-heading font-semibold">Halaman Tidak Ditemukan</h2>
      <p className="text-text-muted">Maaf, episode atau halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <a href="/" className="inline-block bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-strong transition-colors mt-4">
        Kembali ke Beranda
      </a>
    </div>
  );
}
