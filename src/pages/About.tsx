import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading font-bold">Tentang MXL Subs</h1>
        <p className="text-lg text-text-muted">Proyek fan-subtitle Indonesia non-komersial untuk =LOVE (イコールラブ).</p>
      </div>

      <div className="space-y-8 text-text-primary leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-brand">Visi Kami</h2>
          <p>
            Kami mendedikasikan proyek ini untuk membantu fans =LOVE di Indonesia agar dapat menikmati
            konten-konten mereka dengan lebih nyaman tanpa kendala bahasa.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-brand">Informasi & Keterkaitan</h2>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded-xl text-sm leading-relaxed">
            <p>
              Sebagai ruang berekspresi dan apresiasi dari penggemar, MXL Subs dikelola sepenuhnya secara independen. 
              Situs ini hadir murni sebagai bentuk dukungan kami dan tidak memiliki hubungan kerja sama formal, 
              afiliasi, maupun ikatan profesional dengan =LOVE, Yoyogi Animation Academy, SACRA MUSIC, 
              ataupun entitas manajemen resmi lainnya. 
            </p>
            <p className="mt-4">
              Kami juga sangat menghargai karya asli dari para kreator. Oleh karena itu, seluruh konten video yang 
              dapat diakses melalui platform ini tetap bersumber dan terhubung langsung dari kanal YouTube resmi =LOVE. 
              Dengan pendekatan ini, kami berharap setiap dukungan dan antusiasme penonton tetap bermuara pada 
              pencapaian kreator aslinya, sementara kami hanya menyematkan lapisan terjemahan untuk membantu 
              pemahaman cerita.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-brand">Komunikasi & Penyesuaian Konten</h2>
          <p>
            Kami selalu berupaya untuk menjaga harmoni dan menghormati batasan-batasan hak cipta. Apabila ada pihak 
            terkait atau pemegang hak cipta yang merasa kurang berkenan dengan cara kami menyajikan referensi 
            atau terjemahan dari sebuah karya, pintu komunikasi kami selalu terbuka. Kami akan dengan senang hati 
            berdiskusi dan mengambil langkah penyesuaian yang diperlukan, termasuk menghapus tautan dari katalog kami.
          </p>
          <a 
            href="mailto:takedown@mxlsubs.com"
            className="inline-block mt-2 bg-text-primary text-bg-primary px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Hubungi Kami
          </a>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-brand">Bergabung dengan Komunitas</h2>
          <p>
            Ikuti diskusi seputar =LOVE, dapatkan update terbaru, dan sapa sesama fans di server Discord komunitas kami!
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-brand hover:underline font-medium">Discord Server</a>
            <span className="text-border-subtle">|</span>
            <a href="#" className="text-brand hover:underline font-medium">Twitter / X</a>
          </div>
        </section>
      </div>
      
      <div className="pt-12 text-center">
        <Link to="/" className="text-sm font-medium hover:text-brand transition-colors">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
