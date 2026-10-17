import { PageHeader } from '../components/ui'
import { IMG } from '../lib/images'

const ITEMS = [
  ['01', 'Layar privat', 'One-way Service memakai token acak agar display hanya dapat dibuka dari link yang dibagikan.'],
  ['02', 'Jawaban eksplisit', 'Data layanan hanya dikirim ketika pengguna melakukan tindakan yang jelas, bukan berdasarkan prediksi browser.'],
  ['03', 'Akses terbatas', 'Room dua arah hanya dapat diakses pengguna dan admin mitra yang telah dipasangkan oleh backend.'],
  ['04', 'Identitas server', 'Cookie sesi bersifat HttpOnly dan WebSocket memverifikasi identitas serta keanggotaan room melalui backend.'],
  ['05', 'Data sementara', 'Chat tidak disimpan. Jawaban PSS pada layanan Ritz hanya tersedia dalam room aktif dan dihapus saat room berakhir atau kedaluwarsa.'],
  ['06', 'Peran sederhana', 'Pendaftaran publik membuat akun pengguna. Admin mitra dikelola melalui environment deployment untuk mendampingi room yang sesuai.'],
]

export default function About() {
  return (
    <>
      <PageHeader
        image={IMG.hands}
        eyebrow="Privasi"
        title="Privasi & keamanan data"
        desc="Berikut cara BISARA memperlakukan data pada layanan publik dan layanan mitra."
      />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid border-t border-ink/80 md:grid-cols-2">
          {ITEMS.map(([n, t, d]) => (
            <div
              data-reveal
              key={n}
              className="grid grid-cols-[48px_1fr] border-b border-line py-8 md:odd:pr-10 md:even:pl-10"
            >
              <span className="text-sm text-brand">{n}</span>
              <div>
                <h3 className="text-2xl font-normal">{t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-reveal className="mt-16 rounded-xl bg-ink p-8 text-paper md:p-10">
          <p className="text-2xl font-normal leading-snug">
            BISARA adalah alat bantu komunikasi, bukan alat diagnosis dan bukan pengganti juru bahasa isyarat.
          </p>
          <p className="mt-4 text-paper/70">
            Interpretasi hasil skrining serta keputusan klinis sepenuhnya menjadi tanggung jawab psikolog.
          </p>
        </div>
      </div>
    </>
  )
}
